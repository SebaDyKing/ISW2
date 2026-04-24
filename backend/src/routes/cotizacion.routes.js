"use strict";
import { Router } from "express";
import { crearSolicitud, obtenerCotizaciones } from "../controllers/cotizacion.controller.js";
import { isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", crearSolicitud);
router.get("/", isAdmin, obtenerCotizaciones);

export default router;