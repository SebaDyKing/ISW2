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
      
      // Check if the response is actually a JSON error
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Error al descargar el documento');
      }

      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombreArchivo || 'documento.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al descargar el documento', err);
      setError(err.message || 'Error al descargar el documento. Es posible que el archivo físico ya no exista.');
    }
  }

  const verDocumento = async (idDocumento) => {
    try {
      const blob = await descargarDocumentoService(idDocumento);
      
      // Check if the response is actually a JSON error
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Error al abrir el documento');
      }

      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error al abrir el documento', err);
      setError(err.message || 'Error al abrir el documento. Es posible que el archivo físico ya no exista.');
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
