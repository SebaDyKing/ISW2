"use strict";
import Joi from "joi";

// Esquema para validar al momento de CREAR una instalación
export const crearInstalacionSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required().messages({
    "string.base": "El nombre de la instalación debe ser un texto.",
    "string.empty": "El nombre de la instalación no puede estar vacío.",
    "string.min": "El nombre debe tener al menos 3 caracteres.",
    "string.max": "El nombre no puede superar los 100 caracteres.",
    "any.required": "El nombre de la instalación es obligatorio."
  }),
  direccion: Joi.string().min(5).max(200).required().messages({
    "string.base": "La dirección debe ser un texto.",
    "string.empty": "La dirección no puede estar vacía.",
    "string.min": "La dirección debe tener al menos 5 caracteres.",
    "string.max": "La dirección no puede superar los 200 caracteres.",
    "any.required": "La dirección es obligatoria."
  }),
  latitud: Joi.number().min(-90).max(90).required().messages({
    "number.base": "La latitud debe ser un número válido.",
    "number.min": "La latitud mínima es -90.",
    "number.max": "La latitud máxima es 90.",
    "any.required": "La latitud es obligatoria."
  }),
  longitud: Joi.number().min(-180).max(180).required().messages({
    "number.base": "La longitud debe ser un número válido.",
    "number.min": "La longitud mínima es -180.",
    "number.max": "La longitud máxima es 180.",
    "any.required": "La longitud es obligatoria."
  }),
  telefono: Joi.string().max(20).allow(null, "").optional().messages({
    "string.max": "El teléfono no puede superar los 20 caracteres."
  }),
  idCliente: Joi.number().integer().positive().required().messages({
    "number.base": "El ID del cliente debe ser un número.",
    "number.integer": "El ID del cliente debe ser un número entero.",
    "number.positive": "El ID del cliente debe ser un número positivo.",
    "any.required": "El cliente asociado es obligatorio."
  })
});

// Esquema para validar al momento de ACTUALIZAR una instalación (campos opcionales)
export const actualizarInstalacionSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).optional().messages({
    "string.base": "El nombre de la instalación debe ser un texto.",
    "string.min": "El nombre debe tener al menos 3 caracteres.",
    "string.max": "El nombre no puede superar los 100 caracteres."
  }),
  direccion: Joi.string().min(5).max(200).optional().messages({
    "string.base": "La dirección debe ser un texto.",
    "string.min": "La dirección debe tener al menos 5 caracteres.",
    "string.max": "La dirección no puede superar los 200 caracteres."
  }),
  latitud: Joi.number().min(-90).max(90).optional().messages({
    "number.base": "La latitud debe ser un número válido.",
    "number.min": "La latitud mínima es -90.",
    "number.max": "La latitud máxima es 90."
  }),
  longitud: Joi.number().min(-180).max(180).optional().messages({
    "number.base": "La longitud debe ser un número válido.",
    "number.min": "La longitud mínima es -180.",
    "number.max": "La longitud máxima es 180."
  }),
  telefono: Joi.string().max(20).allow(null, "").optional().messages({
    "string.max": "El teléfono no puede superar los 20 caracteres."
  }),
  idCliente: Joi.number().integer().positive().optional().messages({
    "number.base": "El ID del cliente debe ser un número.",
    "number.integer": "El ID del cliente debe ser un número entero.",
    "number.positive": "El ID del cliente debe ser un número positivo."
  })
});

// Helper de validación de creación
export function validateCrearInstalacion(input) {
  return crearInstalacionSchema.validate(input, { abortEarly: false });
}

// Helper de validación de actualización
export function validateActualizarInstalacion(input) {
  return actualizarInstalacionSchema.validate(input, { abortEarly: false });
}
