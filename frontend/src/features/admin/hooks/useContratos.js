import { useState, useEffect, useCallback } from 'react'
import { contratosService } from '../services/contrato.service'

export function useContratos() {
  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchContratos = useCallback(async (params) => {
    try {
      setError(null)
      const response = await contratosService.getAll(params)

      const contratosMapeados = response.data.map(u => {
        let contratoParaMostrar = null;
        let esCliente = u.rol === 'cliente';
        let contratosList = [];

        if (esCliente && u.cliente && u.cliente.contratos) {
            contratosList = u.cliente.contratos;
        } else if (u.empleado && u.empleado.contratos) {
            contratosList = u.empleado.contratos;
        }

        if (contratosList && contratosList.length > 0) {
            const sortedContratos = [...contratosList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const activo = sortedContratos.find(c => c.estado !== 'FINALIZADO');
            contratoParaMostrar = activo || sortedContratos[0];
        }

        return {
          id: contratoParaMostrar ? contratoParaMostrar.idContrato : `u-${u.idUsuario}`, // Fallback ID for UI keys
          idContrato: contratoParaMostrar?.idContrato,
          idEmpleado: u.empleado?.idEmpleado,
          idCliente: u.cliente?.idCliente,
          idUsuario: u.idUsuario,
          codigo: contratoParaMostrar ? `CT-${String(contratoParaMostrar.idContrato).padStart(4, '0')}` : 'N/A',
          nombre: esCliente ? (u.cliente?.nombreEmpresa || `${u.nombre} ${u.apellido}`) : `${u.nombre} ${u.apellido}`,
          rut: u.rut,
          instalacion: contratoParaMostrar?.contratoInstalaciones?.length > 1
            ? 'Múltiples instalaciones'
            : contratoParaMostrar?.contratoInstalaciones?.[0]?.instalacion?.nombre || (contratoParaMostrar ? 'Sin instalación' : '-'),
          rolSistema: u.rol,
          rol: contratoParaMostrar?.cargo || '-',
          tipoContrato: contratoParaMostrar?.tipo || '-',
          periodoInicio: contratoParaMostrar?.fechaInicio,
          periodoFin: contratoParaMostrar?.fechaFin,
          estado: contratoParaMostrar ? contratoParaMostrar.estado : 'SIN CONTRATO',
          tieneAlerta: false,
          contratoInstalacionesData: contratoParaMostrar?.contratoInstalaciones || [],
          originalContrato: contratoParaMostrar,
          originalUsuario: u
        };
      })

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

  const deleteContrato = useCallback(async (id) => {
    try {
      await contratosService.delete(id)
      await fetchContratos()
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al eliminar el contrato')
    }
  }, [fetchContratos])

  const updateContrato = useCallback(async (id, data) => {
    try {
      await contratosService.update(id, data)
      await fetchContratos()
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al actualizar el contrato')
      throw err
    }
  }, [fetchContratos])

  return { contratos, loading, error, refetch: fetchContratos, deleteContrato, updateContrato }
}