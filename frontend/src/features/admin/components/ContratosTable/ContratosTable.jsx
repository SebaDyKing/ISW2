import React from 'react'
import ContratoRow from '../ContratoRow/ContratoRow'
import { useContratosTable } from './useContratosTable'
import styles from './ContratosTable.module.css'

const COLUMNAS = ['TRABAJADOR', 'INSTALACIÓN & ROL', 'CONTRATO', 'PERÍODO', 'ESTADO', 'ACCIONES']

function SkeletonRow() {
  return (
    <tr className={styles.skeletonRow}>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className={styles.skeletonCell}>
          <div className={styles.skeletonDiv} />
        </td>
      ))}
    </tr>
  )
}

export default function ContratosTable({ contratos = [], loading = false, error = null, onSearch, onDelete, onAnexo }) {
  const { search, handleSearch } = useContratosTable(onSearch)

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
        <button className={styles.filterBtn}>
          <svg className={styles.filterIcon} fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
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
                <td colSpan={6} className={styles.errorRow}>
                  <p className={styles.errorText}>{error}</p>
                </td>
              </tr>
            )}
            {!loading && !error && contratos.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  {search
                    ? <>No se encontraron resultados para <span className={styles.highlightText}>"{search}"</span></>
                    : 'No hay contratos registrados'}
                </td>
              </tr>
            )}
            {!loading && !error && contratos.map((contrato) => (
              <ContratoRow key={contrato.id} contrato={contrato} onDelete={onDelete} onAnexo={onAnexo} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
