"use strict";
import {
    getMetricasDashboard,
    getAlertasPendientes,
} from "../services/dashboard.service.js";
import {
    handleSuccess,
    handleErrorClient,
    handleErrorServer,
} from "../Handlers/responseHanders.js";

export const getDashboard = async (req, res) => {
    try {
        const metricas = await getMetricasDashboard();
        const alertas = await getAlertasPendientes();

        handleSuccess(res, 200, "Dashboard obtenido exitosamente", { metricas, alertas });
    } catch (error) {
        handleErrorServer(res, 500, "Error al obtener el dashboard", error.message);
    }
};
