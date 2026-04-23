"use strict";
import { EntitySchema } from "typeorm";

export const SupervisorInstalacion = new EntitySchema({
  name: "SupervisorInstalacion",
  tableName: "supervisor_instalacion",

  columns: {
    idSupervisorInstalacion: {
      name: "id_supervisor_instalacion",
      type: "int",
      primary: true,
      generated: "increment",
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
  },

  relations: {
    supervisor: {
      type: "many-to-one",
      target: "Supervisor",
      inverseSide: "instalaciones",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_supervisor",
        referencedColumnName: "idSupervisor",
      },
    },
    instalacion: {
      type: "many-to-one",
      target: "Instalacion",
      inverseSide: "supervisores",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_instalacion",
        referencedColumnName: "idInstalacion",
      },
    },
  },
});
