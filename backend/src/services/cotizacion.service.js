"use strict";
import { AppDataSource } from "../config/configDb.js";
import { SolicitudCotizacion } from "../models/SolicitudCotizacion.js";

export async function crearCotizacionService(datosCotizacion) {
  try {
    const repositorio = AppDataSource.getRepository(SolicitudCotizacion);
    const nuevaSolicitud = repositorio.create(datosCotizacion);
    const solicitudGuardada = await repositorio.save(nuevaSolicitud);

    return solicitudGuardada;
  } catch (error) {
    console.error("Error en crearCotizacionService:", error);
    throw new Error("Error al guardar la cotización en la base de datos");
  }
}

export async function obtenerCotizacionesService() {
  try {
    const repositorio = AppDataSource.getRepository(SolicitudCotizacion);
    // Traemos todo ordenado por la fecha más reciente
    return await repositorio.find({
      order: { fecha_creacion: "DESC" }
    });
  } catch (error) {
    console.error("Error en obtenerCotizacionesService:", error);
    throw new Error("Error al obtener las cotizaciones");
  }
}