"use strict";
import Joi from "joi";

export const registroSchema = Joi.object({
  nombre: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/)
    .required()
    .messages({
      "string.min": "El nombre debe tener al menos 2 caracteres.",
      "string.max": "El nombre no puede superar los 50 caracteres.",
      "string.pattern.base": "El nombre solo puede contener letras.",
      "any.required": "El nombre es obligatorio."
    }),
  apellido: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/)
    .required()
    .messages({
      "string.min": "El apellido debe tener al menos 2 caracteres.",
      "string.max": "El apellido no puede superar los 50 caracteres.",
      "string.pattern.base": "El apellido solo puede contener letras.",
      "any.required": "El apellido es obligatorio."
    }),
  rut: Joi.string().max(12).pattern(/^\d{7,8}-[\dkK]$/).required().messages({
    "string.pattern.base": "El RUT debe tener el formato 12345678-9",
    "any.required": "El RUT es obligatorio."
  }),
  correo: Joi.string().email().max(100).required().messages({
    "string.email": "Debes ingresar un correo válido.",
    "any.required": "El correo es obligatorio."
  }),
  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      "string.min": "La contraseña debe tener al menos 6 caracteres.",
      "string.max": "La contraseña no puede superar los 50 caracteres.",
      "any.required": "La contraseña es obligatoria."
    }),
  nombre_empresa: Joi.string().max(100).required().messages({
    "any.required": "El nombre de la empresa es obligatorio.",
    "string.max": "El nombre de la empresa no puede tener más de 100 caracteres."
  }),
  telefono: Joi.string().pattern(/^\+569\d{8}$/).required().messages({
    "string.pattern.base": "El teléfono debe tener el formato +56912345678",
    "any.required": "El teléfono es obligatorio."
  })
});

export const loginSchema = Joi.object({
  correo: Joi.string().email().required(),
  password: Joi.string().required()
});