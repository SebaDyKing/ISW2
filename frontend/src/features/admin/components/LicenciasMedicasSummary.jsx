export default function LicenciasMedicasSummary({ total, pendientes, aprobadas, rechazadas }) {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="text-[10px] tracking-widest text-indigo-100 font-medium mb-3">
        LICENCIAS MÉDICAS
      </div>

      <div className="flex items-baseline gap-2 mb-5">
        <span className="text-5xl font-bold leading-none">{total}</span>
        <span className="text-sm text-indigo-100">en total</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300" /> Pendientes
          </span>
          <span className="font-bold">{pendientes}</span>
        </div>
        <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" /> Aprobadas
          </span>
          <span className="font-bold">{aprobadas}</span>
        </div>
        <div className="flex items-center justify-between bg-white/10 rounded-lg px-3 py-2 text-sm">
          <span className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300" /> Rechazadas
          </span>
          <span className="font-bold">{rechazadas}</span>
        </div>
      </div>
    </div>
  )
}
