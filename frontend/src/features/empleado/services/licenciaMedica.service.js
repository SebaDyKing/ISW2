import api from "../../../config/axios"

const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

export const getAll = () => api.get("/licencias-medicas")

export const crear = (datos) => {
  const fd = new FormData()
  fd.append("archivoPdf", datos.archivoPdf)
  fd.append("fechaInicio", datos.fechaInicio)
  fd.append("fechaFin", datos.fechaFin)
  fd.append("diagnostico", datos.diagnostico)
  // withCredentials ya va en la instancia — solo necesitamos multipart
  return api.post("/licencias-medicas", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  })
}

export const getPdfUrl = (licencia) =>
  `${API_ORIGIN}/licencias-medicas/${licencia.idLicencia}/pdf`