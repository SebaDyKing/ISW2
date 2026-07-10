"use strict";
import { EntitySchema } from "typeorm";

export const ContratoInstalacion = new EntitySchema({
  name: "ContratoInstalacion",
  tableName: "contrato_instalacion",
  columns: {
    idContratoInstalacion: {
      name: "id_contrato_instalacion",
      type: "int",
      primary: true,
      generated: "increment",
    },
    horasSemanales: {
      name: "horas_semanales",
      type: "int",
    },
    pagoAdicional: {
      name: "pago_adicional",
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: true,
      default: 0
    },
    estadoFirma: {
      name: "estado_firma",
      type: "varchar",
      length: 20,
      default: "FIRMADO"
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    contrato: {
      type: "many-to-one",
      target: "Contrato",
      inverseSide: "contratoInstalaciones",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_contrato",
        referencedColumnName: "idContrato",
      },
    },
    instalacion: {
      type: "many-to-one",
      target: "Instalacion",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_instalacion",
        referencedColumnName: "idInstalacion",
      },
    },
  },
});
