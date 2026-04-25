"use strict";
import {
    getAllContratos,
    getContratoById,
    getContratosByEmpleado,
    createContrato,
    updateContrato,
    updateEstadoContrato,
    deleteContrato,
} from "../services/contrato.service.js";
import {
    handleSuccess,
    handleErrorClient,
    handleErrorServer,
} from "../Handlers/responseHanders.js";

export const getAll = async (req, res) => {
    try {
        const data = await getAllContratos();
        handleSuccess(res, 200, "Contratos obtenidos exitosamente", data);
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener contratos", error.message);
    }
};

export const getById = async (req, res) => {
    try {
        const data = await getContratoById(Number(req.params.id));
        handleSuccess(res, 200, "Contrato obtenido exitosamente", data);
    } catch (error) {
        if (error.status === 404) {
            handleErrorClient(res, 404, error.message);
        } else {
            handleErrorServer(res, 500, "Error al obtener contrato", error.message);
        }
    }
};

export const getByEmpleado = async (req, res) => {
    try {
        const data = await getContratosByEmpleado(Number(req.params.id_empleado));
        handleSuccess(res, 200, "Contratos del empleado obtenidos", data);
    } catch (error) {
        if (error.status === 404) {
            handleErrorClient(res, 404, error.message);
        } else {
            handleErrorServer(res, 500, "Error al obtener contratos del empleado", error.message);
        }
    }
};

export const create = async (req, res) => {
    try {
        const data = await createContrato(req.body);
        handleSuccess(res, 201, "Contrato creado exitosamente", data);
    } catch (error) {
        if (error.status === 400 || error.status === 404) {
            handleErrorClient(res, error.status, error.message);
        } else {
            handleErrorServer(res, 500, "Error al crear contrato", error.message);
        }
    }
};

export const update = async (req, res) => {
    try {
        const data = await updateContrato(Number(req.params.id), req.body);
        handleSuccess(res, 200, "Contrato actualizado exitosamente", data);
    } catch (error) {
        if (error.status === 400 || error.status === 404) {
            handleErrorClient(res, error.status, error.message);
        } else {
            handleErrorServer(res, 500, "Error al actualizar contrato", error.message);
        }
    }
};

export const updateEstado = async (req, res) => {
    try {
        const data = await updateEstadoContrato(Number(req.params.id), req.body.estado);
        handleSuccess(res, 200, "Estado actualizado exitosamente", data);
    } catch (error) {
        if (error.status === 400 || error.status === 404) {
            handleErrorClient(res, error.status, error.message);
        } else {
            handleErrorServer(res, 500, "Error al actualizar estado", error.message);
        }
    }
};

export const remove = async (req, res) => {
    try {
        await deleteContrato(Number(req.params.id));
        handleSuccess(res, 200, "Contrato eliminado exitosamente", null);
    } catch (error) {
        if (error.status === 404) {
            handleErrorClient(res, 404, error.message);
        } else {
            handleErrorServer(res, 500, "Error al eliminar contrato", error.message);
        }
    }
};