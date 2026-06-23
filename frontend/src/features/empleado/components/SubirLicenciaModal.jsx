import { useState } from "react"

export default function SubirLicenciaModal({ isOpen, onClose, onSubmit }) {
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [diagnostico, setDiagnostico] = useState("")
  const [archivo, setArchivo] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const reset = () => {
    setFechaInicio("")
    setFechaFin("")
    setDiagnostico("")
    setArchivo(null)
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!archivo) return setError("Adjuntá el PDF de la licencia")
    if (archivo.type !== "application/pdf") return setError("El archivo debe ser un PDF")
    if (fechaFin < fechaInicio) return setError("La fecha de fin no puede ser anterior a la de inicio")

    setSubmitting(true)
    try {
      await onSubmit({ fechaInicio, fechaFin, diagnostico, archivoPdf: archivo })
      reset()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "No se pudo subir la licencia")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Subir licencia médica</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="fechaInicio" className="block text-sm font-medium text-slate-700 mb-1">
                Desde
              </label>
              <input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="fechaFin" className="block text-sm font-medium text-slate-700 mb-1">
                Hasta
              </label>
              <input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="diagnostico" className="block text-sm font-medium text-slate-700 mb-1">
              Diagnóstico
            </label>
            <textarea
              id="diagnostico"
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              required
              rows={3}
              maxLength={255}
              placeholder="Ej: Lumbago agudo"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Archivo PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              required
              className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-slate-900 file:text-white hover:file:bg-slate-800 file:cursor-pointer"
            />
            {archivo && (
              <p className="text-xs text-slate-400 mt-1.5 truncate">Seleccionado: {archivo.name}</p>
            )}
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              {submitting ? "Subiendo..." : "Subir licencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
