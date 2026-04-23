"use strict";
import { EntitySchema } from "typeorm";

export const Instalacion = new EntitySchema({
  name: "Instalacion",
  tableName: "instalacion",

  columns: {
    idInstalacion: {
      name: "id_instalacion",
      type: "int",
      primary: true,
      generated: "increment",
    },
    nombre: {
      type: "varchar",
      length: 150,
    },
    direccion: {
      type: "varchar",
      length: 255,
    },
    latitud: {
      type: "decimal",
      precision: 10,
      scale: 7,
    },
    longitud: {
      type: "decimal",
      precision: 10,
      scale: 7,
    },
    telefono: {
      type: "varchar",
      length: 20,
    },
    activa: {
      type: "boolean",
      default: true,
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
      inverseSide: "instalaciones",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_cliente",
        referencedColumnName: "idCliente",
      },
    },
    supervisores: {
      type: "one-to-many",
      target: "SupervisorInstalacion",
      inverseSide: "instalacion",
    },
    contratos: {
      type: "one-to-many",
      target: "Contrato",
      inverseSide: "instalacion",
    },
  },
});
