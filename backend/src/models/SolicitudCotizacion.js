import { EntitySchema } from "typeorm";

export const SolicitudCotizacion = new EntitySchema({
  name: "SolicitudCotizacion",
  tableName: "solicitud_cotizacion",
  columns: {
    idSolicitud: { primary: true, type: "int", generated: true },
    estado:      { type: "varchar", length: 20, default: "Pendiente" },
    comentarios: { type: "text", nullable: true },
    motivo:      { type: "text", nullable: true },
    medioContacto:   { type: "varchar", length: 50,  nullable: true },
    horarioContacto: { type: "varchar", length: 50,  nullable: true },
    fechaCreacion:   { type: "timestamp", createDate: true },
  },
  relations: {
    cliente: {
      type: "many-to-one", target: "Cliente", inverseSide: "cotizaciones",
      onDelete: "CASCADE", joinColumn: { name: "id_Cliente", referencedColumnName: "idCliente" }
    },
    plan: {
      type: "many-to-one", target: "Plan",
      joinColumn: { name: "idPlan", referencedColumnName: "idPlan" }
    },
    instalacion: {
      type: "many-to-one", target: "Instalacion",
      joinColumn: { name: "id_Instalacion", referencedColumnName: "idInstalacion" }
    }
  }
});