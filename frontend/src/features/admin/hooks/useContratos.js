import { useState, useEffect, useCallback } from 'react'
import { contratosService } from '../services/contratosService'

export function useContratos() {
  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchContratos = useCallback(async (params) => {
    try {
      setError(null)
      const { data } = await contratosService.getAll(params)
      setContratos(data)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al cargar los contratos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContratos()
  }, [fetchContratos])

  return { contratos, loading, error, refetch: fetchContratos }
}