"use strict";
import { AppDataSource } from "../config/configDb.js";

export async function getMetricasDashboard() {
    const hoy = new Date().toISOString().split("T")[0];

    const asistenciaHoy = await AppDataSource.getRepository("Asistencia")
        .count({ where: { fecha: hoy, estado: "PRESENTE" } });

    const personalActivo = await AppDataSource.getRepository("Contrato")
        .createQueryBuilder("contrato")
        .where("UPPER(contrato.estado) IN (:...estados)", { estados: ["ACTIVO", "POR VENCER"] })
        .getCount();

    const resultado = await AppDataSource.getRepository("Contrato")
        .createQueryBuilder("contrato")
        .innerJoin("contrato.instalacion", "instalacion")
        .select("COUNT(DISTINCT instalacion.id_instalacion)", "count")
        .where("UPPER(contrato.estado) IN (:...estados)", { estados: ["ACTIVO", "POR VENCER"] })
        .getRawOne();
    
    const instalacionesEnCurso = parseInt(resultado?.count || 0, 10);

    const totalInstalaciones = await AppDataSource.getRepository("Instalacion").count();

    const totalEmpleados = await AppDataSource.getRepository("Empleado").count();
    const porcentajeAsistencia = totalEmpleados > 0 ? Math.round((asistenciaHoy / totalEmpleados) * 100) : 0;

    return { 
        asistenciaHoy: porcentajeAsistencia, 
        personalActivo, 
        instalacionesEnCurso,
        instalacionesTotales: totalInstalaciones 
    };
}

export async function getHistorialReciente() {
    // Obtenemos los últimos 5 registros de actividad
    const actividades = await AppDataSource.getRepository("Actividad")
        .find({
            order: { createdAt: "DESC" },
            take: 5
        });

    return actividades.map(a => ({
        tipo: a.tipo,
        descripcion: a.descripcion,
        fecha: a.createdAt
    }));
}

export async function getAlertasPendientes() {
    return await AppDataSource.getRepository("Alertas")
        .find({
            where: { Estado: "PENDIENTE" },
            relations: ["Empleado"],
            order: { FechaCreacion: "DESC" },
        });
}