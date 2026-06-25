"use strict";
import { AppDataSource } from "../config/configDb.js";
import { SolicitudCotizacion } from "../models/SolicitudCotizacion.js";
import { Cliente } from "../models/Cliente.js";
import { Instalacion } from "../models/Instalacion.js";
import { enviarCorreoSolicitudRecibida, enviarCorreoEstadoCotizacion } from "../utils/email.js";
import { agregarHorasHabiles } from "../utils/businessHours.js"; // ← nuevo

const HORAS_HABILES_LIMITE = 24; // configurable 

export async function crearCotizacionService(datosCotizacion) {
  const { id_usuario, comentarios, id_plan, id_instalacion, medioContacto, horarioContacto } = datosCotizacion;

  const clienteRepo     = AppDataSource.getRepository(Cliente);
  const cotizacionRepo  = AppDataSource.getRepository(SolicitudCotizacion);
  const instalacionRepo = AppDataSource.getRepository(Instalacion);

  const clienteActual = await clienteRepo.findOne({
    where: { usuario: { idUsuario: id_usuario } },
    relations: ["usuario"]
  });
  if (!clienteActual) throw new Error("Perfil de cliente no encontrado para este usuario.");

  const instalacionValida = await instalacionRepo.findOne({
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

  // ── Calcular fecha límite ───────────────────────────────────────────────────
  const ahora = new Date();
  const fechaLimite = agregarHorasHabiles(ahora, HORAS_HABILES_LIMITE);
  // ───────────────────────────────────────────────────────────────────────────

  const nuevaSolicitud = cotizacionRepo.create({
    comentarios:        comentarios     || null,
    medioContacto:      medioContacto   || null,
    horarioContacto:    horarioContacto || null,
    estado:             "Pendiente",
    fechaLimite,                          
    horasHabilesLimite: HORAS_HABILES_LIMITE, 
    cliente:     clienteActual,
    instalacion: instalacionValida,
    plan:        { idPlan: id_plan }
  });

  const solicitudGuardada = await cotizacionRepo.save(nuevaSolicitud);

  // Pasar fechaLimite al correo
  enviarCorreoSolicitudRecibida(
    clienteActual.usuario.correo,
    clienteActual.nombreEmpresa,
    fechaLimite,              
    HORAS_HABILES_LIMITE      
  ).catch((err) => console.error("Error enviando correo de solicitud:", err));

  delete solicitudGuardada.cliente.usuario.passwordHash;
  return solicitudGuardada;
}

// obtenerCotizacionesService — ordenar por fechaLimite ascendente
// para que el admin vea primero las más urgentes
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

export async function actualizarEstadoService(idSolicitud, nuevoEstado, motivo) {
  const repositorio = AppDataSource.getRepository(SolicitudCotizacion);

  const cotizacion = await repositorio.findOne({
    where: { idSolicitud: parseInt(idSolicitud) }
  });
  if (!cotizacion) throw new Error("Cotización no encontrada.");

  cotizacion.estado = nuevoEstado;
  cotizacion.motivo = motivo || null;
  const cotizacionActualizada = await repositorio.save(cotizacion);

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