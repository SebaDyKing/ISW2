import React, { useEffect, useState } from "react";
import { obtenerMisDocumentosService } from "../services/empleado.service";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const BASE_URL = API_URL.replace('/api', '');

export default function MisDocumentosView() {
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);

  async function cargarDatos() {
    try {
      const res = await obtenerMisDocumentosService();
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
        <h1 className="text-2xl font-bold text-slate-900">Carpeta Digital</h1>
        <p className="text-sm text-slate-500 mt-1">
          Revisa y descarga tus contratos y anexos generados por la empresa.
        </p>
      </header>

      {documentos.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl px-6 py-12 text-center flex flex-col items-center">
          <svg className="w-12 h-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-slate-700 font-medium mb-1">Sin documentos</h3>
          <p className="text-slate-500 text-sm">No tienes contratos ni anexos generados aún.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Fecha de Creación</th>
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
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`${BASE_URL}${doc.rutaArchivo}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-semibold rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
