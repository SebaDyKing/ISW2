"use strict";
import { Router } from "express";
import { obtenerPlanes } from "../controllers/plan.controller.js";

const router = Router();

// Ruta pública
router.get("/", obtenerPlanes);

export default router;