"use strict";
import { usuarioBodyValidation, usuarioUpdateValidation } from "../validations/usuario.validation.js";
import { crearUsuarioService, obtenerUsuariosService,obtenerUsuarioPorIdService, actualizarUsuarioService,eliminarUsuarioService } from "../services/usuario.service.js";

export const crearUsuario = async (req, res) => {
  try {
    const { error, value } = usuarioBodyValidation.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        message: "Error de validación",
        detalle: error.details[0].message
      });
    }

    const nuevoUsuario = await crearUsuarioService(value);

    res.status(201).json({
      message: "Usuario creado exitosamente",
      data: nuevoUsuario
    });

  } catch (error) {
    if (error.message.includes("ya está registrado")) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: "Error interno del servidor al crear el usuario" });
  }
};

export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await obtenerUsuariosService();
    res.status(200).json({
      message: "Lista de usuarios recuperada con éxito",
      data: usuarios
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno al recuperar los usuarios" });
  }
};

export const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuario = await obtenerUsuarioPorIdService(id);
    
    res.status(200).json({
      message: "Usuario recuperado con éxito",
      data: usuario
    });
  } catch (error) {
    if (error.message === "Usuario no encontrado") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error interno al recuperar el usuario" });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const { error, value } = usuarioUpdateValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Error de validación", detalle: error.details[0].message });
    }

    const usuarioActualizado = await actualizarUsuarioService(id, value);

    res.status(200).json({
      message: "Usuario actualizado con éxito",
      data: usuarioActualizado
    });
  } catch (error) {
    if (error.message === "Usuario no encontrado") return res.status(404).json({ message: error.message });
    if (error.message.includes("ya está en uso")) return res.status(400).json({ message: error.message });
    
    res.status(500).json({ message: "Error interno al actualizar el usuario" });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params; // El ID del usuario que queremos borrar
    
    // Simulamos el ID del admin que está haciendo la petición
    const idAdminSolicitante = req.headers["x-admin-id"];

    if (!idAdminSolicitante) {
      return res.status(401).json({ message: "Falta el ID del administrador en los headers (x-admin-id)." });
    }

    await eliminarUsuarioService(id, idAdminSolicitante);

    res.status(200).json({ message: "Cuenta de usuario eliminada de forma permanente." });
  } catch (error) {
    // Si intenta borrarse a sí mismo
    if (error.message.includes("no puede eliminar su propia cuenta")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === "Usuario no encontrado.") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Error interno al eliminar el usuario." });
  }
};