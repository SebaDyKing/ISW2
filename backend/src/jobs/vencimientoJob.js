"use strict";
import { AppDataSource } from "../config/configDb.js";
import { SolicitudCotizacion } from "../models/SolicitudCotizacion.js";
import { enviarCorreoVencimientoAdmin } from "../utils/email.js";
import { EMAIL_USER } from "../config/configEnv.js";

const INTERVALO_MS = 15 * 60 * 1000; // cada 15 minutos

async function verificarVencidas() {
  try {
    const repo = AppDataSource.getRepository(SolicitudCotizacion);

    const pendientes = await repo.find({
      where: { estado: "Pendiente" },
      relations: ["cliente", "plan", "instalacion"],
    });

    const ahora = new Date();
    const vencidas = pendientes.filter(
      (c) => c.fechaLimite && new Date(c.fechaLimite) < ahora
    );

    for (const cotizacion of vencidas) {
      cotizacion.estado = "Vencida";
      await repo.save(cotizacion);

      enviarCorreoVencimientoAdmin(EMAIL_USER, cotizacion)
        .catch((err) => console.error("[Job] Error enviando correo:", err));

      console.log(`[Job] Cotización #${cotizacion.idSolicitud} marcada como Vencida`);
    }

    if (vencidas.length === 0) {
      console.log("[Job] Sin cotizaciones vencidas.");
    }

  } catch (err) {
    console.error("[Job] Error en verificarVencidas:", err);
  }
}

export function iniciarJobVencimiento() {
  console.log("[Job] Iniciando job de vencimiento de cotizaciones...");
  verificarVencidas();
  setInterval(verificarVencidas, INTERVALO_MS);
}