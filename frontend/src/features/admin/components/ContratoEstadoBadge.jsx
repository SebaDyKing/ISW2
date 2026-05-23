const ESTADO_CONFIG = {
  ACTIVO: {
    label: 'ACTIVO',
    className: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  },
  POR_VENCER: {
    label: 'POR VENCER',
    className: 'bg-amber-50 text-amber-600 border border-amber-200',
  },
  FINALIZADO: {
    label: 'FINALIZADO',
    className: 'bg-slate-100 text-slate-500 border border-slate-200',
  },
}

export default function ContratoEstadoBadge({ estado }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG.ACTIVO
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wider ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}