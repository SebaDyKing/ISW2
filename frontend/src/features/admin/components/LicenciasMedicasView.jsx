import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import { useLicenciasMedicas } from "../hooks/useLicenciasMedicas"
import { getPdfUrl } from "../services/licenciaMedica.service"
import LicenciaMedicaCard from "./LicenciaMedicaCard"
import LicenciasMedicasSummary from "./LicenciasMedicasSummary"
import PdfPreviewModal from "./PdfPreviewModal"
import ConfirmDialog from "./ConfirmDialog"

const FILTROS = [
  { key: "pendiente", label: "Pendientes", countKey: "pendientes" },
  { key: "aprobada", label: "Aprobadas", countKey: "aprobadas" },
  { key: "rechazada", label: "Rechazadas", countKey: "rechazadas" },
  { key: "todas", label: "Todas", countKey: "total" },
]

function tituloPdf(licencia) {
  if (!licencia) return ""
  const u = licencia.empleado?.usuario
  const quien = u?.nombre
    ? `${u.nombre} ${u.apellido ?? ""}`.trim()
    : licencia.empleado?.rut
      ? `RUT ${licencia.empleado.rut}`
      : `Empleado #${licencia.empleado?.idEmpleado ?? "?"}`
  return `Licencia médica · ${quien}`
}

export default function LicenciasMedicasView() {
  const { licencias, loading, error, procesando, aprobar, rechazar } = useLicenciasMedicas()
  const [filtro, setFiltro] = useState("pendiente")
  const [pdf, setPdf] = useState(null) // licencia a previsualizar
  const [confirmar, setConfirmar] = useState(null) // licencia a rechazar

  const counts = useMemo(
    () => ({
      total: licencias.length,
      pendientes: licencias.filter((l) => l.estado === "pendiente").length,
      aprobadas: licencias.filter((l) => l.estado === "aprobada").length,
      rechazadas: licencias.filter((l) => l.estado === "rechazada").length,
    }),
    [licencias],
  )

  const visibles = useMemo(
    () => (filtro === "todas" ? licencias : licencias.filter((l) => l.estado === filtro)),
    [licencias, filtro],
  )

  const handleAprobar = async (licencia) => {
    try {
      await aprobar(licencia.idLicencia)
      toast.success("Licencia aprobada")
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "No se pudo aprobar")
    }
  }

  const handleRechazar = async (licencia) => {
    try {
      await rechazar(licencia.idLicencia)
      toast.success("Licencia rechazada")
      setConfirmar(null)
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "No se pudo rechazar")
    }
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Licencias Médicas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisá el PDF de cada licencia y aprobá o rechazá la solicitud.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-72 shrink-0">
            <LicenciasMedicasSummary {...counts} />
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
                No se pudieron cargar las licencias: {error}
              </div>
            ) : visibles.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl px-6 py-12 text-center">
                <p className="text-slate-500 text-sm">No hay licencias en esta categoría.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibles.map((licencia) => (
                  <LicenciaMedicaCard
                    key={licencia.idLicencia}
                    licencia={licencia}
                    procesando={procesando}
                    onVerPdf={setPdf}
                    onAprobar={handleAprobar}
                    onRechazar={setConfirmar}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <PdfPreviewModal
        isOpen={Boolean(pdf)}
        pdfUrl={pdf ? getPdfUrl(pdf) : ""}
        titulo={tituloPdf(pdf)}
        onClose={() => setPdf(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmar)}
        titulo="Rechazar licencia"
        mensaje="¿Seguro que querés rechazar esta licencia médica? El empleado quedará notificado de la decisión."
        confirmLabel="Rechazar"
        tone="danger"
        loading={procesando === confirmar?.idLicencia}
        onConfirm={() => handleRechazar(confirmar)}
        onCancel={() => setConfirmar(null)}
      />
    </>
  )
}
