"use strict";
import { registrarUsuarioService, loginService } from "../services/auth.service.js";
import { registroSchema, loginSchema } from "../validations/auth.validation.js";

export const registrar = async (req, res) => {
  try {
    const { error, value } = registroSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const nuevoUsuario = await registrarUsuarioService(value);
    
    res.status(201).json({
      message: "Usuario registrado con éxito. Ya puedes iniciar sesión.",
      data: nuevoUsuario
    });
  } catch (error) {
    if (error.message.includes("ya se encuentra registrado")) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Error en registro:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const login = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const datosLogin = await loginService(value.correo, value.password);

    res.status(200).json({
      message: "Inicio de sesión exitoso.",
      token: datosLogin.token,
      usuario: datosLogin.usuario
    });
  } catch (error) {
    if (error.message.includes("Credenciales incorrectas")) {
      return res.status(401).json({ message: error.message });
    }
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};