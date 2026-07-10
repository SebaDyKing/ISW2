"use strict";
import { Router } from "express";
import uploadMiddleware from "../middleware/upload.middleware.js";
import { authMiddleware, autorizeEntities } from "../middleware/authentication.js";
import {
  getLicenciasMedicasController,
  getLicenciaMedicaByIdController,
  getPdfLicenciaMedicaController,
  createLicenciaMedicaController,
  updateEstadoLicenciaMedicaController,
  deleteLicenciaMedicaController,
} from "../controllers/licenciamedica.controller.js";

const router = Router();

// Toda ruta de licencias requiere sesión activa (contienen diagnósticos médicos)
router.use(authMiddleware);

// Lectura: el empleado consulta el listado para filtrar sus propias licencias
router.get("/", autorizeEntities("administrador", "supervisor", "empleado"), getLicenciasMedicasController);
router.get("/:id", autorizeEntities("administrador", "supervisor"), getLicenciaMedicaByIdController);
router.get("/:id/pdf", autorizeEntities("administrador", "supervisor", "empleado"), getPdfLicenciaMedicaController);
// El empleado sube su propia licencia; el admin puede cargarla por él
router.post("/", autorizeEntities("empleado", "administrador"), uploadMiddleware.single("archivoPdf"), createLicenciaMedicaController);
router.patch("/:id/estado", autorizeEntities("administrador"), updateEstadoLicenciaMedicaController);
router.delete("/:id", autorizeEntities("administrador"), deleteLicenciaMedicaController);

export default router;
