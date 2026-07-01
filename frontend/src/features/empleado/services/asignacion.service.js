import api from "../../../config/axios";

export const obtenerMisAsignacionesService = async () => {
  return await api.get("/contratos/mis-asignaciones");
};
