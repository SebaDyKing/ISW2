"use strict";
import { EntitySchema } from "typeorm";

export const LicenciaMedica = new EntitySchema({
  name: "LicenciaMedica",
  tableName: "licencia_medica",

  columns: {
    idLicencia: {
      name: "id_licencia",
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
    },
    diagnostico: {
      type: "varchar",
      length: 255,
    },
    estado: {
      type: "varchar",
      length: 20,
    },
    archivoPdf: {
      name: "archivo_pdf",
      type: "varchar",
      length: 255,
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
      inverseSide: "licencias",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_empleado",
        referencedColumnName: "idEmpleado",
      },
    },
    supervisor: {
      type: "many-to-one",
      target: "Supervisor",
      inverseSide: "licenciasAprobadas",
      joinColumn: {
        name: "id_supervisor",
        referencedColumnName: "idSupervisor",
      },
    },
  },
});
