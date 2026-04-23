import { DataSource } from 'typeorm';
import { db } from './configEnv.js';

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
  entities: ["src/models/**/*.js"],
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