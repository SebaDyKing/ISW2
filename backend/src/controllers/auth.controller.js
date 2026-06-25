"use strict";
import {
  registrarUsuarioService,
  loginService,
  refreshAccessTokenService,
} from "../services/auth.service.js";
import { registroSchema, loginSchema } from "../validations/auth.validation.js";
import { REFRESH_TOKEN_EXPIRY_MS } from "../config/configEnv.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
};

export const registrar = async (req, res) => {
  try {
    const { error, value } = registroSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const nuevoUsuario = await registrarUsuarioService(value);
    res.status(201).json({
      message: "Usuario registrado con éxito. Ya puedes iniciar sesión.",
      data: nuevoUsuario,
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
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { accessToken, refreshToken, usuario } = await loginService(value.correo, value.password);

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_EXPIRY_MS,
    });

    res.status(200).json({
      message: "Inicio de sesión exitoso.",
      usuario,
    });
  } catch (error) {
    if (error.message.includes("Credenciales incorrectas")) {
      return res.status(401).json({ message: error.message });
    }
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No hay sesión activa." });
    }

    const newAccessToken = await refreshAccessTokenService(refreshToken);

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Token renovado." });
  } catch (error) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(401).json({ message: "Sesión expirada. Inicie sesión nuevamente." });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("accessToken",  cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  res.status(200).json({ message: "Sesión cerrada correctamente." });
};