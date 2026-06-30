"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Usuario } from "../models/Usuario.js";
import { Cliente } from "../models/Cliente.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../config/configEnv.js";

export async function registrarUsuarioService(datosRegistro) {
  const { nombre, apellido, rut, correo, password, nombre_empresa, telefono } = datosRegistro;
  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const clienteRepo = AppDataSource.getRepository(Cliente);

  const usuarioExistente = await usuarioRepo.findOne({ where: { correo } });
  if (usuarioExistente) throw new Error("El correo ingresado ya se encuentra registrado.");

  const rutExistente = await usuarioRepo.findOne({ where: { rut } });
  if (rutExistente) throw new Error("El RUT ingresado ya se encuentra registrado.");

  const salt = await bcrypt.genSalt(10);
  const passwordEncriptada = await bcrypt.hash(password, salt);

  const nuevoUsuario = usuarioRepo.create({
    nombre, apellido, rut, correo,
    passwordHash: passwordEncriptada,
    rol: "cliente"
  });
  const usuarioGuardado = await usuarioRepo.save(nuevoUsuario);

  const nuevoCliente = clienteRepo.create({
    nombreEmpresa: nombre_empresa,
    telefono,
    usuario: usuarioGuardado
  });
  await clienteRepo.save(nuevoCliente);

  const { passwordHash: _, ...usuarioSinPassword } = usuarioGuardado;
  return usuarioSinPassword;
}

export async function loginService(correo, password) {
  const usuarioRepo = AppDataSource.getRepository(Usuario);

  const usuario = await usuarioRepo.findOne({
    where: { correo },
    select: ["idUsuario", "correo", "rol", "nombre", "apellido", "passwordHash"]
  });
  if (!usuario) throw new Error("Credenciales incorrectas.");

  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValida) throw new Error("Credenciales incorrectas.");

  const payload = {
    idUsuario: usuario.idUsuario,
    rol: usuario.rol,
    correo: usuario.correo,
  };

  const accessToken  = jwt.sign(payload, JWT_SECRET,           { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });

  return {
    accessToken,
    refreshToken,
    usuario: {
      id: usuario.idUsuario,
      correo: usuario.correo,
      rol: usuario.rol,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
    },
  };
}

export async function refreshAccessTokenService(refreshToken) {
  const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

  const newAccessToken = jwt.sign(
    { idUsuario: payload.idUsuario, rol: payload.rol, correo: payload.correo },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  return newAccessToken;
}