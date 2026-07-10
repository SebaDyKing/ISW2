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
import { SolicitudCotizacion } from "../models/SolicitudCotizacion.js";
import { LicenciaMedica } from "../models/LicenciaMedica.js";
import { Asistencia } from "../models/Asistencia.js";
import { HojaVida } from "../models/HojaVida.js";
import { Documento } from "../models/Documento.js";
import { SupervisorInstalacion } from "../models/SupervisorInstalacion.js";

const PLANES_DATA = [
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
];

/**
 * @brief Inserta datos iniciales en la base de datos para pruebas locales.
 *        Es IDEMPOTENTE: si ya hay usuarios cargados, no hace nada.
 *        Solo se debería usar en desarrollo. Para producción, deshabilitar.
 */
export async function seedDatabase() {
  const planRepo = AppDataSource.getRepository(Plan);
  const planesExistentes = await planRepo.find({ order: { idPlan: "ASC" } });

  // PARCHE PARA PRODUCCIÓN: Siempre actualizar los textos de los planes si ya existen,
  // para evitar que queden en blanco tras un despliegue de código nuevo.
  if (planesExistentes.length > 0) {
    for (let i = 0; i < planesExistentes.length; i++) {
      const data = PLANES_DATA[i] || PLANES_DATA[2];
      Object.assign(planesExistentes[i], data);
      await planRepo.save(planesExistentes[i]);
    }
  } else {
    // Si no existen (DB limpia), los creamos.
    await planRepo.save(PLANES_DATA);
  }

  const usuarioRepo = AppDataSource.getRepository(Usuario);

  const count = await usuarioRepo.count();
  if (count > 0) {
    console.log("=> Seed: La base ya tiene datos, se omite");
    return;
  }

  console.log("=> Seed: Insertando datos iniciales...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 7 usuarios base (agregamos 2 empleados extra)
  const usuarios = await usuarioRepo.save([
    { nombre: "Juan",     apellido: "Pérez",   rut: "11111111-1", correo: "juan@test.cl",      passwordHash, rol: "empleado" },
    { nombre: "Ana",      apellido: "Soto",    rut: "22222222-2", correo: "ana@test.cl",       passwordHash, rol: "administrador" },
    { nombre: "Carlos",   apellido: "Ruiz",    rut: "33333333-3", correo: "carlos@test.cl",    passwordHash, rol: "supervisor" },
    { nombre: "CleanPro", apellido: "SpA",     rut: "44444444-4", correo: "cleanpro@test.cl",  passwordHash, rol: "cliente" },
    { nombre: "Angelo",   apellido: "Valenzuela",rut: "55555555-5", correo: "valenzuelaangelo02@gmail.com",  passwordHash, rol: "cliente" },
    { nombre: "María",    apellido: "Gómez",   rut: "66666666-6", correo: "maria@test.cl",     passwordHash, rol: "empleado" },
    { nombre: "Luis",     apellido: "Torres",  rut: "77777777-7", correo: "luis@test.cl",      passwordHash, rol: "empleado" },
  ]);

  // Empleados
  const empleadoRepo = AppDataSource.getRepository(Empleado);
  const [empleado1, empleado2, empleado3] = await empleadoRepo.save([
    {
      rut: "11111111-1",
      fechaNacimiento: "1990-01-01",
      usuario: usuarios[0],
    },
    {
      rut: "66666666-6",
      fechaNacimiento: "1995-05-10",
      usuario: usuarios[5],
    },
    {
      rut: "77777777-7",
      fechaNacimiento: "1988-11-20",
      usuario: usuarios[6],
    }
  ]);

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

  // Contrato vinculando al Empleado Juan
  const contratoRepo = AppDataSource.getRepository(Contrato);
  const contratoGuardado = await contratoRepo.save({
    tipo: "indefinido",
    cargo: "Guardia de seguridad",
    sueldo: 500000,
    jornadaHoras: 8,
    fechaInicio: "2026-01-01",
    estado: "activo",
    empleado: empleado1,
  });

  const contratoGuardado2 = await contratoRepo.save({
    tipo: "plazo_fijo",
    cargo: "Supervisor de Área",
    sueldo: 750000,
    jornadaHoras: 9,
    fechaInicio: "2026-03-15",
    estado: "activo",
    empleado: empleado2,
  });

  const ciRepo = AppDataSource.getRepository("ContratoInstalacion");
  await ciRepo.save([
    {
      contrato: { idContrato: contratoGuardado.idContrato },
      instalacion: { idInstalacion: instalacion.idInstalacion },
      horasSemanales: 8,
      pagoAdicional: 0
    },
    {
      contrato: { idContrato: contratoGuardado2.idContrato },
      instalacion: { idInstalacion: instalacion.idInstalacion }, // Comparten instalación
      horasSemanales: 9,
      pagoAdicional: 50000
    }
  ]);

  // ----------------------------------------------------
  // DATOS DE EXHIBICIÓN: Licencias Médicas
  // ----------------------------------------------------
  const licenciaRepo = AppDataSource.getRepository(LicenciaMedica);
  await licenciaRepo.save([
    {
      diagnostico: "Enfermedad común (Gripe)",
      fechaInicio: new Date().toISOString().split("T")[0],
      fechaFin: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split("T")[0],
      archivoPdf: "licencia_medica_ejemplo.pdf",
      estado: "Pendiente",
      empleado: empleado1
    },
    {
      diagnostico: "Licencia Maternal",
      fechaInicio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
      fechaFin: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString().split("T")[0],
      archivoPdf: "licencia_maternal_maria.pdf",
      estado: "Aprobada",
      empleado: empleado2
    }
  ]);

  // ----------------------------------------------------
  // DATOS DE EXHIBICIÓN: Cotizaciones para el Dashboard
  // ----------------------------------------------------
  const cotizacionRepo = AppDataSource.getRepository(SolicitudCotizacion);
  
  // Fecha límite simulada (2 días en el futuro)
  const fechaLimitePendiente = new Date();
  fechaLimitePendiente.setDate(fechaLimitePendiente.getDate() + 2);

  await cotizacionRepo.save([
    {
      estado: "Pendiente",
      fechaLimite: fechaLimitePendiente,
      comentarios: "Necesitamos limpieza urgente para la inauguración del nuevo edificio.",
      cantidadEmpleados: 3,
      cliente: cliente1,
      plan: { idPlan: 2 }, // Estándar
      instalacion: instalacion, // Edificio Central
      medioContacto: "Teléfono",
      horarioContacto: "Mañana",
      horasHabilesLimite: 24
    },
    {
      estado: "Aprobada",
      fechaLimite: new Date(),
      comentarios: "Servicio de limpieza básica semanal para oficina pequeña.",
      cantidadEmpleados: 1,
      cliente: cliente2,
      plan: { idPlan: 1 }, // Básico
      instalacion: null,
      horasHabilesLimite: 24
    },
    {
      estado: "Rechazada",
      motivo: "No tenemos disponibilidad de personal para horario nocturno.",
      fechaLimite: new Date(),
      comentarios: "Requerimos limpieza nocturna todos los días.",
      cantidadEmpleados: 5,
      cliente: cliente1,
      plan: { idPlan: 3 }, // Personalizado
      instalacion: null,
      horasHabilesLimite: 48
    },
    {
      estado: "Pendiente",
      fechaLimite: fechaLimitePendiente,
      comentarios: "Solicito cotización para sanitización de bodega sur.",
      cantidadEmpleados: 2,
      cliente: cliente1,
      plan: { idPlan: 3 }, // Personalizado
      instalacion: null,
      medioContacto: "Correo",
      horarioContacto: "Tarde",
      horasHabilesLimite: 48
    },
    {
      estado: "Aprobada",
      fechaLimite: new Date(),
      comentarios: "Mantención quincenal de ventanales edificio principal.",
      cantidadEmpleados: 2,
      cliente: cliente2,
      plan: { idPlan: 2 }, // Estándar
      instalacion: null,
      horasHabilesLimite: 24
    }
  ]);

  // ----------------------------------------------------
  // DATOS DE EXHIBICIÓN: Asistencia, Hoja de Vida y más
  // ----------------------------------------------------
  
  // 1. Asistencia (Empleado marcando entrada hoy)
  const asistenciaRepo = AppDataSource.getRepository(Asistencia);
  const fechaHoy = new Date().toISOString().split("T")[0];
  await asistenciaRepo.save([
    {
      fecha: fechaHoy,
      entrada: "08:00:00",
      estado: "Presente",
      contrato: contratoGuardado
    },
    {
      fecha: fechaHoy,
      entrada: "08:15:00",
      estado: "Atraso",
      contrato: contratoGuardado2
    }
  ]);

  // 2. Hoja de Vida (Anotación positiva)
  const hojaVidaRepo = AppDataSource.getRepository(HojaVida);
  await hojaVidaRepo.save([
    {
      tipo: "Positiva",
      descripcion: "Excelente desempeño durante la limpieza del evento anual del cliente.",
      fecha: new Date(),
      empleado: empleado1
    },
    {
      tipo: "Negativa",
      descripcion: "Llegó tarde 3 días seguidos sin justificación.",
      fecha: new Date(new Date().setDate(new Date().getDate() - 5)),
      empleado: empleado3
    }
  ]);

  // 3. Documento (Certificado de Antecedentes)
  const documentoRepo = AppDataSource.getRepository(Documento);
  await documentoRepo.save([
    {
      nombreArchivo: "Certificado_Antecedentes_Juan_Perez.pdf",
      tipo: "Antecedentes",
      rutaArchivo: "/uploads/cert_antecedentes.pdf", // Mock URL
      empleado: empleado1
    },
    {
      nombreArchivo: "Contrato_Firmado_Maria.pdf",
      tipo: "Contrato",
      rutaArchivo: "/uploads/contrato_maria.pdf", // Mock URL
      empleado: empleado2
    }
  ]);

  // 4. Asignación de Supervisor a Instalación
  const superInstRepo = AppDataSource.getRepository(SupervisorInstalacion);
  const supervisor = await AppDataSource.getRepository(Supervisor).findOne({ where: { usuario: { idUsuario: usuarios[2].idUsuario } } });
  if (supervisor) {
    await superInstRepo.save({
      supervisor: supervisor,
      instalacion: instalacion
    });
  }

  console.log("=> Seed: Datos de exhibición insertados correctamente");
  console.log("   - Empleados extra: María Gómez, Luis Torres");
  console.log("   - Cotizaciones: 1 Pendiente, 1 Aprobada, 1 Rechazada");
  console.log("   - Administrador: idAdmin=1 (Ana Soto) → ana@test.cl / password123");
  console.log("   - Cliente 1: idCliente=1 (CleanPro SpA)  → cleanpro@test.cl / password123");
  console.log("   - Cliente 2: idCliente=2 (Angelo Valenzuela) → valenzuelaangelo02@gmail.com / password123");
}