"use strict";
import { Router } from "express";
import { authMiddleware, autorizeEntities } from "../middleware/authentication.js";
import {
  getHojasVidaController,
  getHojaVidaByIdController,
  createHojaVidaController,
  updateHojaVidaController,
  deleteHojaVidaController,
} from "../controllers/hojavida.controller.js";

const router = Router();

// Toda ruta de hojas de vida requiere sesión activa
router.use(authMiddleware);

// Lectura: el empleado consulta el listado para filtrar sus propias hojas
router.get("/", autorizeEntities("administrador", "supervisor", "empleado"), getHojasVidaController);
router.get("/:id", autorizeEntities("administrador", "supervisor"), getHojaVidaByIdController);
// Escritura: admin y supervisor gestionan desde HojaVidaView
router.post("/", autorizeEntities("administrador", "supervisor"), createHojaVidaController);
router.patch("/:id", autorizeEntities("administrador", "supervisor"), updateHojaVidaController);
router.delete("/:id", autorizeEntities("administrador", "supervisor"), deleteHojaVidaController);

export default router;
