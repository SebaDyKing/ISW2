"use strict";
import { EntitySchema } from "typeorm";

export const Asistencia = new EntitySchema({
  name: "Asistencia",
  tableName: "asistencia",

  columns: {
    idAsistencia: {
      name: "id_asistencia",
      type: "int",
      primary: true,
      generated: "increment",
    },
    fecha: {
      type: "date",
    },
    entrada: {
      type: "time",
    },
    salida: {
      type: "time",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 20,
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
      inverseSide: "asistencias",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_contrato",
        referencedColumnName: "idContrato",
      },
    },
  },
});
