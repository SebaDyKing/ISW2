import { DataSource } from 'typeorm';
import { db } from './configEnv.js';
import { Usuario } from '../models/Usuario.js';
import { Empleado } from '../models/Empleado.js';
import { Administrador } from '../models/Administrador.js';
import { Supervisor } from '../models/Supervisor.js';
import { Cliente } from '../models/Cliente.js';
import { Plan } from '../models/Plan.js';
import { ClientePlan } from '../models/ClientePlan.js';
import { Instalacion } from '../models/Instalacion.js';
import { SupervisorInstalacion } from '../models/SupervisorInstalacion.js';
import { Contrato } from '../models/Contrato.js';
import { Asistencia } from '../models/Asistencia.js';
import { LicenciaMedica } from '../models/LicenciaMedica.js';
import { HojaVida } from '../models/HojaVida.js';
import { ReporteCliente } from '../models/ReporteCliente.js';
import { SolicitudCotizacion } from '../models/SolicitudCotizacion.js';
/**
 * Configuración de la fuente de datos (DataSource) de TypeORM.
 * Establece la conexión con la base de datos PostgreSQL utilizando
 * las variables de entorno importadas.
 * * @type {DataSource}
 */

export const AppDataSource = new DataSource({
  type: "postgres",
  host: db.host,
  port: Number(db.port),
  username: db.user,
  password: db.password,
  database: db.database,
  entities: [
    Usuario, Empleado, Administrador, Supervisor,
    Cliente, Plan, ClientePlan, Instalacion,
    SupervisorInstalacion, Contrato, Asistencia,
    LicenciaMedica, HojaVida, ReporteCliente,
    SolicitudCotizacion
  ],
  synchronize: true,
  logging: false,
});

//Conecta la base de datos y en caso que haya un error avisa con un console.error
export async function connectDB() {
  try {
    await AppDataSource.initialize();
    console.log("=> Conexión exitosa a la base de datos");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1);
  }
}