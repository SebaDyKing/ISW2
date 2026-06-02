"use strict";
import { obtenerMisInstalacionesService } from "../services/instalacion.service.js";

export async function obtenerMisInstalaciones(req, res) {
  try {
    const id_usuario = req.user.idUsuario;
    const instalaciones = await obtenerMisInstalacionesService(id_usuario);
    res.status(200).json({ data: instalaciones });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}