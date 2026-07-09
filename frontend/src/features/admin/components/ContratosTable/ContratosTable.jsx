import React from 'react'
import ContratoRow from '../ContratoRow/ContratoRow'
import { useContratosTable } from './useContratosTable'
import styles from './ContratosTable.module.css'

const COLUMNAS = ['TRABAJADOR', 'INSTALACIÓN & ROL', 'CONTRATO', 'PERÍODO', 'ACCIONES']

function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className={styles.skeletonCell}>
          <div className={styles.skeletonDiv} />
        </td>
      ))}
    </tr>
  )
}

export default function ContratosTable({ contratos = [], loading = false, error = null, onSearch, roleFilter, setRoleFilter, onAnexo, onFiniquitar, onIndefinido, onAdministrarInstalaciones, onVerDocumentos, onSolicitarTraslado, onTrasladar, onNuevoContrato }) {
  const { search, handleSearch } = useContratosTable(onSearch)
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  
  const allRoles = [
    { value: '', label: 'Todos los roles' },
    { value: 'administrador', label: 'Administrador' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'empleado', label: 'Empleado' },
    { value: 'cliente', label: 'Cliente' },
  ];

  const availableRoles = usuario.rol === 'supervisor' 
    ? allRoles.filter(r => r.value !== 'administrador')
    : allRoles;

  return (
    <div className={styles.container}>
      {/* Barra superior */}
      <div className={styles.header}>
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar trabajador, RUT o instalación..."
            value={search}
            onChange={handleSearch}
            className={styles.searchInput}
          />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <select
            value={roleFilter || ''}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer shadow-sm hover:border-slate-400 transition-colors"
          >
            {availableRoles.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              {COLUMNAS.map((col) => (
                <th key={col} className={styles.thCell}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
            {!loading && error && (
              <tr>
                <td colSpan={5} className={styles.errorRow}>
                  <p className={styles.errorText}>{error}</p>
                </td>
              </tr>
            )}
            {!loading && !error && contratos.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.emptyRow}>
                  {search
                    ? <>No se encontraron resultados para <span className={styles.highlightText}>"{search}"</span></>
                    : 'No hay personal registrado'}
                </td>
              </tr>
            )}
            {!loading && !error && contratos.map((c) => (
              <ContratoRow 
                key={c.idContrato} 
                contrato={c} 
                onAnexo={onAnexo}
                onFiniquitar={onFiniquitar}
                onIndefinido={onIndefinido}
                onAdministrarInstalaciones={onAdministrarInstalaciones}
                onSolicitarTraslado={onSolicitarTraslado}
                onTrasladar={onTrasladar}
                onVerDocumentos={onVerDocumentos}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
