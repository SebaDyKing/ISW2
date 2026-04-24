"use strict";
import { crearCotizacionService, obtenerCotizacionesService } from "../services/cotizacion.service.js";
import { cotizacionSchema } from "../validations/cotizacion.validation.js";

export const crearSolicitud = async (req, res) => {
  try {
    const { error, value } = cotizacionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Error de validación en los datos",
        detalle: error.details[0].message
      });
    }
    const { nombre_empresa, telefono, correo, comentarios, id_plan } = value;

    const nuevaCotizacion = await crearCotizacionService({
      nombre_empresa,
      telefono,
      correo,
      comentarios,
      id_plan
    });

    // Respuesta temporal al cliente
    res.status(201).json({
      message: "Solicitud guardada correctamente",
      data: nuevaCotizacion
    });

  } catch (error) {
    console.error("Error al crear solicitud:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const obtenerCotizaciones = async (req, res) => {
  try {
    const cotizaciones = await obtenerCotizacionesService();
    res.status(200).json({
      message: "Lista de cotizaciones obtenida correctamente",
      data: cotizaciones
    });
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar datos" });
  }
};