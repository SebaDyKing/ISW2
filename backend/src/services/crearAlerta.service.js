"use strict";
import { AppDataSource } from "../config/configDb.js";
import { getSocketServer } from "../utils/socket.js";

const getRepo = () => AppDataSource.getRepository("Alertas");

export async function crearAlerta(idEmpleado, tipo, mensaje, agrupacion, idContrato = null) {
    if (!idEmpleado) {
        throw { status: 400, message: "El idEmpleado es obligatorio para crear una alerta." };
    }
    if (!tipo || !mensaje || !agrupacion) {
        throw { status: 400, message: "Tipo, mensaje y agrupación son obligatorios para crear una alerta." };
    }

    const empleado = await AppDataSource.getRepository("Empleado").findOne({
        where: { idEmpleado },
    });

    if (!empleado) {
        throw { status: 404, message: "Empleado no encontrado." };
    }

    const repo = getRepo();
    const alertaExistente = await repo.findOne({
        where: {
            tipo,
            Agrupacion: agrupacion,
            Estado: "PENDIENTE",
            Empleado: { idEmpleado },
            ...(idContrato ? { contrato: { idContrato } } : {}),
        },
        relations: ["Empleado", "contrato"],
    });

    if (alertaExistente) {
        return alertaExistente;
    }

    const nuevaAlerta = repo.create({
        tipo,
        mensaje,
        Agrupacion: agrupacion,
        Empleado: { idEmpleado },
        ...(idContrato ? { contrato: { idContrato } } : {}),
    });

    const alertaGuardada = await repo.save(nuevaAlerta);

    try {
        const io = getSocketServer();
        io.to("dashboard_admin").emit("nueva_alerta", {
            idAlerta: alertaGuardada.idAlerta,
            tipo: alertaGuardada.tipo,
            mensaje: alertaGuardada.mensaje,
            Estado: alertaGuardada.Estado,
            Agrupacion: alertaGuardada.Agrupacion,
            FechaCreacion: alertaGuardada.FechaCreacion,
            idEmpleado,
            idContrato: idContrato ?? null,
        });
    } catch (error) {
        console.warn("No se pudo emitir la alerta por socket:", error.message || error);
    }

    return alertaGuardada;
}
