"use strict";
import Joi from "joi";

export const registroSchema = Joi.object({
  nombre: Joi.string().max(50).required().messages({ "any.required": "El nombre es obligatorio." }),
  apellido: Joi.string().max(50).required().messages({ "any.required": "El apellido es obligatorio." }),
  rut: Joi.string().max(12).required().messages({ "any.required": "El RUT es obligatorio." }),
  
  correo: Joi.string().email().max(100).required().messages({
    "string.email": "Debes ingresar un correo válido.",
    "any.required": "El correo es obligatorio."
  }),
  password: Joi.string().min(6).max(50).required().messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres.",
    "any.required": "La contraseña es obligatoria."
  }),
  
  nombre_empresa: Joi.string().max(100).required(),
  telefono: Joi.string().min(8).max(20).required()
});

export const loginSchema = Joi.object({
  correo: Joi.string().email().required(),
  password: Joi.string().required()
});