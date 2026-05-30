"use strict";
import { Router } from "express";
import uploadMiddleware from "../middlewares/upload.middleware.js";
import {
  getLicenciasMedicasController,
  getLicenciaMedicaByIdController,
  getPdfLicenciaMedicaController,
  createLicenciaMedicaController,
  updateEstadoLicenciaMedicaController,
  deleteLicenciaMedicaController,
} from "../controllers/licenciamedica.controller.js";

const router = Router();

router.get("/", getLicenciasMedicasController);
router.get("/:id", getLicenciaMedicaByIdController);
router.get("/:id/pdf", getPdfLicenciaMedicaController);
router.post("/", uploadMiddleware.single("archivoPdf"), createLicenciaMedicaController);
router.patch("/:id/estado", updateEstadoLicenciaMedicaController);
router.delete("/:id", deleteLicenciaMedicaController);

export default router;
