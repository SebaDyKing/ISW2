import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { obtenerMisCotizacionesService } from "../services/cliente.service";
import toast from "react-hot-toast";
import ModalCotizacion from "./ModalCotizacion";

// Iconos
function IconRefresh() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2v6h-6"></path>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
      <path d="M3 22v-6h6"></path>
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const ESTADOS_MAP = {
  Pendiente: { bg: "#fef3c7", text: "#b45309" },
  Aprobada: { bg: "#dcfce7", text: "#15803d" },
  Rechazada: { bg: "#fee2e2", text: "#b91c1c" },
};

function MisCotizacionesView() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  
  const [mostrarModalNueva, setMostrarModalNueva] = useState(false);
  const [planParaModal, setPlanParaModal] = useState(null);

  const cargarCotizaciones = async () => {
    setCargando(true);
    try {
      const data = await obtenerMisCotizacionesService();
      // Ordenar por fecha descendente
      const ordenadas = data.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
      setCotizaciones(ordenadas);
    } catch (error) {
      toast.error("Error al cargar tus cotizaciones.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCotizaciones();
    
    // Si venimos de la LandingPage con intención de cotizar
    if (location.state?.abrirModal) {
      setPlanParaModal(location.state.idPlan || null);
      setMostrarModalNueva(true);
      // Limpiar el estado para que al recargar no se vuelva a abrir
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleCerrarModalNueva = (recargar) => {
    setMostrarModalNueva(false);
    setPlanParaModal(null);
    if (recargar) {
      cargarCotizaciones();
    }
  };

  const formatearFecha = (isoString) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Mis Cotizaciones</h1>
          <p className="text-sm text-slate-500 mt-1">Revisa el estado de tus solicitudes de servicio.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMostrarModalNueva(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            + Nueva Cotización
          </button>
          <button
            onClick={cargarCotizaciones}
            disabled={cargando}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 shadow-sm"
          >
            <IconRefresh />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Instalación</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-sm text-slate-400">
                    Cargando información...
                  </td>
                </tr>
              ) : cotizaciones.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <p className="text-sm text-slate-500 font-medium">No tienes cotizaciones registradas</p>
                    <p className="text-xs text-slate-400 mt-1">Puedes solicitar una desde la sección "Solicitar Cotización".</p>
                  </td>
                </tr>
              ) : (
                cotizaciones.map((cotizacion) => {
                  const est = ESTADOS_MAP[cotizacion.estado] || { bg: "#f1f5f9", text: "#475569" };
                  return (
                    <tr key={cotizacion.idSolicitud} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                        {formatearFecha(cotizacion.fechaCreacion)}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-900 font-medium whitespace-nowrap">
                        {cotizacion.plan?.nombre || `Plan ${cotizacion.plan?.tipo}`}
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 whitespace-nowrap">
                        {cotizacion.instalacion?.nombre || "Nueva ubicación (Sin asignar)"}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ backgroundColor: est.bg, color: est.text }}
                        >
                          {cotizacion.estado}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setCotizacionSeleccionada(cotizacion)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          <IconEye />
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle */}
      {cotizacionSeleccionada && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">Detalle de Cotización</h2>
              <button
                onClick={() => setCotizacionSeleccionada(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <IconClose />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Plan Solicitado</h3>
                  <p className="text-sm font-medium text-slate-900">{cotizacionSeleccionada.plan?.nombre || `Plan ${cotizacionSeleccionada.plan?.tipo}`}</p>
                </div>
                
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Instalación Asociada</h3>
                  <p className="text-sm text-slate-700">{cotizacionSeleccionada.instalacion?.nombre || "Nueva ubicación (Sin asignar)"}</p>
                  {cotizacionSeleccionada.instalacion?.direccion && (
                    <p className="text-xs text-slate-500 mt-0.5">{cotizacionSeleccionada.instalacion.direccion}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fecha de Solicitud</h3>
                    <p className="text-sm text-slate-700">{formatearFecha(cotizacionSeleccionada.fechaCreacion)}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Estado</h3>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium mt-0.5"
                      style={{
                        backgroundColor: ESTADOS_MAP[cotizacionSeleccionada.estado]?.bg || "#f1f5f9",
                        color: ESTADOS_MAP[cotizacionSeleccionada.estado]?.text || "#475569"
                      }}
                    >
                      {cotizacionSeleccionada.estado}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Medio de Contacto Preferido</h3>
                  <p className="text-sm text-slate-700">{cotizacionSeleccionada.medioContacto || "No especificado"}</p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Comentarios Adicionales</h3>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {cotizacionSeleccionada.comentarios || "Sin comentarios adicionales."}
                    </p>
                  </div>
                </div>
                
                {/* Si hay un motivo de rechazo desde el backend, mostrarlo */}
                {cotizacionSeleccionada.motivo && cotizacionSeleccionada.estado === "Rechazada" && (
                  <div>
                    <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Motivo de Rechazo</h3>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <p className="text-sm text-red-700 whitespace-pre-wrap">
                        {cotizacionSeleccionada.motivo}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setCotizacionSeleccionada(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalNueva && (
        <ModalCotizacion
          planPreseleccionado={planParaModal}
          onClose={handleCerrarModalNueva}
        />
      )}
    </div>
  );
}

export default MisCotizacionesView;
