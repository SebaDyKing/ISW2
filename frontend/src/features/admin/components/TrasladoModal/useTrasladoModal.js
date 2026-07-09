import { useState, useEffect, useCallback } from 'react'
import { trasladarEmpleado, getEmpleados, getInstalaciones } from '../../services/admin.service'
import { generateAnexoTrasladoPDF } from '../../utils/pdfGenerator'

const INITIAL_FORM = {
  idEmpleado: '',
  idInstalacion: '',
}

export function useTrasladoModal({ onSuccess, defaultEmpleadoId, contrato } = {}) {
  const [form, setForm] = useState({
    ...INITIAL_FORM,
    idEmpleado: defaultEmpleadoId || '',
  })
  const [empleados, setEmpleados] = useState([])
  const [instalaciones, setInstalaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (defaultEmpleadoId) {
      setForm(prev => ({ ...prev, idEmpleado: defaultEmpleadoId }))
    }
  }, [defaultEmpleadoId])

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

  const instalacionesFiltradas = instalaciones.filter((inst) => {
    if (!form.idEmpleado) return true;
    
    // Si tenemos el contrato preseleccionado, usamos sus instalaciones actuales
    if (contrato && String(contrato.idEmpleado) === String(form.idEmpleado)) {
      const instalacionesActuales = (contrato.contratoInstalacionesData || [])
        .map(ci => ci.instalacion?.idInstalacion);
      return !instalacionesActuales.includes(inst.idInstalacion);
    }
    
    // Fallback: Si no tenemos el contrato (ej. se cambió el empleado manualmente)
    const empId = parseInt(form.idEmpleado, 10);
    const empleado = empleados.find(e => e.idEmpleado === empId);
    if (!empleado) return true;
    
    const currentInstalacionId = empleado.instalacion?.idInstalacion;
    return inst.idInstalacion !== currentInstalacionId;
  });

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
      await trasladarEmpleado(form.idEmpleado, form.idInstalacion)

      const empId = parseInt(form.idEmpleado, 10)
      const instId = parseInt(form.idInstalacion, 10)
      
      const empleado = empleados.find(e => e.idEmpleado === empId) || {}
      
      // Obtener instalación anterior (la que tiene el empleado actualmente)
      const instAnteriorId = empleado?.instalacion?.idInstalacion
      const instalacionAnterior = instalaciones.find(i => i.idInstalacion === instAnteriorId) || null
      
      // Obtener nueva instalación
      const instalacionNueva = instalaciones.find(i => i.idInstalacion === instId) || null
      
      // Asegurarnos de que tenemos los datos del usuario
      const empleadoCompleto = {
        ...empleado,
        nombre: empleado.nombre || '',
        apellido: empleado.apellido || ''
      }

      await generateAnexoTrasladoPDF(empleadoCompleto, instalacionAnterior, instalacionNueva)

      reset()
      onSuccess?.()
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Error al trasladar el empleado')
    } finally {
      setLoading(false)
    }
  }, [form, onSuccess, reset])

  return {
    form,
    empleados,
    instalaciones,
    instalacionesFiltradas,
    loading,
    loadingOptions,
    error,
    handleChange,
    submit,
    reset,
  }
}
