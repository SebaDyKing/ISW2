import { useState, useMemo } from 'react'
import { useContratos } from '../../hooks/useContratos'

export function useContratosPage() {
  const { contratos, loading, error, refetch } = useContratos()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const contratosFiltrados = useMemo(() => {
    if (!search) return contratos
    const q = search.toLowerCase()
    return contratos.filter((c) =>
      c.nombre?.toLowerCase().includes(q) ||
      c.rut?.includes(q) ||
      c.instalacion?.toLowerCase().includes(q)
    )
  }, [contratos, search])

  const alertaTrabajador = useMemo(
    () => contratos.find((c) => c.tieneAlerta) ?? null,
    [contratos]
  )

  return {
    contratos,
    contratosFiltrados,
    alertaTrabajador,
    loading,
    error,
    search,
    setSearch,
    showModal,
    setShowModal,
    refetch
  }
}
