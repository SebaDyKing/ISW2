"use strict";
import { Router } from "express";
import hojaVidaRouter from "./hojavida.routes.js";
import licenciaMedicaRouter from "./licenciamedica.routes.js";
import asistenciaRouter from "./asistencia.routes.js";

/**
 * Registra todas las rutas de la API bajo el prefijo /api.
 * A medida que agregues módulos (usuarios, clientes, etc.) importá sus routers
 * y montalos acá con router.use("/recurso", recursoRouter).
 *
 * @param {import("express").Express} app - Instancia de Express.
 */
export function routerApi(app) {
  const router = Router();

  router.use("/hojas-vida", hojaVidaRouter);
  router.use("/licencias-medicas", licenciaMedicaRouter);
  router.use("/asistencias", asistenciaRouter);

  app.use("/api", router);
}