import React from 'react'
import styles from './ContratoEstadoBadge.module.css'

import { useContratoEstadoBadge } from './useContratoEstadoBadge'

export default function ContratoEstadoBadge({ estado }) {
  const cfg = useContratoEstadoBadge(estado)
  return (
    <span className={`${styles.badge} ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}