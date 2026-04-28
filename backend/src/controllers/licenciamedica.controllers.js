"use strict";
import {
  getLicenciasMedicasServices,
  getLicenciaMedicaServicesByID,
  createLicenciaMedicaServices,
  updateEstadoLicenciaMedicaServices,
  deleteLicenciaMedicaServices,
} from "../services/licenciamedica.services.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../Handlers/responseHanders.js";
import {
  validateLicenciaMedicaBody,
  validateLicenciaMedicaEstado,
} from "../validations/licenciamedica.validations.js";

export async function getLicenciasMedicasController(req, res) {
  try {
    const licencias = await getLicenciasMedicasServices();
    handleSuccess(res, 200, "Licencias médicas obtenidas", licencias);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getLicenciaMedicaByIdController(req, res) {
  try {
    const id = Number(req.params.id);
    const licencia = await getLicenciaMedicaServicesByID(id);
    handleSuccess(res, 200, "Licencia médica obtenida", licencia);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createLicenciaMedicaController(req, res) {
  try {
    const { error, value } = validateLicenciaMedicaBody(req.body);
    if (error) return handleErrorClient(res, 400, "Datos inválidos", error.details);

    const nueva = await createLicenciaMedicaServices(value);
    handleSuccess(res, 201, "Licencia médica creada", nueva);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateEstadoLicenciaMedicaController(req, res) {
  try {
    const id = Number(req.params.id);

    const { error, value } = validateLicenciaMedicaEstado(req.body);
    if (error) return handleErrorClient(res, 400, "Datos inválidos", error.details);

    const actualizada = await updateEstadoLicenciaMedicaServices(id, value);
    handleSuccess(res, 200, "Estado de licencia médica actualizado", actualizada);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteLicenciaMedicaController(req, res) {
  try {
    const id = Number(req.params.id);

    const resultado = await deleteLicenciaMedicaServices(id);
    handleSuccess(res, 200, "Licencia médica eliminada", resultado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
