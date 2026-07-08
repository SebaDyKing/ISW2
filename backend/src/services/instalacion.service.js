"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Instalacion } from "../models/Instalacion.js";
import { Cliente } from "../models/Cliente.js";

import { Contrato } from "../models/Contrato.js";
import { SolicitudCotizacion } from "../models/SolicitudCotizacion.js";

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
  const cotizacionRepo = AppDataSource.getRepository(SolicitudCotizacion);
  const estadosBloqueantes = [
    "Pendiente", "pendiente",
    "Aprobada", "aprobada", "Aprobado", "aprobado",
    "Rechazada", "rechazada", "Rechazado", "rechazado"
  ];
  
  const cotizaciones = await cotizacionRepo.find({
    where: estadosBloqueantes.map((est) => ({
      estado: est
    })),
    relations: ["instalacion"]
  });

  const instalacionIds = [...new Set(cotizaciones.map((c) => c.instalacion?.idInstalacion).filter(Boolean))];

  if (instalacionIds.length === 0) {
    return [];
  }

  const instalacionRepo = AppDataSource.getRepository(Instalacion);
  return await instalacionRepo.find({
    where: instalacionIds.map((id) => ({ idInstalacion: id })),
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

export async function actualizarInstalacionService(id, data, user) {
  const instalacionRepo = AppDataSource.getRepository(Instalacion);
  const instalacion = await instalacionRepo.findOne({
    where: { idInstalacion: id },
    relations: ["cliente"]
  });
  if (!instalacion) throw new Error("Instalación no encontrada.");

  if (user && user.rol === "cliente") {
    const clienteRepo = AppDataSource.getRepository(Cliente);
    const cliente = await clienteRepo.findOne({
      where: { usuario: { idUsuario: user.idUsuario } },
    });
    if (!cliente || instalacion.cliente?.idCliente !== cliente.idCliente) {
      throw new Error("No tienes permisos para modificar esta instalación.");
    }
    // Clientes no pueden cambiar de cliente asociado
    delete data.idCliente;
  } else if (data.idCliente) {
    const clienteRepo = AppDataSource.getRepository(Cliente);
    const cliente = await clienteRepo.findOneBy({ idCliente: data.idCliente });
    if (!cliente) throw new Error("Cliente asociado no encontrado.");
    instalacion.cliente = cliente;
  }

  instalacionRepo.merge(instalacion, data);
  return await instalacionRepo.save(instalacion);
}

export async function eliminarInstalacionService(id, user) {
  const instalacionRepo = AppDataSource.getRepository(Instalacion);
  const instalacion = await instalacionRepo.findOne({
    where: { idInstalacion: id },
    relations: ["cliente"]
  });
  if (!instalacion) throw new Error("Instalación no encontrada.");

  if (user && user.rol === "cliente") {
    const clienteRepo = AppDataSource.getRepository(Cliente);
    const cliente = await clienteRepo.findOne({
      where: { usuario: { idUsuario: user.idUsuario } },
    });
    if (!cliente || instalacion.cliente?.idCliente !== cliente.idCliente) {
      throw new Error("No tienes permisos de propiedad sobre esta instalación");
    }
  }

  // Buscar si existen cotizaciones en estado "Pendiente", "Aprobada" o "Rechazada" asociadas a esta instalación
  const cotizacionRepo = AppDataSource.getRepository(SolicitudCotizacion);
  const estadosBloqueantes = [
    "Pendiente", "pendiente",
    "Aprobada", "aprobada", "Aprobado", "aprobado",
    "Rechazada", "rechazada", "Rechazado", "rechazado"
  ];
  const cotizacionAsociada = await cotizacionRepo.findOne({
    where: estadosBloqueantes.map((est) => ({
      instalacion: { idInstalacion: id },
      estado: est
    }))
  });

  if (cotizacionAsociada) {
    throw new Error("No se puede eliminar la instalación porque tiene cotizaciones asociadas");
  }

  // Buscar si existen contratos activos para esta instalación
  const contratoInstalacionRepo = AppDataSource.getRepository("ContratoInstalacion");
  const contratoActivo = await contratoInstalacionRepo.findOne({
    where: [
      { instalacion: { idInstalacion: id }, contrato: { estado: "activo" } },
      { instalacion: { idInstalacion: id }, contrato: { estado: "ACTIVO" } }
    ],
    relations: ["contrato"]
  });

  if (contratoActivo) {
    throw new Error("No se puede eliminar la instalación porque tiene contratos activos asociados");
  }

  try {
    const result = await instalacionRepo.delete(id);
    if (result.affected === 0) {
      throw new Error("Instalación no encontrada");
    }
  } catch (error) {
    if (error.code === "23503" || error.message.includes("foreign key")) {
      throw new Error("No se puede eliminar la instalación porque tiene cotizaciones o contratos asociados");
    }
    throw error;
  }
}