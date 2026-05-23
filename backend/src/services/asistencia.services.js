"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Asistencia } from "../models/Asistencia.js";

export async function registrarEntradaService(data) {
  try {
    const asistenciaRepository = AppDataSource.getRepository(Asistencia);

    const hoy = new Date().toISOString().split("T")[0];

    const registroExistente = await asistenciaRepository.findOne({
      where: {
        contrato: { idContrato: data.idContrato },
        fecha: hoy,
      },
      relations: ["contrato"],
    });

    if (registroExistente) {
      throw new Error("Ya existe una entrada registrada para hoy.");
    }

    const nuevaAsistencia = asistenciaRepository.create({
      fecha: hoy,
      entrada: new Date().toTimeString().split(" ")[0],
      estado: "presente",
      contrato: { idContrato: data.idContrato },
    });

    return await asistenciaRepository.save(nuevaAsistencia);
  } catch (error) {
    throw new Error(`Error al registrar entrada: ${error.message}`);
  }
}

export async function registrarSalidaService(data) {
  try {
    const asistenciaRepository = AppDataSource.getRepository(Asistencia);

    const hoy = new Date().toISOString().split("T")[0];

    const asistencia = await asistenciaRepository.findOne({
      where: {
        contrato: { idContrato: data.idContrato },
        fecha: hoy,
      },
      relations: ["contrato"],
    });

    if (!asistencia) {
      throw new Error("No existe una entrada activa para hoy. Debe marcar entrada primero.");
    }

    if (asistencia.salida) {
      throw new Error("Ya existe una salida registrada para hoy.");
    }

    asistenciaRepository.merge(asistencia, {
      salida: new Date().toTimeString().split(" ")[0],
      estado: "completo",
    });

    return await asistenciaRepository.save(asistencia);
  } catch (error) {
    throw new Error(`Error al registrar salida: ${error.message}`);
  }
}

export async function getAsistenciasService() {
  try {
    const asistenciaRepository = AppDataSource.getRepository(Asistencia);
    return await asistenciaRepository.find({
      relations: ["contrato"],
    });
  } catch (error) {
    throw new Error(`Error al obtener asistencias: ${error.message}`);
  }
}

export async function getAsistenciaByIdService(id) {
  try {
    const asistenciaRepository = AppDataSource.getRepository(Asistencia);
    const asistencia = await asistenciaRepository.findOne({
      where: { idAsistencia: id },
      relations: ["contrato"],
    });

    if (!asistencia) throw new Error("Asistencia no encontrada");
    return asistencia;
  } catch (error) {
    throw new Error(`Error al obtener la asistencia: ${error.message}`);
  }
}

export async function eliminarAsistenciasService() {
  try {
    const asistenciaRepository = AppDataSource.getRepository(Asistencia);
    await asistenciaRepository.clear();
    return { message: "Todos los registros de asistencia eliminados" };
  } catch (error) {
    throw new Error(`Error al eliminar asistencias: ${error.message}`);
  }
}