import { useState, useEffect } from 'react';
import api from '../../../../config/axios';

export function useSolicitudTrasladoModal({ contrato, onSuccess }) {
  const [instalaciones, setInstalaciones] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  const [form, setForm] = useState({
    idInstalacion: '',
    motivo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const resInstalaciones = await api.get('/instalaciones');
      
      const instalacionesActuales = (contrato.contratoInstalacionesData || [])
        .map(ci => ci.instalacion?.idInstalacion);

      const instalacionesFiltradas = resInstalaciones.data?.filter(
        inst => !instalacionesActuales.includes(inst.idInstalacion)
      ) || [];

      setInstalaciones(instalacionesFiltradas);
    } catch (err) {
      console.error('Error fetching options:', err);
      setError('Error al cargar opciones');
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.idInstalacion) {
      setError('Debes seleccionar una instalación de destino');
      return;
    }
    if (!form.motivo.trim()) {
      setError('Debes proporcionar un motivo');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.post(`/contratos/${contrato.idContrato || contrato.id}/solicitar-traslado`, {
        idInstalacion: form.idInstalacion,
        motivo: form.motivo
      });

      onSuccess?.();
    } catch (err) {
      console.error('Error al solicitar traslado:', err);
      setError(err.response?.data?.message || 'Error al solicitar el traslado');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    instalaciones,
    loading,
    loadingOptions,
    error,
    handleChange,
    submit,
  };
}
