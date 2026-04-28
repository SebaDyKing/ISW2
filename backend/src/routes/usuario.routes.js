"use strict";
import { Router } from "express";
import { crearUsuario, obtenerUsuarios, obtenerUsuario, actualizarUsuario, eliminarUsuario } from "../controllers/usuario.controller.js";

const router = Router();

router.post("/", crearUsuario);
router.get("/", obtenerUsuarios);
router.get("/:id", obtenerUsuario);
router.put("/:id", actualizarUsuario);
router.delete("/:id", eliminarUsuario);
export default router;