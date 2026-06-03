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
      
      const contratosMapeados = data.data.map(c => ({
        id: c.idContrato,
        codigo: `CT-${String(c.idContrato).padStart(4, '0')}`,
        nombre: c.empleado ? `${c.empleado.nombre} ${c.empleado.apellido}` : 'Sin empleado',
        rut: c.empleado?.rut || 'Sin RUT',
        instalacion: c.instalacion?.nombre || 'Sin instalación',
        rol: c.cargo,
        tipoContrato: c.tipo,
        periodoInicio: c.fechaInicio,
        periodoFin: c.fechaFin,
        estado: c.estado,
        tieneAlerta: false
      }))

      setContratos(contratosMapeados)
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