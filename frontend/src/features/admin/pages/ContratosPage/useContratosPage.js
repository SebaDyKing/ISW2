import { useState, useMemo, useCallback } from 'react'
import { useContratos } from '../../hooks/useContratos'

export function useContratosPage() {
  const { contratos, loading, error, refetch, deleteContrato } = useContratos()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showTrasladoModal, setShowTrasladoModal] = useState(false)
  const [showAnexoModal, setShowAnexoModal] = useState(false)
  const [selectedContratoForAnexo, setSelectedContratoForAnexo] = useState(null)

  const contratosFiltrados = useMemo(() => {
    if (!search) return contratos
    const term = search.toLowerCase()
    return contratos.filter((c) =>
      c.nombre.toLowerCase().includes(term) ||
      c.rut.toLowerCase().includes(term) ||
      c.instalacion?.toLowerCase().includes(term)
    )
  }, [contratos, search])

  const alertaTrabajador = useMemo(() => {
    return contratos.find(c => c.tieneAlerta) || null
  }, [contratos])

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este contrato? Esta acción no se puede deshacer.')) {
      try {
        await deleteContrato(id)
      } catch (err) {
        console.error('Error al eliminar contrato:', err)
        alert('Hubo un error al intentar eliminar el contrato.')
      }
    }
  }, [deleteContrato])

  return {
    contratosFiltrados,
    alertaTrabajador,
    loading,
    error,
    search,
    setSearch,
    showModal,
    setShowModal,
    showTrasladoModal,
    setShowTrasladoModal,
    showAnexoModal,
    setShowAnexoModal,
    selectedContratoForAnexo,
    setSelectedContratoForAnexo,
    refetch,
    handleDelete
  }
}
