"use strict";
import express from "express";
import multer from "multer";
import { 
  subirDocumentoController, 
  getDocumentosByEmpleadoController, 
  getMisDocumentosController,
  getMisDocumentosClienteController,
  downloadDocumentoController,
  firmarDocumentoController
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
router.get("/empleados/mis-documentos", autorizeEntities("empleado", "supervisor"), getMisDocumentosController);

// GET /api/empleados/:id/documentos - Obtener historial de documentos de un empleado
router.get("/empleados/:id/documentos", autorizeEntities("administrador", "supervisor"), getDocumentosByEmpleadoController);

// POST /api/empleados/:id/documentos - Subir un nuevo documento
router.post("/empleados/:id/documentos", autorizeEntities("administrador", "supervisor"), upload.single("archivoPdf"), subirDocumentoController);

// GET /api/clientes/mis-documentos - Obtener historial de documentos del propio cliente
router.get("/clientes/mis-documentos", autorizeEntities("cliente"), getMisDocumentosClienteController);

// GET /api/clientes/:id/documentos - Obtener historial de documentos de un cliente
router.get("/clientes/:id/documentos", autorizeEntities("administrador"), getDocumentosByEmpleadoController);

// POST /api/clientes/:id/documentos - Subir un nuevo documento
router.post("/clientes/:id/documentos", autorizeEntities("administrador"), upload.single("archivoPdf"), subirDocumentoController);

// GET /api/documentos/:idDocumento/download - Descargar un documento (protegido)
router.get("/documentos/:idDocumento/download", autorizeEntities("administrador", "supervisor", "empleado", "cliente"), downloadDocumentoController);
// POST /api/documentos/:idDocumento/firmar - Firmar digitalmente un documento
router.post("/documentos/:idDocumento/firmar", autorizeEntities("empleado", "supervisor", "cliente"), firmarDocumentoController);

export default router;
