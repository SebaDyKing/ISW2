"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Usuario } from "../models/Usuario.js";
import bcrypt from "bcrypt";

export async function crearUsuarioService(datosUsuario) {
  try {
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const { nombre, apellido, rut, correo, password } = datosUsuario;

    // Verificamos si existe un usuario con el mismo RUT o correo para evitar duplicados
    const usuarioExistente = await usuarioRepository.findOne({
      where: [{ rut: rut }, { correo: correo }]
    });

    if (usuarioExistente) {
      if (usuarioExistente.rut === rut) throw new Error("El RUT ya está registrado.");
      if (usuarioExistente.correo === correo) throw new Error("El correo ya está registrado.");
    }

    // Encripta la contraseña (el 10 es el costo, un estandar recomendado)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const nuevoUsuario = usuarioRepository.create({
      nombre,
      apellido,
      rut,
      correo,
      passwordHash: passwordHash 
    });

    const usuarioGuardado = await usuarioRepository.save(nuevoUsuario);

    // 5. Por seguridad, no se devuelve el passwordHash al frontend
    const { passwordHash: _, ...usuarioSinPassword } = usuarioGuardado;
    
    return usuarioSinPassword;

  } catch (error) {
    console.error("Error en crearUsuarioService:", error);
    throw error; 
  }
}

export async function obtenerUsuariosService() {
  try {
    const usuarioRepository = AppDataSource.getRepository(Usuario);

    const usuarios = await usuarioRepository.find({
      select: ["idUsuario", "nombre", "apellido", "rut", "correo", "createdAt", "updatedAt"]
    });
    
    return usuarios;
  } catch (error) {
    console.error("Error en obtenerUsuariosService:", error);
    throw new Error("Error al obtener la lista de usuarios");
  }
}

export async function obtenerUsuarioPorIdService(id) {
  try {
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    
    const usuario = await usuarioRepository.findOne({
      where: { idUsuario: id },
      select: ["idUsuario", "nombre", "apellido", "rut", "correo", "createdAt", "updatedAt"]
    });

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    return usuario;
  } catch (error) {
    console.error("Error en obtenerUsuarioPorIdService:", error);
    throw error;
  }
}

export async function actualizarUsuarioService(id, datosActualizar) {
try {
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const idNumerico = parseInt(id, 10);
    const usuario = await usuarioRepository.findOne({ where: { idUsuario: idNumerico } });

    if (!usuario) throw new Error("Usuario no encontrado");

    // Si intenta actualizar el RUT
    if (datosActualizar.rut) {
      const rutOcupado = await usuarioRepository.findOne({ where: { rut: datosActualizar.rut } });
      if (rutOcupado && rutOcupado.idUsuario !== idNumerico) {
        throw new Error("El RUT ya está en uso por otra cuenta.");
      }
    }

    // Si intenta actualizar el correo
    if (datosActualizar.correo) {
      const correoOcupado = await usuarioRepository.findOne({ where: { correo: datosActualizar.correo } });
      if (correoOcupado && correoOcupado.idUsuario !== idNumerico) {
        throw new Error("El correo ya está en uso por otra cuenta.");
      }
    }

    // Si intenta actualizar la contraseña, la encriptamos primero
    if (datosActualizar.password) {
      datosActualizar.passwordHash = await bcrypt.hash(datosActualizar.password, 10);
      delete datosActualizar.password; // Borramos la de texto plano del objeto
    }

    // Combinamos los datos antiguos con los nuevos y guardamos
    const usuarioActualizado = usuarioRepository.merge(usuario, datosActualizar);
    const resultado = await usuarioRepository.save(usuarioActualizado);

    const { passwordHash: _, ...usuarioLimpio } = resultado;
    return usuarioLimpio;

  } catch (error) {
    console.error("Error en actualizarUsuarioService:", error);
    throw error;
  }
}

export async function eliminarUsuarioService(idAEliminar, idAdminSolicitante) {
  try {
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const idTarget = parseInt(idAEliminar, 10);
    const idAdmin = parseInt(idAdminSolicitante, 10);

    // Evitar auto eliminacion
    if (idTarget === idAdmin) {
      throw new Error("Acción denegada: Un administrador no puede eliminar su propia cuenta.");
    }

    const usuario = await usuarioRepository.findOne({ where: { idUsuario: idTarget } });
    if (!usuario) throw new Error("Usuario no encontrado.");

    // Hard delete: borra el registro permanentemente de PostgreSQL
    await usuarioRepository.remove(usuario);
    
    return true;
  } catch (error) {
    console.error("Error en eliminarUsuarioService:", error);
    throw error;
  }
}