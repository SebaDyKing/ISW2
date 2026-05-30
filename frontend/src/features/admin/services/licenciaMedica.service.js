import api from "../../../config/api"

// Mismo origen que usa config/api.js (incluye el sufijo /api).
const API_ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

export const getAll = () => api.get("/licencias-medicas")
export const getById = (id) => api.get(`/licencias-medicas/${id}`)
export const updateEstado = (id, data) =>
  api.patch(`/licencias-medicas/${id}/estado`, data)

/**
 * URL del PDF de una licencia. ÚNICO punto de contrato con el backend para el archivo.
 *
 * Recomendado (datos médicos = sensibles): endpoint dedicado DETRÁS DE auth ->
 *   GET /api/licencias-medicas/:id/pdf
 * El controller responde con res.sendFile / res.download del archivo en uploads/.
 *
 * Si en cambio lo servís como carpeta estática
 * (app.use("/uploads", express.static("uploads")) en backend/src/index.js),
 * cambiá SOLO esta línea por:
 *   return `${API_ORIGIN.replace(/\/api$/, "")}/uploads/${licencia.archivoPdf}`
 */
export const getPdfUrl = (licencia) =>
  `${API_ORIGIN}/licencias-medicas/${licencia.idLicencia}/pdf`
