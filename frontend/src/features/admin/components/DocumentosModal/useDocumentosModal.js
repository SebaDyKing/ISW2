import { useState, useEffect } from 'react'
import { getDocumentosEmpleado } from '../../services/admin.service'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const BASE_URL = API_URL.replace('/api', '')

export function useDocumentosModal(idEmpleado, isOpen) {
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && idEmpleado) {
      setLoading(true)
      setError(null)
      getDocumentosEmpleado(idEmpleado)
        .then(res => setDocumentos(res.data || []))
        .catch(err => setError('Error al cargar la carpeta digital'))
        .finally(() => setLoading(false))
    }
  }, [isOpen, idEmpleado])

  return {
    documentos,
    loading,
    error,
    BASE_URL
  }
}
