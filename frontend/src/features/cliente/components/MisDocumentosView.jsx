import React, { useEffect, useState } from "react";
import { obtenerMisDocumentosClienteService, descargarDocumentoClienteService, firmarDocumentoClienteService } from "../services/cliente.service";
import { toast } from "react-hot-toast";
import FirmaDocumentoModal from "../../empleado/components/FirmaDocumentoModal";

export default function MisDocumentosView() {
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [documentoAFirmar, setDocumentoAFirmar] = useState(null);

  async function cargarDatos() {
    try {
      const res = await obtenerMisDocumentosClienteService();
      // res.data trae la lista de documentos
      setDocumentos(res.data || []);
    } catch (error) {
      toast.error("Error al cargar la carpeta digital");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleVerDocumento = async (idDocumento) => {
    try {
      const blob = await descargarDocumentoClienteService(idDocumento);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (error) {
      toast.error("Error al abrir el documento");
    }
  };

  const handleGuardarFirma = async (firmaBase64) => {
    try {
      await firmarDocumentoClienteService(documentoAFirmar.idDocumento, firmaBase64);
      toast.success("Documento firmado exitosamente");
      setDocumentoAFirmar(null);
      cargarDatos();
    } catch (error) {
      toast.error("Error al firmar el documento");
      throw error;
    }
  };

  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 flex justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mis Contratos</h1>
        <p className="text-sm text-slate-500 mt-1">
          Revisa y descarga tus contratos y documentos generados por la empresa.
        </p>
      </header>

      {documentos.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl px-6 py-12 text-center flex flex-col items-center">
          <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-slate-700 font-medium mb-1">Sin documentos</h3>
          <p className="text-slate-500 text-sm">No tienes contratos ni documentos generados aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Fecha de Creación</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documentos.map((doc) => (
                <tr key={doc.idDocumento} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {doc.tipo.replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(doc.fechaCreacion).toLocaleDateString('es-CL', {
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {doc.estadoFirma === 'FIRMADO' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Firmado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {doc.estadoFirma === 'PENDIENTE' && (
                        <button
                          onClick={() => setDocumentoAFirmar(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 font-semibold rounded-lg transition-colors border border-transparent hover:border-emerald-100 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Firmar
                        </button>
                      )}
                      <button
                        onClick={() => handleVerDocumento(doc.idDocumento)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg transition-colors border border-transparent hover:border-indigo-100 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
