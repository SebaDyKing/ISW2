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
        tipoAlerta: a.tipo,
    }));

    // 1. Contratos por vencer
    const contratosVencer = await AppDataSource.getRepository("Contrato")
        .find({
            where: { estado: "POR VENCER" },
            relations: ["empleado", "empleado.usuario", "cliente", "cliente.usuario"]
        });

    contratosVencer.forEach(c => {
        const emp = c.empleado?.usuario;
        const cliente = c.cliente;
        
        let nombreAsignado = 'Desconocido';
        if (emp) {
            nombreAsignado = `Empleado: ${emp.nombre} ${emp.apellido}`;
        } else if (cliente) {
            nombreAsignado = `Cliente: ${cliente.nombreEmpresa}`;
        }

        let diasRestantes = '';
        if (c.fechaFin) {
            const diffTime = new Date(c.fechaFin) - new Date();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 0) diasRestantes = 'hoy';
            else if (diffDays === 1) diasRestantes = 'mañana';
            else if (diffDays < 0) diasRestantes = `hace ${Math.abs(diffDays)} días`;
            else diasRestantes = `en ${diffDays} días`;
        }

        alertasAgregadas.push({
            idAlerta: `contrato_${c.idContrato}`,
            mensaje: `Vencimiento de contrato - ${nombreAsignado} ${diasRestantes ? '(' + diasRestantes + ')' : ''}`,
            FechaCreacion: c.fechaActualizacion || c.fechaInicio || new Date(),
            tipoOriginal: 'contrato'
        });
    });

    // 2. Contratos pendientes de firma
    const contratosPendientes = await AppDataSource.getRepository("Contrato")
        .find({
            where: { estado: "PENDIENTE DE FIRMA" },
            relations: ["empleado", "empleado.usuario", "cliente", "cliente.usuario"]
        });

    contratosPendientes.forEach(c => {
        const emp = c.empleado?.usuario;
        const cliente = c.cliente;
    
        let nombreAsignado = 'Desconocido';
        if (emp) {
            nombreAsignado = `Empleado - ${emp.nombre} ${emp.apellido}`;
        } else if (cliente) {
            nombreAsignado = `Cliente - ${cliente.nombreEmpresa}`;
        }
        alertasAgregadas.push({
            idAlerta: `firma_${c.idContrato}`,
            mensaje: `Contrato pendiente de firma: ${nombreAsignado}`,
            FechaCreacion: c.fechaActualizacion || c.fechaInicio || new Date(),
            tipoOriginal: 'firma'
        });
    });

    // 2.5. Documentos pendientes de firma (Anexos, Finiquitos, etc.)
    const documentosPendientes = await AppDataSource.getRepository("Documento")
        .find({
            where: { estadoFirma: "PENDIENTE" },
            relations: ["empleado", "empleado.usuario", "cliente", "cliente.usuario"]
        });

    documentosPendientes.forEach(doc => {
        const emp = doc.empleado?.usuario;
        const cliente = doc.cliente;
    
        let nombreAsignado = 'Desconocido';
        if (emp) {
            nombreAsignado = `Empleado - ${emp.nombre} ${emp.apellido}`;
        } else if (cliente) {
            nombreAsignado = `Cliente - ${cliente.nombreEmpresa}`;
        }
        alertasAgregadas.push({
            idAlerta: `doc_firma_${doc.idDocumento}`,
            mensaje: `Documento pendiente de firma (${doc.tipo}): ${nombreAsignado}`,
            FechaCreacion: doc.fechaCreacion || new Date(),
            tipoOriginal: 'firma' // Podemos usar el mismo tipo para que redirija a la sección correcta
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

    // 3.5. Licencias médicas pendientes de revisión (Nuevas)
    const licenciasNuevas = await AppDataSource.getRepository("LicenciaMedica")
        .find({
            where: {
                estado: "pendiente"
            },
            relations: ["empleado", "empleado.usuario"]
        });

    licenciasNuevas.forEach(l => {
        const emp = l.empleado?.usuario;
        alertasAgregadas.push({
            idAlerta: `licencia_nueva_${l.idLicencia}`,
            mensaje: `Nueva licencia médica por revisar: ${emp ? emp.nombre + ' ' + emp.apellido : 'Empleado desconocido'}`,
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