"use strict";
import Joi from "joi";

export const cotizacionSchema = Joi.object({
  id_plan: Joi.number().integer().positive().required().messages({
    "number.positive": "El plan seleccionado no es válido.",
    "any.required": "Debes seleccionar un plan."
  }),
  id_instalacion: Joi.number().integer().required().messages({
    "number.base": "El ID de la instalación debe ser un número.",
    "any.required": "Debes indicar para qué instalación es la cotización."
  }),
  comentarios: Joi.string().max(600).allow(null, "").optional().messages({
    "string.max": "Los comentarios no pueden superar los 600 caracteres."
  }),
  medioContacto: Joi.string()
    .valid("WhatsApp", "Llamada", "Correo electrónico")
    .allow(null, "").optional(),
  horarioContacto: Joi.string()
    .valid("Mañana (9:00 - 13:00)", "Tarde (13:00 - 18:00)", "Indiferente")
    .allow(null, "").optional(),
});