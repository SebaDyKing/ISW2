import { useState, useCallback, useEffect } from 'react'
import { contratosService } from '../../services/contrato.service'
import api from '../../../../config/axios'
import { generateAnexoMultiInstalacionPDF } from '../../utils/pdfGenerator'

export function useAnexoInstalacionModal(contrato, { onSuccess } = {}) {
  const [instalaciones, setInstalaciones] = useState([])
  const [form, setForm] = useState({
    idInstalacion: '',
    horasSemanales: '',
    pagoAdicional: '0'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInstalaciones = async () => {
      try {
        const res = await api.get('/instalaciones');
        setInstalaciones(res.data || []);
      } catch (err) {
        console.error("Error fetching instalaciones", err);
      }
    };
    fetchInstalaciones();
  }, []);

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
        idInstalacion: parseInt(form.idInstalacion, 10),
        horasSemanales: parseInt(form.horasSemanales, 10),
        pagoAdicional: parseFloat(form.pagoAdicional) || 0,
      }

      const res = await contratosService.agregarInstalacion(contrato.id, payload)
      
      const instalacionElegida = instalaciones.find(i => i.idInstalacion === payload.idInstalacion);
      
      // Generate PDF
      await generateAnexoMultiInstalacionPDF(contrato, payload, instalacionElegida)

      onSuccess?.()
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al crear el anexo de instalación')
    } finally {
      setLoading(false)
    }
  }, [form, contrato, onSuccess, instalaciones])

  return {
    form,
    loading,
    error,
    instalaciones,
    handleChange,
    submit,
  }
}
