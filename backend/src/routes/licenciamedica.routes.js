"use strict";
import { Router } from "express";
import {
  getLicenciasMedicasController,
  getLicenciaMedicaByIdController,
  createLicenciaMedicaController,
  updateEstadoLicenciaMedicaController,
  deleteLicenciaMedicaController,
} from "../controllers/licenciamedica.controllers.js";

const router = Router();

router.get("/", getLicenciasMedicasController);
router.get("/:id", getLicenciaMedicaByIdController);
router.post("/", createLicenciaMedicaController);
router.patch("/:id/estado", updateEstadoLicenciaMedicaController);
router.delete("/:id", deleteLicenciaMedicaController);

export default router;
