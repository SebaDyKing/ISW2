"use strict";
import { EntitySchema } from "typeorm";

export const HojaVida = new EntitySchema({
  name: "HojaVida",
  tableName: "hoja_vida",

  columns: {
    idRegistro: {
      name: "id_registro",
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
    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
  },

  relations: {
    empleado: {
      type: "many-to-one",
      target: "Empleado",
      inverseSide: "hojaVida",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_empleado",
        referencedColumnName: "idEmpleado",
      },
    },
    administrador: {
      type: "many-to-one",
      target: "Administrador",
      inverseSide: "hojaVidas",
      joinColumn: {
        name: "id_admin",
        referencedColumnName: "idAdmin",
      },
    },
    reporte: {
      type: "many-to-one",
      target: "ReporteCliente",
      inverseSide: "hojaVida",
      nullable: true,
      joinColumn: {
        name: "id_reporte",
        referencedColumnName: "idReporte",
      },
    },
  },
});
