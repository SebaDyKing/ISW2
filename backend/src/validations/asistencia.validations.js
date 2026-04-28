"use strict";
import Joi from "joi";
 
/**
 * @brief Esquema de validación para el registro de entrada/salida de empleados.
 *        Valida el campo requerido: nombre.
 *        Utiliza Joi para asegurar que los datos cumplan con los tipos y restricciones establecidas.
 * @param {Object} input - Objeto que representa los datos del registro a validar.
 * @return {Object} - Resultado de la validación con información sobre los errores, si los hay.
 */
export const registroBodyValidation = Joi.object({
  nombre: Joi.string().max(100).required().messages({
    "string.base": "El campo nombre debe ser un texto",
    "string.max": "El campo nombre no puede superar los 100 caracteres",
    "any.required": "El campo nombre es obligatorio",
    "string.empty": "El campo nombre no puede estar vacío",
  }),
});
 
/**
 * @brief Función que valida los datos completos del registro según el esquema definido.
 *        Retorna un objeto con los resultados de la validación, incluyendo los errores si existen.
 * @param {Object} input - Objeto con los datos del registro a validar.
 * @return {Object} - Resultado de la validación, incluyendo mensajes de error si los hay.
 */
export function validarNombre(input) {
  return registroBodyValidation.validate(input, { abortEarly: false });
}
 
/**
 * @brief Función que realiza una validación parcial del registro.
 *        Permite validar uno o varios campos opcionalmente, sin requerir todos los campos del esquema.
 * @param {Object} input - Objeto con los campos a validar parcialmente.
 * @return {Object} - Resultado de la validación parcial, con detalles de los errores si existen.
 */
export function registroBodyPartialValidation(input) {
  return registroBodyValidation
    .fork(Object.keys(registroBodyValidation.describe().keys), (schema) => schema.optional())
    .validate(input, { abortEarly: false });
}