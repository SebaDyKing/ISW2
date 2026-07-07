"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Instalacion } from "../models/Instalacion.js";
import { Cliente } from "../models/Cliente.js";

import { Contrato } from "../models/Contrato.js";

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

export async function obtenerInstalacionesService() {
  const instalacionRepo = AppDataSource.getRepository(Instalacion);
  return await instalacionRepo.find({
    relations: ["cliente", "cliente.usuario"],
    order: { createdAt: "DESC" },
  });
}

export async function crearInstalacionService(data) {
  const clienteRepo = AppDataSource.getRepository(Cliente);
  const cliente = await clienteRepo.findOneBy({ idCliente: data.idCliente });
  if (!cliente) throw new Error("Cliente asociado no encontrado.");

  const instalacionRepo = AppDataSource.getRepository(Instalacion);
  const nuevaInstalacion = instalacionRepo.create({
    nombre: data.nombre,
    direccion: data.direccion,
    latitud: data.latitud,
    longitud: data.longitud,
    telefono: data.telefono,
    cliente
  });
  return await instalacionRepo.save(nuevaInstalacion);
}

export async function actualizarInstalacionService(id, data) {
  const instalacionRepo = AppDataSource.getRepository(Instalacion);
  const instalacion = await instalacionRepo.findOneBy({ idInstalacion: id });
  if (!instalacion) throw new Error("Instalación no encontrada.");

  // Si se actualiza el cliente
  if (data.idCliente) {
    const clienteRepo = AppDataSource.getRepository(Cliente);
    const cliente = await clienteRepo.findOneBy({ idCliente: data.idCliente });
    if (!cliente) throw new Error("Cliente asociado no encontrado.");
    instalacion.cliente = cliente;
  }

  instalacionRepo.merge(instalacion, data);
  return await instalacionRepo.save(instalacion);
}

export async function eliminarInstalacionService(id) {
  const contratoRepo = AppDataSource.getRepository(Contrato);
  
  // Buscar si existen contratos activos para esta instalación
  const contratoActivo = await contratoRepo.findOne({
    where: { 
      instalacion: { idInstalacion: id }, 
      estado: "activo" 
    }
  });

  if (contratoActivo) {
    throw new Error("No se puede eliminar la instalación porque tiene contratos activos asociados.");
  }

  const instalacionRepo = AppDataSource.getRepository(Instalacion);
  const result = await instalacionRepo.delete(id);
  if (result.affected === 0) {
    throw new Error("Instalación no encontrada.");
  }
}