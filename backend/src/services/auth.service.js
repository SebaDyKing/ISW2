"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Usuario } from "../models/Usuario.js";
import { Cliente } from "../models/Cliente.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function registrarUsuarioService(datosRegistro) {
  const { nombre, apellido, rut, correo, password, nombre_empresa, telefono } = datosRegistro;
  const usuarioRepo = AppDataSource.getRepository(Usuario);
  const clienteRepo = AppDataSource.getRepository(Cliente);

  const usuarioExistente = await usuarioRepo.findOne({ where: { correo } });
  if (usuarioExistente) {
    throw new Error("El correo ingresado ya se encuentra registrado.");
  }

  const rutExistente = await usuarioRepo.findOne({ where: { rut } });
  if (rutExistente) {
    throw new Error("El RUT ingresado ya se encuentra registrado.");
  }

  const salt = await bcrypt.genSalt(10);
  const passwordEncriptada = await bcrypt.hash(password, salt);

  const nuevoUsuario = usuarioRepo.create({
    nombre,
    apellido,
    rut,
    correo,
    passwordHash: passwordEncriptada,
    entity: "cliente" 
  });
  const usuarioGuardado = await usuarioRepo.save(nuevoUsuario);

  const nuevoCliente = clienteRepo.create({
    nombreEmpresa:nombre_empresa,
    telefono:telefono,
    usuario: usuarioGuardado
  });
  await clienteRepo.save(nuevoCliente);

  delete usuarioGuardado.password_hash; 
  return usuarioGuardado;
}

export async function loginService(correo, password) {
  const usuarioRepo = AppDataSource.getRepository(Usuario);

  // Busca al usuario
  const usuario = await usuarioRepo.findOne({ where: { correo } });
  if (!usuario) {
    throw new Error("Credenciales incorrectas."); 
  }

  // Comparar la contraseña ingresada con la encriptada en la BD
  const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValida) {
    throw new Error("Credenciales incorrectas.");
  }

  const payload = {
    idUsuario: usuario.idUsuario, 
    entity: usuario.entity,       // "cliente" o "admin"
    correo: usuario.correo
  };

  // Firmamos el token con el secreto del .env (expira en 8 horas)
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });

  return { 
    token, 
    usuario: { id: usuario.idUsuario, correo: usuario.correo, rol: usuario.entity } 
  };
}