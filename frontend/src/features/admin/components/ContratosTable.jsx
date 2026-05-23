import { useState } from 'react'
import ContratoRow from './ContratoRow'

const COLUMNAS = ['TRABAJADOR', 'INSTALACIÓN & ROL', 'CONTRATO', 'PERÍODO', 'ESTADO']

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="py-4 px-5">
          <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  )
}

export default function ContratosTable({ contratos = [], loading = false, error = null, onSearch }) {
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    const value = e.target.value
    setSearch(value)
    onSearch?.(value)
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

      {/* Barra superior */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div className="relative w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar trabajador, RUT o instalación..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50
                       focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent
                       placeholder:text-slate-400 transition"
          />
        </div>
        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {COLUMNAS.map((col) => (
                <th key={col}
                  className="text-left text-[11px] font-semibold text-slate-400 tracking-widest uppercase px-5 py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Estado: cargando */}
            {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

            {/* Estado: error */}
            {!loading && error && (
              <tr>
                <td colSpan={5} className="text-center py-14">
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                </td>
              </tr>
            )}

            {/* Estado: sin resultados */}
            {!loading && !error && contratos.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-14 text-slate-400 text-sm">
                  {search
                    ? <>No se encontraron resultados para <span className="font-medium text-slate-600">"{search}"</span></>
                    : 'No hay contratos registrados'}
                </td>
              </tr>
            )}

            {/* Estado: datos */}
            {!loading && !error && contratos.map((contrato) => (
              <ContratoRow key={contrato.id} contrato={contrato} />
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}