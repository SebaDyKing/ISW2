"use strict";
import { EntitySchema } from "typeorm";

export const Contrato = new EntitySchema({
  name: "Contrato",
  tableName: "contrato",

  columns: {
    idContrato: {
      name: "id_contrato",
      type: "int",
      primary: true,
      generated: "increment",
    },
    tipo: {
      type: "varchar",
      length: 50,
    },
    cargo: {
      type: "varchar",
      length: 100,
    },
    sueldo: {
      type: "decimal",
      precision: 10,
      scale: 2,
    },
    jornadaHoras: {
      name: "jornada_horas",
      type: "int",
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
      inverseSide: "contratos",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_empleado",
        referencedColumnName: "idEmpleado",
      },
    },
    instalacion: {
      type: "many-to-one",
      target: "Instalacion",
      inverseSide: "contratos",
      joinColumn: {
        name: "id_instalacion",
        referencedColumnName: "idInstalacion",
      },
    },
    asistencias: {
      type: "one-to-many",
      target: "Asistencia",
      inverseSide: "contrato",
    },
  },
});
