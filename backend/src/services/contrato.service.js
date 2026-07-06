"use strict";
import { AppDataSource } from "../config/configDb.js";
import { crearAlerta, resolverAlertasEmpleado } from "./crearAlerta.service.js";
import { registrarActividad } from "./actividad.service.js";
import { In } from "typeorm";

const getRepo = () => AppDataSource.getRepository("Contrato");

const TIPOS_VALIDOS = ["Plazo Fijo", "Indefinido"];
const ESTADOS_VALIDOS = ["ACTIVO", "POR VENCER", "FINALIZADO"];

export async function getAllContratos(user = null) {
    let whereClause = {};
    
    if (user && user.rol === "supervisor") {
        const supervisor = await AppDataSource.getRepository("Supervisor").findOne({
            where: { usuario: { idUsuario: user.idUsuario } },
            relations: ["instalaciones", "instalaciones.instalacion"]
        });
        
        if (supervisor && supervisor.instalaciones && supervisor.instalaciones.length > 0) {
            const instalacionIds = supervisor.instalaciones.map(si => si.instalacion.idInstalacion);
            whereClause = {
                contratoInstalaciones: {
                    instalacion: {
                        idInstalacion: In(instalacionIds)
                    }
                }
            };
        } else {
            return []; // Supervisor sin instalaciones
        }
    }

    return await getRepo().find({
        where: whereClause,
        relations: ["empleado", "empleado.usuario", "contratoInstalaciones", "contratoInstalaciones.instalacion"],
    });
}

export async function getContratoById(id) {
    const contrato = await getRepo().findOne({
        where: { idContrato: id },
        relations: ["empleado", "empleado.usuario", "contratoInstalaciones", "contratoInstalaciones.instalacion"],
    });
    if (!contrato) throw { status: 404, message: "Contrato no encontrado" };
    return contrato;
}

export async function getContratosByEmpleado(idEmpleado) {
    const empleado = await AppDataSource.getRepository("Empleado")
        .findOne({ where: { idEmpleado } });
    if (!empleado) throw { status: 404, message: "Empleado no encontrado" };

    return await getRepo().find({
        where: { empleado: { idEmpleado } },
        relations: ["empleado", "contratoInstalaciones", "contratoInstalaciones.instalacion"],
    });
}

export async function getMisAsignacionesService(idUsuario) {
    const empleado = await AppDataSource.getRepository("Empleado")
        .findOne({ where: { usuario: { idUsuario } } });
    if (!empleado) throw { status: 404, message: "Perfil de empleado no encontrado" };

    return await getRepo().find({
        where: { empleado: { idEmpleado: empleado.idEmpleado } },
        relations: ["contratoInstalaciones", "contratoInstalaciones.instalacion", "contratoInstalaciones.instalacion.cliente"],
        order: { fechaInicio: "DESC" }
    });
}

