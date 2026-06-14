import api from "../../../config/axios";

export async function obtenerUsuariosService() {
  const res = await api.get(`/usuarios`);
  return res;
}

export async function eliminarUsuarioService(id) {
  const res = await api.delete(`/usuarios/${id}`);
  return res;
}

export async function obtenerCotizacionesService() {
  const res = await api.get(`/cotizaciones`);
  return res;
}

export async function actualizarEstadoCotizacionService(id, estado) {
  const res = await api.patch(`/cotizaciones/${id}/estado`, { estado });
  return res;
}

export async function crearUsuarioService(datos) {
  const res = await api.post(`/usuarios`, datos);
  return res;
}

export async function actualizarUsuarioService(id, datos) {
  const res = await api.put(`/usuarios/${id}`, datos);
  return res;
}

export async function getEmpleados() {
  const res = await api.get('/usuarios/empleados');
  return res;
}

export async function getInstalaciones() {
  const res = await api.get('/instalaciones');
  return res;
}

export async function getDashboard() {
  const res = await api.get('/dashboard');
  return res;
}