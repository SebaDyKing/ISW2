"use strict";
import cron from "node-cron";
import { AppDataSource } from "../config/configDb.js";
import { crearAlerta } from "../services/crearAlerta.service.js";

export async function revisarVencimientos() {
    try {
        console.log("[CRON] Iniciando revisión de vencimientos de contratos...");
        const contratoRepo = AppDataSource.getRepository("Contrato");
        const hoy = new Date();
        
        // Obtener todos los contratos a plazo fijo que sigan activos
        const contratos = await contratoRepo.find({
            where: {
                tipo: "Plazo Fijo",
                estado: "ACTIVO"
            },
            relations: ["empleado", "empleado.usuario"]
        });

        let contratosActualizados = 0;

        for (const contrato of contratos) {
            if (!contrato.fechaFin) continue;

            const fechaFin = new Date(contrato.fechaFin);
            const diffTime = fechaFin - hoy;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 15) {
                // Cambiar estado a POR VENCER
                contrato.estado = "POR VENCER";
                await contratoRepo.save(contrato);
                contratosActualizados++;

                // Generar alerta en el dashboard
                if (contrato.empleado) {
                    const nombreEmpleado = contrato.empleado.usuario ? `${contrato.empleado.usuario.nombre} ${contrato.empleado.usuario.apellido}` : `ID ${contrato.empleado.idEmpleado}`;
                    const mensaje = `El contrato a plazo fijo de ${nombreEmpleado} finaliza el ${contrato.fechaFin} (en ${diffDays} días).`;
                    await crearAlerta(
                        contrato.empleado.idEmpleado,
                        "ALERTA VENCIMIENTO",
                        mensaje,
                        "POR_VENCER",
                        contrato.idContrato
                    );
                }
            }
        }

        console.log(`[CRON] Revisión finalizada. Contratos actualizados a 'POR VENCER': ${contratosActualizados}`);
    } catch (error) {
        console.error("[CRON] Error al revisar vencimientos de contratos:", error);
    }
}

// Programar para que corra todos los días a la medianoche
export function initCronJobs() {
    cron.schedule("0 0 * * *", () => {
        revisarVencimientos();
    });
    console.log("[CRON] Tarea programada: Revisión de vencimientos (00:00 hrs)");
}
