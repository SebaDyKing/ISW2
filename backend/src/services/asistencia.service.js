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
    await validarDistanciaInstalacion(data.idContrato, data.latitud, data.longitud);
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
    await validarDistanciaInstalacion(data.idContrato, data.latitud, data.longitud);
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

    // Validaciones de secuencia de tiempo removidas para permitir marcaje flexible durante pruebas

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
    await validarDistanciaInstalacion(data.idContrato, data.latitud, data.longitud);
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

    // Validaciones de secuencia de tiempo removidas para permitir marcaje flexible durante pruebas

    asistencia.inicioColacion = data.horaDispositivo;

    return await asistenciaRepository.save(asistencia);
  } catch (error) {
    if (error.status) throw error;
    throw new Error(`Error al registrar inicio de colación: ${error.message}`);
  }
}

export async function registrarFinColacionService(data) {
  try {
    await validarDistanciaInstalacion(data.idContrato, data.latitud, data.longitud);
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

    // Validaciones de secuencia de tiempo y de duración mínima de colación removidas para permitir marcaje flexible durante pruebas

    asistencia.finColacion = data.horaDispositivo;

    return await asistenciaRepository.save(asistencia);
  } catch (error) {
    if (error.status) throw error;
    throw new Error(`Error al registrar fin de colación: ${error.message}`);
  }
}

export async function getAsistenciasService(idContrato) {
  try {
    const asistenciaRepository = AppDataSource.getRepository(Asistencia);
    const where = idContrato ? { contrato: { idContrato } } : {};
    return await asistenciaRepository.find({
      where,
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

// Helper para calcular distancia entre dos coordenadas en metros usando Haversine
function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

// Verifica si el marcaje está dentro del rango de 150m de la instalación asignada
async function validarDistanciaInstalacion(idContrato, latDispositivo, lonDispositivo) {
  if (latDispositivo === undefined || lonDispositivo === undefined || latDispositivo === null || lonDispositivo === null) {
    throw { status: 400, message: "La geolocalización es obligatoria para registrar la asistencia." };
  }

  const maxDistancia = process.env.MAX_ASISTENCIA_DISTANCIA
    ? Number(process.env.MAX_ASISTENCIA_DISTANCIA)
    : 150;

  const contratoRepo = AppDataSource.getRepository("Contrato");
  const contrato = await contratoRepo.findOne({
    where: { idContrato },
    relations: ["contratoInstalaciones", "contratoInstalaciones.instalacion"]
  });

  if (!contrato) {
    throw { status: 404, message: "Contrato no encontrado." };
  }

  if (!contrato.contratoInstalaciones || contrato.contratoInstalaciones.length === 0) {
    throw { status: 400, message: "El contrato del empleado no tiene una instalación asignada." };
  }

  let instalacionValida = false;
  let menorDistancia = Infinity;

  for (const ci of contrato.contratoInstalaciones) {
    const instLat = Number(ci.instalacion.latitud);
    const instLon = Number(ci.instalacion.longitud);

    const distancia = calcularDistanciaHaversine(
      Number(latDispositivo),
      Number(lonDispositivo),
      instLat,
      instLon
    );

    if (distancia < menorDistancia) {
      menorDistancia = distancia;
    }

    if (distancia <= maxDistancia) {
      instalacionValida = true;
      break;
    }
  }

  if (!instalacionValida) {
    throw {
      status: 400,
      message: `Marcaje fuera de rango. Estás a ${Math.round(menorDistancia)} metros del lugar de trabajo más cercano (rango máx: ${maxDistancia}m). Coordenadas detectadas: ${latDispositivo}, ${lonDispositivo}`
    };
  }
}