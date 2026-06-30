"use strict";
import { EntitySchema } from "typeorm";

export const Usuario = new EntitySchema({
  name: "Usuario",
  tableName: "usuario",

  columns: {
    idUsuario: {
      name: "id_usuario",
      type: "int",
      primary: true,
      generated: "increment",
    },
    nombre: {
      type: "varchar",
      length: 100,
    },
    apellido: {
      type: "varchar",
      length: 100,
    },
    rut: {
      type: "varchar",
      length: 12,
      unique: true,
      nullable: false,
    },
    correo: {
      type: "varchar",
      length: 150,
      unique: true,
    },
    passwordHash: {
      name: "password_hash",
      type: "varchar",
      length: 255,
      select: false,
    },
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      name: "updated_at",
      type: "timestamp",
      updateDate: true,
    },
    rol: {
      name: "rol",
      type: "varchar",
      length: 50,
      nullable: false
    },
  },

  relations: {
    cliente: {
      type: "one-to-one",
      target: "Cliente",
      inverseSide: "usuario",
    },
    empleado: {
      type: "one-to-one",
      target: "Empleado",
      inverseSide: "usuario",
    },
    supervisor: {
      type: "one-to-one",
      target: "Supervisor",
      inverseSide: "usuario",
    },
    administrador: {
      type: "one-to-one",
      target: "Administrador",
      inverseSide: "usuario",
    },
  },
});
