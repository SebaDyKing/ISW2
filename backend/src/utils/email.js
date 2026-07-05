"use strict";
import mailer from "../config/mailer.js";
import { EMAIL_USER } from "../config/configEnv.js";

const transporter = mailer.transporter;

// ── Helpers visuales  ────────────────────────────────────────────
const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

function header(color, titulo) {
  return `
    <div style="background: ${color}; padding: 28px 32px;">
      <div style="font-size: 13px; font-weight: 700; letter-spacing: 2px; color: rgba(255,255,255,0.7); margin-bottom: 6px;">CLEANPRO</div>
      <div style="font-size: 22px; font-weight: 700; color: #ffffff;">${titulo}</div>
    </div>
  `;
}

function footer() {
  return `
    <div style="background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        Este correo fue generado automáticamente por el sistema CleanPro.<br/>
        Si tienes dudas, responde este correo o contacta a nuestro equipo.
      </p>
    </div>
  `;
}

function bloque(contenido) {
  return `<div style="padding: 24px 32px;">${contenido}</div>`;
}

function infoBox(items) {
  const filas = items.map(([label, valor]) => `
    <tr>
      <td style="padding: 7px 12px; font-size: 13px; color: #64748b; white-space: nowrap;">${label}</td>
      <td style="padding: 7px 12px; font-size: 13px; color: #0f172a; font-weight: 500;">${valor}</td>
    </tr>
  `).join("");

  return `
    <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin: 16px 0;">
      ${filas}
    </table>
  `;
}

function destacado(color, texto) {
  return `
    <div style="border-left: 3px solid ${color}; background: #f8fafc; padding: 12px 16px; border-radius: 0 6px 6px 0; margin: 16px 0;">
      <p style="font-size: 13px; color: #334155; line-height: 1.6; margin: 0;">${texto}</p>
    </div>
  `;
}

// ── Helpers de fecha ───────────────────────────────────────────────────────────
function formatearFechaLimite(fecha) {
  return new Date(fecha).toLocaleString("es-CL", {
    weekday: "long",
    day:     "numeric",
    month:   "long",
    year:    "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
  });
}

// ── Correos ───────────────────────────────────────────────────────────────────
export async function enviarCorreoSolicitudRecibida(correoDestino, nombreEmpresa, fechaLimite, horasHabilesLimite) {
  const plazoTexto = fechaLimite
    ? `el <strong>${formatearFechaLimite(fechaLimite)}</strong>`
    : "a la brevedad";

  await transporter.sendMail({
    from: `"CleanPro" <${EMAIL_USER}>`,
    to: correoDestino,
    subject: "Recibimos tu solicitud de cotización",
    html: `
      <div style="${baseStyle}">
        ${header("#534AB7", "Solicitud recibida")}
        ${bloque(`
          <p style="font-size: 15px; color: #0f172a; font-weight: 600; margin: 0 0 8px;">Hola, ${nombreEmpresa} 👋</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 16px;">
            Recibimos tu solicitud de cotización y ya está en manos de nuestro equipo.
          </p>
          ${infoBox([
            ["Plazo de respuesta", `${horasHabilesLimite} horas hábiles`],
            ["Te notificaremos antes del", formatearFechaLimite(fechaLimite)],
          ])}
          ${destacado("#534AB7", "Si tienes alguna consulta mientras tanto, no dudes en responder este correo.")}
        `)}
        ${footer()}
      </div>
    `,
  });
}

