"use strict";
import { Router } from "express";
import { crearSolicitud } from "../controllers/cotizacion.controller.js";
// Importaremos el controlador cuando lo crees
// import { crearSolicitud } from "../controllers/cotizacion.controller.js";

const router = Router();

router.post("/", crearSolicitud);
// Definimos la ruta POST para /api/cotizaciones
// Por ahora la dejaremos comentada para que no te dé error de "file not found"
// router.post("/", crearSolicitud);

export default router;