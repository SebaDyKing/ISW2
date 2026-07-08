"use strict";
import { AppDataSource } from "../config/configDb.js";

export async function getMetricasDashboard() {
    const hoy = new Date().toISOString().split("T")[0];

    const asistenciaHoy = await AppDataSource.getRepository("Asistencia")
        .count({ where: { fecha: hoy } });

    const personalActivo = await AppDataSource.getRepository("Contrato")
        .createQueryBuilder("contrato")
        .where("UPPER(contrato.estado) IN (:...estados)", { estados: ["ACTIVO", "POR VENCER"] })
        .andWhere("contrato.id_empleado IS NOT NULL")
        .getCount();

    const resultado = await AppDataSource.getRepository("Contrato")
        .createQueryBuilder("contrato")
        .innerJoin("contrato.contratoInstalaciones", "ci")
        .innerJoin("ci.instalacion", "instalacion")
        .select("COUNT(DISTINCT instalacion.id_instalacion)", "count")
        .where("UPPER(contrato.estado) IN (:...estados)", { estados: ["ACTIVO", "POR VENCER"] })
        .getRawOne();
    
    const instalacionesEnCurso = parseInt(resultado?.count || 0, 10);

    const totalInstalaciones = await AppDataSource.getRepository("Instalacion").count();

    const porcentajeAsistencia = personalActivo > 0 ? Math.round((asistenciaHoy / personalActivo) * 100) : 0;

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
    const { LessThanOrEqual } = await import("typeorm");
    
    // 0. Alertas Base
    const alertasBase = await AppDataSource.getRepository("Alertas")
        .find({
            where: { Estado: "PENDIENTE" },
            relations: ["Empleado"],
        });
        
    let alertasAgregadas = alertasBase.map(a => ({
        idAlerta: a.idAlerta,
        mensaje: a.mensaje || `Alerta: ${a.tipo}`,
        FechaCreacion: a.FechaCreacion,
        tipoOriginal: 'general',
    }));

    // 1. Contratos por vencer
    const contratosVencer = await AppDataSource.getRepository("Contrato")
        .find({
            where: { estado: "POR VENCER" },
            relations: ["empleado", "empleado.usuario"]
        });
    
    contratosVencer.forEach(c => {
        const emp = c.empleado?.usuario;
        alertasAgregadas.push({
            idAlerta: `contrato_${c.idContrato}`,
            mensaje: `Vencimiento de contrato: ${emp ? emp.nombre + ' ' + emp.apellido : 'Empleado desconocido'}`,
            FechaCreacion: c.fechaActualizacion || c.fechaInicio || new Date(),
            tipoOriginal: 'contrato'
        });
    });

    // 2. Contratos pendientes de firma
    const contratosPendientes = await AppDataSource.getRepository("Contrato")
        .find({
            where: { estado: "PENDIENTE DE FIRMA" },
            relations: ["empleado", "empleado.usuario"]
        });
    
    contratosPendientes.forEach(c => {
        const emp = c.empleado?.usuario;
        alertasAgregadas.push({
            idAlerta: `firma_${c.idContrato}`,
            mensaje: `Contrato pendiente de firma: ${emp ? emp.nombre + ' ' + emp.apellido : 'Empleado desconocido'}`,
            FechaCreacion: c.fechaActualizacion || c.fechaInicio || new Date(),
            tipoOriginal: 'firma'
        });
    });

    // 3. Licencias médicas por finalizar (próximos 7 días o ya finalizadas recientes)
    const hoy = new Date();
    const proximaSemana = new Date();
    proximaSemana.setDate(hoy.getDate() + 7);

    const licenciasTerminando = await AppDataSource.getRepository("LicenciaMedica")
        .find({
            where: {
                fechaFin: LessThanOrEqual(proximaSemana.toISOString().split('T')[0]),
                estado: "Aprobada"
            },
            relations: ["empleado", "empleado.usuario"]
        });
    
    licenciasTerminando.forEach(l => {
        const emp = l.empleado?.usuario;
        alertasAgregadas.push({
            idAlerta: `licencia_${l.idLicencia}`,
            mensaje: `Finalización de licencia médica: ${emp ? emp.nombre + ' ' + emp.apellido : 'Empleado desconocido'} (hasta ${l.fechaFin})`,
            FechaCreacion: l.createdAt || new Date(),
            tipoOriginal: 'licencia'
        });
    });

    // 4. Cotizaciones sin revisar
    const cotizaciones = await AppDataSource.getRepository("SolicitudCotizacion")
        .find({
            where: { estado: "Pendiente" },
            relations: ["cliente", "cliente.usuario"]
        });

    cotizaciones.forEach(cot => {
        const cli = cot.cliente?.usuario;
        alertasAgregadas.push({
            idAlerta: `cotizacion_${cot.idSolicitud}`,
            mensaje: `Cotización sin revisar: ${cli ? cli.nombre + ' ' + cli.apellido : 'Cliente desconocido'}`,
            FechaCreacion: cot.fechaCreacion || new Date(),
            tipoOriginal: 'cotizacion'
        });
    });

    // Ordenar todas por fecha de creación (más recientes primero)
    alertasAgregadas.sort((a, b) => new Date(b.FechaCreacion) - new Date(a.FechaCreacion));

    return alertasAgregadas;
}