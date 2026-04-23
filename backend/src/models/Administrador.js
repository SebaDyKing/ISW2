"use strict";
import { EntitySchema } from "typeorm";

export const Administrador = new EntitySchema({
  name: "Administrador",
  tableName: "administrador",

  columns: {
    idAdmin: {
      name: "id_admin",
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
    usuario: {
      type: "one-to-one",
      target: "Usuario",
      inverseSide: "administrador",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_usuario",
        referencedColumnName: "idUsuario",
      },
    },
    hojaVidas: {
      type: "one-to-many",
      target: "HojaVida",
      inverseSide: "administrador",
    },
  },
});
