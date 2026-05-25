"use strict";
import {
  registrarEntradaService,
  registrarSalidaService,
  registrarInicioColacionService,
  registrarFinColacionService,
  getAsistenciasService,
  getAsistenciaByIdService,
  eliminarAsistenciasService,
} from "../services/asistencia.services.js";
import { validateAsistenciaBody } from "../validations/asistencia.validations.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../Handlers/responseHanders.js";

export async function registrarEntradaController(req, res) {
  try {
    const { idContrato, latitud, longitud, fechaDispositivo, horaDispositivo } = req.body;

    const { error } = validateAsistenciaBody({ idContrato, latitud, longitud, fechaDispositivo, horaDispositivo });
    if (error) {
      return handleErrorClient(res, 400, error.details.map((d) => d.message).join(", "));
    }

    const registro = await registrarEntradaService({ idContrato, latitud, longitud, fechaDispositivo, horaDispositivo });
    handleSuccess(res, 201, "Entrada registrada correctamente", registro);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function registrarSalidaController(req, res) {
  try {
    const { idContrato, latitud, longitud, fechaDispositivo, horaDispositivo } = req.body;

    const { error } = validateAsistenciaBody({ idContrato, latitud, longitud, fechaDispositivo, horaDispositivo });
    if (error) {
      return handleErrorClient(res, 400, error.details.map((d) => d.message).join(", "));
    }

    const registro = await registrarSalidaService({ idContrato, latitud, longitud, fechaDispositivo, horaDispositivo });
    handleSuccess(res, 200, "Salida registrada correctamente", registro);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function registrarInicioColacionController(req, res) {
  try {
    const { idContrato, latitud, longitud, fechaDispositivo, horaDispositivo } = req.body;

    const { error } = validateAsistenciaBody({ idContrato, latitud, longitud, fechaDispositivo, horaDispositivo });
    if (error) {
      return handleErrorClient(res, 400, error.details.map((d) => d.message).join(", "));
    }

    const registro = await registrarInicioColacionService({ idContrato, latitud, longitud, fechaDispositivo, horaDispositivo });
    handleSuccess(res, 200, "Inicio de colación registrado correctamente", registro);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function registrarFinColacionController(req, res) {
  try {
    const { idContrato, latitud, longitud, fechaDispositivo, horaDispositivo } = req.body;

    const { error } = validateAsistenciaBody({ idContrato, latitud, longitud, fechaDispositivo, horaDispositivo });
    if (error) {
      return handleErrorClient(res, 400, error.details.map((d) => d.message).join(", "));
    }

    const registro = await registrarFinColacionService({ idContrato, latitud, longitud, fechaDispositivo, horaDispositivo });
    handleSuccess(res, 200, "Fin de colación registrado correctamente", registro);
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