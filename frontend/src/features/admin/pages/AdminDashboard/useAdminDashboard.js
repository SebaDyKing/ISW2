import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'

export function useAdminDashboard() {
  const [data, setData] = useState({
    metricas: { personalActivo: 0, instalacionesEnCurso: 0, asistenciaHoy: 0 },
    alertas: [],
    historial: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminService.getDashboard()
        setData(res.data.data)
      } catch (err) {
        console.error("Error cargando dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading }
}
