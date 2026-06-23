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
import { Plan } from "../models/Plan.js";

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

  const planRepo = AppDataSource.getRepository(Plan);
  const planes = await planRepo.save([
  {
    tipo: "Básico",
    descripcion: "Limpieza general periódica para mantener tus instalaciones en óptimas condiciones.",
    frecuencia: "Semanal",
    idealPara: "Oficinas y locales pequeños",
    esPersonalizado: false,
  },
  {
    tipo: "Estándar",
    descripcion: "Limpieza profunda con desinfección certificada y mayor cobertura de áreas.",
    frecuencia: "Diaria o interdiaria",
    idealPara: "Empresas medianas y edificios",
    esPersonalizado: false,
  },
  {
    tipo: "Personalizado",
    descripcion: "Servicio diseñado completamente a medida según las necesidades específicas de tu empresa.",
    frecuencia: "A convenir",
    idealPara: "Plantas industriales, hospitales, colegios",
    esPersonalizado: true,
  },
]);

  // 5 usuarios base
  const usuarios = await usuarioRepo.save([
    { nombre: "Juan",     apellido: "Pérez",   rut: "11111111-1", correo: "juan@test.cl",      passwordHash, rol: "empleado" },
    { nombre: "Ana",      apellido: "Soto",    rut: "22222222-2", correo: "ana@test.cl",       passwordHash, rol: "administrador" },
    { nombre: "Carlos",   apellido: "Ruiz",    rut: "33333333-3", correo: "carlos@test.cl",    passwordHash, rol: "supervisor" },
    { nombre: "CleanPro", apellido: "SpA",     rut: "44444444-4", correo: "cleanpro@test.cl",  passwordHash, rol: "cliente" },
    { nombre: "Angelo", apellido: "Valenzuela",    rut: "55555555-5", correo: "valenzuelaangelo02@gmail.com",  passwordHash, rol: "cliente" },
  ]);

  // Empleado (usa Usuario 1 = Juan Pérez)
  const empleadoRepo = AppDataSource.getRepository(Empleado);
  const empleado = await empleadoRepo.save({
    rut: "11111111-1",
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
    rut: "33333333-3",
    usuario: usuarios[2],
  });

  // Cliente 1 (usa Usuario 4 = CleanPro SpA)
  const clienteRepo = AppDataSource.getRepository(Cliente);
  const cliente1 = await clienteRepo.save({
    nombreEmpresa: "CleanPro SpA",
    telefono: "+56 9 1234 5678",
    usuario: usuarios[3],
  });

  // Cliente 2 (usa Usuario 5 = Angelo Valenzuela)
  const cliente2 = await clienteRepo.save({
    nombreEmpresa: "Angelo",
    telefono: "+56 9 8765 4321",
    usuario: usuarios[4],
  });

  // Instalaciones del cliente 1
  const instalacionRepo = AppDataSource.getRepository(Instalacion);
  const [instalacion] = await instalacionRepo.save([
    {
      nombre: "Edificio Central",
      direccion: "Av. Test 123, Concepción",
      latitud: -36.8270,
      longitud: -73.0498,
      telefono: "+56 41 222 3333",
      cliente: cliente1,
    },
    {
      nombre: "Sucursal Norte",
      direccion: "Calle Los Pinos 456, Concepción",
      latitud: -36.8100,
      longitud: -73.0600,
      telefono: "+56 41 333 4444",
      cliente: cliente1,
    },
    {
      nombre: "Bodega Sur",
      direccion: "Ruta 160 Km 5, Coronel",
      latitud: -37.0200,
      longitud: -73.1500,
      telefono: "+56 41 444 5555",
      cliente: cliente1,
    },
  ]);

  // Instalaciones del cliente 2
  await instalacionRepo.save([
    {
      nombre: "Oficina Hualpén",
      direccion: "Av. Colón 789, Hualpén",
      latitud: -36.7900,
      longitud: -73.1100,
      telefono: "+56 41 555 6666",
      cliente: cliente2,
    },
    {
      nombre: "Planta Talcahuano",
      direccion: "Av. Gran Bretaña 1000, Talcahuano",
      latitud: -36.7200,
      longitud: -73.1200,
      telefono: "+56 41 666 7777",
      cliente: cliente2,
    },
    {
      nombre: "Depósito Chiguayante",
      direccion: "Camino a Chiguayante 321, Chiguayante",
      latitud: -36.9100,
      longitud: -73.0200,
      telefono: "+56 41 777 8888",
      cliente: cliente2,
    },
  ]);

  // Contrato vinculando al Empleado Juan con la Instalación de cliente 1
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
  console.log("   - Cliente 1: idCliente=1 (CleanPro SpA)  → cleanpro@test.cl / password123");
  console.log("   - Cliente 2: idCliente=2 (Angelo Valenzuela) → valenzuelaangelo02@gmail.com / password123");
  console.log("   - Instalación: idInstalacion=1 (Edificio Central)");
  console.log("   - Contrato: idContrato=1 (Juan @ Edificio Central)");
}