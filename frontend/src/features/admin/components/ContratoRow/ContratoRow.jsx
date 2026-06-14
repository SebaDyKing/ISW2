import React from 'react'
import ContratoEstadoBadge from '../ContratoEstadoBadge/ContratoEstadoBadge'
import styles from './ContratoRow.module.css'
import { useContratoRow } from './useContratoRow'

function IconDocumento() {
  return (
    <svg className={styles.iconSm} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function IconTraslado() {
  return (
    <svg className={styles.iconSm} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  )
}

function IconPersona() {
  return (
    <svg className={styles.iconXs} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

export default function ContratoRow({ contrato, onDelete, onAnexo }) {
  const { esTraslado, iniciales, avatarColor } = useContratoRow(contrato)

  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <div className={styles.workerWrapper}>
          <div className={styles.avatarBox} style={{ backgroundColor: avatarColor }}>
            {iniciales}
            {contrato.tieneAlerta && (
              <span className={styles.alertDot} />
            )}
          </div>
          <div>
            <p className={styles.workerName}>{contrato.nombre}</p>
            <p className={styles.workerSub}>{contrato.codigo} · {contrato.rut}</p>
          </div>
        </div>
      </td>
      <td className={styles.cell}>
        <p className={styles.instName}>{contrato.instalacion}</p>
        <p className={styles.instRole}>
          <IconPersona />
          {contrato.rol}
        </p>
      </td>
      <td className={styles.cell}>
        <div className={styles.typeWrapper}>
          {esTraslado ? <IconTraslado /> : <IconDocumento />}
          <span>{esTraslado ? 'Traslado' : 'Plazo Fijo'}</span>
        </div>
      </td>
      <td className={styles.cell}>
        <span className={styles.periodBadge}>
          {contrato.periodoInicio} — {contrato.periodoFin}
        </span>
      </td>
      <td className={styles.cell}>
        <ContratoEstadoBadge estado={contrato.estado} />
      </td>
      <td className={styles.cell}>
        <div className="flex items-center gap-1">
          <button 
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer flex items-center justify-center"
            onClick={() => onAnexo(contrato)}
            title="Generar Anexo"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer flex items-center justify-center"
            onClick={() => onDelete(contrato.id)}
            title="Eliminar contrato"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}