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

export default function ContratoRow({ contrato, onAnexo, onFiniquitar, onIndefinido }) {
  const { esTraslado, iniciales, avatarColor } = useContratoRow(contrato)

  return (
    <tr className={`${styles.row} group`}>
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
          <span>{esTraslado ? 'Traslado' : (contrato.tipoContrato || 'Plazo Fijo')}</span>
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
          {contrato.estado === 'ACTIVO' && contrato.tipoContrato === 'Plazo Fijo' && (
            <button 
              className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-md transition-colors cursor-pointer flex items-center justify-center"
              onClick={() => onIndefinido(contrato)}
              title="Ascender a Indefinido"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          )}
          {contrato.estado === 'ACTIVO' && (
            <button 
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer flex items-center justify-center"
              onClick={() => onFiniquitar(contrato)}
              title="Finiquitar contrato"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}