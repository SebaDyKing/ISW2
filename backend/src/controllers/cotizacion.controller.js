"use strict";
import { crearCotizacionService } from "../services/cotizacion.service.js";

export const crearSolicitud = async (req, res) => {
  try {
    // Extraemos los datos que vienen del formulario (req.body)
    const { nombre_empresa, telefono, correo, comentarios, id_plan } = req.body;

    // Validación rápida
    if (!nombre_empresa || !correo || !id_plan) {
      return res.status(400).json({
        message: "Faltan campos obligatorios: nombre, correo o plan."
      });
    }

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