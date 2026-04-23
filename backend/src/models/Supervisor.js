"use strict";
import { EntitySchema } from "typeorm";

export const Supervisor = new EntitySchema({
  name: "Supervisor",
  tableName: "supervisor",

  columns: {
    idSupervisor: {
      name: "id_supervisor",
      type: "int",
      primary: true,
      generated: "increment",
    },
    rut: {
      type: "varchar",
      length: 20,
      unique: true,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
  },

  relations: {
    usuario: {
      type: "one-to-one",
      target: "Usuario",
      inverseSide: "supervisor",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_usuario",
        referencedColumnName: "idUsuario",
      },
    },
    instalaciones: {
      type: "one-to-many",
      target: "SupervisorInstalacion",
      inverseSide: "supervisor",
    },
    licenciasAprobadas: {
      type: "one-to-many",
      target: "LicenciaMedica",
      inverseSide: "supervisor",
    },
  },
});
