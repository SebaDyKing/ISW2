"use strict";
import {
  registrarEntradaService,
  registrarSalidaService,
  eliminarRegistrosService,
} from "../services/registros.service.js";
import {
  handleSuccess,
  handleErrorClient,
  handleErrorServer,
} from "../handlers/responseHandlers.js";
import { validarNombre } from "../validations/registros.validation.js";
 
export async function entradaController(req, res) {
  try {
    const { error } = validarNombre(req.body);
    if (error) return handleErrorClient(res, 400, "Datos inválidos", error);
 
    const registro = await registrarEntradaService(req.body.nombre);
    handleSuccess(res, 201, `Entrada registrada para ${req.body.nombre.trim()}`, registro);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
 
export async function salidaController(req, res) {
  try {
    const { error } = validarNombre(req.body);
    if (error) return handleErrorClient(res, 400, "Datos inválidos", error);
 
    const registro = await registrarSalidaService(req.body.nombre);
    handleSuccess(res, 201, `Salida registrada para ${req.body.nombre.trim()}`, registro);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
 
export async function eliminarController(req, res) {
  try {
    const resultado = await eliminarRegistrosService();
    handleSuccess(res, 200, "Registros y estados eliminados", resultado);
  } catch (error) {
    handleErrorServer(res, 500, error.message);
  }
}
 