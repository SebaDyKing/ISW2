"use strict";
import Joi from "joi";

/**
 * @brief Esquema de validación para los datos de la hoja de vida.
 *        Valida los campos requeridos: tipo, descripcion, fecha, idEmpleado e idAdmin.
 *        Utiliza Joi para asegurar que los datos cumplan con los tipos y restricciones establecidas.
 * @param {Object} input - Objeto que representa los datos de la hoja de vida a validar.
 * @return {Object} - Resultado de la validación con información sobre los errores, si los hay.
 */
export const hojaVidaBodyValidation = Joi.object({
  tipo: Joi.string().max(50).required().messages({
    "string.base": `El campo tipo debe ser un texto`,
    "string.max": `El campo tipo no puede superar los 50 caracteres`,
    "any.required": `El campo tipo es obligatorio`,
    "string.empty": `El campo tipo no puede estar vacío`,
  }),
  descripcion: Joi.string().required().messages({
    "string.base": `El campo descripcion debe ser un texto`,
    "any.required": `El campo descripcion es obligatorio`,
    "string.empty": `El campo descripcion no puede estar vacío`,
  }),
  fecha: Joi.date().iso().required().messages({
    "date.base": `El campo fecha debe ser una fecha válida`,
    "date.format": `El campo fecha debe tener formato ISO (YYYY-MM-DD)`,
    "any.required": `El campo fecha es obligatorio`,
  }),
  idEmpleado: Joi.number().integer().positive().required().messages({
    "number.base": `El campo idEmpleado debe ser un número`,
    "number.integer": `El campo idEmpleado debe ser un entero`,
    "number.positive": `El campo idEmpleado debe ser un número positivo`,
    "any.required": `El campo idEmpleado es obligatorio`,
  }),
  idAdmin: Joi.number().integer().positive().required().messages({
    "number.base": `El campo idAdmin debe ser un número`,
    "number.integer": `El campo idAdmin debe ser un entero`,
    "number.positive": `El campo idAdmin debe ser un número positivo`,
    "any.required": `El campo idAdmin es obligatorio`,
  }),
});

/**
 * @brief Función que valida los datos completos de la hoja de vida según el esquema definido.
 *        Retorna un objeto con los resultados de la validación, incluyendo los errores si existen.
 * @param {Object} input - Objeto con los datos de la hoja de vida a validar.
 * @return {Object} - Resultado de la validación, incluyendo mensajes de error si los hay.
 */
export function validateHojaVidaBody(input) {
  return hojaVidaBodyValidation.validate(input, { abortEarly: false });
}

/**
 * @brief Función que realiza una validación parcial de la hoja de vida.
 *        Permite validar uno o varios campos opcionalmente, sin requerir todos los campos del esquema.
 * @param {Object} input - Objeto con los campos a validar parcialmente.
 * @return {Object} - Resultado de la validación parcial, con detalles de los errores si existen.
 */
export function hojaVidaBodyPartialValidation(input) {
  return hojaVidaBodyValidation.fork(Object.keys(hojaVidaBodyValidation.describe().keys), (schema) => schema.optional()).validate(input, { abortEarly: false });
}
