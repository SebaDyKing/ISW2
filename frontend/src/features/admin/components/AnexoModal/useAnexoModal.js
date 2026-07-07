import { useState, useCallback, useEffect } from 'react'
import { contratosService } from '../../services/contrato.service'
import { getInstalaciones } from '../../services/admin.service'
import { generateAnexoPDF, generateAnexoMultiInstalacionPDF } from '../../utils/pdfGenerator'

export function useAnexoModal(contratoActual, { onSuccess } = {}) {
  const [tipoAnexo, setTipoAnexo] = useState('condiciones') // 'condiciones' | 'instalacion'
  
  const [form, setForm] = useState({
    // Condiciones
    sueldo: contratoActual.sueldo || '',
    cargo: contratoActual.cargo || '',
    jornadaHoras: contratoActual.jornadaHoras || '',
    fechaFin: contratoActual.periodoFin || '',
    // Instalacion
    idInstalacion: '',
    horasAdicionales: '',
    pagoAdicional: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [instalaciones, setInstalaciones] = useState([])
  const [loadingInstalaciones, setLoadingInstalaciones] = useState(false)

  // Cargar instalaciones si se elige esa opción
  useEffect(() => {
    if (tipoAnexo === 'instalacion' && instalaciones.length === 0) {
      setLoadingInstalaciones(true)
      getInstalaciones()
        .then(res => setInstalaciones(res.data || []))
        .catch(() => setError('Error al cargar las instalaciones'))
        .finally(() => setLoadingInstalaciones(false))
    }
  }, [tipoAnexo, instalaciones.length])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const submit = useCallback(async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      
      if (tipoAnexo === 'condiciones') {
        if (contratoActual.tipoContrato === 'Plazo Fijo' && !form.fechaFin) {
          throw new Error('Debe especificar la fecha de término para contratos a plazo fijo')
        }

        const payload = {
          sueldo: parseFloat(form.sueldo),
          cargo: form.cargo,
          jornadaHoras: parseInt(form.jornadaHoras, 10),
          tipo: contratoActual.tipoContrato,
          fechaInicio: new Date().toISOString().split('T')[0],
          fechaFin: form.fechaFin || null,
        }
        await contratosService.update(contratoActual.id, payload)
        await generateAnexoPDF(contratoActual, payload)
      } else {
        // Anexo Instalación
        if (!form.idInstalacion || !form.horasAdicionales) {
          throw new Error('Debe seleccionar instalación y horas')
        }
        const response = await contratosService.agregarInstalacion(
          contratoActual.id, 
          {
            idInstalacion: parseInt(form.idInstalacion, 10),
            horasSemanales: parseInt(form.horasAdicionales, 10),
            pagoAdicional: parseFloat(form.pagoAdicional) || 0
          }
        )
        // Generar PDF
        const instElegida = instalaciones.find(i => String(i.idInstalacion) === String(form.idInstalacion))
        const instPayload = {
          horasSemanales: parseInt(form.horasAdicionales, 10),
          pagoAdicional: parseFloat(form.pagoAdicional) || 0
        }
        await generateAnexoMultiInstalacionPDF(contratoActual, instPayload, instElegida)
      }

      onSuccess?.()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Error al generar el anexo')
    } finally {
      setLoading(false)
    }
  }, [form, tipoAnexo, contratoActual, instalaciones, onSuccess])

  return {
    tipoAnexo,
    setTipoAnexo,
    form,
    loading,
    error,
    handleChange,
    submit,
    instalaciones,
    loadingInstalaciones
  }
}
