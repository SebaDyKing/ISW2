import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import { useHojasVida } from "../hooks/useHojasVida"
import HojaVidaCard from "./HojaVidaCard"
import HojaVidaSummary from "./HojaVidaSummary"
import NuevoRegistroModal from "./NuevoRegistroModal"

const FILTROS = [
  { key: "todos", label: "Todas", countKey: "total" },
  { key: "positivo", label: "Felicitaciones", countKey: "felicitaciones" },
  { key: "negativo", label: "Quejas", countKey: "quejas" },
]

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function HojaVidaView() {
  const { hojas, loading, error, createHoja } = useHojasVida()
  const [filtro, setFiltro] = useState("todos")
  const [modalAbierto, setModalAbierto] = useState(false)

  const counts = useMemo(
    () => ({
      total: hojas.length,
      felicitaciones: hojas.filter((h) => h.tipo === "positivo").length,
      quejas: hojas.filter((h) => h.tipo === "negativo").length,
    }),
    [hojas],
  )

  const visibles = useMemo(
    () => (filtro === "todos" ? hojas : hojas.filter((h) => h.tipo === filtro)),
    [hojas, filtro],
  )

  // Si createHoja falla, propagamos para que NuevoRegistroModal muestre el error
  // inline y NO se cierre (ese es su flujo interno). El toast solo corre en éxito.
  const handleCreate = async (data) => {
    await createHoja(data)
    toast.success("Registro creado")
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Hojas de Vida</h1>
            <p className="text-sm text-slate-500 mt-1">
              Felicitaciones y quejas registradas sobre los empleados.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 shrink-0"
          >
            <IconPlus /> Nuevo Registro
          </button>
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
            <div className="flex flex-wrap gap-2 mb-5">
              {FILTROS.map((f) => {
                const activo = filtro === f.key
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFiltro(f.key)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      activo
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {f.label}
                    <span className={`ml-1.5 ${activo ? "text-slate-300" : "text-slate-400"}`}>
                      {counts[f.countKey]}
                    </span>
                  </button>
                )
              })}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-36 rounded-xl bg-white border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3">
                No se pudieron cargar las hojas de vida: {error}
              </div>
            ) : visibles.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl px-6 py-12 text-center">
                <p className="text-slate-500 text-sm">No hay registros en esta categoría.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibles.map((hoja) => (
                  <HojaVidaCard key={hoja.idRegistro} hoja={hoja} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <NuevoRegistroModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onCreate={handleCreate}
      />
    </>
  )
}
