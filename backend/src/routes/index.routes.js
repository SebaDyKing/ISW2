"use strict";
import { Router } from "express";

/**
 * Registra todas las rutas de la API bajo el prefijo /api.
 * A medida que agregues módulos (usuarios, clientes, etc.) importá sus routers
 * y montalos acá con router.use("/recurso", recursoRouter).
 *
 * @param {import("express").Express} app - Instancia de Express.
 */
export function routerApi(app) {
  const router = Router();

  // Ejemplo: cuando tengas tus rutas, las montás así:
  // router.use("/usuarios", usuariosRouter);
  // router.use("/clientes", clientesRouter);
  // router.use("/empleados", empleadosRouter);

  app.use("/api", router);
}
