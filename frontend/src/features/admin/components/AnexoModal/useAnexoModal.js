import { useState, useCallback } from 'react'
import { contratosService } from '../../services/contrato.service'
import { generateAnexoPDF } from '../../utils/pdfGenerator'

export function useAnexoModal(contratoActual, { onSuccess } = {}) {
  const [form, setForm] = useState({
    sueldo: contratoActual.sueldo || '',
    cargo: contratoActual.cargo || '',
    jornadaHoras: contratoActual.jornadaHoras || '',
    tipo: contratoActual.tipoContrato || '',
    fechaFin: contratoActual.periodoFin || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const submit = useCallback(async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      
      const payload = {
        sueldo: parseFloat(form.sueldo),
        cargo: form.cargo,
        jornadaHoras: parseInt(form.jornadaHoras, 10),
        tipo: form.tipo,
        fechaFin: form.fechaFin || null,
      }

      await contratosService.update(contratoActual.id, payload)
      
      // Generate PDF
      await generateAnexoPDF(contratoActual, payload)

      onSuccess?.()
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al crear el anexo')
    } finally {
      setLoading(false)
    }
  }, [form, contratoActual, onSuccess])

  return {
    form,
    loading,
    error,
    handleChange,
    submit,
  }
}
