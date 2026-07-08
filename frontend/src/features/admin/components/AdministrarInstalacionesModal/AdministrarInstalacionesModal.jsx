import React from 'react'
import { useAdministrarInstalacionesModal } from './useAdministrarInstalacionesModal'

function IconUbicacion() {
  return (
    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function IconBasurero() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

export default function AdministrarInstalacionesModal({ contrato, onClose, onRefresh }) {
  const { loading, handleRemove } = useAdministrarInstalacionesModal({ contrato, onClose, onRefresh })

  const instalaciones = contrato.contratoInstalacionesData || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Instalaciones Asignadas
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {contrato.nombre} ({contrato.rut})
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {instalaciones.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No hay instalaciones asignadas a este contrato.</p>
          ) : (
            <ul className="space-y-3">
              {instalaciones.map((ci) => {
                const inst = ci.instalacion
                if (!inst) return null
                return (
                  <li key={inst.idInstalacion} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <IconUbicacion />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{inst.nombre}</p>
                        <p className="text-xs text-slate-500">{inst.direccion}</p>
                      </div>
                    </div>
                    
                    <button
                      disabled={loading || instalaciones.length <= 1}
                      onClick={() => handleRemove(inst.idInstalacion)}
                      title={instalaciones.length <= 1 ? "No puedes remover la única instalación" : "Remover instalación"}
                      className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                        instalaciones.length <= 1 
                          ? 'text-slate-300 bg-slate-50 cursor-not-allowed' 
                          : 'text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer'
                      }`}
                    >
                      <IconBasurero />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          
          {instalaciones.length <= 1 && instalaciones.length > 0 && (
            <p className="text-xs text-slate-400 mt-4 text-center">
              Para desasignar esta instalación, primero debes agregar otra (el contrato no puede quedar sin local).
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
