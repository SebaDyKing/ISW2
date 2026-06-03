"use strict";
import Joi from "joi";

export const cotizacionSchema = Joi.object({
  id_plan: Joi.number().integer().valid(1, 2, 3).required().messages({
    "any.only": "El plan seleccionado no es válido.",
    "any.required": "Debes seleccionar un plan."
  }),
  id_instalacion: Joi.number().integer().required().messages({
    "number.base": "El ID de la instalación debe ser un número.",
    "any.required": "Debes indicar para qué instalación es la cotización."
  }),
  
  comentarios: Joi.string().allow(null, "").optional()
});