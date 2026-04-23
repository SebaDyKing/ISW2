"use strict";
import Joi from "joi";

export const cotizacionSchema = Joi.object({
  nombre_empresa: Joi.string().max(100).required().messages({
    "string.empty": "El nombre de la empresa no puede estar vacío.",
    "any.required": "El nombre de la empresa es un campo obligatorio."
  }),
  
    telefono: Joi.string().min(8).max(20).required().messages({
    "string.min": "El teléfono debe tener al menos 8 caracteres.",
    "string.max": "El teléfono no puede superar los 20 caracteres.",
    "string.empty": "El teléfono es obligatorio."
  }),

  correo: Joi.string().email().max(100).required().messages({
    "string.email": "Debes ingresar un correo electrónico válido."
  }),
  
  comentarios: Joi.string().allow(null, "").optional(),
  
  id_plan: Joi.number().integer().valid(1, 2, 3).required().messages({
  "any.only": "El plan seleccionado no es válido. Debe ser 1, 2 o 3."
  })
});