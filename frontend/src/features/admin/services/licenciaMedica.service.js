import api from "../../../config/axios"

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

export const getAll = () => api.get("/licencias-medicas")
export const getById = (id) => api.get(`/licencias-medicas/${id}`)
export const updateEstado = (id, data) =>
  api.patch(`/licencias-medicas/${id}/estado`, data)
export const getPdfUrl = (licencia) =>
  `${API_ORIGIN}/licencias-medicas/${licencia.idLicencia}/pdf`
