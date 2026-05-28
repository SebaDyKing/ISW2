"use strict";
import {
  registrarEntradaService,
  registrarSalidaService,
  getAsistenciasService,
  getAsistenciaByIdService,
  eliminarAsistenciasService,
} from "../services/asistencia.services.js";
// MODIFICACIÓN: Se agregó import de validateAsistenciaBody para validar los datos antes de llamar al servicio
import { validateAsistenciaBody } from "../validations/asistencia.validations.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../Handlers/responseHanders.js";

export async function registrarEntradaController(req, res) {
  try {
    // MODIFICACIÓN: Se reemplazó "const idContrato = req.body?.idContrato" por destructuring
    // para extraer también latitud y longitud en la misma función (antes eran dos funciones duplicadas)
    const { idContrato, latitud, longitud } = req.body;

    // MODIFICACIÓN: Se agregó validación con Joi antes de llamar al servicio
    // Antes no se validaba nada, cualquier dato pasaba directo
    const { error } = validateAsistenciaBody({ idContrato, latitud, longitud });
    if (error) {
      return handleErrorClient(res, 400, error.details.map((d) => d.message).join(", "));
    }

    // MODIFICACIÓN: Se agregó latitud y longitud al llamado del servicio
    const registro = await registrarEntradaService({ idContrato, latitud, longitud });
    handleSuccess(res, 201, "Entrada registrada correctamente", registro);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function registrarSalidaController(req, res) {
  try {
    // MODIFICACIÓN: Se reemplazó "const idContrato = req.body?.idContrato" por destructuring
    // para extraer también latitud y longitud en la misma función (antes eran dos funciones duplicadas)
    const { idContrato, latitud, longitud } = req.body;

    // MODIFICACIÓN: Se agregó validación con Joi antes de llamar al servicio
    const { error } = validateAsistenciaBody({ idContrato, latitud, longitud });
    if (error) {
      return handleErrorClient(res, 400, error.details.map((d) => d.message).join(", "));
    }

    // MODIFICACIÓN: Se agregó latitud y longitud al llamado del servicio
    const registro = await registrarSalidaService({ idContrato, latitud, longitud });
    handleSuccess(res, 200, "Salida registrada correctamente", registro);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

// Sin cambios desde aquí
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