export async function createContrato(body) {
    const {
        idEmpleado, tipo, cargo,
        sueldo, jornadaHoras, fechaInicio, fechaFin,
        nacionalidad, estadoCivil, fechaNacimiento, domicilio,
        idInstalacion
    } = body;

    // Validaciones de campos obligatorios
    if (!idEmpleado || !tipo || !cargo ||
        !sueldo || !jornadaHoras || !fechaInicio) {
        throw { status: 400, message: "Todos los campos son obligatorios" };
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
        throw { status: 400, message: `Tipo inválido. Permitidos: ${TIPOS_VALIDOS.join(", ")}` };
    }
    if (fechaFin && new Date(fechaFin) <= new Date(fechaInicio)) {
        throw { status: 400, message: "La fecha fin debe ser posterior a la de inicio" };
    }

    // Verifica que existan las entidades relacionadas
    const empleado = await AppDataSource.getRepository("Empleado")
        .findOne({ 
            where: { idEmpleado },
            relations: ["usuario"]
        });
    if (!empleado) throw { status: 404, message: "Empleado no encontrado" };

    const existeContratoActivo = await AppDataSource.getRepository("Contrato")
        .findOne({
            where: {
                empleado: { idEmpleado },
                estado: In(["ACTIVO", "activo"]),
            },
        });
    if (existeContratoActivo) {
        throw { status: 400, message: "El empleado ya tiene un contrato activo en el sistema. Debe finalizarlo o realizar un traslado." };
    }

    if (tipo === "Plazo Fijo") {
        // 1. Obtener los últimos 2 contratos finalizados del empleado
        const ultimosContratos = await AppDataSource.getRepository("Contrato").find({
            where: {
                empleado: { idEmpleado },
                estado: "FINALIZADO",
            },
            order: { fechaFin: "DESC" }, // Ordenamos por fecha de término descendente (los más recientes primero)
            take: 2,
        });

        // 2. Verificar que existan 2 contratos anteriores y que AMBOS sean "Plazo Fijo"
        let sonConsecutivos =
            ultimosContratos.length === 2 &&
            ultimosContratos[0].tipo === "Plazo Fijo" &&
            ultimosContratos[1].tipo === "Plazo Fijo";

        // 3. Validación de fechas: Asegurar que no hubo una pausa larga entre ellos
        if (sonConsecutivos) {
            // Máximo de días de separación (ej. pausas cortas) para seguir considerándolos "consecutivos"
            const MAX_DIAS_SEPARACION = 15;

            // Brecha entre el NUEVO contrato y el último finalizado
            const difDiasNuevo = Math.abs(new Date(fechaInicio) - new Date(ultimosContratos[0].fechaFin)) / (1000 * 60 * 60 * 24);
            // Brecha entre el último finalizado y el penúltimo
            const difDiasAnteriores = Math.abs(new Date(ultimosContratos[0].fechaInicio) - new Date(ultimosContratos[1].fechaFin)) / (1000 * 60 * 60 * 24);

            // Si cualquiera de las brechas supera el máximo permitido, se rompe la continuidad
            if (difDiasNuevo > MAX_DIAS_SEPARACION || difDiasAnteriores > MAX_DIAS_SEPARACION) {
                sonConsecutivos = false;
            }
        }

        if (sonConsecutivos) {
            await crearAlerta(
                idEmpleado,
                "Alerta de Riesgo Legal (Plazo Fijo)",
                `El empleado ${empleado.usuario?.nombre || 'Desconocido'} ${empleado.usuario?.apellido || ''} registrará su tercer contrato a Plazo Fijo de forma consecutiva.`,
                "LIMITE_PLAZO_FIJO"
            );
        }

        // [NUEVA REGLA] Regla de los 15 meses: Si ha trabajado 12 meses (365 días) en un periodo de 15 meses.
        const fechaInicioVentana = new Date(fechaInicio);
        fechaInicioVentana.setMonth(fechaInicioVentana.getMonth() - 15);

        const contratosTodos = await AppDataSource.getRepository("Contrato").find({
            where: {
                empleado: { idEmpleado },
                tipo: "Plazo Fijo",
            }
        });

        let diasTrabajados = 0;
        for (const c of contratosTodos) {
            if (!c.fechaFin) continue; // solo contamos periodos cerrados para esta regla
            const dInicio = new Date(c.fechaInicio) < fechaInicioVentana ? fechaInicioVentana : new Date(c.fechaInicio);
            const dFin = new Date(c.fechaFin);
            
            if (dFin > dInicio) {
                diasTrabajados += Math.ceil((dFin - dInicio) / (1000 * 60 * 60 * 24));
            }
        }

        // Sumamos los días del nuevo contrato que se está creando
        if (fechaFin) {
            const diasNuevo = Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24));
            diasTrabajados += diasNuevo;
        }

        if (diasTrabajados >= 365) {
             await crearAlerta(
                idEmpleado,
                "Alerta Regla 15 Meses (Plazo Fijo)",
                `El empleado ${empleado.usuario?.nombre || 'Desconocido'} superará los 12 meses de servicio discontinuo en un periodo de 15 meses con este contrato, debiendo pasar a Indefinido.`,
                "LIMITE_PLAZO_FIJO"
            );
        }
    }

    let estadoInicial = "ACTIVO";
    if (fechaFin) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Ignorar la hora para comparar solo días
        // Ajustar la fecha fin para comparar correctamente (generalmente viene en YYYY-MM-DD)
        const dFin = new Date(fechaFin + "T00:00:00"); 
        if (dFin < hoy) {
            estadoInicial = "FINALIZADO";
        }
    }

    const nuevo = getRepo().create({
        tipo,
        cargo,
        sueldo,
        jornadaHoras,
        fechaInicio,
        fechaFin,
        estado: estadoInicial,
        nacionalidad,
        estadoCivil,
        fechaNacimiento,
        domicilio,
        empleado: { idEmpleado }
    });

    const contratoGuardado = await getRepo().save(nuevo);

    // Guardar la instalacion inicial si se provee
    if (idInstalacion) {
        const ciRepo = AppDataSource.getRepository("ContratoInstalacion");
        const ci = ciRepo.create({
            contrato: { idContrato: contratoGuardado.idContrato },
            instalacion: { idInstalacion: idInstalacion },
            horasSemanales: jornadaHoras,
            pagoAdicional: 0
        });
        await ciRepo.save(ci);
    }

    // Registrar actividad
    const nombreEmpleado = empleado?.usuario ? `${empleado.usuario.nombre} ${empleado.usuario.apellido}` : `ID ${idEmpleado}`;

    // [NUEVO] Verificación instantánea de vencimiento para nuevos contratos
    if (tipo === 'Plazo Fijo' && fechaFin && estadoInicial !== 'FINALIZADO') {
        const diffTime = new Date(fechaFin) - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 15) {
            contratoGuardado.estado = 'POR VENCER';
            await getRepo().save(contratoGuardado);
            
            const mensaje = `El contrato a plazo fijo de ${nombreEmpleado} finaliza el ${fechaFin} (en ${diffDays} días).`;
            await crearAlerta(
                idEmpleado,
                "ALERTA VENCIMIENTO",
                mensaje,
                "POR_VENCER",
                contratoGuardado.idContrato
            );
        }
    }

    await registrarActividad("Contrato creado", `Se creó un contrato a ${tipo} para ${nombreEmpleado}`);
    
    return contratoGuardado;
}

