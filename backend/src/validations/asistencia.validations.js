"use strict";
import Joi from "joi";

/**
 * @brief Esquema de validación para el registro de entrada/salida de asistencia.
 *        Valida el campo requerido: idContrato (FK al contrato del empleado).
 *        Utiliza Joi para asegurar que los datos cumplan con los tipos y restricciones establecidas.
 * @param {Object} input - Objeto que representa los datos del registro a validar.
 * @return {Object} - Resultado de la validación con información sobre los errores, si los hay.
 */
export const asistenciaBodyValidation = Joi.object({
  idContrato: Joi.number().integer().positive().required().messages({
    "number.base": "El campo idContrato debe ser un número",
    "number.integer": "El campo idContrato debe ser un entero",
    "number.positive": "El campo idContrato debe ser un número positivo",
    "any.required": "El campo idContrato es obligatorio",
  }),
});

/**
 * @brief Función que valida los datos completos del registro de asistencia.
 *        Retorna un objeto con los resultados de la validación, incluyendo todos los errores si existen.
 * @param {Object} input - Objeto con los datos del registro a validar.
 * @return {Object} - Resultado de la validación, incluyendo mensajes de error si los hay.
 */
export function validateAsistenciaBody(input) {
  return asistenciaBodyValidation.validate(input, { abortEarly: false });
}