"use strict";
import fs from "fs"
import path from "path"
import { AppDataSource } from "../config/configDb.js";
import { LicenciaMedica } from "../models/LicenciaMedica.js";
import { Empleado } from "../models/Empleado.js";
import { Supervisor } from "../models/Supervisor.js";

export async function getLicenciasMedicasServices() {
  try {
    const licenciaRepository = AppDataSource.getRepository(LicenciaMedica);
    return await licenciaRepository.find({
      relations: { empleado: { usuario: true }, supervisor: { usuario: true } },
    });
  } catch (error) {
    throw new Error(`Error al obtener las licencias médicas ${error.message}`);
  }
}

export async function getLicenciaMedicaServicesByID(id) {
  try {
    const licenciaRepository = AppDataSource.getRepository(LicenciaMedica);
    const licencia = await licenciaRepository.findOne({
      where: { idLicencia: id },
      relations: { empleado: { usuario: true }, supervisor: { usuario: true } },
    });
    if (!licencia) throw new Error("Licencia médica no encontrada");
    return licencia;
  } catch (error) {
    throw new Error(`Error al obtener la licencia médica ${error.message}`);
  }
}

export async function createLicenciaMedicaServices(data) {
  try {
    if (!data.archivoPdf) {
      throw new Error("El archivo PDF es obligatorio");
    }
    const empleadoRepository = AppDataSource.getRepository(Empleado);
    const empleado = await empleadoRepository.findOne({
      where: data.idEmpleado
        ? { idEmpleado: data.idEmpleado }
        : { usuario: { idUsuario: data.idUsuario } },
    });
    if (!empleado) throw new Error("No se encontró el empleado del usuario");

    // Crear y guardar la lcencia medica
    const licenciaRepository = AppDataSource.getRepository(LicenciaMedica);
    const newLicencia = licenciaRepository.create({
      fechaInicio: data.fechaInicio,
      fechaFin: data.fechaFin,
      diagnostico: data.diagnostico,
      estado: "pendiente",
      archivoPdf: data.archivoPdf,
      empleado,
    });
    return await licenciaRepository.save(newLicencia);
  } catch (error) {
    throw new Error(`Error al crear la licencia médica ${error.message}`);
  }
}

export async function updateEstadoLicenciaMedicaServices(id, data) {
  try {
    // Buscar licencia
    const licenciaRepository = AppDataSource.getRepository(LicenciaMedica);
    const licencia = await licenciaRepository.findOneBy({ idLicencia: id });
    if (!licencia) throw new Error("Licencia médica no encontrada");

    // Validar supervisor
    const supervisorRepository = AppDataSource.getRepository(Supervisor);
    const supervisor = await supervisorRepository.findOne({
      where: { idSupervisor: data.idSupervisor },
    });
    if (!supervisor) throw new Error("Supervisor no encontrado");

    // Aplicar cambios  solo estado y supervisor
    licenciaRepository.merge(licencia, {
      estado: data.estado,
      supervisor,
    });
    return await licenciaRepository.save(licencia);
  } catch (error) {
    throw new Error(`Error al actualizar el estado de la licencia médica ${error.message}`);
  }
}

export async function deleteLicenciaMedicaServices(id) {
  try {
    const licenciaRepository = AppDataSource.getRepository(LicenciaMedica);
    const licencia = await licenciaRepository.findOneBy({idLicencia: id})
    
    if(!licencia) throw new Error("Licencia médica no encontrada")

    if(licencia.archivoPdf){
      const filePath = path.join("uploads",licencia.archivoPdf)
      try{
        fs.unlinkSync(filePath)
      }catch(error){
        console.warn(`No se pudo borrar el archivo ${filePath}:`, error.message);
      }
    }
    const resultado = await licenciaRepository.delete(id)
    if(resultado.affected=== 0) {
      throw new Error("Licencia medica no encontrada")
    }
    return {id,message: "Licencia Medica eliminada"}
  } catch (error) {
    throw new Error(`Error al eliminar la licencia médica ${error.message}`);
  }
}
