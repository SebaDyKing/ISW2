import { AppDataSource } from "../config/configDb.js";

const getRepo = () => AppDataSource.getRepository("Contrato");

const TIPOS_VALIDOS = ["Plazo Fijo", "Indefinido", "Traslado", "Reemplazo"];
const ESTADOS_VALIDOS = ["ACTIVO", "POR VENCER", "FINALIZADO"];

export async function getAllContratos() {
    return await getRepo().find({
        relations: ["empleado", "instalacion"], // trae los datos relacionados
    });
}

export async function getContratoById(id) {
    const contrato = await getRepo().findOne({
        where: { idContrato: id }, // filtro por PK
        relations: ["empleado", "instalacion"],
    });
    if (!contrato) throw { status: 404, message: "Contrato no encontrado" };
    return contrato;
}

export async function getContratosByEmpleado(idEmpleado) {
    return await getRepo().find({
        where: { empleado: { idEmpleado } }, // filtro por relación
        relations: ["instalacion"],
    });
}

export async function createContrato(body) {
    const {
        idEmpleado, idInstalacion, tipo, cargo,
        sueldo, jornadaHoras, fechaInicio, fechaFin,
        estado = "ACTIVO",
    } = body;

    // Validaciones
    if (!idEmpleado || !idInstalacion || !tipo || !cargo ||
        !sueldo || !jornadaHoras || !fechaInicio) {
        throw { status: 400, message: "Todos los campos son obligatorios" };
    }
    if (!TIPOS_VALIDOS.includes(tipo)) {
        throw { status: 400, message: `Tipo inválido. Permitidos: ${TIPOS_VALIDOS.join(", ")}` };
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
        throw { status: 400, message: `Estado inválido. Permitidos: ${ESTADOS_VALIDOS.join(", ")}` };
    }
    if (fechaFin && new Date(fechaFin) <= new Date(fechaInicio)) {
        throw { status: 400, message: "La fecha fin debe ser posterior a la de inicio" };
    }

    // Las relaciones se pasan como objetos con su PK
    const nuevo = getRepo().create({
        tipo,
        cargo,
        sueldo,
        jornadaHoras,   
        fechaInicio,    
        fechaFin,
        estado,
        empleado: { idEmpleado }, // se asume que el empleado ya existe, solo se referencia por su ID
        instalacion: { idInstalacion }, // se asume que la instalacion ya existe, solo se referencia por su ID
    });

    return await getRepo().save(nuevo);
}

export async function updateContrato(id, body) {
    const contrato = await getContratoById(id);

    const {
        idEmpleado, idInstalacion, tipo, cargo,
        sueldo, jornadaHoras, fechaInicio, fechaFin, estado,
    } = body;

    // Validaciones solo si vienen los campos
    if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
        throw { status: 400, message: `Tipo inválido. Permitidos: ${TIPOS_VALIDOS.join(", ")}` };
    }
    if (estado && !ESTADOS_VALIDOS.includes(estado)) {
        throw { status: 400, message: `Estado inválido. Permitidos: ${ESTADOS_VALIDOS.join(", ")}` };
    }
    const inicio = fechaInicio || contrato.fechaInicio;
    const fin = fechaFin || contrato.fechaFin;
    if (fin && new Date(fin) <= new Date(inicio)) {
        throw { status: 400, message: "La fecha fin debe ser posterior a la de inicio" };
    }

    // Actualiza solo los campos que llegaron
    if (tipo) contrato.tipo = tipo;
    if (cargo) contrato.cargo = cargo;
    if (sueldo) contrato.sueldo = sueldo;
    if (jornadaHoras) contrato.jornadaHoras = jornadaHoras;
    if (fechaInicio) contrato.fechaInicio = fechaInicio;
    if (fechaFin) contrato.fechaFin = fechaFin;
    if (estado) contrato.estado = estado;
    if (idEmpleado) contrato.empleado = { idEmpleado };
    if (idInstalacion) contrato.instalacion = { idInstalacion };

    return await getRepo().save(contrato);
}

export async function updateEstadoContrato(id, estado) {
    if (!ESTADOS_VALIDOS.includes(estado)) {
        throw { status: 400, message: `Estado inválido. Permitidos: ${ESTADOS_VALIDOS.join(", ")}` };
    }
    const contrato = await getContratoById(id);
    contrato.estado = estado;
    return await getRepo().save(contrato);
}

export async function deleteContrato(id) {
    const contrato = await getContratoById(id);
    await getRepo().remove(contrato);
}   