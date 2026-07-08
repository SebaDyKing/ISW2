"use strict";
import { AppDataSource } from "../config/configDb.js";
import { crearAlerta, resolverAlertasEmpleado } from "./crearAlerta.service.js";
import { registrarActividad } from "./actividad.service.js";
import { In } from "typeorm";

const getRepo = () => AppDataSource.getRepository("Contrato");

const TIPOS_VALIDOS = ["Plazo Fijo", "Indefinido", "Prestación de Servicios"];
const ESTADOS_VALIDOS = ["ACTIVO", "POR VENCER", "FINALIZADO", "PENDIENTE DE FIRMA"];

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
        relations: ["empleado", "empleado.usuario", "cliente", "cliente.usuario", "contratoInstalaciones", "contratoInstalaciones.instalacion"],
    });
}

export async function getContratoById(id) {
    const contrato = await getRepo().findOne({
        where: { idContrato: id },
        relations: ["empleado", "empleado.usuario", "cliente", "cliente.usuario", "contratoInstalaciones", "contratoInstalaciones.instalacion"],
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
        idEmpleado, idCliente, tipo, cargo,
        sueldo, montoServicio, jornadaHoras, fechaInicio, fechaFin,
        nacionalidad, estadoCivil, fechaNacimiento, domicilio,
        descripcionServicio, condicionPago,
        idInstalacion
    } = body;

    // Validaciones de campos obligatorios
    if (!tipo || !cargo || !fechaInicio) {
        throw { status: 400, message: "Tipo, cargo y fecha de inicio son obligatorios" };
    }
    
    if (!idEmpleado && !idCliente) {
        throw { status: 400, message: "Debe especificar un empleado o un cliente para el contrato" };
    }
    
    if (idEmpleado && idCliente) {
        throw { status: 400, message: "El contrato no puede pertenecer a un empleado y a un cliente simultáneamente" };
    }

    if (idEmpleado) {
        if (!idInstalacion) {
            throw { status: 400, message: "La instalación es obligatoria para contratos de empleados" };
        }
        if (!sueldo || !jornadaHoras) {
            throw { status: 400, message: "El sueldo y la jornada son obligatorios para empleados" };
        }
        if (jornadaHoras < 1 || jornadaHoras > 42) {
            throw { status: 400, message: "La jornada laboral debe ser entre 1 y 42 horas semanales" };
        }
    } else if (idCliente) {
        if (!montoServicio) {
            throw { status: 400, message: "El valor del servicio es obligatorio para contratos comerciales" };
        }
        if (!fechaFin) {
            throw { status: 400, message: "La fecha de término es obligatoria para contratos comerciales" };
        }
    }

    if (!TIPOS_VALIDOS.includes(tipo)) {
        throw { status: 400, message: `Tipo inválido. Permitidos: ${TIPOS_VALIDOS.join(", ")}` };
    }
    if (tipo === "Plazo Fijo" && !fechaFin) {
        throw { status: 400, message: "La fecha de término es obligatoria para contratos a Plazo Fijo" };
    }
    if (fechaFin && new Date(fechaFin) <= new Date(fechaInicio)) {
        throw { status: 400, message: "La fecha fin debe ser posterior a la de inicio" };
    }

    if (fechaNacimiento) {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        if (edad < 18) {
            throw { status: 400, message: "El empleado debe tener al menos 18 años de edad" };
        }
    }

    let empleadoEntidad = null;
    let clienteEntidad = null;

    if (idEmpleado) {
        empleadoEntidad = await AppDataSource.getRepository("Empleado")
            .findOne({
                where: { idEmpleado },
                relations: ["usuario"]
            });
        if (!empleadoEntidad) throw { status: 404, message: "Empleado no encontrado" };

        const rol = empleadoEntidad.usuario?.rol;
        if (rol === "supervisor" && cargo !== "Supervisor") {
            throw { status: 400, message: 'Un usuario con rol "supervisor" solo puede tener el cargo de "Supervisor".' };
        }
        if (rol === "empleado" && !["Guardia", "Personal de Aseo"].includes(cargo)) {
            throw { status: 400, message: 'Un usuario con rol "empleado" solo puede tener el cargo de "Guardia" o "Personal de Aseo".' };
        }
        
        const existeContratoActivo = await AppDataSource.getRepository("Contrato")
            .findOne({
                where: {
                    empleado: { idEmpleado },
                    estado: In(["ACTIVO", "activo", "PENDIENTE DE FIRMA"]),
                },
            });
        if (existeContratoActivo) {
            throw { status: 400, message: "El empleado ya tiene un contrato activo en el sistema. Debe finalizarlo o realizar un traslado." };
        }
    } else if (idCliente) {
        clienteEntidad = await AppDataSource.getRepository("Cliente")
            .findOne({ where: { idCliente } });
        if (!clienteEntidad) throw { status: 404, message: "Cliente no encontrado" };
        
        if (cargo !== "Cliente") {
            throw { status: 400, message: 'El cargo debe ser "Cliente" para contratos comerciales.' };
        }
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
            throw {
                status: 400,
                message: `El empleado ${empleadoEntidad.usuario?.nombre || 'Desconocido'} ${empleadoEntidad.usuario?.apellido || ''} no puede registrar un tercer contrato a Plazo Fijo consecutivo. Debe pasar a contrato Indefinido.`
            };
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

            if (dFin >= dInicio) {
                diasTrabajados += Math.ceil((dFin - dInicio) / (1000 * 60 * 60 * 24)) + 1;
            }
        }

        // Sumamos los días del nuevo contrato que se está creando
        if (fechaFin) {
            const diasNuevo = Math.ceil((new Date(fechaFin) - new Date(fechaInicio)) / (1000 * 60 * 60 * 24)) + 1;
            diasTrabajados += diasNuevo;
        }

        if (diasTrabajados >= 365) {
            throw {
                status: 400,
                message: `El empleado ${empleadoEntidad.usuario?.nombre || 'Desconocido'} superará los 12 meses (365 días) de servicio en un periodo de 15 meses. Por ley, debe pasar a contrato Indefinido.`
            };
        }
    }

    let estadoInicial = "PENDIENTE DE FIRMA";
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
        empleado: empleadoEntidad,
        cliente: clienteEntidad,
        tipo,
        cargo,
        sueldo: idEmpleado ? sueldo : null,
        montoServicio: idCliente ? montoServicio : null,
        jornadaHoras: idEmpleado ? jornadaHoras : null,
        fechaInicio,
        fechaFin,
        estado: estadoInicial,
        causalTermino: null,
        nacionalidad,
        estadoCivil,
        fechaNacimiento,
        domicilio,
        descripcionServicio: idCliente ? descripcionServicio : null,
        condicionPago: idCliente ? condicionPago : null
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
    let nombreContratado = "Desconocido";
    if (empleadoEntidad) {
        nombreContratado = empleadoEntidad.usuario ? `${empleadoEntidad.usuario.nombre} ${empleadoEntidad.usuario.apellido}` : `Empleado ID ${idEmpleado}`;
    } else if (clienteEntidad) {
        nombreContratado = clienteEntidad.nombreEmpresa || (clienteEntidad.usuario ? `${clienteEntidad.usuario.nombre} ${clienteEntidad.usuario.apellido}` : `Cliente ID ${idCliente}`);
    }

    // [NUEVO] Verificación instantánea de vencimiento para nuevos contratos
    if (tipo === 'Plazo Fijo' && fechaFin && estadoInicial !== 'FINALIZADO') {
        const diffTime = new Date(fechaFin) - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 15) {
            contratoGuardado.estado = 'POR VENCER';
            await getRepo().save(contratoGuardado);

            const mensaje = `El contrato a plazo fijo de ${nombreContratado} finaliza el ${fechaFin} (en ${diffDays} días).`;
            await crearAlerta(
                idEmpleado,
                "ALERTA VENCIMIENTO",
                mensaje,
                "POR_VENCER",
                contratoGuardado.idContrato
            );
        }
    }

    await registrarActividad("Contrato creado", `Se creó un contrato a ${tipo} para ${nombreContratado}`);

    return contratoGuardado;
}

