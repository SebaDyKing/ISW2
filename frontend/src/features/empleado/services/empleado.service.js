import api from "../../../config/axios";

export const obtenerMisDocumentosService = async () => {
  return await api.get("/empleados/mis-documentos");
};
