"use strict";
import { AppDataSource } from "../config/configDb.js";

const getRepo = () => AppDataSource.getRepository("Actividad");

export async function registrarActividad(tipo, descripcion) {
    try {
        const repo = getRepo();
        const nuevaActividad = repo.create({
            tipo,
            descripcion
        });
        await repo.save(nuevaActividad);
    } catch (error) {
        console.error("Error al registrar actividad:", error);
    }
}