export async function updateContrato(id, body) {
    const contrato = await getContratoById(id);

    const {
        idEmpleado, tipo, cargo,
        sueldo, jornadaHoras, fechaInicio, fechaFin, estado, causalTermino,
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
    const tipoActual = tipo || contrato.tipo;
    const jornadaActual = jornadaHoras !== undefined ? jornadaHoras : contrato.jornadaHoras;

    if (estado === "FINALIZADO" && contrato.estado !== "FINALIZADO") {
        if (!causalTermino && !contrato.causalTermino) {
            throw { status: 400, message: "Debe especificar una causal de término al finalizar el contrato" };
        }
    }

    if (tipoActual === "Plazo Fijo" && !fin) {
        throw { status: 400, message: "La fecha de término es obligatoria para contratos a Plazo Fijo" };
    }
    if (fin && new Date(fin) <= new Date(inicio)) {
        throw { status: 400, message: "La fecha fin debe ser posterior a la de inicio" };
    }
    if (jornadaActual < 1 || jornadaActual > 42) {
        throw { status: 400, message: "La jornada laboral debe ser entre 1 y 42 horas semanales" };
    }

    const nacimientoAValidar = fechaNacimiento !== undefined ? fechaNacimiento : contrato.fechaNacimiento;
    if (nacimientoAValidar) {
        const hoy = new Date();
        const nacimiento = new Date(nacimientoAValidar);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        if (edad < 18) {
            throw { status: 400, message: "El empleado debe tener al menos 18 años de edad" };
        }
    }

    // Verifica existencia de relaciones si se quieren cambiar
    if (idEmpleado) {
        const empleado = await AppDataSource.getRepository("Empleado")
            .findOne({ where: { idEmpleado }, relations: ["usuario"] });
        if (!empleado) throw { status: 404, message: "Empleado no encontrado" };
        contrato.empleado = empleado; // Save the full object to use its role
    }

    const nuevoCargo = cargo || contrato.cargo;
    const rolActual = contrato.empleado?.usuario?.rol;

    if (rolActual) {
        if (rolActual === "supervisor" && nuevoCargo !== "Supervisor") {
            throw { status: 400, message: 'Un usuario con rol "supervisor" solo puede tener el cargo de "Supervisor".' };
        }
        if (rolActual === "empleado" && !["Guardia", "Personal de Aseo"].includes(nuevoCargo)) {
            throw { status: 400, message: 'Un usuario con rol "empleado" solo puede tener el cargo de "Guardia" o "Personal de Aseo".' };
        }
        if (rolActual === "cliente" && nuevoCargo !== "Cliente") {
            throw { status: 400, message: 'Un usuario con rol "cliente" solo puede tener el cargo de "Cliente".' };
        }
    }

    // Actualiza solo los campos que llegaron
    if (tipo) contrato.tipo = tipo;
    if (cargo) contrato.cargo = cargo;
    if (sueldo) contrato.sueldo = sueldo;
    if (jornadaHoras) contrato.jornadaHoras = jornadaHoras;
    if (fechaInicio) contrato.fechaInicio = fechaInicio;
    if (fechaFin !== undefined) contrato.fechaFin = fechaFin;
    if (estado) contrato.estado = estado;
    if (causalTermino !== undefined) contrato.causalTermino = causalTermino;
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

export async function updateEstadoContrato(id, estado, causalTermino) {
    if (!estado) {
        throw { status: 400, message: "El campo estado es obligatorio" };
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
        throw { status: 400, message: `Estado inválido. Permitidos: ${ESTADOS_VALIDOS.join(", ")}` };
    }
    const contrato = await getContratoById(id);

    if (estado === "FINALIZADO" && contrato.estado !== "FINALIZADO") {
        if (!causalTermino) {
            throw { status: 400, message: "Debe especificar una causal de término al finalizar el contrato" };
        }
        contrato.causalTermino = causalTermino;
    }

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

export async function solicitarTrasladoService(idContrato, body) {
    const { idInstalacion, motivo } = body;
    if (!idInstalacion || !motivo) {
        throw { status: 400, message: "La instalación de destino y el motivo son obligatorios" };
    }

    const contrato = await getContratoById(idContrato);
    if (!contrato.empleado) {
        throw { status: 404, message: "El contrato no tiene un empleado asociado" };
    }

    const instalacionRepo = AppDataSource.getRepository("Instalacion");
    const instalacion = await instalacionRepo.findOne({ where: { idInstalacion } });
    if (!instalacion) {
        throw { status: 404, message: "La instalación destino no existe" };
    }

    const nombreEmpleado = contrato.empleado.usuario ? `${contrato.empleado.usuario.nombre} ${contrato.empleado.usuario.apellido}` : `ID ${contrato.empleado.idEmpleado}`;
    const mensaje = `Solicitud de traslado para ${nombreEmpleado} a la instalación: ${instalacion.nombre}. Motivo: ${motivo}`;

    const alerta = await crearAlerta(
        contrato.empleado.idEmpleado,
        "Solicitud de Traslado",
        mensaje,
        "TRASLADOS",
        idContrato
    );

    await registrarActividad("Solicitud de traslado", `Se generó una solicitud de traslado para ${nombreEmpleado}`);
    return alerta;
}

export async function getStaffContratosService(user = null) {
    const repo = AppDataSource.getRepository("Usuario");
    const usuarios = await repo.find({
        where: [
            { rol: "empleado" },
            { rol: "supervisor" },
            { rol: "cliente" }
        ],
        relations: [
            "empleado",
            "empleado.contratos",
            "empleado.contratos.contratoInstalaciones",
            "empleado.contratos.contratoInstalaciones.instalacion",
            "supervisor",
            "cliente",
            "cliente.contratos",
            "cliente.contratos.contratoInstalaciones",
            "cliente.contratos.contratoInstalaciones.instalacion"
        ]
    });

    let filtrados = usuarios;

    if (user && user.rol === "supervisor") {
        const supervisor = await AppDataSource.getRepository("Supervisor").findOne({
            where: { usuario: { idUsuario: user.idUsuario } },
            relations: [
                "instalaciones",
                "instalaciones.instalacion",
                "usuario",
                "usuario.empleado",
                "usuario.empleado.contratos",
                "usuario.empleado.contratos.contratoInstalaciones",
                "usuario.empleado.contratos.contratoInstalaciones.instalacion"
            ]
        });

        let instalacionIds = [];

        // Desde SupervisorInstalacion
        if (supervisor && supervisor.instalaciones) {
            instalacionIds.push(...supervisor.instalaciones.map(si => si.instalacion.idInstalacion));
        }

        // Desde contratos activos del supervisor
        if (supervisor && supervisor.usuario && supervisor.usuario.empleado && supervisor.usuario.empleado.contratos) {
            const activos = supervisor.usuario.empleado.contratos.filter(c => c.estado !== "FINALIZADO");
            activos.forEach(c => {
                if (c.contratoInstalaciones) {
                    c.contratoInstalaciones.forEach(ci => {
                        if (ci.instalacion) instalacionIds.push(ci.instalacion.idInstalacion);
                    });
                }
            });
        }

        instalacionIds = [...new Set(instalacionIds)]; // Eliminar duplicados

        if (instalacionIds.length > 0) {
            filtrados = usuarios.filter(u => {
                let contratosList = [];
                if (u.rol === 'cliente' && u.cliente && u.cliente.contratos) {
                    contratosList = u.cliente.contratos;
                } else if ((u.rol === 'empleado' || u.rol === 'supervisor') && u.empleado && u.empleado.contratos) {
                    contratosList = u.empleado.contratos;
                } else {
                    return false;
                }
                
                return contratosList.some(c =>
                    c.estado !== "FINALIZADO" &&
                    c.contratoInstalaciones &&
                    c.contratoInstalaciones.some(ci => ci.instalacion && instalacionIds.includes(ci.instalacion.idInstalacion))
                );
            });
        } else {
            return [];
        }
    }

    return filtrados;
}
