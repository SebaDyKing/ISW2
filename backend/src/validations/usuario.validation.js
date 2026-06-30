"use strict";
import Joi from "joi";

// RUT: sin puntos, con guión
const rutRegex = /^\d{7,8}-[\dkK]$/;

const nombreApellidoRegex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/;

export const usuarioBodyValidation = Joi.object({
  nombre: Joi.string().min(2).max(50).pattern(nombreApellidoRegex).required().messages({
    "string.min": "El nombre debe tener al menos 2 caracteres.",
    "string.max": "El nombre no puede superar los 50 caracteres.",
    "string.pattern.base": "El nombre solo puede contener letras.",
    "any.required": "El nombre es obligatorio.",
  }),
  apellido: Joi.string().min(2).max(50).pattern(nombreApellidoRegex).required().messages({
    "string.min": "El apellido debe tener al menos 2 caracteres.",
    "string.max": "El apellido no puede superar los 50 caracteres.",
    "string.pattern.base": "El apellido solo puede contener letras.",
    "any.required": "El apellido es obligatorio.",
  }),
  rut: Joi.string().max(12).pattern(rutRegex).required().messages({
    "string.pattern.base": "El RUT debe tener el formato 12345678-9 (sin puntos).",
    "any.required": "El RUT es obligatorio.",
  }),
  correo: Joi.string().email().max(150).required().messages({
    "string.email": "El formato del correo no es válido.",
    "any.required": "El correo es obligatorio.",
  }),
  password: Joi.string().min(6).max(50).required().messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres.",
    "string.max": "La contraseña no puede superar los 50 caracteres.",
    "any.required": "La contraseña es obligatoria.",
  }),
  rol: Joi.string().valid("cliente", "empleado", "supervisor", "administrador").required().messages({
    "any.only": "El rol debe ser cliente, empleado, supervisor o administrador.",
    "any.required": "El rol es obligatorio.",
  }),
});

export const usuarioUpdateValidation = Joi.object({
  nombre: Joi.string().min(2).max(50).pattern(nombreApellidoRegex).messages({
    "string.min": "El nombre debe tener al menos 2 caracteres.",
    "string.max": "El nombre no puede superar los 50 caracteres.",
    "string.pattern.base": "El nombre solo puede contener letras.",
  }),
  apellido: Joi.string().min(2).max(50).pattern(nombreApellidoRegex).messages({
    "string.min": "El apellido debe tener al menos 2 caracteres.",
    "string.max": "El apellido no puede superar los 50 caracteres.",
    "string.pattern.base": "El apellido solo puede contener letras.",
  }),
  correo: Joi.string().email().max(150).messages({
    "string.email": "El formato del correo no es válido.",
  }),
  password: Joi.string().min(6).max(50).messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres.",
    "string.max": "La contraseña no puede superar los 50 caracteres.",
  }),
}).min(1).messages({
  "object.min": "Debes proporcionar al menos un campo para actualizar.",
});