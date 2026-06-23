import api from "../../../config/axios";

export async function obtenerPlanesService() {
  const res = await api.get(`/planes`);
  return res.data.data;
}

export async function solicitarCotizacionService(datos) {
  const res = await api.post(`/cotizaciones/solicitar`, datos);
  return res.data;
}

export async function obtenerMisInstalacionesService() {
  const res = await api.get(`/instalaciones/mis-instalaciones`);
  return res.data.data;
}