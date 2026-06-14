"use strict";
import { Router } from "express";
import { crearUsuario, obtenerUsuarios, obtenerUsuario, actualizarUsuario, eliminarUsuario, obtenerEmpleados, trasladarEmpleado } from "../controllers/usuario.controller.js";
import { authMiddleware, autorizeEntities } from "../middleware/authentication.js";

const router = Router();

router.post("/", authMiddleware, autorizeEntities("administrador"), crearUsuario);
router.get("/", authMiddleware, autorizeEntities("administrador"), obtenerUsuarios);
router.get("/empleados", authMiddleware, autorizeEntities("administrador", "supervisor"), obtenerEmpleados);
router.put("/empleados/:id/traslado", authMiddleware, autorizeEntities("administrador"), trasladarEmpleado);
router.get("/:id", authMiddleware, autorizeEntities("administrador"), obtenerUsuario);
router.put("/:id", authMiddleware, autorizeEntities("administrador"), actualizarUsuario);
router.delete("/:id", authMiddleware, autorizeEntities("administrador"), eliminarUsuario);

export default router;