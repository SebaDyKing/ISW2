"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Asistencia } from "../models/Asistencia.js";

// Helper para convertir formato HH:mm:ss o HH:mm a minutos totales y facilitar comparaciones
function horaAMinutos(horaStr) {
  const [hh, mm, ss = 0] = horaStr.split(":").map(Number);
  return hh * 60 + mm + ss / 60;
}

export async function registrarEntradaService(data) {
  try {
    const asistenciaRepository = AppDataSource.getRepository(Asistencia);

    const hoy = data.fechaDispositivo;

    const registroExistente = await asistenciaRepository.findOne({
      where: {
        contrato: { idContrato: data.idContrato },
        fecha: hoy,
      },
      relations: ["contrato"],
    });

    if (registroExistente) {
      throw { status: 400, message: "Ya existe una entrada registrada para hoy." };
    }

    const nuevaAsistencia = asistenciaRepository.create({
      fecha: hoy,
      entrada: data.horaDispositivo,
      estado: "presente",
      contrato: { idContrato: data.idContrato },
      latitudEntrada: data.latitud,
      longitudEntrada: data.longitud,
    });

    return await asistenciaRepository.save(nuevaAsistencia);
  } catch (error) {
    if (error.status) throw error;
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
      throw { status: 400, message: "No existe una entrada activa para hoy. Debe marcar entrada primero." };
    }

    if (asistencia.salida) {
      throw { status: 400, message: "Ya existe una salida registrada para hoy." };
    }

    // Validar que no tenga colación iniciada sin finalizar
    if (asistencia.inicioColacion && !asistencia.finColacion) {
      throw { status: 400, message: "Debe registrar el fin de la colación antes de registrar la salida." };
    }

    // Validar secuencia de tiempo: salida posterior a entrada
    const entradaMinutos = horaAMinutos(asistencia.entrada);
    const salidaMinutos = horaAMinutos(data.horaDispositivo);
    if (salidaMinutos <= entradaMinutos) {
      throw { status: 400, message: "La hora de salida debe ser posterior a la hora de entrada." };
    }

    // Validar secuencia de tiempo: salida posterior a colación (si aplica)
    if (asistencia.finColacion) {
      const finColacionMinutos = horaAMinutos(asistencia.finColacion);
      if (salidaMinutos <= finColacionMinutos) {
        throw { status: 400, message: "La hora de salida debe ser posterior a la hora de fin de colación." };
      }
    }

    asistencia.salida = data.horaDispositivo;
    asistencia.estado = "completo";
    asistencia.latitudSalida = data.latitud;
    asistencia.longitudSalida = data.longitud;

    return await asistenciaRepository.save(asistencia);
  } catch (error) {
    if (error.status) throw error;
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
      throw { status: 400, message: "Debe registrar entrada antes de iniciar la colación." };
    }

    if (asistencia.salida) {
      throw { status: 400, message: "No puede iniciar colación después de haber registrado la salida." };
    }

    if (asistencia.inicioColacion) {
      throw { status: 400, message: "Ya existe un inicio de colación registrado para hoy." };
    }

    // Validar secuencia de tiempo: inicio de colación posterior a entrada
    const entradaMinutos = horaAMinutos(asistencia.entrada);
    const inicioColacionMinutos = horaAMinutos(data.horaDispositivo);
    if (inicioColacionMinutos <= entradaMinutos) {
      throw { status: 400, message: "La hora de inicio de colación debe ser posterior a la hora de entrada." };
    }

    asistencia.inicioColacion = data.horaDispositivo;

    return await asistenciaRepository.save(asistencia);
  } catch (error) {
    if (error.status) throw error;
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

    if (!asistencia || !asistencia.inicioColacion) {
      throw { status: 400, message: "Debe iniciar la colación antes de registrar su término." };
    }

    if (asistencia.salida) {
      throw { status: 400, message: "No puede finalizar la colación después de haber registrado la salida." };
    }

    if (asistencia.finColacion) {
      throw { status: 400, message: "Ya existe un fin de colación registrado para hoy." };
    }

    const inicioEnMinutos = horaAMinutos(asistencia.inicioColacion);
    const finEnMinutos = horaAMinutos(data.horaDispositivo);

    // Validar secuencia de tiempo
    if (finEnMinutos <= inicioEnMinutos) {
      throw { status: 400, message: "La hora de término de colación no puede ser anterior o igual a la hora de inicio." };
    }

    const minutosTranscurridos = finEnMinutos - inicioEnMinutos;

    if (minutosTranscurridos < 30) {
      const minutosRestantes = Math.ceil(30 - minutosTranscurridos);
      throw {
        status: 400,
        message: `Aún no han transcurrido 30 minutos desde el inicio de la colación. Faltan ${minutosRestantes} minuto(s).`
      };
    }

    asistencia.finColacion = data.horaDispositivo;

    return await asistenciaRepository.save(asistencia);
  } catch (error) {
    if (error.status) throw error;
    throw new Error(`Error al registrar fin de colación: ${error.message}`);
  }
}

export async function getAsistenciasService() {
  try {
    const asistenciaRepository = AppDataSource.getRepository(Asistencia);
    return await asistenciaRepository.find({
      where: { contrato: { idContrato } },
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

    if (!asistencia) {
      throw { status: 404, message: "Asistencia no encontrada" };
    }
    return asistencia;
  } catch (error) {
    if (error.status) throw error;
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