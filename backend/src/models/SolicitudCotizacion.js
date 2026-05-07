import Joi from "joi";
import { EntitySchema, JoinColumn } from "typeorm";

export const SolicitudCotizacion = new EntitySchema({
  name: "SolicitudCotizacion",
  tableName: "solicitud_cotizacion",
  
  columns: {
    idSolicitud: {
      primary: true,
      type: "int",
      generated: true // autoincremental
    },
    estado: {
      type: "varchar",
      length: 20,
      default: "Pendiente"
    },
    comentarios: {
      type: "text",
      nullable: true // Es opcional
    },
    fechaCreacion: {
      type: "timestamp",
      createDate: true // Fecha automaticamente asignada al crear el registro
    }
  },
  relations: {
    cliente: {
      type: "many-to-one",
      target: "Cliente",
      inverseSide: "cotizaciones",
      onDelete: "CASCADE", // Si el cliente se borra, se borran sus cotizaciones
      joinColumn: {
        name: "id_Cliente",
        referencedColumnName: "idCliente"
      }
    },
    plan: {
      type: "many-to-one",
      target: "Plan",
      joinColumn: {
        name: "idPlan",
        referencedColumnName: "idPlan"
      }
    },
    instalacion: {
      type: "many-to-one",
      target: "Instalacion",
      joinColumn: {
        name: "id_Instalacion",
        referencedColumnName: "idInstalacion"
      }
    }
  }
}
);