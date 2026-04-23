"use strict";
import { EntitySchema } from "typeorm";

export const ReporteCliente = new EntitySchema({
  name: "ReporteCliente",
  tableName: "reporte_cliente",

  columns: {
    idReporte: {
      name: "id_reporte",
      type: "int",
      primary: true,
      generated: "increment",
    },
    tipo: {
      type: "varchar",
      length: 50,
    },
    descripcion: {
      type: "text",
    },
    fecha: {
      type: "date",
    },
    estado: {
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
    cliente: {
      type: "many-to-one",
      target: "Cliente",
      inverseSide: "reportes",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_cliente",
        referencedColumnName: "idCliente",
      },
    },
    empleado: {
      type: "many-to-one",
      target: "Empleado",
      inverseSide: "reportes",
      nullable: true,
      joinColumn: {
        name: "id_empleado",
        referencedColumnName: "idEmpleado",
      },
    },
    hojaVida: {
      type: "one-to-one",
      target: "HojaVida",
      inverseSide: "reporte",
    },
  },
});
