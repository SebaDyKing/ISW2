import React, { useEffect, useState, useMemo } from "react";
import { obtenerMisDocumentosClienteService, descargarDocumentoClienteService, firmarDocumentoClienteService } from "../services/cliente.service";
import { obtenerMisAsignacionesService } from "../../empleado/services/asignacion.service";
import { toast } from "react-hot-toast";
import FirmaDocumentoModal from "../../empleado/components/FirmaDocumentoModal";

export default function MisDocumentosView() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [documentoAFirmar, setDocumentoAFirmar] = useState(null);

  async function cargarDatos() {
    try {
      const [resDoc, resAsig] = await Promise.all([
        obtenerMisDocumentosClienteService(),
        obtenerMisAsignacionesService()
      ]);
      setDocumentos(resDoc || []);
      setAsignaciones(resAsig.data || []);
    } catch (error) {
      toast.error("Error al cargar los datos");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const ordenEstados = { "PENDIENTE DE FIRMA": 1, "ACTIVO": 2, "FINALIZADO": 3 };

  const asignacionesOrdenadas = useMemo(() => {
    return [...asignaciones].sort((a, b) => {
      const ordenA = ordenEstados[a.estado] || 99;
      const ordenB = ordenEstados[b.estado] || 99;
      if (ordenA !== ordenB) return ordenA - ordenB;
      return new Date(b.fechaInicio) - new Date(a.fechaInicio);
    });
  }, [asignaciones]);

  const handleVerDocumento = async (idDocumento) => {
    try {
      const blob = await descargarDocumentoClienteService(idDocumento);
      
      if (blob.type === 'application/json') {
        const text = await blob.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Error al abrir el documento');
      }

      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error) {
      toast.error(error.message || "Error al abrir el documento");
    }
  };

  const handleGuardarFirma = async (firmaBase64) => {
    try {
      await firmarDocumentoClienteService(documentoAFirmar.idDocumento, firmaBase64);
      toast.success("Documento firmado exitosamente");
      setDocumentoAFirmar(null);
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al firmar el documento");
      throw error;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Indefinida";
    return new Date(dateStr).toLocaleDateString("es-CL");
  };

  // Función heurística para encontrar el documento relacionado al contrato
  // Para los contratos comerciales, suele haber 1 documento principal.
  const encontrarDocumentoRelacionado = (contrato) => {
    // Si el contrato está pendiente, buscamos un documento pendiente de firma
    if (contrato.estado === "PENDIENTE DE FIRMA") {
      const docPd = documentos.find(d => d.estadoFirma === "PENDIENTE");
      if (docPd) return docPd;
    }
    // Si está activo o finalizado, buscamos el documento firmado más reciente,
    // o simplemente el primer documento que tengamos si solo hay uno (ya que es la vista del cliente).
    // Idealmente buscaríamos por fecha cercana a fechaInicio, pero como la relación es 1 a 1 en la mayoría de los casos de clientes, devolvemos el primero firmado.
    const docFirm = documentos.find(d => d.estadoFirma === "FIRMADO");
    return docFirm || documentos[0];
  };

  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 flex justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mis Documentos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Revisa tus contratos activos, finalizados y los que están pendientes por firmar.
        </p>
      </header>

      {asignacionesOrdenadas.length === 0 ? (
        <div className="w-full bg-white border border-dashed border-slate-300 rounded-xl px-6 py-12 text-center flex flex-col items-center">
          <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-slate-700 font-medium mb-1">Sin contratos</h3>
          <p className="text-slate-500 text-sm">No tienes contratos vigentes ni finalizados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Servicio e Instalación</th>
                <th className="px-6 py-4">Monto / Condición</th>
                <th className="px-6 py-4">Periodo</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {asignacionesOrdenadas.map((c) => {
                const isActivo = c.estado === "ACTIVO";
                const isPorVencer = c.estado === "POR VENCER";
                const isFinalizado = c.estado === "FINALIZADO";
                const isPendiente = c.estado === "PENDIENTE DE FIRMA";

                let badgeClasses = "bg-slate-100 text-slate-600";
                if (isActivo) badgeClasses = "bg-emerald-100 text-emerald-700";
                else if (isPorVencer) badgeClasses = "bg-amber-100 text-amber-700";
                else if (isFinalizado) badgeClasses = "bg-rose-100 text-rose-700";
                else if (isPendiente) badgeClasses = "bg-blue-100 text-blue-700";

                const instalacion = c.contratoInstalaciones?.[0]?.instalacion;
                const docRelacionado = encontrarDocumentoRelacionado(c);

                return (
                  <tr key={c.idContrato} className={`hover:bg-slate-50/50 transition-colors ${isPendiente ? "bg-blue-50/20" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{c.descripcionServicio || c.tipo}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {instalacion?.nombre || "Instalación Desconocida"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">${Number(c.montoServicio).toLocaleString("es-CL")}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{c.condicionPago || "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700">{formatDate(c.fechaInicio)}</div>
                      <div className="text-xs text-slate-500 mt-0.5">hasta {formatDate(c.fechaFin)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${badgeClasses}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {docRelacionado && isPendiente && docRelacionado.estadoFirma === "PENDIENTE" && (
                          <button
                            onClick={() => setDocumentoAFirmar(docRelacionado)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Firmar
                          </button>
                        )}
                        {docRelacionado && (
                          <button
                            onClick={() => handleVerDocumento(docRelacionado.idDocumento)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <FirmaDocumentoModal 
        isOpen={!!documentoAFirmar}
        onClose={() => setDocumentoAFirmar(null)}
        onFirmar={handleGuardarFirma}
      />
    </div>
  );
}
