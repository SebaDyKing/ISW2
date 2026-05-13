"use strict";
import { EntitySchema } from "typeorm";
import { Empleado } from "./Empleado.js";

export const Alertas = new EntitySchema({
    name: "Alertas",
    tableName: "alertas",


    columns:{
        idAlerta: {
            name: "id_alerta",
            type: "int",
            primary: true,
            generated: "increment",
        },
        tipo: {
            type: "varchar",
            length: 50,
            //mensaje: " ",
        },
        mensaje: {
            type: "varchar",
            length: 255,
        },
        Estado: {
            type: "varchar",
            length: 20,
            default: "PENDIENTE",
        },
        Agrupacion: {
            name: "agrupacion",
            type: "varchar",
            length: 50,
        },
        FechaCreacion: {
            name: "fecha_creacion",
            type: "timestamp", 
            default: () => "CURRENT_TIMESTAMP",
            createDate: true,
        },
        FechaResolucion: {
            name: "fecha_resolucion",
            type: "timestamp",
            nullable: true,
        },
    },
    relations: {
        contrato: {
            type: "many-to-one",
            target: "Contrato",
            joinColumn: {
                name: "id_contrato",
                referencedColumnName: "idContrato", 
            },
            nullable: true,
            onDelete: "SET NULL", // Si el contrato se elimina, la alerta no se elimina pero se desvincula
        },
        Empleado: {
            type: "many-to-one",
            target: "Empleado",
            joinColumn: {
                name: "id_empleado",
                referencedColumnName: "idEmpleado",
            },
            nullable: true,
            onDelete: "CASCADE", // Si el empleado se elimina, se eliminan sus alertas
        }
    }
});