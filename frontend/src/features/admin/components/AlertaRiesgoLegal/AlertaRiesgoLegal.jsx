import React from 'react'
import styles from './AlertaRiesgoLegal.module.css'
import { useAlertaRiesgoLegal } from './useAlertaRiesgoLegal'

export default function AlertaRiesgoLegal({ trabajador }) {
  const { shouldRender } = useAlertaRiesgoLegal(trabajador)

  if (!shouldRender) return null

  return (
    <div className={styles.container}>
      <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        <p className={styles.title}>Alerta de riesgo legal</p>
        <p className={styles.message}>
          El trabajador <span className={styles.highlight}>{trabajador}</span> acumula 3 contratos a
          plazo fijo continuos. Se recomienda revisar su situación contractual inmediatamente.
        </p>
      </div>
    </div>
  )
}