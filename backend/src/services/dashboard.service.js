"use strict";
import { AppDataSource } from "../config/configDb.js";

export async function getMetricasDashboard() {
    const hoy = new Date().toISOString().split("T")[0];

    const asistenciaHoy = await AppDataSource.getRepository("Asistencia")
        .count({ where: { fecha: hoy, estado: "PRESENTE" } });

    const personalActivo = await AppDataSource.getRepository("Contrato")
        .count({ where: { estado: "ACTIVO" } });

    const instalacionesEnCurso = await AppDataSource.getRepository("Instalacion")
        .count({ where: { estado: "EN_CURSO" } });

    return { asistenciaHoy, personalActivo, instalacionesEnCurso };
}

export async function getAlertasPendientes() {
    return await AppDataSource.getRepository("Alerta")
        .find({
            where: { estado: "PENDIENTE" },
            relations: ["empleado"],
            order: { fechaCreacion: "DESC" },
        });
}