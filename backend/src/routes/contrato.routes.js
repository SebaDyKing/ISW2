"use strict";
import { Router } from "express";
import { authMiddleware, autorizeEntities } from "../middleware/authentication.js";
import { getAll, getById, getByEmpleado, create,
        update, updateEstado, remove, getMisAsignaciones
} from "../controllers/contrato.controller.js";

const router = Router();

// Lectura — admin y supervisor pueden ver
router.get("/", authMiddleware, autorizeEntities("administrador", "supervisor"), getAll);
router.get("/empleado/:id_empleado", authMiddleware, autorizeEntities("administrador", "supervisor"), getByEmpleado);
router.get("/mis-asignaciones", authMiddleware, autorizeEntities("empleado"), getMisAsignaciones);
router.get("/:id", authMiddleware, autorizeEntities("administrador", "supervisor"), getById);

// Escritura — solo admin
router.post("/", authMiddleware, autorizeEntities("administrador"), create);
router.put("/:id", authMiddleware, autorizeEntities("administrador"), update);
router.patch("/:id/estado", authMiddleware, autorizeEntities("administrador"), updateEstado);
router.delete("/:id", authMiddleware, autorizeEntities("administrador"), remove);

export default router;