export async function updateContrato(id, body) {
    const contrato = await getContratoById(id);

    const {
        idEmpleado, tipo, cargo,
        sueldo, jornadaHoras, fechaInicio, fechaFin, estado,
        nacionalidad, estadoCivil, fechaNacimiento, domicilio,
        idInstalacion
    } = body;

    // Validaciones solo si vienen los campos
    if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
        throw { status: 400, message: `Tipo inválido. Permitidos: ${TIPOS_VALIDOS.join(", ")}` };
    }
    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
        throw { status: 400, message: `Estado inválido. Permitidos: ${ESTADOS_VALIDOS.join(", ")}` };
    }
    const inicio = fechaInicio || contrato.fechaInicio;
    const fin = fechaFin !== undefined ? fechaFin : contrato.fechaFin;
    if (fin && new Date(fin) <= new Date(inicio)) {
        throw { status: 400, message: "La fecha fin debe ser posterior a la de inicio" };
    }

    // Verifica existencia de relaciones si se quieren cambiar
    if (idEmpleado) {
        const empleado = await AppDataSource.getRepository("Empleado")
            .findOne({ where: { idEmpleado } });
        if (!empleado) throw { status: 404, message: "Empleado no encontrado" };
        contrato.empleado = { idEmpleado };
    }

    // Actualiza solo los campos que llegaron
    if (tipo) contrato.tipo = tipo;
    if (cargo) contrato.cargo = cargo;
    if (sueldo) contrato.sueldo = sueldo;
    if (jornadaHoras) contrato.jornadaHoras = jornadaHoras;
    if (fechaInicio) contrato.fechaInicio = fechaInicio;
    if (fechaFin !== undefined) contrato.fechaFin = fechaFin;
    if (estado) contrato.estado = estado;
    if (nacionalidad !== undefined) contrato.nacionalidad = nacionalidad;
    if (estadoCivil !== undefined) contrato.estadoCivil = estadoCivil;
    if (fechaNacimiento !== undefined) contrato.fechaNacimiento = fechaNacimiento;
    if (domicilio !== undefined) contrato.domicilio = domicilio;
    if (idInstalacion) {
        // En update básico, si mandan idInstalacion se asume que se quiere cambiar la instalación principal
        // Por simplicidad, esto podría eliminarse y forzar el uso de agregarInstalacionContrato
        // No actualizaremos instalaciones desde acá para evitar conflictos con los anexos
    }

    const contratoGuardado = await getRepo().save(contrato);

    // Si el contrato pasa a ser Indefinido, resolvemos las alertas de Plazo Fijo para este empleado
    if (tipo === 'Indefinido' && contratoGuardado.empleado) {
        await resolverAlertasEmpleado(contratoGuardado.empleado.idEmpleado, 'LIMITE_PLAZO_FIJO');
        await resolverAlertasEmpleado(contratoGuardado.empleado.idEmpleado, 'POR_VENCER');
    }

    if (estado === 'FINALIZADO' && contratoGuardado.empleado) {
        await resolverAlertasEmpleado(contratoGuardado.empleado.idEmpleado, 'POR_VENCER');
    }

    // Registrar actividad
    const cod = `CT-${String(id).padStart(4, '0')}`;
    let desc = `Se modificó el contrato ${cod}`;
    if (tipo === 'Indefinido') desc = `Se ascendió a Indefinido el contrato ${cod}`;
    if (estado === 'FINALIZADO') desc = `Se finiquitó el contrato ${cod}`;
    await registrarActividad("Contrato modificado", desc);

    return contratoGuardado;
}

