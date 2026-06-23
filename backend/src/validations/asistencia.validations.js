"use strict";
import Joi from "joi";

export const asistenciaBodyValidation = Joi.object({
  idContrato: Joi.number().integer().positive().required().messages({
    "number.base": "El campo idContrato debe ser un número",
    "number.integer": "El campo idContrato debe ser un entero",
    "number.positive": "El campo idContrato debe ser un número positivo",
    "any.required": "El campo idContrato es obligatorio",
  }),
  latitud: Joi.number().min(-90).max(90).required().messages({
    "any.required": "La latitud es obligatoria",
    "number.base": "La latitud debe ser un número válido",
    "number.min": "La latitud mínima es -90",
    "number.max": "La latitud máxima es 90",
  }),
  longitud: Joi.number().min(-180).max(180).required().messages({
    "any.required": "La longitud es obligatoria",
    "number.base": "La longitud debe ser un número válido",
    "number.min": "La longitud mínima es -180",
    "number.max": "La longitud máxima es 180",
  }),
  fechaDispositivo: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
    "any.required": "La fecha del dispositivo es obligatoria",
    "string.pattern.base": "La fecha debe tener el formato YYYY-MM-DD",
  }),
  horaDispositivo: Joi.string().pattern(/^\d{2}:\d{2}(:\d{2})?$/).required().messages({
    "any.required": "La hora del dispositivo es obligatoria",
    "string.pattern.base": "La hora debe tener el formato HH:mm o HH:mm:ss",
  }),
});

export function validateAsistenciaBody(input) {
  return asistenciaBodyValidation.validate(input, { abortEarly: false });
}