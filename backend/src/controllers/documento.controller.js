"use strict";
import { 
  subirDocumentoService, 
  getDocumentosByEmpleadoService,
  downloadDocumentoService
} from "../services/documento.service.js";
import { handleSuccess, handleErrorClient, handleErrorServer } from "../Handlers/responseHanders.js";

export const subirDocumentoController = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;
    
    if (!req.file) {
      return handleErrorClient(res, 400, "No se adjuntó ningún archivo");
    }
    if (!tipo) {
      return handleErrorClient(res, 400, "El tipo de documento es obligatorio");
    }

    const documento = await subirDocumentoService(Number(id), tipo, req.file, req.user);
    handleSuccess(res, 201, "Documento guardado exitosamente", documento);
  } catch (error) {
    if (error.status === 400 || error.status === 403 || error.status === 404) {
      handleErrorClient(res, error.status, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
};

export const getDocumentosByEmpleadoController = async (req, res) => {
  try {
    const { id } = req.params;
    const documentos = await getDocumentosByEmpleadoService(Number(id), req.user);
    handleSuccess(res, 200, "Documentos obtenidos", documentos);
  } catch (error) {
    if (error.status === 403 || error.status === 404) {
      handleErrorClient(res, error.status, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
};

export const downloadDocumentoController = async (req, res) => {
  try {
    const { idDocumento } = req.params;
    const filePath = await downloadDocumentoService(Number(idDocumento), req.user);
    res.download(filePath);
  } catch (error) {
    if (error.status === 403 || error.status === 404) {
      handleErrorClient(res, error.status, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
};

export const getMisDocumentosController = async (req, res) => {
  try {
    const { AppDataSource } = await import("../config/configDb.js");
    const empleadoRepo = AppDataSource.getRepository("Empleado");
    
    const empleado = await empleadoRepo.findOne({ where: { usuario: { idUsuario: req.user.idUsuario } } });
    
    if (!empleado) {
      return handleErrorClient(res, 404, "Perfil de empleado no encontrado");
    }

    const documentos = await getDocumentosByEmpleadoService(empleado.idEmpleado);
    handleSuccess(res, 200, "Mis documentos obtenidos", documentos);
  } catch (error) {
    if (error.status === 404) {
      handleErrorClient(res, error.status, error.message);
    } else {
      handleErrorServer(res, 500, error.message);
    }
  }
};
