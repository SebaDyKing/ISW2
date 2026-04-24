import jwt from "jsonwebtoken";

// Fabricamos un token falso con la misma clave secreta de tu .env
const token = jwt.sign(
  { id: 1, rol: "admin" }, 
  "CleanPro_Secreto_Ultra_Seguro_2026", // Asegúrate de que sea la misma que pusiste en tu .env
  { expiresIn: "10h" }
);

console.log("\n=== COPIA TU TOKEN AQUÍ ABAJO ===");
console.log(token);
console.log("=================================\n");