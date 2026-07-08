import { useState, useEffect } from 'react'
import { getDocumentosEmpleado, getDocumentosCliente, descargarDocumentoService } from '../../services/admin.service'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
const BASE_URL = API_URL.replace('/api', '')

export function useDocumentosModal(contrato, isOpen) {
  const [documentos, setDocumentos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && contrato) {
      setLoading(true)
      setError(null)
      
      const isCliente = contrato.originalUsuario?.rol === 'cliente';
      const idUsuarioRef = isCliente ? contrato.originalUsuario.cliente?.idCliente : contrato.idEmpleado;

      const fetchPromise = isCliente 
        ? getDocumentosCliente(idUsuarioRef)
        : getDocumentosEmpleado(idUsuarioRef);

      fetchPromise
        .then(res => setDocumentos(res.data || []))
        .catch(err => setError('Error al cargar la carpeta digital'))
        .finally(() => setLoading(false))
    }
  }, [isOpen, contrato])

  const descargarDocumento = async (idDocumento, nombreArchivo) => {
    try {
      const blob = await descargarDocumentoService(idDocumento);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo || 'documento.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al descargar el documento', err);
      // Opcional: mostrar un toast de error
    }
  }

  const verDocumento = async (idDocumento) => {
    try {
      const blob = await descargarDocumentoService(idDocumento);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error al abrir el documento', err);
    }
  }

  return {
    documentos,
    loading,
    error,
    BASE_URL,
    descargarDocumento,
    verDocumento
  }
}
