import { useState, useEffect, useCallback } from 'react'
import { contratosService } from '../services/contratosService'

const INITIAL_FORM = {
  idEmpleado: '',
  idInstalacion: '',
  tipo: '',
  cargo: '',
  sueldo: '',
  jornadaHoras: '',
  fechaInicio: '',
  fechaFin: '',
}

export function useNuevoContrato({ onSuccess } = {}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [empleados, setEmpleados] = useState([])
  const [instalaciones, setInstalaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [error, setError] = useState(null)

  // Carga los selects al montar
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true)
        const [empRes, instRes] = await Promise.all([
      
        ])
        setEmpleados(empRes.data)
        setInstalaciones(instRes.data)
      } catch {
        setError('Error al cargar opciones del formulario')
      } finally {
        setLoadingOptions(false)
      }
    }
    fetchOptions()
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const reset = useCallback(() => {
    setForm(INITIAL_FORM)
    setError(null)
  }, [])

  const submit = useCallback(async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      await contratosService.create({
        ...form,
        estado: 'ACTIVO',                              // el backend podría ignorarlo si lo setea él
        sueldo: parseFloat(form.sueldo),
        jornadaHoras: parseInt(form.jornadaHoras, 10),
        idEmpleado: parseInt(form.idEmpleado, 10),
        idInstalacion: parseInt(form.idInstalacion, 10),
        fechaFin: form.fechaFin || null,               // opcional
      })
      reset()
      onSuccess?.()
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al crear el contrato')
    } finally {
      setLoading(false)
    }
  }, [form, onSuccess, reset])

  return {
    form,
    empleados,
    instalaciones,
    loading,
    loadingOptions,
    error,
    handleChange,
    submit,
    reset,
  }
}