import dotenv from 'dotenv';
dotenv.config();
import { AppDataSource } from './src/config/configDb.js';

async function run() {
  await AppDataSource.initialize();
  await AppDataSource.query("UPDATE contrato SET fecha_inicio = '2026-05-10' WHERE id_contrato = 8");
  console.log('Fecha inicio contrato 8 actualizada');
  process.exit(0);
}
run().catch(console.error);
