"use strict";
import {
  crearCotizacionService,
  obtenerCotizacionesService,
  obtenerMisCotizacionesService,
  actualizarEstadoService
} from "../services/cotizacion.service.js";
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
    const { comentarios, id_plan, id_instalacion } = value;
    const idUsuario = req.user.idUsuario;

    const nuevaCotizacion = await crearCotizacionService({
      id_usuario: idUsuario,
      comentarios,
      id_plan,
      id_instalacion
    });

    res.status(201).json({
      message: "Solicitud guardada correctamente",
      data: nuevaCotizacion
    });
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    if (
      error.message.includes("Ya tienes") ||
      error.message.includes("Esta instalación") ||
      error.message.includes("no pertenece") ||
      error.message.includes("no encontrado")
    ) {
      return res.status(400).json({ message: error.message });
    }
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

export const obtenerMisCotizaciones = async (req, res) => {
  try {
    const idUsuario = req.user.idUsuario;
    const misCotizaciones = await obtenerMisCotizacionesService(idUsuario);
    res.status(200).json({
      message: "Tus cotizaciones obtenidas correctamente",
      data: misCotizaciones
    });
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar tus cotizaciones" });
  }
};

export const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ["Pendiente", "Aprobada", "Rechazada"];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        message: `Estado inválido. Los estados válidos son: ${estadosValidos.join(", ")}`
      });
    }

    const cotizacionActualizada = await actualizarEstadoService(id, estado);
    res.status(200).json({
      message: "Estado de cotización actualizado correctamente",
      data: cotizacionActualizada
    });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    if (error.message.includes("no encontrada")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error interno del servidor" });
  }
};