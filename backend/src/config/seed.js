"use strict";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { Usuario } from "../models/Usuario.js";
import { Empleado } from "../models/Empleado.js";
import { Administrador } from "../models/Administrador.js";
import { Supervisor } from "../models/Supervisor.js";
import { Cliente } from "../models/Cliente.js";
import { Instalacion } from "../models/Instalacion.js";
import { Contrato } from "../models/Contrato.js";

/**
 * @brief Inserta datos iniciales en la base de datos para pruebas locales.
 *        Es IDEMPOTENTE: si ya hay usuarios cargados, no hace nada.
 *        Solo se debería usar en desarrollo. Para producción, deshabilitar.
 */
export async function seedDatabase() {
  const usuarioRepo = AppDataSource.getRepository(Usuario);

  const count = await usuarioRepo.count();
  if (count > 0) {
    console.log("=> Seed: La base ya tiene datos, se omite");
    return;
  }

  console.log("=> Seed: Insertando datos iniciales...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 4 usuarios base
  const usuarios = await usuarioRepo.save([
    { nombre: "Juan",     apellido: "Pérez", rut: "11111111-1", correo: "juan@test.cl",     passwordHash },
    { nombre: "Ana",      apellido: "Soto",  rut: "22222222-2", correo: "ana@test.cl",      passwordHash },
    { nombre: "Carlos",   apellido: "Ruiz",  rut: "33333333-3", correo: "carlos@test.cl",   passwordHash },
    { nombre: "CleanPro", apellido: "SpA",   rut: "44444444-4", correo: "cleanpro@test.cl", passwordHash },
  ]);

  // Empleado (usa Usuario 1 = Juan Pérez)
  const empleadoRepo = AppDataSource.getRepository(Empleado);
  const empleado = await empleadoRepo.save({
    rut: "11111111-1",  // Mismo RUT que su Usuario
    fechaNacimiento: "1990-01-01",
    usuario: usuarios[0],
  });

  // Administrador (usa Usuario 2 = Ana Soto)
  const adminRepo = AppDataSource.getRepository(Administrador);
  await adminRepo.save({
    usuario: usuarios[1],
  });

  // Supervisor (usa Usuario 3 = Carlos Ruiz)
  const supervisorRepo = AppDataSource.getRepository(Supervisor);
  await supervisorRepo.save({
    rut: "33333333-3",  // Mismo RUT que su Usuario (Carlos)
    usuario: usuarios[2],
  });

  // Cliente (usa Usuario 4 = CleanPro SpA)
  const clienteRepo = AppDataSource.getRepository(Cliente);
  const cliente = await clienteRepo.save({
    nombreEmpresa: "CleanPro SpA",
    telefono: "+56 9 1234 5678",
    usuario: usuarios[3],
  });

  // Instalación del cliente
  const instalacionRepo = AppDataSource.getRepository(Instalacion);
  const instalacion = await instalacionRepo.save({
    nombre: "Edificio Central",
    direccion: "Av. Test 123, Concepción",
    latitud: -36.8270,
    longitud: -73.0498,
    telefono: "+56 41 222 3333",
    cliente,
  });

  // Contrato vinculando al Empleado Juan con la Instalación
  const contratoRepo = AppDataSource.getRepository(Contrato);
  await contratoRepo.save({
    tipo: "indefinido",
    cargo: "Guardia de seguridad",
    sueldo: 500000,
    jornadaHoras: 8,
    fechaInicio: "2026-01-01",
    estado: "activo",
    empleado,
    instalacion,
  });

  console.log("=> Seed: Datos insertados correctamente");
  console.log("   - Empleado: idEmpleado=1 (Juan Pérez)");
  console.log("   - Administrador: idAdmin=1 (Ana Soto)");
  console.log("   - Supervisor: idSupervisor=1 (Carlos Ruiz)");
  console.log("   - Cliente: idCliente=1 (CleanPro SpA)");
  console.log("   - Instalación: idInstalacion=1 (Edificio Central)");
  console.log("   - Contrato: idContrato=1 (Juan @ Edificio Central)");
}
