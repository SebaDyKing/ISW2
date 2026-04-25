"use strict";
import { Router } from "express";
import {
    getAll,
    getById,
    getByEmpleado,
    create,
    update,
    updateEstado,
    remove,
} from "../controllers/contrato.controller.js";

const router = Router();

router.get("/", getAll);
router.get("/:id", getById);
router.get("/empleado/:id_empleado", getByEmpleado);
router.post("/", create);
router.put("/:id", update);
router.patch("/:id/estado", updateEstado);
router.delete("/:id", remove);

export default router;