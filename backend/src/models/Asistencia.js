"use strict";
import { EntitySchema } from "typeorm";

export const Asistencia = new EntitySchema({
  name: "Asistencia",
  tableName: "asistencia",

  columns: {
    idAsistencia: {
      name: "id_asistencia",
      type: "int",
      primary: true,
      generated: "increment",
    },
    fecha: {
      type: "date",
    },
    entrada: {
      type: "time",
    },
    salida: {
      type: "time",
      nullable: true,
    },
    inicioColacion: {
      name: "inicio_colacion",
      type: "time",
      nullable: true,
    },
    finColacion: {
      name: "fin_colacion",
      type: "time",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 20,
    },

    // --- COLUMNAS DE GEOLOCALIZACIÓN ---
    latitudEntrada: {
      name: "latitud_entrada",
      type: "float",
      nullable: true,
    },
    longitudEntrada: {
      name: "longitud_entrada",
      type: "float",
      nullable: true,
    },
    latitudSalida: {
      name: "latitud_salida",
      type: "float",
      nullable: true,
    },
    longitudSalida: {
      name: "longitud_salida",
      type: "float",
      nullable: true,
    },
    // ------------------------------------------

    createdAt: {
      name: "created_at",
      type: "timestamp",
      createDate: true,
    },
  },

  relations: {
    contrato: {
      type: "many-to-one",
      target: "Contrato",
      inverseSide: "asistencias",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_contrato",
        referencedColumnName: "idContrato",
      },
    },
  },
});