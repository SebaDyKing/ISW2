"use strict";
import Joi from "joi";

/**
 * @brief Esquema de validación para el registro de entrada/salida de asistencia.
 *        Valida idContrato, latitud y longitud.
 */
// MODIFICACIÓN: Se eliminó la declaración duplicada de asistenciaBodyValidation
// que causaba SyntaxError. Se fusionó todo en un solo objeto Joi
// MODIFICACIÓN: Se agregaron rangos min/max a latitud y longitud
// para rechazar coordenadas imposibles antes de que lleguen a la BD
export const asistenciaBodyValidation = Joi.object({
  idContrato: Joi.number().integer().positive().required().messages({
    "number.base": "El campo idContrato debe ser un número",
    "number.integer": "El campo idContrato debe ser un entero",
    "number.positive": "El campo idContrato debe ser un número positivo",
    "any.required": "El campo idContrato es obligatorio",
  }),
  // MODIFICACIÓN: Se agregó validación de latitud con rango -90 a 90
  latitud: Joi.number().min(-90).max(90).required().messages({
    "any.required": "La latitud es obligatoria",
    "number.base": "La latitud debe ser un número válido",
    "number.min": "La latitud mínima es -90",
    "number.max": "La latitud máxima es 90",
  }),
  // MODIFICACIÓN: Se agregó validación de longitud con rango -180 a 180
  longitud: Joi.number().min(-180).max(180).required().messages({
    "any.required": "La longitud es obligatoria",
    "number.base": "La longitud debe ser un número válido",
    "number.min": "La longitud mínima es -180",
    "number.max": "La longitud máxima es 180",
  }),
});

/**
 * @brief Valida los datos del registro de asistencia.
 * @param {Object} input - Datos a validar.
 * @return {Object} - Resultado de la validación con errores si los hay.
 */
export function validateAsistenciaBody(input) {
  return asistenciaBodyValidation.validate(input, { abortEarly: false });
}