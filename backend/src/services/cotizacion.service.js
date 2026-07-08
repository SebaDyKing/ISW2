"use strict";
import { IsNull } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import { SolicitudCotizacion } from "../models/SolicitudCotizacion.js";
import { Cliente } from "../models/Cliente.js";
import { Instalacion } from "../models/Instalacion.js";
import { Empleado } from "../models/Empleado.js";
import { Supervisor } from "../models/Supervisor.js";
import { SupervisorInstalacion } from "../models/SupervisorInstalacion.js";
import { enviarCorreoSolicitudRecibida, enviarCorreoEstadoCotizacion, enviarCorreoReactivacion } from "../utils/email.js";
import { agregarHorasHabiles } from "../utils/businessHours.js";

// Plazo por defecto (en horas hábiles) que tiene el admin para responder una solicitud.
const HORAS_HABILES_LIMITE = 24;

export async function crearCotizacionService(datosCotizacion) {
  const { id_usuario, comentarios, id_plan, id_instalacion, medioContacto, horarioContacto, cantidadEmpleados } = datosCotizacion;

  const clienteRepo     = AppDataSource.getRepository(Cliente);
  const cotizacionRepo  = AppDataSource.getRepository(SolicitudCotizacion);
  const instalacionRepo = AppDataSource.getRepository(Instalacion);

  const clienteActual = await clienteRepo.findOne({
    where: { usuario: { idUsuario: id_usuario } },
    relations: ["usuario"]
  });
  if (!clienteActual) throw new Error("Perfil de cliente no encontrado para este usuario.");

  if (id_instalacion) {
    instalacionValida = await instalacionRepo.findOne({
      where: { idInstalacion: id_instalacion, cliente: { idCliente: clienteActual.idCliente } },
      relations: ["cliente"]
    });
    if (!instalacionValida) throw new Error("La instalación indicada no existe o no pertenece a tu cuenta.");

    const cotizacionPendiente = await cotizacionRepo.findOne({
      where: {
        estado: "Pendiente",
        cliente: { idCliente: clienteActual.idCliente },
        instalacion: { idInstalacion: id_instalacion }
      }
    });
    if (cotizacionPendiente) throw new Error("Esta instalación ya tiene una cotización pendiente. Espera a que sea respondida.");
  }

  // Plazo de respuesta: horas HÁBILES (no corridas) desde ahora.
  const ahora = new Date();
  const fechaLimite = agregarHorasHabiles(ahora, HORAS_HABILES_LIMITE);

  const nuevaSolicitud = cotizacionRepo.create({
    comentarios:        comentarios     || null,
    medioContacto:      medioContacto   || null,
    horarioContacto:    horarioContacto || null,
    estado:             "Pendiente",
    fechaLimite,
    horasHabilesLimite: HORAS_HABILES_LIMITE,
    // Se guarda tal cual la pide el cliente; es lo que despues lee asignarEmpleadosService
    // para saber cuantos empleados tomar cuando el admin apruebe esta cotizacion.
    cantidadEmpleados,
    cliente:     clienteActual,
    instalacion: instalacionValida,
    plan:        { idPlan: id_plan }
  });

  const solicitudGuardada = await cotizacionRepo.save(nuevaSolicitud);

  // Fire-and-forget: si el correo falla no queremos que falle la creación de la cotización.
  enviarCorreoSolicitudRecibida(
    clienteActual.usuario.correo,
    clienteActual.nombreEmpresa,
    fechaLimite,
    HORAS_HABILES_LIMITE
  ).catch((err) => console.error("Error enviando correo de solicitud:", err));

  delete solicitudGuardada.cliente.usuario.passwordHash;
  return solicitudGuardada;
}

// Vista del admin: todas las cotizaciones, las más urgentes (fechaLimite más próxima) primero.
export async function obtenerCotizacionesService() {
  try {
    const repositorio = AppDataSource.getRepository(SolicitudCotizacion);
    return await repositorio.find({
      order: { fechaLimite: "ASC" },
      relations: ["cliente", "plan", "instalacion"]
    });
  } catch (error) {
    console.error("Error en obtenerCotizacionesService:", error);
    throw new Error("Error al obtener las cotizaciones");
  }
}

// Vista del cliente: solo sus propias cotizaciones, más nuevas primero.
export async function obtenerMisCotizacionesService(id_usuario) {
  try {
    const repositorio = AppDataSource.getRepository(SolicitudCotizacion);
    return await repositorio.find({
      where: {
        cliente: { usuario: { idUsuario: id_usuario } }
      },
      order: { fechaCreacion: "DESC" },
      relations: ["plan", "instalacion"]
    });
  } catch (error) {
    console.error("Error en obtenerMisCotizacionesService:", error);
    throw new Error("Error al obtener tus cotizaciones");
  }
}

