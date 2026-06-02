import axios from "axios";

const API = "http://localhost:3000/api";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export async function obtenerUsuariosService() {
  const res = await axios.get(`${API}/usuarios`, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function eliminarUsuarioService(id) {
  const res = await axios.delete(`${API}/usuarios/${id}`, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function obtenerCotizacionesService() {
  const res = await axios.get(`${API}/cotizaciones`, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function actualizarEstadoCotizacionService(id, estado) {
  const res = await axios.patch(`${API}/cotizaciones/${id}/estado`, { estado }, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function crearUsuarioService(datos) {
  const res = await axios.post(`${API}/usuarios`, datos, {
    headers: getAuthHeader(),
  });
  return res.data;
}

export async function actualizarUsuarioService(id, datos) {
  const res = await axios.put(`${API}/usuarios/${id}`, datos, {
    headers: getAuthHeader(),
  });
  return res.data;
}