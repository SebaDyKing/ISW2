"use strict";
import { Router } from "express";
import { authMiddleware, autorizeEntities } from "../middleware/authentication.js";
import { 
  obtenerMisInstalaciones, 
  obtenerInstalaciones,
  crearInstalacion,
  actualizarInstalacion,
  eliminarInstalacion 
} from "../controllers/instalacion.controller.js";

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

router.post("/",
  authMiddleware,
  autorizeEntities("administrador", "cliente"),
  crearInstalacion
);

router.put("/:id",
  authMiddleware,
  autorizeEntities("administrador", "cliente"),
  actualizarInstalacion
);

router.delete("/:id",
  authMiddleware,
  autorizeEntities("administrador", "cliente"),
  eliminarInstalacion
);

export default router;