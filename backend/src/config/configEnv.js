import { config } from 'dotenv';
config();

//Importa credenciales del archivo .env para la base de datos
export const db = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DATABASE
}

//exporta credenciales del .env para utilizarlo en el backend
export const PORT = Number(process.env.PORT) || 3000;
export const HOST = process.env.HOST || 'localhost';
