"use strict";
import mailer from "../config/mailer.js";
const transporter = mailer.transporter;

export async function enviarCorreoSolicitudRecibida(correoDestino, nombreEmpresa) {
  await transporter.sendMail({
    from: `"CleanPro Sistema" <${process.env.EMAIL_USER}>`,
    to: correoDestino,
    subject: "Solicitud de cotización recibida",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Solicitud de cotización recibida</h2>
        <p>Estimado/a <strong>${nombreEmpresa}</strong>,</p>
        <p>Le informamos que hemos recibido correctamente su solicitud de cotización.</p>
        <p>Su solicitud se encuentra actualmente en estado <strong>Pendiente</strong> y será revisada por nuestro equipo a la brevedad.</p>
        <p>Le notificaremos por este medio una vez que su solicitud haya sido procesada.</p>
        <br/>
        <p>Atentamente,</p>
        <p><strong>Equipo CleanPro</strong></p>
      </div>
    `,
  });
}

export async function enviarCorreoEstadoCotizacion(correoDestino, nombreEmpresa, estado) {
  const esAprobada = estado === "Aprobada";

  await transporter.sendMail({
    from: `"CleanPro Sistema" <${process.env.EMAIL_USER}>`,
    to: correoDestino,
    subject: `Cotización ${esAprobada ? "aprobada" : "rechazada"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${esAprobada ? "#27ae60" : "#e74c3c"};">
          Cotización ${esAprobada ? "aprobada" : "rechazada"}
        </h2>
        <p>Estimado/a <strong>${nombreEmpresa}</strong>,</p>
        <p>Le informamos que su solicitud de cotización ha sido 
          <strong>${esAprobada ? "aprobada" : "rechazada"}</strong>.
        </p>
        ${esAprobada
          ? `<p>Nos pondremos en contacto con usted a la brevedad para coordinar los próximos pasos.</p>`
          : `<p>Lamentamos informarle que su solicitud no pudo ser aprobada en esta oportunidad. 
               Puede enviar una nueva solicitud cuando lo estime conveniente.</p>`
        }
        <br/>
        <p>Atentamente,</p>
        <p><strong>Equipo CleanPro</strong></p>
      </div>
    `,
  });
}