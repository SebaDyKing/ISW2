"use strict";
import { AppDataSource } from "../config/configDb.js";
import fs from "fs";
import path from "path";

// Asegurar que exista el directorio uploads/documentos
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "documentos");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function subirDocumentoService(idEmpleado, tipo, file) {
  try {
    const empleadoRepo = AppDataSource.getRepository("Empleado");
    const empleado = await empleadoRepo.findOne({ where: { idEmpleado } });
    if (!empleado) {
      throw { status: 404, message: "Empleado no encontrado" };
    }

    const documentoRepo = AppDataSource.getRepository("DocumentoEmpleado");
    
    // Generar nombre de archivo único
    const ext = path.extname(file.originalname);
    const fileName = `${tipo}_${idEmpleado}_${Date.now()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    // Mover archivo del buffer temporal a disco
    fs.writeFileSync(filePath, file.buffer);

    const nuevoDocumento = documentoRepo.create({
      tipo: tipo,
      nombreArchivo: file.originalname,
      rutaArchivo: `/uploads/documentos/${fileName}`,
      empleado: empleado,
    });

    const guardado = await documentoRepo.save(nuevoDocumento);
    return guardado;
  } catch (error) {
    if (error.status) throw error;
    throw new Error(`Error al subir documento: ${error.message}`);
  }
}

export async function getDocumentosByEmpleadoService(idEmpleado) {
  try {
    const empleadoRepo = AppDataSource.getRepository("Empleado");
    const empleado = await empleadoRepo.findOne({ where: { idEmpleado } });
    if (!empleado) {
      throw { status: 404, message: "Empleado no encontrado" };
    }

    const documentoRepo = AppDataSource.getRepository("DocumentoEmpleado");
    return await documentoRepo.find({
      where: { empleado: { idEmpleado } },
      order: { fechaCreacion: "DESC" },
    });
  } catch (error) {
    if (error.status) throw error;
    throw new Error(`Error al obtener documentos: ${error.message}`);
  }
}
