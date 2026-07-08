"use strict";
import express from "express";
import multer from "multer";
import { 
  subirDocumentoController, 
  getDocumentosByEmpleadoController, 
  getMisDocumentosController,
  downloadDocumentoController 
} from "../controllers/documento.controller.js";
import { authMiddleware, autorizeEntities } from "../middleware/authentication.js";

const router = express.Router();

// Configuración de multer en memoria (el servicio se encarga de guardarlo a disco)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
});

router.use(authMiddleware);

// GET /api/empleados/mis-documentos - Obtener historial de documentos del propio empleado
router.get("/empleados/mis-documentos", autorizeEntities("empleado"), getMisDocumentosController);

// GET /api/empleados/:id/documentos - Obtener historial de documentos de un empleado
router.get("/empleados/:id/documentos", autorizeEntities("administrador", "supervisor"), getDocumentosByEmpleadoController);

// POST /api/empleados/:id/documentos - Subir un nuevo documento
router.post("/empleados/:id/documentos", autorizeEntities("administrador", "supervisor"), upload.single("archivoPdf"), subirDocumentoController);

// GET /api/documentos/:idDocumento/download - Descargar un documento (protegido)
router.get("/documentos/:idDocumento/download", autorizeEntities("administrador", "supervisor", "empleado"), downloadDocumentoController);

export default router;
