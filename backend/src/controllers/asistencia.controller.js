"use strict";
import {
  getAsistenciasService,
  getAsistenciaByIdService,
  registrarEntradaService,
  registrarSalidaService,
  eliminarAsistenciasService,
} from "../services/asistencia.services.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../Handlers/responseHanders.js";
import { validateAsistenciaBody } from "../validations/asistencia.validations.js";

export async function getAsistenciasController(req, res) {
  try {
    const asistencias = await getAsistenciasService();
    handleSuccess(res, 200, "Asistencias obtenidas", asistencias);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getAsistenciaByIdController(req, res) {
  try {
    const id = Number(req.params.id);
    const asistencia = await getAsistenciaByIdService(id);
    handleSuccess(res, 200, "Asistencia obtenida", asistencia);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function registrarEntradaController(req, res) {
  try {
    const { error, value } = validateAsistenciaBody(req.body);
    if (error) return handleErrorClient(res, 400, "Datos inválidos", error.details);

    const registro = await registrarEntradaService(value);
    handleSuccess(res, 201, "Entrada registrada", registro);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function registrarSalidaController(req, res) {
  try {
    const { error, value } = validateAsistenciaBody(req.body);
    if (error) return handleErrorClient(res, 400, "Datos inválidos", error.details);

    const registro = await registrarSalidaService(value);
    handleSuccess(res, 200, "Salida registrada", registro);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function eliminarAsistenciasController(req, res) {
  try {
    const resultado = await eliminarAsistenciasService();
    handleSuccess(res, 200, "Todas las asistencias eliminadas", resultado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}