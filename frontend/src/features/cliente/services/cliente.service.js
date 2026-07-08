import api from "../../../config/axios";

export async function obtenerPlanesService() {
  const res = await api.get(`/planes`);
  return res.data;
}

export async function solicitarCotizacionService(datos) {
  const res = await api.post(`/cotizaciones/solicitar`, datos);
  return res;
}

export async function obtenerMisInstalacionesService() {
  const res = await api.get(`/instalaciones/mis-instalaciones`);
  return res.data;
}

export async function obtenerMisCotizacionesService() {
  const res = await api.get(`/cotizaciones/mis-cotizaciones`);
  return res.data;
}

export async function obtenerMisDocumentosClienteService() {
  const res = await api.get(`/clientes/mis-documentos`);
  return res.data;
}

export async function descargarDocumentoClienteService(idDocumento) {
  const res = await api.get(`/documentos/${idDocumento}/download`, { responseType: 'blob' });
  return res;
}

export async function firmarDocumentoClienteService(idDocumento, firmaBase64) {
  const res = await api.post(`/documentos/${idDocumento}/firmar`, { firmaBase64 });
  return res.data;
}