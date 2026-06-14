import api from "../../../config/axios"

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

function authHeader() {
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const getAll = () => api.get("/licencias-medicas")


export const crear = (datos) => {
  const fd = new FormData()
  fd.append("archivoPdf", datos.archivoPdf)
  fd.append("fechaInicio", datos.fechaInicio)
  fd.append("fechaFin", datos.fechaFin)
  fd.append("diagnostico", datos.diagnostico)
  return api.post("/licencias-medicas", fd, {
    headers: { "Content-Type": "multipart/form-data", ...authHeader() },
  })
}

export const getPdfUrl = (licencia) =>
  `${API_ORIGIN}/licencias-medicas/${licencia.idLicencia}/pdf`
