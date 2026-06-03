import { useEffect, useState } from "react"
import * as hojaService from "../services/hojaVida.service"

function getIdUsuario() {
  try {
    const token = localStorage.getItem("token")
    if (!token) return null
    return JSON.parse(atob(token.split(".")[1])).idUsuario
  } catch {
    return null
  }
}

export function useMisHojasVida() {
  const [hojas, setHojas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const idUsuario = getIdUsuario()

  const fetchMisHojas = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await hojaService.getAll()
      const mias = (res.data || []).filter(
        (h) => h.empleado?.usuario?.idUsuario === idUsuario,
      )
      setHojas(mias)
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMisHojas()
  }, [])

  return { hojas, loading, error, fetchMisHojas }
}
