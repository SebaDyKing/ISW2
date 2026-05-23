"use strict";
import Joi from "joi";

// Expresión regular para validar RUT chileno (con o sin puntos, pero con guion)
// Ejemplos válidos: 12.345.678-9, 12345678-9, 9.876.543-K
const rutRegex = /^[0-9]{1,2}(\.?[0-9]{3}){2}-[0-9Kk]{1}$/;

export const usuarioBodyValidation = Joi.object({
  nombre: Joi.string().max(100).required().messages({
    "string.empty": "El nombre es obligatorio.",
    "string.max": "El nombre no puede superar los 100 caracteres."
  }),
  
  apellido: Joi.string().max(100).required().messages({
    "string.empty": "El apellido es obligatorio.",
    "string.max": "El apellido no puede superar los 100 caracteres."
  }),

  rut: Joi.string().pattern(rutRegex).required().messages({
    "string.pattern.base": "El RUT ingresado no tiene un formato válido. Debe incluir guion y dígito verificador.",
    "string.empty": "El RUT es obligatorio."
  }),

  correo: Joi.string().email().max(150).required().messages({
    "string.email": "El formato del correo electrónico no es válido.",
    "string.empty": "El correo es obligatorio."
  }),

  // El cliente envía "password", y nosotros en el backend lo convertiremos a "passwordHash"
  password: Joi.string().min(6).max(255).required().messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres por seguridad.",
    "string.empty": "La contraseña es obligatoria."
  }),
});

export const usuarioUpdateValidation = Joi.object({
  nombre: Joi.string().max(100).messages({
    "string.max": "El nombre no puede superar los 100 caracteres."
  }),
  apellido: Joi.string().max(100).messages({
    "string.max": "El apellido no puede superar los 100 caracteres."
  }),
  rut: Joi.string().pattern(rutRegex).messages({
    "string.pattern.base": "El RUT ingresado no tiene un formato válido."
  }),
  correo: Joi.string().email().max(150).messages({
    "string.email": "El formato del correo electrónico no es válido."
  }),
  password: Joi.string().min(6).max(255).messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres."
  })
}).min(1).messages({
  "object.min": "Debes proporcionar al menos un campo para actualizar."
});