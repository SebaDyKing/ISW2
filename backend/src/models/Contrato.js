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
    nacionalidad: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    estadoCivil: {
      name: "estado_civil",
      type: "varchar",
      length: 50,
      nullable: true,
    },
    fechaNacimiento: {
      name: "fecha_nacimiento",
      type: "date",
      nullable: true,
    },
    domicilio: {
      type: "varchar",
      length: 255,
      nullable: true,
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
    asistencias: {
      type: "one-to-many",
      target: "Asistencia",
      inverseSide: "contrato",
    },
    instalacion: {
      type: "many-to-one",
      target: "Instalacion",
      nullable: true,
      joinColumn: {
        name: "id_instalacion",
        referencedColumnName: "idInstalacion",
      },
    },
  },
});
