import { EntitySchema } from "typeorm";

export const SolicitudCotizacion = new EntitySchema({
  name: "SolicitudCotizacion",
  tableName: "solicitud_cotizacion",
  
  columns: {
    id_solicitud: {
      primary: true,
      type: "int",
      generated: true // autoincremental
    },
    nombre_empresa: {
      type: "varchar",
      length: 100,
      nullable: false // No puede ser nulo
    },
    telefono: {
      type: "varchar",
      length: 20,
      nullable: false
    },
    correo: {
      type: "varchar",
      length: 100,
      nullable: false
    },
    comentarios: {
      type: "text",
      nullable: true // Es opcional
    },
    id_plan: {
      type: "int",
      nullable: false // llave foránea que conecta con la tabla Plan
    },
    fecha_creacion: {
      type: "timestamp",
      createDate: true // Fecha automaticamente asignada al crear el registro
    }
  }
});