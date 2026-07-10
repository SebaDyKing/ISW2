import { useEffect, useState } from "react"
import * as licenciaService from "../services/licenciaMedica.service"

export function useLicenciasMedicas() {
  const [licencias, setLicencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [procesando, setProcesando] = useState(null) // idLicencia que se está actualizando

  const fetchLicencias = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await licenciaService.getAll()
      setLicencias(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLicencias()
  }, [])

  const cambiarEstado = async (id, estado) => {
    setProcesando(id)
    try {
      await licenciaService.updateEstado(id, { estado })
      await fetchLicencias()
    } finally {
      setProcesando(null)
    }
  }

  const aprobar = (id) => cambiarEstado(id, "aprobada")
  const rechazar = (id) => cambiarEstado(id, "rechazada")

  return { licencias, loading, error, procesando, fetchLicencias, aprobar, rechazar }
}
