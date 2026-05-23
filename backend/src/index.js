"use strict";
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./config/configDb.js";
import { HOST, PORT } from "./config/configEnv.js";
import { routerApi } from "./routes/index.routes.js";
import { seedDatabase } from "./config/seed.js";
import authRouter from "./routes/auth.routes.js";

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("¡Bienvenido a mi API REST con TypeORM!");
});

connectDB()
  .then(async () => {
    await seedDatabase();
    routerApi(app);

    app.listen(PORT, () => {
      console.log(`Servidor iniciado en ${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error al conectar con la base de datos:", error);
    process.exit(1);
  });