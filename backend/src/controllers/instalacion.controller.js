"use strict";
import { 
  obtenerMisInstalacionesService, 
  obtenerInstalacionesService,
  crearInstalacionService,
  actualizarInstalacionService,
  eliminarInstalacionService 
} from "../services/instalacion.service.js";
import { 
  validateCrearInstalacion, 
  validateActualizarInstalacion 
} from "../validations/instalacion.validations.js";

export async function obtenerMisInstalaciones(req, res) {
  try {
    const id_usuario = req.user.idUsuario;
    const instalaciones = await obtenerMisInstalacionesService(id_usuario);
    res.status(200).json({ data: instalaciones });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function obtenerInstalaciones(req, res) {
  try {
    const instalaciones = await obtenerInstalacionesService();
    res.status(200).json({ data: instalaciones });
  } catch (error) {
    res.status(500).json({ message: "Error interno al recuperar las instalaciones" });
  }
}

export async function crearInstalacion(req, res) {
  try {
    const { error, value } = validateCrearInstalacion(req.body);
    if (error) {
      return res.status(400).json({ message: error.details.map((d) => d.message).join(", ") });
    }
    const nueva = await crearInstalacionService(value);
    res.status(201).json({ status: "Success", data: nueva });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function actualizarInstalacion(req, res) {
  try {
    const { id } = req.params;
    const { error, value } = validateActualizarInstalacion(req.body);
    if (error) {
      return res.status(400).json({ message: error.details.map((d) => d.message).join(", ") });
    }
    const actualizada = await actualizarInstalacionService(Number(id), value);
    res.status(200).json({ status: "Success", data: actualizada });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function eliminarInstalacion(req, res) {
  try {
    const { id } = req.params;
    await eliminarInstalacionService(Number(id));
    res.status(200).json({ status: "Success", message: "Instalación eliminada correctamente." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}