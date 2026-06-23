import api from "../../../config/axios";

export async function loginService(correo, password) {
  const response = await api.post(`/auth/login`, { correo, password });
  return response;
}

export async function registroService(datos) {
  const response = await api.post(`/auth/registro`, datos);
  return response;
}