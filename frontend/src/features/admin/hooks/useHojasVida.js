import { useEffect, useState } from "react"
import * as hojaVidaService from "../services/hojaVida.service"

export function useHojasVida() {
  const [hojas, setHojas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchHojas = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await hojaVidaService.getAll()
      setHojas(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchHojas()
  }, [])

  const createHoja = async (data) => {
    await hojaVidaService.create(data)
    await fetchHojas()
  }

  const updateHoja = async (id, data) => {
    await hojaVidaService.update(id, data)
    await fetchHojas()
  }

  const deleteHoja = async (id) => {
    await hojaVidaService.remove(id)
    await fetchHojas()
  }

  return { hojas, loading, error, fetchHojas, createHoja, updateHoja, deleteHoja }
}