// Aprueba o rechaza una cotización y le avisa al cliente por correo el resultado.
export async function actualizarEstadoService(idSolicitud, nuevoEstado, motivo) {
  const repositorio = AppDataSource.getRepository(SolicitudCotizacion);

  // Se trae la instalación para que el controller pueda decidir si corresponde
  // intentar la asignación automática de personal (no tiene sentido si no hay instalación).
  const cotizacion = await repositorio.findOne({
    where: { idSolicitud: parseInt(idSolicitud) },
    relations: ["instalacion"]
  });
  if (!cotizacion) throw new Error("Cotización no encontrada.");

  // No se valida el estado anterior a propósito: el admin también puede usar esto
  // para corregir una decisión ya tomada (ej. rechazar algo que había aprobado mal).
  cotizacion.estado = nuevoEstado;
  cotizacion.motivo = motivo || null;
  const cotizacionActualizada = await repositorio.save(cotizacion);

  // Se vuelve a leer con relaciones porque el save() de arriba no las trae.
  const cotizacionConCliente = await repositorio.findOne({
    where: { idSolicitud: parseInt(idSolicitud) },
    relations: ["cliente", "cliente.usuario"]
  });

  enviarCorreoEstadoCotizacion(
    cotizacionConCliente.cliente.usuario.correo,
    cotizacionConCliente.cliente.nombreEmpresa,
    nuevoEstado,
    motivo,
    cotizacionConCliente.medioContacto,
    cotizacionConCliente.horarioContacto,
  ).catch((err) => console.error("Error enviando correo de estado:", err));

  return cotizacionActualizada;
}

// Devuelve una cotización "Vencida" a "Pendiente" con un plazo nuevo de 24hs hábiles desde ahora.
export async function reactivarCotizacionService(idSolicitud) {
  const repositorio = AppDataSource.getRepository(SolicitudCotizacion);

  const cotizacion = await repositorio.findOne({
    where: { idSolicitud: parseInt(idSolicitud) },
    relations: ["cliente", "cliente.usuario"]
  });
  if (!cotizacion) throw new Error("Cotización no encontrada.");
  if (cotizacion.estado !== "Vencida") throw new Error("Solo se pueden reactivar cotizaciones vencidas.");

  const ahora = new Date();
  const nuevaFechaLimite = agregarHorasHabiles(ahora, HORAS_HABILES_LIMITE);

  cotizacion.estado = "Pendiente";
  cotizacion.fechaLimite = nuevaFechaLimite;

  const cotizacionReactivada = await repositorio.save(cotizacion);

  enviarCorreoReactivacion(
    cotizacion.cliente.usuario.correo,
    cotizacion.cliente.nombreEmpresa,
    nuevaFechaLimite
  ).catch((err) => console.error("Error enviando correo de reactivación:", err));

  return cotizacionReactivada;
}

export async function asignarEmpleadosService(idSolicitud) {
  const cotizacionRepo = AppDataSource.getRepository(SolicitudCotizacion);
  const empleadoRepo = AppDataSource.getRepository(Empleado);
  const supervisorRepo = AppDataSource.getRepository(Supervisor);
  const supervisorInstalacionRepo = AppDataSource.getRepository(SupervisorInstalacion);

  const cotizacion = await cotizacionRepo.findOne({
    where: { idSolicitud: parseInt(idSolicitud) },
    relations: ["instalacion"]
  });
  if (!cotizacion) throw new Error("Cotización no encontrada.");


  // Solo tiene sentido asignar personal a algo ya aprobado y con un lugar concreto donde trabajar.
  if (cotizacion.estado !== "Aprobada") throw new Error("Solo se pueden asignar empleados a cotizaciones aprobadas.");
  if (!cotizacion.instalacion) throw new Error("Esta cotización no tiene una instalación asociada.");


  // Guard de idempotencia: sin esto, volver a apretar el botón asignaría empleados de más.
  if (cotizacion.personalAsignado) throw new Error("Esta cotización ya tiene personal asignado.");

  // Busca los primeros N empleados que no tienen instalación asignada.
  const empleadosLibres = await empleadoRepo.find({
    where: { instalacion: IsNull() },
    relations: ["usuario"],
    order: { idEmpleado: "ASC" },
    take: cotizacion.cantidadEmpleados,
  });

  //Verifica que haya empleados suficientes para la cotizacion
  if (empleadosLibres.length < cotizacion.cantidadEmpleados) {
    throw new Error(
      `No hay suficientes empleados libres. Se necesitan ${cotizacion.cantidadEmpleados}, hay ${empleadosLibres.length} disponibles.`
    );
  }


  //Se busca el primer supervisor que exista
  const [supervisor] = await supervisorRepo.find({
    relations: ["usuario"],
    order: { idSupervisor: "ASC" },
    take: 1,
  });
  if (!supervisor) throw new Error("No hay supervisores registrados.");

  // Mueve a cada empleado libre a la instalación de la cotización.
  for (const empleado of empleadosLibres) {
    empleado.instalacion = cotizacion.instalacion;
  }
  await empleadoRepo.save(empleadosLibres);

  // Vincula el supervisor a la instalación, salvo que ya estuviera a cargo de ella
  const vinculoExistente = await supervisorInstalacionRepo.findOne({
    where: {
      supervisor: { idSupervisor: supervisor.idSupervisor },
      instalacion: { idInstalacion: cotizacion.instalacion.idInstalacion }
    }
  });
  if (!vinculoExistente) {
    await supervisorInstalacionRepo.save({ supervisor, instalacion: cotizacion.instalacion });
  }

  // Marca la cotización para que el botón no se pueda volver a apretar sobre esta misma.
  cotizacion.personalAsignado = true;
  await cotizacionRepo.save(cotizacion);

  return {
    empleados: empleadosLibres.map((e) => ({
      idEmpleado: e.idEmpleado,
      nombre: e.usuario?.nombre,
      apellido: e.usuario?.apellido,
    })),
    supervisor: {
      idSupervisor: supervisor.idSupervisor,
      nombre: supervisor.usuario?.nombre,
      apellido: supervisor.usuario?.apellido,
    },
  };
}
