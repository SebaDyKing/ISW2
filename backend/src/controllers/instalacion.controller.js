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
import { AppDataSource } from "../config/configDb.js";
import { Cliente } from "../models/Cliente.js";

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
    if (req.user.rol === "cliente") {
      const clienteRepo = AppDataSource.getRepository(Cliente);
      const cliente = await clienteRepo.findOne({
        where: { usuario: { idUsuario: req.user.idUsuario } },
      });
      if (!cliente) {
        return res.status(400).json({ message: "Perfil de cliente no encontrado." });
      }
      req.body.idCliente = cliente.idCliente;
    }

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
    const actualizada = await actualizarInstalacionService(Number(id), value, req.user);
    res.status(200).json({ status: "Success", data: actualizada });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function eliminarInstalacion(req, res) {
  try {
    const { id } = req.params;
    await eliminarInstalacionService(Number(id), req.user);
    res.status(200).json({ status: "Success", message: "Instalación eliminada correctamente." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}