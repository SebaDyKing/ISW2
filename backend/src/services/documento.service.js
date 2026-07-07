"use strict";
import { AppDataSource } from "../config/configDb.js";
import fs from "fs";
import path from "path";

// Asegurar que exista el directorio uploads/documentos
const UPLOADS_DIR = path.join(process.cwd(), "uploads", "documentos");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

async function getInstalacionesSupervisor(user) {
    const supervisor = await AppDataSource.getRepository("Supervisor").findOne({
        where: { usuario: { idUsuario: user.idUsuario } },
        relations: [
            "instalaciones", 
            "instalaciones.instalacion",
            "usuario",
            "usuario.empleado",
            "usuario.empleado.contratos",
            "usuario.empleado.contratos.contratoInstalaciones",
            "usuario.empleado.contratos.contratoInstalaciones.instalacion"
        ]
    });
    
    let instalacionIds = [];
    if (supervisor && supervisor.instalaciones) {
        instalacionIds.push(...supervisor.instalaciones.map(si => si.instalacion.idInstalacion));
    }

    if (supervisor && supervisor.usuario && supervisor.usuario.empleado && supervisor.usuario.empleado.contratos) {
        const activos = supervisor.usuario.empleado.contratos.filter(c => c.estado !== "FINALIZADO");
        activos.forEach(c => {
            if (c.contratoInstalaciones) {
                c.contratoInstalaciones.forEach(ci => {
                    if (ci.instalacion) instalacionIds.push(ci.instalacion.idInstalacion);
                });
            }
        });
    }

    return [...new Set(instalacionIds)];
}

export async function subirDocumentoService(idEmpleado, tipo, file, user = null) {
  try {
    const empleadoRepo = AppDataSource.getRepository("Empleado");
    const empleado = await empleadoRepo.findOne({ 
      where: { idEmpleado },
      relations: ["contratos", "contratos.contratoInstalaciones", "contratos.contratoInstalaciones.instalacion"]
    });
    if (!empleado) {
      throw { status: 404, message: "Empleado no encontrado" };
    }

    if (user && user.rol === "supervisor") {
      const supervisorInstalacionIds = await getInstalacionesSupervisor(user);
      if (supervisorInstalacionIds.length === 0) {
        throw { status: 403, message: "No tienes permisos para interactuar con este empleado" };
      }
      const isAssigned = empleado.contratos.some(c => 
        c.estado !== "FINALIZADO" &&
        c.contratoInstalaciones &&
        c.contratoInstalaciones.some(ci => ci.instalacion && supervisorInstalacionIds.includes(ci.instalacion.idInstalacion))
      );
      if (!isAssigned) {
        throw { status: 403, message: "No tienes permisos para interactuar con este empleado" };
      }
    }

    const documentoRepo = AppDataSource.getRepository("DocumentoEmpleado");
    
    // Generar nombre de archivo ǧnico
    const ext = path.extname(file.originalname);
    const fileName = `${tipo}_${idEmpleado}_${Date.now()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    // Mover archivo del buffer temporal a disco
    fs.writeFileSync(filePath, file.buffer);

    const nuevoDocumento = documentoRepo.create({
      tipo: tipo,
      nombreArchivo: file.originalname,
      rutaArchivo: `/uploads/documentos/${fileName}`, // esto ya no ser directamente pblico
      empleado: empleado,
    });

    const guardado = await documentoRepo.save(nuevoDocumento);
    return guardado;
  } catch (error) {
    if (error.status) throw error;
    throw new Error(`Error al subir documento: ${error.message}`);
  }
}

export async function getDocumentosByEmpleadoService(idEmpleado, user = null) {
  try {
    const empleadoRepo = AppDataSource.getRepository("Empleado");
    const empleado = await empleadoRepo.findOne({ 
      where: { idEmpleado },
      relations: ["contratos", "contratos.contratoInstalaciones", "contratos.contratoInstalaciones.instalacion"] 
    });
    if (!empleado) {
      throw { status: 404, message: "Empleado no encontrado" };
    }

    if (user && user.rol === "supervisor") {
      const supervisorInstalacionIds = await getInstalacionesSupervisor(user);
      if (supervisorInstalacionIds.length === 0) {
        throw { status: 403, message: "No tienes permisos para ver a este empleado" };
      }
      const isAssigned = empleado.contratos.some(c => 
        c.estado !== "FINALIZADO" &&
        c.contratoInstalaciones &&
        c.contratoInstalaciones.some(ci => ci.instalacion && supervisorInstalacionIds.includes(ci.instalacion.idInstalacion))
      );
      if (!isAssigned) {
        throw { status: 403, message: "No tienes permisos para ver a este empleado" };
      }
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

export async function downloadDocumentoService(idDocumento, user) {
  try {
    const documentoRepo = AppDataSource.getRepository("DocumentoEmpleado");
    const documento = await documentoRepo.findOne({
      where: { idDocumento },
      relations: [
        "empleado", 
        "empleado.usuario",
        "empleado.contratos", 
        "empleado.contratos.contratoInstalaciones", 
        "empleado.contratos.contratoInstalaciones.instalacion"
      ]
    });

    if (!documento) {
      throw { status: 404, message: "Documento no encontrado" };
    }

    // Autorizacin
    if (user.rol === "empleado") {
      if (documento.empleado.usuario.idUsuario !== user.idUsuario) {
        throw { status: 403, message: "No puedes acceder a documentos de otro empleado" };
      }
    } else if (user.rol === "supervisor") {
      const supervisorInstalacionIds = await getInstalacionesSupervisor(user);
      if (supervisorInstalacionIds.length === 0) {
        throw { status: 403, message: "No tienes permisos para descargar este documento" };
      }
      const isAssigned = documento.empleado.contratos.some(c => 
        c.estado !== "FINALIZADO" &&
        c.contratoInstalaciones &&
        c.contratoInstalaciones.some(ci => ci.instalacion && supervisorInstalacionIds.includes(ci.instalacion.idInstalacion))
      );
      if (!isAssigned) {
        throw { status: 403, message: "No tienes permisos para descargar este documento" };
      }
    }

    // Si es administrador, pasa de largo
    const fileName = path.basename(documento.rutaArchivo);
    const filePath = path.join(UPLOADS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
      throw { status: 404, message: "El archivo físico no existe en el servidor" };
    }

    return filePath;
  } catch (error) {
    if (error.status) throw error;
    throw new Error(`Error en servicio de descarga: ${error.message}`);
  }
}
