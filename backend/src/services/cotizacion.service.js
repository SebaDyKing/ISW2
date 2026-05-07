"use strict";
import { AppDataSource } from "../config/configDb.js";
import { SolicitudCotizacion } from "../models/SolicitudCotizacion.js";
import { Cliente } from "../models/Cliente.js";
import { Instalacion } from "../models/Instalacion.js";

export async function crearCotizacionService(datosCotizacion) {
  const { id_usuario, comentarios, id_plan, id_instalacion } = datosCotizacion;

  const clienteRepo = AppDataSource.getRepository(Cliente);
  const cotizacionRepo = AppDataSource.getRepository(SolicitudCotizacion);
  const instalacionRepo = AppDataSource.getRepository(Instalacion);

  // Busca el Perfil de Cliente asociado al Usuario
  const clienteActual = await clienteRepo.findOne({
    where: { usuario: { idUsuario: id_usuario } } 
  });

  if (!clienteActual) {
    throw new Error("Perfil de cliente no encontrado para este usuario.");
  }

  // Validar que la instalación le pertenece al cliente
  const instalacionValida = await instalacionRepo.findOne({
    where: { 
      idInstalacion: id_instalacion,
      cliente: { idCliente: clienteActual.idCliente }
    }
  });

  if (!instalacionValida) {
    throw new Error("La instalación indicada no existe o no pertenece a tu cuenta.");
  }

  // Validar que no haya cotización Pendiente
  const cotizacionPendiente = await cotizacionRepo.findOne({
    where: {
      estado: "Pendiente",
      cliente: { idCliente: clienteActual.idCliente }
    }
  });

  if (cotizacionPendiente) {
    throw new Error("Ya tienes una cotización en proceso. Por favor espera a que sea respondida.");
  }

  const nuevaSolicitud = cotizacionRepo.create({
    comentarios: comentarios || null,
    estado: "Pendiente",
    cliente: clienteActual,
    instalacion: instalacionValida,
    plan: { idPlan: id_plan } 
  });

  const solicitudGuardada = await cotizacionRepo.save(nuevaSolicitud);
  return solicitudGuardada;
}
export async function obtenerCotizacionesService() {
  try {
    const repositorio = AppDataSource.getRepository(SolicitudCotizacion);
    return await repositorio.find({
      order: { fecha_creacion: "DESC" },
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
      order: { fecha_creacion: "DESC" },
      relations: ["plan", "instalacion"] 
    });
  } catch (error) {
    console.error("Error en obtenerMisCotizacionesService:", error);
    throw new Error("Error al obtener tus cotizaciones");
  }
}