export async function updateEstadoContrato(id, estado) {
    if (!estado) {
        throw { status: 400, message: "El campo estado es obligatorio" };
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
        throw { status: 400, message: `Estado inválido. Permitidos: ${ESTADOS_VALIDOS.join(", ")}` };
    }
    const contrato = await getContratoById(id);
    contrato.estado = estado;
    const guardado = await getRepo().save(contrato);
    
    const cod = `CT-${String(id).padStart(4, '0')}`;
    await registrarActividad("Estado modificado", `El contrato ${cod} cambió a estado ${estado}`);
    
    return guardado;
}

export async function deleteContrato(id) {
    const contrato = await getContratoById(id);
    await getRepo().remove(contrato);
    
    const cod = `CT-${String(id).padStart(4, '0')}`;
    await registrarActividad("Contrato eliminado", `Se eliminó el contrato ${cod}`);
}

export async function agregarInstalacionContrato(idContrato, idInstalacion, horasSemanales, pagoAdicional) {
    const contrato = await getContratoById(idContrato);
    
    // Obtener las instalaciones actuales para sumar las horas
    const ciRepo = AppDataSource.getRepository("ContratoInstalacion");
    const asignacionesActuales = await ciRepo.find({ 
        where: { contrato: { idContrato } },
        relations: ["instalacion"]
    });
    
    let horasTotalesActuales = 0;
    for (const asig of asignacionesActuales) {
        if (asig.instalacion.idInstalacion === idInstalacion) {
            throw { status: 400, message: "El empleado ya está asignado a esta instalación en este contrato" };
        }
        horasTotalesActuales += Number(asig.horasSemanales);
    }
    
    const maxHorasLegales = 42; // LEY_LABORAL_CHILE
    if ((horasTotalesActuales + Number(horasSemanales)) > maxHorasLegales) {
        throw { status: 400, message: `No se puede exceder el límite legal de ${maxHorasLegales} horas. Total proyectado: ${horasTotalesActuales + Number(horasSemanales)} horas.` };
    }
    
    const nuevaAsignacion = ciRepo.create({
        contrato: { idContrato },
        instalacion: { idInstalacion },
        horasSemanales: Number(horasSemanales),
        pagoAdicional: Number(pagoAdicional)
    });
    
    await ciRepo.save(nuevaAsignacion);
    
    // Registrar actividad
    const nombreEmpleado = contrato.empleado?.usuario ? `${contrato.empleado.usuario.nombre} ${contrato.empleado.usuario.apellido}` : `ID ${contrato.empleado.idEmpleado}`;
    await registrarActividad("Anexo generado", `Se asignó a ${nombreEmpleado} a una nueva instalación con ${horasSemanales}h adicionales.`);
    
    return await getContratoById(idContrato);
}

export async function removerInstalacionService(idContrato, idInstalacion) {
  try {
    const contratoRepo = AppDataSource.getRepository("Contrato");
    const contratoInstalacionRepo = AppDataSource.getRepository("ContratoInstalacion");

    const contrato = await contratoRepo.findOne({
      where: { idContrato },
      relations: ["contratoInstalaciones", "contratoInstalaciones.instalacion"]
    });

    if (!contrato) {
      throw { status: 404, message: "Contrato no encontrado." };
    }

    if (contrato.contratoInstalaciones.length <= 1) {
      throw { status: 400, message: "No se puede dejar un contrato sin ninguna instalación." };
    }

    const asignacion = contrato.contratoInstalaciones.find(ci => ci.instalacion.idInstalacion === idInstalacion);
    if (!asignacion) {
      throw { status: 404, message: "La instalación indicada no está asignada a este contrato." };
    }

    await contratoInstalacionRepo.delete({ 
      contrato: { idContrato: idContrato }, 
      instalacion: { idInstalacion: idInstalacion } 
    });

    return true;
  } catch (error) {
    if (error.status) throw error;
    throw new Error(`Error al remover instalación: ${error.message}`);
  }
}
