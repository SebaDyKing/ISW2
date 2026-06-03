import { AppDataSource } from "./src/config/configDb.js";

console.log("=> Limpiando y recreando el esquema de la base de datos...");

// Habilitamos temporalmente la opción de TypeORM para limpiar el esquema
AppDataSource.setOptions({ dropSchema: true });

try {
  await AppDataSource.initialize();
  console.log("=> Base de datos limpiada y recreada con éxito.");
  await AppDataSource.destroy();
  process.exit(0);
} catch (error) {
  console.error("=> Error al limpiar la base de datos:", error);
  process.exit(1);
}
