"use strict";
import jwt from "jsonwebtoken";

export const isAdmin = (req, res, next) => {
  try {
    // Miramos si el cliente trajo la cabecera "Authorization"
    const authHeader = req.headers.authorization;

    // Si no la trae, o no empieza con "Bearer ", le negamos la entrada
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        message: "Acceso denegado. Faltan credenciales de seguridad." 
      });
    }

    // Extraemos el token (cortamos la palabra "Bearer " y nos quedamos con el código)
    const token = authHeader.split(" ")[1];

    // Verificamos si el token es válido usando nuestra firma secreta del .env
    const secret = process.env.JWT_SECRET;
    
    jwt.verify(token, secret, (error, decoded) => {
      // Si el token fue manipulado o expiró, Joi lanza un error
      if (error) {
        return res.status(403).json({ 
          message: "Token inválido, expirado o manipulado." 
        });
      }

      // Guardamos los datos del usuario y le abrimos la puerta
      req.user = decoded; 
      next(); 
    });

  } catch (error) {
    console.error("Error en middleware de autenticación:", error);
    res.status(500).json({ message: "Error interno del servidor en seguridad." });
  }
};