import jwt from "jsonwebtoken";
import { handleErrorClient } from "../Handlers/responseHanders.js";
import { JWT_SECRET } from "../config/configEnv.js";

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return handleErrorClient(res, 401, "Acceso denegado. No hay sesión activa.");
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
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