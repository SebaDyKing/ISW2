"use strict";
import { EntitySchema } from "typeorm";

export const DocumentoEmpleado = new EntitySchema({
  name: "DocumentoEmpleado",
  tableName: "documento_empleado",
  columns: {
    idDocumento: {
      name: "id_documento",
      type: "int",
      primary: true,
      generated: "increment",
    },
    tipo: {
      type: "varchar",
      length: 100,
    },
    nombreArchivo: {
      name: "nombre_archivo",
      type: "varchar",
      length: 255,
    },
    rutaArchivo: {
      name: "ruta_archivo",
      type: "varchar",
      length: 500,
    },
    fechaCreacion: {
      name: "fecha_creacion",
      type: "timestamp",
      createDate: true,
    },
  },
  relations: {
    empleado: {
      target: "Empleado",
      type: "many-to-one",
      joinColumn: {
        name: "id_empleado",
        referencedColumnName: "idEmpleado",
      },
      onDelete: "CASCADE",
    },
  },
});
