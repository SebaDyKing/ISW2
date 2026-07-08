"use strict";
import { EntitySchema } from "typeorm";

export const Actividad = new EntitySchema({
  name: "Actividad",
  tableName: "actividad",

  columns: {
    idActividad: {
      name: "id_actividad",
      type: "int",
      primary: true,
      generated: "increment",
    },
    tipo: {
      type: "varchar",
      length: 100,
    },
    descripcion: {
      type: "text",
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
  },
});
