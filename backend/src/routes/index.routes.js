"use strict";
import { Router } from "express";
<<<<<<< HEAD
import cotizacionRouter from "./cotizacion.routes.js";
import usuarioRouter from "./usuario.routes.js";

=======
import contratoRouter from "./contrato.routes.js";
>>>>>>> 6e1498508132ba6fd8954ef6aec1e6d356f1d333
/**
 * Registra todas las rutas de la API bajo el prefijo /api.
 * A medida que agregues módulos (usuarios, clientes, etc.) importá sus routers
 * y montalos acá con router.use("/recurso", recursoRouter).
 *
 * @param {import("express").Express} app - Instancia de Express.
 */
export function routerApi(app) {
  const router = Router();
<<<<<<< HEAD

  router.use("/cotizaciones", cotizacionRouter);
  router.use("/usuarios", usuarioRouter);
=======
  router.use("/contratos", contratoRouter);

>>>>>>> 6e1498508132ba6fd8954ef6aec1e6d356f1d333
  app.use("/api", router);
}
