import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useContratos } from '../../hooks/useContratos'
import { generateAnexoIndefinidoPDF } from '../../utils/pdfGenerator'

export function useContratosPage() {
  const { contratos, loading, error, refetch, updateContrato } = useContratos()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const [search, setSearch] = useState(initialSearch)
  const [showModal, setShowModal] = useState(false)
  const [showTrasladoModal, setShowTrasladoModal] = useState(false)
  const [showAnexoModal, setShowAnexoModal] = useState(false)
  const [selectedContratoForAnexo, setSelectedContratoForAnexo] = useState(null)
  
  const [showFiniquitoModal, setShowFiniquitoModal] = useState(false)
  const [selectedContratoForFiniquito, setSelectedContratoForFiniquito] = useState(null)
  const [isFiniquitando, setIsFiniquitando] = useState(false)

  const [showIndefinidoModal, setShowIndefinidoModal] = useState(false)
  const [selectedContratoForIndefinido, setSelectedContratoForIndefinido] = useState(null)
  const [isAscendiendo, setIsAscendiendo] = useState(false)

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



  const handleFiniquitar = useCallback(async (id, fechaFin) => {
    try {
      setIsFiniquitando(true)
      await updateContrato(id, { fechaFin, estado: 'FINALIZADO' })
      setShowFiniquitoModal(false)
      setSelectedContratoForFiniquito(null)
    } catch (err) {
      console.error('Error al finiquitar contrato:', err)
      alert('Hubo un error al intentar finiquitar el contrato.')
    } finally {
      setIsFiniquitando(false)
    }
  }, [updateContrato])

  const handlePasoAIndefinido = useCallback(async (contrato) => {
    try {
      setIsAscendiendo(true)
      
      // Mock empresa and representante since we don't have global state for it right now
      const empresa = { razonSocial: 'Mi Empresa SpA', rut: '76.123.456-7' }
      const representante = { nombre: 'Juan Pérez', rut: '15.234.567-8' }
      
      // 1. Generate PDF
      await generateAnexoIndefinidoPDF(contrato, empresa, representante)
      
      // 2. Update DB
      await updateContrato(contrato.id, { tipo: 'Indefinido', fechaFin: null })
      
      setShowIndefinidoModal(false)
      setSelectedContratoForIndefinido(null)
    } catch (err) {
      console.error('Error al ascender a indefinido:', err)
      alert('Hubo un error: ' + (err?.message || 'Revisa la consola para más detalles.'))
    } finally {
      setIsAscendiendo(false)
    }
  }, [updateContrato])

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
    showFiniquitoModal,
    setShowFiniquitoModal,
    selectedContratoForFiniquito,
    setSelectedContratoForFiniquito,
    isFiniquitando,
    handleFiniquitar,
    showIndefinidoModal,
    setShowIndefinidoModal,
    selectedContratoForIndefinido,
    setSelectedContratoForIndefinido,
    isAscendiendo,
    handlePasoAIndefinido,
    refetch
  }
}
