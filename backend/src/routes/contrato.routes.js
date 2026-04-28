"use strict";
import { Router } from "express";
import { authMiddleware, autorizeEntities } from "../middleware/authentication.js";
import { getAll, getById, getByEmpleado, create,
        update, updateEstado, remove,
} from "../controllers/contrato.controller.js";

const router = Router();

// Lectura — admin y supervisor pueden ver
router.get("/", authMiddleware, autorizeEntities("admin", "supervisor"), getAll);
router.get("/empleado/:id_empleado", authMiddleware, autorizeEntities("admin", "supervisor"), getByEmpleado);
router.get("/:id", authMiddleware, autorizeEntities("admin", "supervisor"), getById);

// Escritura — solo admin
router.post("/", authMiddleware, autorizeEntities("admin"), create);
router.put("/:id", authMiddleware, autorizeEntities("admin"), update);
router.patch("/:id/estado", authMiddleware, autorizeEntities("admin"), updateEstado);
router.delete("/:id", authMiddleware, autorizeEntities("admin"), remove);

export default router;