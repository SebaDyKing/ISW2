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

export const getAll = async (req, res) => {
    try {
        const data = await getAllContratos();
        res.status(200).json({ ok: true, data });
    } catch (error) {
        res.status(error.status || 500).json({ ok: false, message: error.message });
    }
};

export const getById = async (req, res) => {
    try {
        const data = await getContratoById(Number(req.params.id));
        res.status(200).json({ ok: true, data });
    } catch (error) {
        res.status(error.status || 500).json({ ok: false, message: error.message });
    }
};

export const getByEmpleado = async (req, res) => {
    try {
        const data = await getContratosByEmpleado(Number(req.params.id_empleado));
        res.status(200).json({ ok: true, data });
    } catch (error) {
        res.status(error.status || 500).json({ ok: false, message: error.message });
    }
};

export const create = async (req, res) => {
    try {
        const data = await createContrato(req.body);
        res.status(201).json({ ok: true, message: "Contrato creado exitosamente", data });
    } catch (error) {
        res.status(error.status || 500).json({ ok: false, message: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const data = await updateContrato(Number(req.params.id), req.body);
        res.status(200).json({ ok: true, message: "Contrato actualizado exitosamente", data });
    } catch (error) {
        res.status(error.status || 500).json({ ok: false, message: error.message });
    }
};

export const updateEstado = async (req, res) => {
    try {
        const data = await updateEstadoContrato(Number(req.params.id), req.body.estado);
        res.status(200).json({ ok: true, message: "Estado actualizado exitosamente", data });
    } catch (error) {
        res.status(error.status || 500).json({ ok: false, message: error.message });
    }
};

export const remove = async (req, res) => {
    try {
        await deleteContrato(Number(req.params.id));
        res.status(200).json({ ok: true, message: "Contrato eliminado exitosamente" });
    } catch (error) {
        res.status(error.status || 500).json({ ok: false, message: error.message });
    }
};