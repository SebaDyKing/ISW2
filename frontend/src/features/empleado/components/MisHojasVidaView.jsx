import { useMemo } from "react"
import { useMisHojasVida } from "../hooks/useMisHojasVida"
import HojaVidaCard from "../../admin/components/HojaVidaCard"
import HojaVidaSummary from "../../admin/components/HojaVidaSummary"

export default function MisHojasVidaView() {
  const { hojas, loading, error } = useMisHojasVida()

  const counts = useMemo(
    () => ({
      total: hojas.length,
      felicitaciones: hojas.filter((h) => h.tipo === "positivo").length,
      quejas: hojas.filter((h) => h.tipo === "negativo").length,
    }),
    [hojas],
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mi Hoja de Vida</h1>
        <p className="text-sm text-slate-500 mt-1">
          Felicitaciones y quejas registradas sobre tu desempeño.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-72 shrink-0">
          <HojaVidaSummary
            total={counts.total}
            felicitaciones={counts.felicitaciones}
            quejas={counts.quejas}
          />
        </aside>

        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
              No se pudo cargar tu hoja de vida: {error}
            </div>
          ) : hojas.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-xl px-6 py-12 text-center">
              <p className="text-slate-500 text-sm">Todavía no tenés registros en tu hoja de vida.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hojas.map((hoja) => (
                <HojaVidaCard key={hoja.idRegistro} hoja={hoja} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
