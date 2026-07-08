import { useState, useEffect, useCallback } from 'react'
import { contratosService } from '../../services/contrato.service'
import { obtenerClientesService, getEmpleados, getInstalaciones } from '../../services/admin.service'
import { generateContractPDF } from '../../utils/pdfGenerator'

const INITIAL_FORM = {
  tipoContratoPadre: 'Laboral', // 'Laboral' | 'Comercial'
  idEmpleado: '',
  idCliente: '',
  tipo: '',
  cargo: '',
  sueldo: '',
  montoServicio: '',
  jornadaHoras: '',
  fechaInicio: '',
  fechaFin: '',
  nacionalidad: '',
  estadoCivil: '',
  fechaNacimiento: '',
  domicilio: '',
  idInstalacion: '',
  descripcionServicio: '',
  condicionPago: '',
}

export function useNuevoContratoModal({ onSuccess, defaultUser } = {}) {
  const [form, setForm] = useState({
    ...INITIAL_FORM,
    tipoContratoPadre: defaultUser?.rol === 'cliente' ? 'Comercial' : 'Laboral',
    idEmpleado: defaultUser?.empleado?.idEmpleado || '',
    idCliente: defaultUser?.cliente?.idCliente || '',
  })
  const [empleados, setEmpleados] = useState([])
  const [clientes, setClientes] = useState([])
  const [instalaciones, setInstalaciones] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [error, setError] = useState(null)

  // Carga los selects al montar
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true)
        const [empRes, cliRes, instRes] = await Promise.all([
          getEmpleados(),
          obtenerClientesService(),
          getInstalaciones()
        ])
        setEmpleados(empRes.data)
        setClientes(cliRes.data)
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
      let payload = {
        ...form,
        estado: 'ACTIVO',
        fechaFin: form.fechaFin || null,
        nacionalidad: form.nacionalidad || null,
        estadoCivil: form.estadoCivil || null,
        fechaNacimiento: form.fechaNacimiento || null,
        domicilio: form.domicilio,
        idInstalacion: form.idInstalacion ? parseInt(form.idInstalacion, 10) : null,
      }

      if (form.tipoContratoPadre === 'Laboral') {
        if (!form.idInstalacion) {
          setError('La instalación es obligatoria para contratos laborales');
          setLoading(false);
          return;
        }
        payload.idEmpleado = parseInt(form.idEmpleado, 10)
        payload.sueldo = parseFloat(form.sueldo)
        payload.jornadaHoras = parseInt(form.jornadaHoras, 10)
      } else {
        payload.idCliente = parseInt(form.idCliente, 10)
        payload.montoServicio = parseFloat(form.montoServicio)
        payload.cargo = 'Cliente' // Ensure cargo is Cliente
        payload.tipo = 'Prestación de Servicios' // Commercial contracts use this tipo
        payload.descripcionServicio = form.descripcionServicio
        payload.condicionPago = form.condicionPago
      }

      await contratosService.create(payload)

      if (form.tipoContratoPadre === 'Laboral') {
        const employeeData = empleados.find(e => String(e.idEmpleado) === String(form.idEmpleado))
        const facilityData = instalaciones.find(i => String(i.idInstalacion) === String(form.idInstalacion))
        await generateContractPDF(form, employeeData, facilityData)
      } else {
        const clientData = clientes.find(c => String(c.idCliente) === String(form.idCliente))
        const facilityData = instalaciones.find(i => String(i.idInstalacion) === String(form.idInstalacion))
        await generateContractPDF(form, clientData, facilityData)
      }

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
    clientes,
    instalaciones,
    loading,
    loadingOptions,
    error,
    handleChange,
    submit,
    reset,
  }
}