"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Instalacion } from "../models/Instalacion.js";
import { Cliente } from "../models/Cliente.js";

export async function obtenerMisInstalacionesService(id_usuario) {
  const clienteRepo = AppDataSource.getRepository(Cliente);
  const cliente = await clienteRepo.findOne({
    where: { usuario: { idUsuario: id_usuario } },
  });
  if (!cliente) throw new Error("Perfil de cliente no encontrado.");

  const instalacionRepo = AppDataSource.getRepository(Instalacion);
  return await instalacionRepo.find({
    where: { cliente: { idCliente: cliente.idCliente } },
    order: { createdAt: "DESC" },
  });
}