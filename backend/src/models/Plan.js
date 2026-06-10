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
    descripcion: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    frecuencia: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    idealPara: {
      name: "ideal_para",
      type: "varchar",
      length: 150,
      nullable: true,
    },
    esPersonalizado: {
      name: "es_personalizado",
      type: "boolean",
      default: false,
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