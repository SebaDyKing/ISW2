"use strict";
import { AppDataSource } from "../config/configDb.js";
import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

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

export async function subirDocumentoService(idEntidad, tipo, file, user = null, esCliente = false) {
  try {
    const documentoRepo = AppDataSource.getRepository("Documento");
    const nuevoDocumento = documentoRepo.create({
      tipo: tipo,
      nombreArchivo: file.originalname,
      // la ruta real la asignaremos luego
    });

    if (esCliente) {
      const clienteRepo = AppDataSource.getRepository("Cliente");
      const cliente = await clienteRepo.findOne({ where: { idCliente: idEntidad } });
      if (!cliente) throw { status: 404, message: "Cliente no encontrado" };
      nuevoDocumento.cliente = cliente;
    } else {
      const empleadoRepo = AppDataSource.getRepository("Empleado");
      const empleado = await empleadoRepo.findOne({ 
        where: { idEmpleado: idEntidad },
        relations: ["contratos", "contratos.contratoInstalaciones", "contratos.contratoInstalaciones.instalacion"]
      });
      if (!empleado) throw { status: 404, message: "Empleado no encontrado" };
      nuevoDocumento.empleado = empleado;

      if (user && user.rol === "supervisor") {
        const supervisorInstalacionIds = await getInstalacionesSupervisor(user);
        if (supervisorInstalacionIds.length === 0) throw { status: 403, message: "No tienes permisos" };
        const isAssigned = empleado.contratos.some(c => 
          c.estado !== "FINALIZADO" &&
          c.contratoInstalaciones &&
          c.contratoInstalaciones.some(ci => ci.instalacion && supervisorInstalacionIds.includes(ci.instalacion.idInstalacion))
        );
        if (!isAssigned) throw { status: 403, message: "No tienes permisos" };
      }
    }
    
    const ext = path.extname(file.originalname);
    const fileName = `${tipo}_${idEntidad}_${Date.now()}${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, file.buffer);
    nuevoDocumento.rutaArchivo = `/uploads/documentos/${fileName}`;
    
    return await documentoRepo.save(nuevoDocumento);
  } catch (error) {
    if (error.status) throw error;
    throw new Error(`Error al subir documento: ${error.message}`);
  }
}

export async function getDocumentosByEmpleadoService(idEntidad, user = null, isCliente = false) {
  try {
    const documentoRepo = AppDataSource.getRepository("Documento");

    if (isCliente) {
      return await documentoRepo.find({
        where: { cliente: { idCliente: idEntidad } },
        order: { fechaCreacion: "DESC" },
      });
    }

    // Verificamos permisos para supervisor igual
    if (user && user.rol === "supervisor") {
      const empleadoRepo = AppDataSource.getRepository("Empleado");
      const empleado = await empleadoRepo.findOne({ 
        where: { idEmpleado: idEntidad },
        relations: ["contratos", "contratos.contratoInstalaciones", "contratos.contratoInstalaciones.instalacion"] 
      });
      if (empleado && empleado.usuario?.idUsuario !== user.idUsuario) {
        const supervisorInstalacionIds = await getInstalacionesSupervisor(user);
        const isAssigned = empleado.contratos.some(c => 
          c.estado !== "FINALIZADO" &&
          c.contratoInstalaciones &&
          c.contratoInstalaciones.some(ci => ci.instalacion && supervisorInstalacionIds.includes(ci.instalacion.idInstalacion))
        );
        if (!isAssigned && supervisorInstalacionIds.length > 0) {
          throw { status: 403, message: "No tienes permisos para ver a este empleado" };
        }
      }
    }

    return await documentoRepo.find({
      where: { empleado: { idEmpleado: idEntidad } },
      order: { fechaCreacion: "DESC" },
    });
  } catch (error) {
    if (error.status) throw error;
    throw new Error(`Error al obtener documentos: ${error.message}`);
  }
}

export async function downloadDocumentoService(idDocumento, user) {
  try {
    const documentoRepo = AppDataSource.getRepository("Documento");
    const documento = await documentoRepo.findOne({
      where: { idDocumento },
      relations: [
        "empleado", 
        "empleado.usuario",
        "empleado.contratos", 
        "empleado.contratos.contratoInstalaciones", 
        "empleado.contratos.contratoInstalaciones.instalacion",
        "cliente",
        "cliente.usuario"
      ]
    });

    if (!documento) {
      throw { status: 404, message: "Documento no encontrado" };
    }

    if (user.rol === "supervisor") {
      if (documento.empleado && documento.empleado.usuario.idUsuario === user.idUsuario) {
        // Es propio
      } else if (documento.empleado) {
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
      } else {
        throw { status: 403, message: "No tienes permisos" };
      }
    } else if (user.rol === "empleado") {
      if (documento.empleado && documento.empleado.usuario.idUsuario !== user.idUsuario) {
        throw { status: 403, message: "No puedes acceder a documentos de otro empleado" };
      }
    } else if (user.rol === "cliente") {
      if (documento.cliente && documento.cliente.usuario.idUsuario !== user.idUsuario) {
        throw { status: 403, message: "No puedes acceder a documentos de otro cliente" };
      }
    }

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

export async function firmarDocumentoService(idDocumento, user, firmaBase64) {
  try {
    const documentoRepo = AppDataSource.getRepository("Documento");
    const documento = await documentoRepo.findOne({
      where: { idDocumento },
      relations: ["empleado", "empleado.usuario", "cliente", "cliente.usuario"]
    });

    if (!documento) {
      throw { status: 404, message: "Documento no encontrado" };
    }

    if (user.rol === "empleado" || user.rol === "supervisor") {
      if (documento.empleado && documento.empleado.usuario.idUsuario !== user.idUsuario) {
        throw { status: 403, message: "No puedes firmar un documento que no te pertenece" };
      }
    } else if (user.rol === "cliente") {
      if (documento.cliente && documento.cliente.usuario.idUsuario !== user.idUsuario) {
        throw { status: 403, message: "No puedes firmar un documento que no te pertenece" };
      }
    } else {
      throw { status: 403, message: "Rol no autorizado para firmar" };
    }

    if (documento.tipo.startsWith("Anexo")) {
      const whereCondition = documento.empleado 
        ? { empleado: { idEmpleado: documento.empleado.idEmpleado }, tipo: "Contrato", estadoFirma: "FIRMADO" }
        : { cliente: { idCliente: documento.cliente.idCliente }, tipo: "Contrato", estadoFirma: "FIRMADO" };
        
      const contratoSigned = await documentoRepo.findOne({ where: whereCondition });

      if (!contratoSigned) {
        throw { status: 400, message: "Debes firmar primero el contrato principal antes de firmar un anexo." };
      }
    }

    documento.estadoFirma = "FIRMADO";
    documento.fechaFirma = new Date();
    documento.firmaBase64 = firmaBase64;

    await documentoRepo.save(documento);

    // Si el documento firmado es un contrato, activamos el contrato asociado
    if (documento.tipo === "Contrato") {
      const contratoRepo = AppDataSource.getRepository("Contrato");
      let contrato;
      
      if (documento.empleado) {
        contrato = await contratoRepo.findOne({
          where: {
            empleado: { idEmpleado: documento.empleado.idEmpleado },
            estado: "PENDIENTE DE FIRMA"
          },
          order: { fechaInicio: "DESC" }
        });
      } else if (documento.cliente) {
        contrato = await contratoRepo.findOne({
          where: {
            cliente: { idCliente: documento.cliente.idCliente },
            estado: "PENDIENTE DE FIRMA"
          },
          order: { fechaInicio: "DESC" }
        });
      }

      if (contrato) {
        contrato.estado = "ACTIVO";
        await contratoRepo.save(contrato);
      }
    }

    try {
      const fileName = path.basename(documento.rutaArchivo);
      const filePath = path.join(UPLOADS_DIR, fileName);

      if (fs.existsSync(filePath)) {
        const pdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        const lastPage = pages[pages.length - 1]; // Stamp on last page where SignatureBlock is

        const firmaBuffer = Buffer.from(firmaBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
        let firmaImage;
        if (firmaBase64.includes("image/jpeg") || firmaBase64.includes("image/jpg")) {
            firmaImage = await pdfDoc.embedJpg(firmaBuffer);
        } else {
            firmaImage = await pdfDoc.embedPng(firmaBuffer);
        }

        const imgDims = firmaImage.scale(0.5); // scale down

        lastPage.drawImage(firmaImage, {
            x: 422, // Coordinates for worker signature (right column)
            y: 105, // Matches the new absolute bottom: 80 positioning
            width: 100,
            height: 50,
        });

        const modifiedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(filePath, modifiedPdfBytes);
      }
    } catch (err) {
      console.error("Error al estampar firma en el PDF", err);
    }

    return { message: "Documento firmado exitosamente" };
  } catch (error) {
    if (error.status) throw error;
    throw new Error(`Error al firmar documento: ${error.message}`);
  }
}
