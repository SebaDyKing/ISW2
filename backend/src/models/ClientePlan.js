"use strict";
import { EntitySchema } from "typeorm";

export const ClientePlan = new EntitySchema({
  name: "ClientePlan",
  tableName: "cliente_plan",

  columns: {
    idClientePlan: {
      name: "id_cliente_plan",
      type: "int",
      primary: true,
      generated: "increment",
    },
    fechaInicio: {
      name: "fecha_inicio",
      type: "date",
    },
    fechaFin: {
      name: "fecha_fin",
      type: "date",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 20,
    },
    precioAcordado: {
      name: "precio_acordado",
      type: "decimal",
      precision: 10,
      scale: 2,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
  },

  relations: {
    cliente: {
      type: "many-to-one",
      target: "Cliente",
      inverseSide: "clientesPlan",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_cliente",
        referencedColumnName: "idCliente",
      },
    },
    plan: {
      type: "many-to-one",
      target: "Plan",
      inverseSide: "clientesPlan",
      joinColumn: {
        name: "id_plan",
        referencedColumnName: "idPlan",
      },
    },
  },
});
