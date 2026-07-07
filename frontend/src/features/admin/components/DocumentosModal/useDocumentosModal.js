import { useState, useEffect } from 'react'
import { getDocumentosEmpleado, descargarDocumentoService } from '../../services/admin.service'

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

  const descargarDocumento = async (idDocumento, nombreArchivo) => {
    try {
      const res = await descargarDocumentoService(idDocumento);
      const blob = res.data;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo || 'documento.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error al descargar el documento', err);
      // Opcional: mostrar un toast de error
    }
  }

  return {
    documentos,
    loading,
    error,
    BASE_URL,
    descargarDocumento
  }
}
