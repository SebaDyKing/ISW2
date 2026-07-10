import styles from './ContratoEstadoBadge.module.css'

const ESTADO_CONFIG = {
  ACTIVO: {
    label: 'ACTIVO',
    className: styles.activo,
  },
  POR_VENCER: {
    label: 'POR VENCER',
    className: styles.porVencer,
  },
  FINALIZADO: {
    label: 'FINALIZADO',
    className: styles.finalizado,
  },
  'PENDIENTE DE FIRMA': {
    label: 'PENDIENTE DE FIRMA',
    className: styles.pendiente,
  }
}

export function useContratoEstadoBadge(estado) {
  return ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.ACTIVO
}
