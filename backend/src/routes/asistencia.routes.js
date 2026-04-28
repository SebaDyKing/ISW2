"use strict";
import { Router } from "express";
import {
  getAsistenciasController,
  getAsistenciaByIdController,
  registrarEntradaController,
  registrarSalidaController,
  eliminarAsistenciasController,
} from "../controllers/asistencia.controllers.js";

const router = Router();

router.get("/", getAsistenciasController);
router.get("/:id", getAsistenciaByIdController);
router.post("/entrada", registrarEntradaController);
router.post("/salida", registrarSalidaController);
router.delete("/", eliminarAsistenciasController);

export default router;