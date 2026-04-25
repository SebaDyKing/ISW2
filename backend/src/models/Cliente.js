"use strict";
import { EntitySchema } from "typeorm";

export const Cliente = new EntitySchema({
  name: "Cliente",
  tableName: "cliente",

  columns: {
    idCliente: {
      name: "id_cliente",
      type: "int",
      primary: true,
      generated: "increment",
    },
    nombreEmpresa: {
      name: "nombre_empresa",
      type: "varchar",
      length: 150,
    },
    telefono: {
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
    usuario: {
      type: "one-to-one",
      target: "Usuario",
      inverseSide: "cliente",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_usuario",
        referencedColumnName: "idUsuario",
      },
    },
    instalaciones: {
      type: "one-to-many",
      target: "Instalacion",
      inverseSide: "cliente",
    },
    clientesPlan: {
      type: "one-to-many",
      target: "ClientePlan",
      inverseSide: "cliente",
    },
    reportes: {
      type: "one-to-many",
      target: "ReporteCliente",
      inverseSide: "cliente",
    },
  },
});
