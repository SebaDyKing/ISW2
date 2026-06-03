import { useEffect, useState } from "react"
import * as licenciaService from "../services/licenciaMedica.service"

// El token JWT guarda { idUsuario, rol, correo }.
function getIdUsuario() {
  try {
    const token = localStorage.getItem("token")
    if (!token) return null
    return JSON.parse(atob(token.split(".")[1])).idUsuario
  } catch {
    return null
  }
}

export function useMisLicencias() {
  const [licencias, setLicencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const idUsuario = getIdUsuario()

  const fetchMisLicencias = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await licenciaService.getAll()
      const mias = (res.data || []).filter(
        (l) => l.empleado?.usuario?.idUsuario === idUsuario,
      )
      setLicencias(mias)
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMisLicencias()
  }, [])

  // El backend deriva el empleado del token, no hace falta mandarlo.
  const subir = async (datos) => {
    await licenciaService.crear(datos)
    await fetchMisLicencias()
  }

  return { licencias, loading, error, subir, fetchMisLicencias }
}
