"use strict";
import Joi from "joi";

/**
 * @brief Esquema de validación para los datos de creación de una licencia médica.
 *        Valida los campos requeridos: fechaInicio, fechaFin, diagnostico e idEmpleado.
 *        El campo archivoPdf es opcional (por ahora se gestiona desde el body; cuando
 *        se integre Multer pasará a req.file). El campo fechaFin debe ser mayor o
 *        igual que fechaInicio.
 * @param {Object} input - Objeto que representa los datos de la licencia a validar.
 * @return {Object} - Resultado de la validación con información sobre los errores, si los hay.
 */
export const licenciaMedicaBodyValidation = Joi.object({
  fechaInicio: Joi.date().iso().required().messages({
    "date.base": `El campo fechaInicio debe ser una fecha válida`,
    "date.format": `El campo fechaInicio debe tener formato ISO (YYYY-MM-DD)`,
    "any.required": `El campo fechaInicio es obligatorio`,
  }),
  fechaFin: Joi.date().iso().min(Joi.ref("fechaInicio")).required().messages({
    "date.base": `El campo fechaFin debe ser una fecha válida`,
    "date.format": `El campo fechaFin debe tener formato ISO (YYYY-MM-DD)`,
    "date.min": `La fecha de fin no puede ser anterior a la fecha de inicio`,
    "any.required": `El campo fechaFin es obligatorio`,
  }),
  diagnostico: Joi.string().max(255).required().messages({
    "string.base": `El campo diagnostico debe ser un texto`,
    "string.max": `El campo diagnostico no puede superar los 255 caracteres`,
    "string.empty": `El campo diagnostico no puede estar vacío`,
    "any.required": `El campo diagnostico es obligatorio`,
  }),
  idEmpleado: Joi.number().integer().positive().required().messages({
    "number.base": `El campo idEmpleado debe ser un número`,
    "number.integer": `El campo idEmpleado debe ser un entero`,
    "number.positive": `El campo idEmpleado debe ser un número positivo`,
    "any.required": `El campo idEmpleado es obligatorio`,
  }),
  archivoPdf: Joi.string().max(255).optional().messages({
    "string.base": `El campo archivoPdf debe ser un texto`,
    "string.max": `El campo archivoPdf no puede superar los 255 caracteres`,
  }),
});

/**
 * @brief Esquema de validación para el cambio de estado de una licencia médica.
 *        Valida que el estado sea uno de los permitidos y que el supervisor que toma
 *        la decisión sea identificado.
 * @param {Object} input - Objeto con los campos estado e idSupervisor.
 * @return {Object} - Resultado de la validación.
 */
export const licenciaMedicaEstadoValidation = Joi.object({
  estado: Joi.string().valid("pendiente", "aprobada", "rechazada").required().messages({
    "any.only": `El estado debe ser uno de: pendiente, aprobada, rechazada`,
    "string.empty": `El estado no puede estar vacío`,
    "any.required": `El estado es obligatorio`,
  }),
  idSupervisor: Joi.number().integer().positive().required().messages({
    "number.base": `El campo idSupervisor debe ser un número`,
    "number.integer": `El campo idSupervisor debe ser un entero`,
    "number.positive": `El campo idSupervisor debe ser un número positivo`,
    "any.required": `El campo idSupervisor es obligatorio`,
  }),
});

/**
 * @brief Función que valida los datos completos para crear una licencia médica.
 *        Retorna un objeto con los resultados de la validación, incluyendo todos los errores si existen.
 * @param {Object} input - Objeto con los datos de la licencia a validar.
 * @return {Object} - Resultado de la validación, incluyendo mensajes de error si los hay.
 */
export function validateLicenciaMedicaBody(input) {
  return licenciaMedicaBodyValidation.validate(input, { abortEarly: false });
}

/**
 * @brief Función que valida los datos del cambio de estado de una licencia médica.
 * @param {Object} input - Objeto con los campos estado e idSupervisor.
 * @return {Object} - Resultado de la validación, con detalles de los errores si existen.
 */
export function validateLicenciaMedicaEstado(input) {
  return licenciaMedicaEstadoValidation.validate(input, { abortEarly: false });
}
