import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

// Lee la clave secreta desde el .env, o usa la clave por defecto del scaffold
const secret = process.env.SECRET_JWT_KEY || "clave_temporal";

const token = jwt.sign(
  { id: 1, entity: "empleado" }, // Payload esperado por el authMiddleware
  secret,
  { expiresIn: "1d" }
);

console.log("\n=== COPIA TU TOKEN DE EMPLEADO AQUÍ ABAJO ===");
console.log(`Bearer ${token}`);
console.log("============================================\n");
