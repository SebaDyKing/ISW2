import { useMemo, useState } from "react"
import toast from "react-hot-toast"
import { useMisLicencias } from "../hooks/useMisLicencias"
import { getPdfUrl } from "../services/licenciaMedica.service"
import MiLicenciaCard from "./MiLicenciaCard"
import SubirLicenciaModal from "./SubirLicenciaModal"
import LicenciasMedicasSummary from "../../admin/components/LicenciasMedicasSummary"
import PdfPreviewModal from "../../admin/components/PdfPreviewModal"

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function MisLicenciasView() {
  const { licencias, loading, error, subir } = useMisLicencias()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [pdf, setPdf] = useState(null)

  const counts = useMemo(
    () => ({
      total: licencias.length,
      pendientes: licencias.filter((l) => l.estado === "pendiente").length,
      aprobadas: licencias.filter((l) => l.estado === "aprobada").length,
      rechazadas: licencias.filter((l) => l.estado === "rechazada").length,
    }),
    [licencias],
  )

  // Si subir() falla, propagamos para que el modal muestre el error inline.
  const handleSubir = async (datos) => {
    await subir(datos)
    toast.success("Licencia subida")
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mis Licencias Médicas</h1>
            <p className="text-sm text-slate-500 mt-1">
              Subí tus licencias y seguí el estado de cada solicitud.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 shrink-0"
          >
            <IconPlus /> Subir licencia
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-72 shrink-0">
            <LicenciasMedicasSummary {...counts} />
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
                No se pudieron cargar tus licencias: {error}
              </div>
            ) : licencias.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl px-6 py-12 text-center">
                <p className="text-slate-500 text-sm">Todavía no subiste ninguna licencia.</p>
                <button
                  type="button"
                  onClick={() => setModalAbierto(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800"
                >
                  <IconPlus /> Subir mi primera licencia
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {licencias.map((licencia) => (
                  <MiLicenciaCard key={licencia.idLicencia} licencia={licencia} onVerPdf={setPdf} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <SubirLicenciaModal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSubmit={handleSubir}
      />

      <PdfPreviewModal
        isOpen={Boolean(pdf)}
        pdfUrl={pdf ? getPdfUrl(pdf) : ""}
        titulo="Mi licencia médica"
        onClose={() => setPdf(null)}
      />
    </>
  )
}
