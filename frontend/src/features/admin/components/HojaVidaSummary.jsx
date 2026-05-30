export default function HojaVidaSummary({ total, felicitaciones, quejas }) {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg w-72">
      <div className="text-[10px] tracking-widest text-indigo-100 font-medium mb-3">
        RESUMEN MENSUAL
      </div>

      <div className="flex items-baseline gap-2 mb-5">
        <span className="text-5xl font-bold leading-none">{total}</span>
        <span className="text-sm text-indigo-100">registros totales</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2 text-sm">
          <span>Felicitaciones</span>
          <span className="font-bold">{felicitaciones}</span>
        </div>
        <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2 text-sm">
          <span>Quejas</span>
          <span className="font-bold">{quejas}</span>
        </div>
      </div>
    </div>
  )
}
