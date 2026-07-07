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
  const [selectedUsuarioForNuevoContrato, setSelectedUsuarioForNuevoContrato] = useState(null)
  const [showTrasladoModal, setShowTrasladoModal] = useState(false)
  const [showSolicitudTrasladoModal, setShowSolicitudTrasladoModal] = useState(false)
  const [selectedContratoForSolicitudTraslado, setSelectedContratoForSolicitudTraslado] = useState(null)
  const [showAnexoModal, setShowAnexoModal] = useState(false)
  const [selectedContratoForAnexo, setSelectedContratoForAnexo] = useState(null)
  
  const [showFiniquitoModal, setShowFiniquitoModal] = useState(false)
  const [selectedContratoForFiniquito, setSelectedContratoForFiniquito] = useState(null)
  const [isFiniquitando, setIsFiniquitando] = useState(false)

  const [showIndefinidoModal, setShowIndefinidoModal] = useState(false)
  const [selectedContratoForIndefinido, setSelectedContratoForIndefinido] = useState(null)
  const [isAscendiendo, setIsAscendiendo] = useState(false)

  const [showAdministrarInstalacionesModal, setShowAdministrarInstalacionesModal] = useState(false)
  const [selectedContratoForInstalaciones, setSelectedContratoForInstalaciones] = useState(null)

  const [showDocumentosModal, setShowDocumentosModal] = useState(false)
  const [selectedContratoForDocumentos, setSelectedContratoForDocumentos] = useState(null)

  const [roleFilter, setRoleFilter] = useState('')

  const contratosFiltrados = useMemo(() => {
    let filtered = contratos;
    
    if (roleFilter) {
      filtered = filtered.filter(c => c.rolSistema === roleFilter);
    }

    if (search) {
      const term = search.toLowerCase()
      filtered = filtered.filter((c) =>
        c.nombre.toLowerCase().includes(term) ||
        c.rut.toLowerCase().includes(term) ||
        c.instalacion?.toLowerCase().includes(term)
      )
    }

    return filtered;
  }, [contratos, search, roleFilter])

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

  const handleOpenDocumentos = useCallback((contrato) => {
    setSelectedContratoForDocumentos(contrato)
    setShowDocumentosModal(true)
  }, [])

  return {
    contratos: contratosFiltrados,
    loading,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    showModal,
    setShowModal,
    selectedUsuarioForNuevoContrato,
    setSelectedUsuarioForNuevoContrato,
    showTrasladoModal,
    setShowTrasladoModal,
    showSolicitudTrasladoModal,
    setShowSolicitudTrasladoModal,
    selectedContratoForSolicitudTraslado,
    setSelectedContratoForSolicitudTraslado,
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
    showAdministrarInstalacionesModal,
    setShowAdministrarInstalacionesModal,
    selectedContratoForInstalaciones,
    setSelectedContratoForInstalaciones,
    alertaTrabajador,
    refetch,
    showDocumentosModal,
    setShowDocumentosModal,
    selectedContratoForDocumentos,
    handleOpenDocumentos,
  }
}
