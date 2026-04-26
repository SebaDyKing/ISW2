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
  handleErrorServer,
} from "../Handlers/responseHanders.js";

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
    const nueva = await createHojaVidaServices(req.body);
    handleSuccess(res, 201, "Hoja de vida creada", nueva);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}

export async function updateHojaVidaController(req, res) {
  try {
    const id = Number(req.params.id);
    const actualizada = await updateHojaVidaServices(id, req.body);
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
