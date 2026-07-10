"use strict";
import { EntitySchema } from "typeorm";

export const Documento = new EntitySchema({
  name: "Documento",
  tableName: "documento",
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
    estadoFirma: {
      name: "estado_firma",
      type: "varchar",
      length: 20,
      default: "PENDIENTE",
    },
    fechaFirma: {
      name: "fecha_firma",
      type: "timestamp",
      nullable: true,
    },
    firmaBase64: {
      name: "firma_base64",
      type: "text",
      nullable: true,
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
      nullable: true,
    },
    cliente: {
      target: "Cliente",
      type: "many-to-one",
      joinColumn: {
        name: "id_cliente",
        referencedColumnName: "idCliente",
      },
      onDelete: "CASCADE",
      nullable: true,
    },
  },
});
