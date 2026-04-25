"use strict";
import { Router } from "express";
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
  router.use("/contratos", contratoRouter);

  app.use("/api", router);
}
