"use strict";
import { AppDataSource } from "../config/configDb.js";

export async function getMetricasDashboard() {
    const hoy = new Date().toISOString().split("T")[0];

    const asistenciaHoy = await AppDataSource.getRepository("Asistencia")
        .count({ where: { fecha: hoy, estado: "PRESENTE" } });

    const personalActivo = await AppDataSource.getRepository("Contrato")
        .createQueryBuilder("contrato")
        .where("UPPER(contrato.estado) = :estado", { estado: "ACTIVO" })
        .getCount();

    const resultado = await AppDataSource.getRepository("Contrato")
        .createQueryBuilder("contrato")
        .innerJoin("contrato.empleado", "empleado")
        .innerJoin("empleado.instalacion", "instalacion")
        .select("COUNT(DISTINCT instalacion.id_instalacion)", "count")
        .where("UPPER(contrato.estado) = :estado", { estado: "ACTIVO" })
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
    // Obtenemos los últimos contratos creados como historial
    const contratos = await AppDataSource.getRepository("Contrato")
        .find({
            relations: ["empleado", "empleado.usuario", "empleado.instalacion"],
            order: { fechaInicio: "DESC" },
            take: 5
        });

    return contratos.map(c => ({
        tipo: "Contrato creado",
        descripcion: `${c.empleado?.usuario?.nombre} ${c.empleado?.usuario?.apellido} asignado a ${c.empleado?.instalacion?.nombre || 'Sin instalación'}`,
        fecha: c.fechaInicio
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