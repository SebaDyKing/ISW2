import api from "../../../config/axios";

export const obtenerMisDocumentosService = async () => {
  return await api.get("/empleados/mis-documentos");
};

export const descargarDocumentoEmpleadoService = async (idDocumento) => {
  const res = await api.get(`/documentos/${idDocumento}/download`, {
    responseType: 'blob'
  });
  return res;
};

export const firmarDocumentoEmpleadoService = async (idDocumento, firmaBase64) => {
  return await api.post(`/documentos/${idDocumento}/firmar`, { firmaBase64 });
};
