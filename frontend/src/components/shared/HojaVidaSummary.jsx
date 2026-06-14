export default function HojaVidaSummary({ total, felicitaciones, quejas }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-sm border border-slate-800">
      <div className="text-[10px] tracking-widest text-slate-400 font-medium mb-3">
        RESUMEN
      </div>

      <div className="flex items-baseline gap-2 mb-5">
        <span className="text-5xl font-bold leading-none">{total}</span>
        <span className="text-sm text-slate-400">registros totales</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Felicitaciones
          </span>
          <span className="font-bold">{felicitaciones}</span>
        </div>
        <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Quejas
          </span>
          <span className="font-bold">{quejas}</span>
        </div>
      </div>
    </div>
  )
}
