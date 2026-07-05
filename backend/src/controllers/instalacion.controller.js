"use strict";
import { obtenerMisInstalacionesService, obtenerInstalacionesService } from "../services/instalacion.service.js";

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