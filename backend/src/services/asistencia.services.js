"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Asistencia } from "../models/Asistencia.js";

export async function registrarEntradaService(data) {
  try {
    const asistenciaRepository = AppDataSource.getRepository(Asistencia);

    // Se usa la fecha proveniente del dispositivo
    const hoy = data.fechaDispositivo; 

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
      entrada: data.horaDispositivo, // Se usa la hora del dispositivo
      estado: "presente",
      contrato: { idContrato: data.idContrato },
      latitudEntrada: data.latitud,
      longitudEntrada: data.longitud,
    });

    return await asistenciaRepository.save(nuevaAsistencia);
  } catch (error) {
    throw new Error(`Error al registrar entrada: ${error.message}`);
  }
}

export async function registrarSalidaService(data) {
  try {
    const asistenciaRepository = AppDataSource.getRepository(Asistencia);

    const hoy = data.fechaDispositivo;

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

    asistencia.salida = data.horaDispositivo; // Hora del dispositivo
    asistencia.estado = "completo";
    asistencia.latitudSalida = data.latitud;
    asistencia.longitudSalida = data.longitud;

    return await asistenciaRepository.save(asistencia);
  } catch (error) {
    throw new Error(`Error al registrar salida: ${error.message}`);
  }
}

export async function registrarInicioColacionService(data) {
  try {
    const asistenciaRepository = AppDataSource.getRepository(Asistencia);

    const hoy = data.fechaDispositivo;

    const asistencia = await asistenciaRepository.findOne({
      where: {
        contrato: { idContrato: data.idContrato },
        fecha: hoy,
      },
      relations: ["contrato"],
    });

    if (!asistencia) {
      throw new Error("Debe registrar entrada antes de iniciar la colación.");
    }

    if (asistencia.salida) {
      throw new Error("No puede iniciar colación después de haber registrado la salida.");
    }

    if (asistencia.inicioColacion) {
      throw new Error("Ya existe un inicio de colación registrado para hoy.");
    }

    asistencia.inicioColacion = data.horaDispositivo; // Hora del dispositivo

    return await asistenciaRepository.save(asistencia);
  } catch (error) {
    throw new Error(`Error al registrar inicio de colación: ${error.message}`);
  }
}

export async function registrarFinColacionService(data) {
  try {
    const asistenciaRepository = AppDataSource.getRepository(Asistencia);

    const hoy = data.fechaDispositivo;

    const asistencia = await asistenciaRepository.findOne({
      where: {
        contrato: { idContrato: data.idContrato },
        fecha: hoy,
      },
      relations: ["contrato"],
    });

    if (!asistencia?.inicioColacion) {
      throw new Error("Debe iniciar la colación antes de registrar su término.");
    }

    if (asistencia.finColacion) {
      throw new Error("Ya existe un fin de colación registrado para hoy.");
    }

    // Cálculo usando el string de la hora de inicio
    const [hhInicio, mmInicio, ssInicio = 0] = asistencia.inicioColacion.split(":").map(Number);
    const inicioEnMinutos = hhInicio * 60 + mmInicio + ssInicio / 60;

    // Cálculo usando el string de la hora enviada por el dispositivo
    const [hhFin, mmFin, ssFin = 0] = data.horaDispositivo.split(":").map(Number);
    const finEnMinutos = hhFin * 60 + mmFin + ssFin / 60;

    const minutosTranscurridos = finEnMinutos - inicioEnMinutos;

    if (minutosTranscurridos < 30) {
      const minutosRestantes = Math.ceil(30 - minutosTranscurridos);
      throw new Error(
        `Aún no han transcurrido 30 minutos desde el inicio de la colación. Faltan ${minutosRestantes} minuto(s).`
      );
    }

    asistencia.finColacion = data.horaDispositivo; // Hora del dispositivo

    return await asistenciaRepository.save(asistencia);
  } catch (error) {
    throw new Error(`Error al registrar fin de colación: ${error.message}`);
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