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
      precision: 15,
      scale: 2,
      nullable: true,
    },
    montoServicio: {
      name: "monto_servicio",
      type: "decimal",
      precision: 15,
      scale: 2,
      nullable: true,
    },
    jornadaHoras: {
      name: "jornada_horas",
      type: "int",
      nullable: true,
    },
    descripcionServicio: {
      name: "descripcion_servicio",
      type: "text",
      nullable: true,
    },
    condicionPago: {
      name: "condicion_pago",
      type: "varchar",
      length: 255,
      nullable: true,
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
    causalTermino: {
      name: "causal_termino",
      type: "varchar",
      length: 255,
      nullable: true,
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
      nullable: true,
    },
    cliente: {
      type: "many-to-one",
      target: "Cliente",
      inverseSide: "contratos",
      onDelete: "CASCADE",
      joinColumn: {
        name: "id_cliente",
        referencedColumnName: "idCliente",
      },
      nullable: true,
    },
    asistencias: {
      type: "one-to-many",
      target: "Asistencia",
      inverseSide: "contrato",
    },
    contratoInstalaciones: {
      type: "one-to-many",
      target: "ContratoInstalacion",
      inverseSide: "contrato",
    },
  },
});
