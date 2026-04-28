"use strict";
import { Router } from "express";
import cotizacionRouter from "./cotizacion.routes.js";
import usuarioRouter from "./usuario.routes.js";
import hojaVidaRouter from "./hojavida.routes.js";
import licenciaMedicaRouter from "./licenciamedica.routes.js";
import contratoRouter from "./contrato.routes.js";

/**
 * Registra todas las rutas de la API bajo el prefijo /api.
 * A medida que agregues módulos (usuarios, clientes, etc.) importá sus routers
 * y montalos acá con router.use("/recurso", recursoRouter).
 *
 * @param {import("express").Express} app - Instancia de Express.
 */
export function routerApi(app) {
  const router = Router();

  router.use("/cotizaciones", cotizacionRouter);
  router.use("/usuarios", usuarioRouter);
  router.use("/contratos", contratoRouter);
  router.use("/hojas-vida", hojaVidaRouter);
  router.use("/licencias-medicas", licenciaMedicaRouter);

  app.use("/api", router);
}