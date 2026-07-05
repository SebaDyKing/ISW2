"use strict";
import { Router } from "express";
import { authMiddleware, autorizeEntities } from "../middleware/authentication.js";
import { obtenerMisInstalaciones, obtenerInstalaciones } from "../controllers/instalacion.controller.js";

const router = Router();

router.get("/",
  authMiddleware,
  autorizeEntities("administrador", "supervisor"),
  obtenerInstalaciones
);

router.get("/mis-instalaciones",
  authMiddleware,
  autorizeEntities("cliente"),
  obtenerMisInstalaciones
);

export default router;