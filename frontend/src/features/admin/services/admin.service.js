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

export async function actualizarEstadoCotizacionService(id, estado, motivo) {
  const res = await api.patch(`/cotizaciones/${id}/estado`, { estado, motivo });
  return res;
}

export async function reactivarCotizacionService(id) {
  const res = await api.put(`/cotizaciones/${id}/reactivar`);
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

export async function crearInstalacionService(datos) {
  const res = await api.post('/instalaciones', datos);
  return res;
}

export async function actualizarInstalacionService(id, datos) {
  const res = await api.put(`/instalaciones/${id}`, datos);
  return res;
}

export async function eliminarInstalacionService(id) {
  const res = await api.delete(`/instalaciones/${id}`);
  return res;
}

export async function obtenerClientesService() {
  const res = await api.get('/usuarios/clientes');
  return res;
}

export async function getDashboard() {
  const res = await api.get(`/dashboard?t=${new Date().getTime()}`);
  return res;
}

export async function trasladarEmpleado(idEmpleado, idInstalacion) {
  const res = await api.put(`/usuarios/empleados/${idEmpleado}/traslado`, { idInstalacion });
  return res;
}

export async function subirDocumentoEmpleado(idEmpleado, tipo, archivoBlob) {
  const formData = new FormData();
  formData.append("tipo", tipo);
  formData.append("archivoPdf", archivoBlob, `${tipo}.pdf`);
  
  const res = await api.post(`/empleados/${idEmpleado}/documentos`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res;
}

export async function getDocumentosEmpleado(idEmpleado) {
  const res = await api.get(`/empleados/${idEmpleado}/documentos`);
  return res;
}