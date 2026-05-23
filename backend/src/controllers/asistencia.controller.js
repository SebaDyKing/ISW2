"use strict";
import {
  registrarEntradaService,
  registrarSalidaService,
  getAsistenciasService,
  getAsistenciaByIdService,
  eliminarAsistenciasService,
} from "../services/asistencia.services.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../Handlers/responseHanders.js";

export async function registrarEntradaController(req, res) {
  try {
    const idContrato = req.body?.idContrato;
    if (!idContrato) {
      return handleErrorClient(res, 400, "El campo idContrato es requerido");
    }
    const registro = await registrarEntradaService({ idContrato });
    handleSuccess(res, 201, "Entrada registrada correctamente", registro);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function registrarSalidaController(req, res) {
  try {
    const idContrato = req.body?.idContrato;
    if (!idContrato) {
      return handleErrorClient(res, 400, "El campo idContrato es requerido");
    }
    const registro = await registrarSalidaService({ idContrato });
    handleSuccess(res, 200, "Salida registrada correctamente", registro);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getAsistenciasController(req, res) {
  try {
    const data = await getAsistenciasService();
    handleSuccess(res, 200, "Asistencias obtenidas correctamente", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getAsistenciaByIdController(req, res) {
  try {
    const data = await getAsistenciaByIdService(Number(req.params.id));
    handleSuccess(res, 200, "Asistencia obtenida correctamente", data);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function eliminarAsistenciasController(req, res) {
  try {
    const resultado = await eliminarAsistenciasService();
    handleSuccess(res, 200, "Registros de asistencia eliminados", resultado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}