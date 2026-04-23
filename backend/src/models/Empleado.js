"use strict";
import { EntitySchema } from "typeorm";

export const Empleado = new EntitySchema({
  name: "Empleado",
  tableName: "empleado",

  columns: {
    idEmpleado: {
      name: "id_empleado",
      type: "int",
      primary: true,
      generated: "increment",
    },
    rut: {
      type: "varchar",
      length: 20,
      unique: true,
    },
    fechaNacimiento: {
      name: "fecha_nacimiento",
      type: "date",
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
      inverseSide: "empleado",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_usuario",
        referencedColumnName: "idUsuario",
      },
    },
    contratos: {
      type: "one-to-many",
      target: "Contrato",
      inverseSide: "empleado",
    },
    licencias: {
      type: "one-to-many",
      target: "LicenciaMedica",
      inverseSide: "empleado",
    },
    hojaVida: {
      type: "one-to-many",
      target: "HojaVida",
      inverseSide: "empleado",
    },
    reportes: {
      type: "one-to-many",
      target: "ReporteCliente",
      inverseSide: "empleado",
    },
  },
});
