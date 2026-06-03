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

export default function ContratoRow({ contrato }) {
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
    </tr>
  )
}