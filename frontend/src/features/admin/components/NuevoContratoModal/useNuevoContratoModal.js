import { useState, useEffect, useCallback } from 'react'
import { contratosService } from '../../services/contrato.service'
import { getEmpleados, getInstalaciones } from '../../services/admin.service'
import { generateContractPDF } from '../../utils/pdfGenerator'

const INITIAL_FORM = {
  idEmpleado: '',
  tipo: '',
  cargo: '',
  sueldo: '',
  jornadaHoras: '',
  fechaInicio: '',
  fechaFin: '',
  nacionalidad: '',
  estadoCivil: '',
  fechaNacimiento: '',
  domicilio: '',
  idInstalacion: '',
}

export function useNuevoContratoModal({ onSuccess, defaultUser } = {}) {
  const [form, setForm] = useState({
    ...INITIAL_FORM,
    idEmpleado: defaultUser?.empleado?.idEmpleado || ''
  })
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
          getEmpleados(),
          getInstalaciones()
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
        fechaFin: form.fechaFin || null,               // opcional
        nacionalidad: form.nacionalidad,
        estadoCivil: form.estadoCivil,
        fechaNacimiento: form.fechaNacimiento,
        domicilio: form.domicilio,
        idInstalacion: form.idInstalacion ? parseInt(form.idInstalacion, 10) : null,
      })
      const employeeData = empleados.find(e => String(e.idEmpleado) === String(form.idEmpleado))
      const facilityData = instalaciones.find(i => String(i.idInstalacion) === String(form.idInstalacion))
      
      // Generar PDF (facilityData puede pasarse vacío ahora que no se asocia a instalación en contrato)
      await generateContractPDF(form, employeeData, facilityData)

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