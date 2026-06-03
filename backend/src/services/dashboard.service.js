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

    const totalEmpleados = await AppDataSource.getRepository("Empleado").count();
    const porcentajeAsistencia = totalEmpleados > 0 ? Math.round((asistenciaHoy / totalEmpleados) * 100) : 0;

    return { asistenciaHoy: porcentajeAsistencia, personalActivo, instalacionesEnCurso };
}

export async function getHistorialReciente() {
    // Obtenemos los últimos contratos creados como historial
    const contratos = await AppDataSource.getRepository("Contrato")
        .find({
            relations: ["empleado", "instalacion"],
            order: { fechaInicio: "DESC" },
            take: 5
        });

    return contratos.map(c => ({
        tipo: "Contrato creado",
        descripcion: `${c.empleado?.nombre} ${c.empleado?.apellido} asignado a ${c.instalacion?.nombre}`,
        fecha: c.fechaInicio
    }));
}

export async function getAlertasPendientes() {
    return await AppDataSource.getRepository("Alerta")
        .find({
            where: { estado: "PENDIENTE" },
            relations: ["empleado"],
            order: { fechaCreacion: "DESC" },
        });
}