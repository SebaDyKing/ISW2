"use strict";
import { Router } from "express";
import { authMiddleware, autorizeEntities } from "../middleware/authentication.js";
import { obtenerMisInstalaciones } from "../controllers/instalacion.controller.js";

const router = Router();

router.get("/mis-instalaciones",
  authMiddleware,
  autorizeEntities("cliente"),
  obtenerMisInstalaciones
);

export default router;