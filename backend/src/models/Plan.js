"use strict";
import { EntitySchema } from "typeorm";

export const Plan = new EntitySchema({
  name: "Plan",
  tableName: "plan",

  columns: {
    idPlan: {
      name: "id_plan",
      type: "int",
      primary: true,
      generated: "increment",
    },
    tipo: {
      type: "varchar",
      length: 50,
    },
    cantidadEmpleados: {
      name: "cantidad_empleados",
      type: "int",
    },
    cantidadProductos: {
      name: "cantidad_productos",
      type: "int",
    },
    precio: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
  },

  relations: {
    clientesPlan: {
      type: "one-to-many",
      target: "ClientePlan",
      inverseSide: "plan",
    },
  },
});
