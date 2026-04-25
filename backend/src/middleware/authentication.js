import jwt from "jsonwebtoken";
import { handleErrorClient } from "../Handlers/responseHanders.js";


/**
 * @brief Middleware de autenticación que verifica la existencia y validez de un token JWT.
 *        Agrega la información de la entidad y el ID del usuario al objeto req.user.
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función que llama al siguiente middleware.
 * @return {void} - Continúa con next() si el token es válido, o responde con error si no.
 */
export function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return handleErrorClient(res, 401, "Acceso denegado. No se proporcionó token.");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return handleErrorClient(res, 401, "Acceso denegado. Token malformado.");
    }

    try {
        const payload = jwt.verify(token, process.env.SECRET_JWT_KEY);
        req.user = payload;
        next();
    } catch (error) {
        return handleErrorClient(res, 401, "Sesión expirada, inicie sesión nuevamente.", error.message);
    }
}



/**
 * @brief Middleware de autorización que valida si la entidad del usuario está permitida en la ruta.
 * @param {...string} allowedEntities - Lista de entidades permitidas para acceder a la ruta (ej. "owner", "guardia", "central").
 * @return {Function} - Devuelve una función middleware que verifica la entidad y llama a next() si está permitida.
 */
export function autorizeEntities(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.entity)) {
            return handleErrorClient(res, 403, "No tienes permiso para acceder a esta ruta.");
        }
        next()
    }

}