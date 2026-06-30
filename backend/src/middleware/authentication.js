import jwt from "jsonwebtoken";
import { handleErrorClient } from "../Handlers/responseHanders.js";
import { JWT_SECRET } from "../config/configEnv.js";
import { AppDataSource } from "../config/configDb.js";
import { Usuario } from "../models/Usuario.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return handleErrorClient(res, 401, "Acceso denegado. No hay sesión activa.");
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    
    // Verificación contra la DB para evitar sesiones zombie
    const usuarioRepo = AppDataSource.getRepository(Usuario);
    const usuarioActivo = await usuarioRepo.findOne({ where: { idUsuario: payload.idUsuario } });
    
    if (!usuarioActivo) {
      return handleErrorClient(res, 401, "Acceso denegado. Cuenta inactiva o eliminada.");
    }

    req.user = payload;
    next();
  } catch (error) {
    return handleErrorClient(res, 401, "Sesión expirada. Renueve su sesión.", error.message);
  }
};

export const autorizeEntities = (...allowedRoles) => {
  return (req, res, next) => {
    const roleOrEntity = req.user?.rol || req.user?.entity;
    if (!req.user || !allowedRoles.includes(roleOrEntity)) {
      return handleErrorClient(res, 403, "No tienes permisos para acceder a esta ruta.");
    }
    next();
  };
};