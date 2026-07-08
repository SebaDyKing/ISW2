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

export async function crearInstalacionService(datos) {
  const res = await api.post(`/instalaciones`, datos);
  return res.data;
}

export async function actualizarInstalacionService(id, datos) {
  const res = await api.put(`/instalaciones/${id}`, datos);
  return res.data;
}

export async function eliminarInstalacionService(id) {
  const res = await api.delete(`/instalaciones/${id}`);
  return res.data;
}

export async function obtenerMisCotizacionesService() {
  const res = await api.get(`/cotizaciones/mis-cotizaciones`);
  return res.data;
}