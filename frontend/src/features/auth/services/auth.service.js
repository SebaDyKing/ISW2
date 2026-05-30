import axios from "axios";

const API_URL = "http://localhost:3000/api/auth";

export async function loginService(correo, password) {
  const response = await axios.post(`${API_URL}/login`, { correo, password });
  return response.data;
}

export async function registroService(datos) {
  const response = await axios.post(`${API_URL}/registro`, datos);
  return response.data;
}