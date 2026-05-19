"use strict";
import {
  getHojaVidaServices,
  getHojaVidaServicesByID,
  createHojaVidaServices,
  updateHojaVidaServices,
  deleteHojaVidaServices,
} from "../services/hojavida.services.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../Handlers/responseHanders.js";
import {
  validateHojaVidaBody,
  hojaVidaBodyPartialValidation,
} from "../validations/hojavida.validations.js";

export async function getHojasVidaController(req, res) {
  try {
    const hojas = await getHojaVidaServices();
    handleSuccess(res, 200, "Hojas de vida obtenidas", hojas);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function getHojaVidaByIdController(req, res) {
  try {
    const id = Number(req.params.id);
    const hoja = await getHojaVidaServicesByID(id);
    handleSuccess(res, 200, "Hoja de vida obtenida", hoja);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function createHojaVidaController(req, res) {
  try {
    const { error, value } = validateHojaVidaBody(req.body);
    if (error) return handleErrorClient(res, 400, "Datos inválidos", error.details);

    const nueva = await createHojaVidaServices(value);
    handleSuccess(res, 201, "Hoja de vida creada", nueva);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateHojaVidaController(req, res) {
  try {
    const id = Number(req.params.id);

    const { error, value } = hojaVidaBodyPartialValidation(req.body);
    if (error) return handleErrorClient(res, 400, "Datos inválidos", error.details);

    const actualizada = await updateHojaVidaServices(id, value);
    handleSuccess(res, 200, "Hoja de vida actualizada", actualizada);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function deleteHojaVidaController(req, res) {
  try {
    const id = Number(req.params.id);

    const resultado = await deleteHojaVidaServices(id);
    handleSuccess(res, 200, "Hoja de vida eliminada", resultado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
