import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

//Planes
export async function obtenerPlanesService() {
  const res = await axios.get(`${API}/planes`);
  return res.data;
}

//Cotizaciones
export async function solicitarCotizacionService(datos) {
  const res = await axios.post(`${API}/cotizaciones/solicitar`, datos, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function obtenerMisInstalacionesService() {
  const res = await axios.get(`${API}/instalaciones/mis-instalaciones`, {
    headers: getAuthHeader(),
  });
  return res.data;
}