export async function enviarCorreoEstadoCotizacion(correoDestino, nombreEmpresa, estado, motivo, medioContacto, horarioContacto) {
  const esAprobada  = estado === "Aprobada";
  const colorHeader = esAprobada ? "#16a34a" : "#dc2626";
  const titulo      = esAprobada ? "Tu cotización fue aprobada" : "Tu cotización no pudo ser aprobada";

  const seccionContacto = esAprobada && (medioContacto || horarioContacto) ? `
    <p style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 4px;">
      Cómo te contactaremos
    </p>
    ${infoBox([
      ...(medioContacto   ? [["Medio",   medioContacto]]   : []),
      ...(horarioContacto ? [["Horario", horarioContacto]] : []),
    ])}
  ` : "";

  const seccionMotivo = motivo ? `
    <p style="font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 4px;">
      ${esAprobada ? "Próximos pasos" : "Motivo"}
    </p>
    ${destacado(colorHeader, motivo)}
  ` : "";

  const cuerpo = esAprobada ? `
    <p style="font-size: 15px; color: #0f172a; font-weight: 600; margin: 0 0 8px;">¡Buenas noticias, ${nombreEmpresa}!</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 4px;">
      Tu solicitud de cotización ha sido <strong style="color: #16a34a;">aprobada</strong>.
      Nos pondremos en contacto contigo según tus preferencias para coordinar los próximos pasos.
    </p>
    ${seccionContacto}
    ${seccionMotivo}
  ` : `
    <p style="font-size: 15px; color: #0f172a; font-weight: 600; margin: 0 0 8px;">Hola, ${nombreEmpresa}.</p>
    <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 4px;">
      Lamentamos informarte que tu solicitud de cotización no pudo ser aprobada en esta oportunidad.
    </p>
    ${seccionMotivo}
    <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 16px 0 0;">
      Si lo deseas, puedes enviar una nueva solicitud en cualquier momento o contactarnos directamente.
    </p>
  `;

  await transporter.sendMail({
    from: `"CleanPro" <${EMAIL_USER}>`,
    to: correoDestino,
    subject: titulo,
    html: `
      <div style="${baseStyle}">
        ${header(colorHeader, titulo)}
        ${bloque(cuerpo)}
        ${footer()}
      </div>
    `,
  });
}

// notificación al cliente cuando se reactiva una cotización
export async function enviarCorreoReactivacion(correoDestino, nombreEmpresa, nuevaFechaLimite) {
  await transporter.sendMail({
    from: `"CleanPro" <${EMAIL_USER}>`,
    to: correoDestino,
    subject: "Actualización sobre tu solicitud de cotización",
    html: `
      <div style="${baseStyle}">
        ${header("#534AB7", "Retomamos tu solicitud")}
        ${bloque(`
          <p style="font-size: 15px; color: #0f172a; font-weight: 600; margin: 0 0 8px;">Hola, ${nombreEmpresa}</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 16px;">
            Te pedimos sinceras disculpas por la demora en nuestra respuesta. Hemos tenido un alto volumen de solicitudes, pero <strong>hemos retomado tu caso con prioridad máxima.</strong>
          </p>
          ${infoBox([
            ["Nuevo plazo de respuesta", "Antes de 24 horas hábiles"],
            ["Te notificaremos antes del", formatearFechaLimite(nuevaFechaLimite)],
          ])}
          <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 16px 0 0;">
            Agradecemos enormemente tu paciencia. Nos pondremos en contacto contigo muy pronto.
          </p>
        `)}
        ${footer()}
      </div>
    `,
  });
}

// notificación al admin cuando una solicitud vence
export async function enviarCorreoVencimientoAdmin(correoAdmin, cotizacion) {
  await transporter.sendMail({
    from: `"CleanPro" <${EMAIL_USER}>`,
    to: correoAdmin,
    subject: `⚠️ Solicitud vencida — ${cotizacion.cliente?.nombreEmpresa || "Cliente"}`,
    html: `
      <div style="${baseStyle}">
        ${header("#b45309", "Solicitud sin respuesta")}
        ${bloque(`
          <p style="font-size: 15px; color: #0f172a; font-weight: 600; margin: 0 0 8px;">
            Una solicitud venció sin ser resuelta
          </p>
          <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 16px;">
            El plazo de respuesta expiró y el estado fue marcado automáticamente como <strong>Vencida</strong>.
          </p>
          ${infoBox([
            ["Cliente",        cotizacion.cliente?.nombreEmpresa || "—"],
            ["Instalación",    cotizacion.instalacion?.nombre    || "—"],
            ["Plan",           cotizacion.plan?.tipo             || "—"],
            ["Venció el",      formatearFechaLimite(cotizacion.fechaLimite)],
          ])}
          ${destacado("#b45309", "Ingresa al panel de administración para gestionar esta solicitud.")}
        `)}
        ${footer()}
      </div>
    `,
  });
}