import { useState, useCallback } from 'react';
import { contratosService } from '../../services/contrato.service';
import { toast } from 'react-hot-toast';

export function useAdministrarInstalacionesModal({ contrato, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  
  // Como `contrato` ya viene mapeado desde `useContratos` y lamentablemente el mapeo
  // a veces borra la data completa de `contratoInstalaciones` si no se mapeó completa,
  // idealmente usaremos las instalaciones completas o pediremos recargar.
  // Asumimos que `contrato.contratoInstalacionesData` se agregó en useContratos, o hacemos un fetch.
  
  const handleRemove = useCallback(async (idInstalacion) => {
    if (!window.confirm("¿Estás seguro de que deseas desasignar esta instalación?")) {
      return;
    }

    try {
      setLoading(true);
      await contratosService.removerInstalacion(contrato.id, idInstalacion);
      toast.success("Instalación desasignada correctamente");
      onRefresh(); // Recargar los contratos para refrescar la lista
      
      // Si solo quedaba 1 instalación después de borrar, igual la tabla se actualiza.
      // Opcional: Cerrar si se queda sin locales o manejarlo de otra forma.
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error al desasignar la instalación");
    } finally {
      setLoading(false);
    }
  }, [contrato, onRefresh]);

  return {
    loading,
    handleRemove
  };
}
