"use strict";
import { Router } from "express";
import { authMiddleware } from "../middleware/authentication.js";
import {getAll, getById, getByEmpleado,create,
        update, updateEstado, remove,

} from "../controllers/contrato.controller.js";

const router = Router();

router.get("/", authMiddleware, getAll);
router.get("/empleado/:id_empleado", authMiddleware, getByEmpleado); // ← antes que /:id
router.get("/:id", authMiddleware, getById);
router.post("/", authMiddleware, create);
router.put("/:id", authMiddleware, update);
router.patch("/:id/estado", authMiddleware, updateEstado);
router.delete("/:id", authMiddleware, remove);

export default router;