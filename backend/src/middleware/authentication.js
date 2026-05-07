import jwt from "jsonwebtoken";
import { handleErrorClient } from "../Handlers/responseHanders.js";

/**
 * @brief Middleware que verifica que el usuario haya iniciado sesión (Token válido).
 */
export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    // Rescatamos la validación estricta del "Bearer"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return handleErrorClient(res, 401, "Acceso denegado. Faltan credenciales de seguridad o están malformadas.");
    }

    const token = authHeader.split(" ")[1];

    try {
        // Usamos la firma del archivo .env
        const payload = jwt.verify(token, process.env.JWT_SECRET); 
        
        // Guardamos los datos del usuario en la request para que el Controlador los use
        req.user = payload; 
        next();
    } catch (error) {
        return handleErrorClient(res, 401, "Sesión expirada o token inválido. Inicie sesión nuevamente.", error.message);
    }
};

/**
 * @brief Middleware de autorización basado en Roles / Entidades.
 */
export const autorizeEntities = (...allowedRoles) => {
    return (req, res, next) => {
        // Validamos si el rol/entidad del usuario está en la lista de permitidos
        if (!req.user || !allowedRoles.includes(req.user.entity)) { 
            return handleErrorClient(res, 403, "No tienes permisos de seguridad para acceder a esta ruta.");
        }
        next();
    };
};