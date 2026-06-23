"use strict";
import { Router } from "express";
import { authMiddleware, autorizeEntities } from "../middleware/authentication.js";
import {
  getAsistenciasController,
  getAsistenciaByIdController,
  registrarEntradaController,
  registrarSalidaController,
  registrarInicioColacionController,
  registrarFinColacionController,
  eliminarAsistenciasController,
} from "../controllers/asistencia.controller.js";

const router = Router();

// Rutas protegidas de consulta (Admin y Supervisor)
router.get("/", authMiddleware, autorizeEntities("admin", "supervisor"), getAsistenciasController);
router.get("/:id", authMiddleware, autorizeEntities("admin", "supervisor"), getAsistenciaByIdController);

// Rutas de marcaje (Solo empleados)
router.post("/entrada", authMiddleware, autorizeEntities("empleado"), registrarEntradaController);
router.post("/salida", authMiddleware, autorizeEntities("empleado"), registrarSalidaController);
router.post("/colacion/inicio", authMiddleware, autorizeEntities("empleado"), registrarInicioColacionController);
router.post("/colacion/fin", authMiddleware, autorizeEntities("empleado"), registrarFinColacionController);

// Eliminación de registros (Solo administradores)
router.delete("/", authMiddleware, autorizeEntities("admin"), eliminarAsistenciasController);

export default router;