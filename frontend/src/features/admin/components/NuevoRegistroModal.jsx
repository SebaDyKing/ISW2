import { useState } from "react"

// TODO: reemplazar con fetch real cuando exista GET /api/empleados
const EMPLEADOS_MOCK = [
  { idEmpleado: 1, nombre: "Juan", apellido: "Pérez" },
]

function getInitials(nombre = "", apellido = "") {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase() || "??"
}

export default function NuevoRegistroModal({ isOpen, onClose, onCreate }) {
  const [tipo, setTipo] = useState("positivo")
  const [descripcion, setDescripcion] = useState("")
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0])
  const [idEmpleado, setIdEmpleado] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await onCreate({
        tipo,
        descripcion,
        fecha,
        idEmpleado: Number(idEmpleado),
        idAdmin: 1,
      })
      resetForm()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setTipo("positivo")
    setDescripcion("")
    setFecha(new Date().toISOString().split("T")[0])
    setIdEmpleado("")
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Nuevo Registro</h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipo("positivo")}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  tipo === "positivo"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                Felicitación
              </button>
              <button
                type="button"
                onClick={() => setTipo("negativo")}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  tipo === "negativo"
                    ? "bg-rose-50 border-rose-500 text-rose-700"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                Queja
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              rows={4}
              placeholder="Describí el registro..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Empleado
            </label>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {EMPLEADOS_MOCK.map((emp) => {
                const seleccionado = Number(idEmpleado) === emp.idEmpleado
                return (
                  <button
                    key={emp.idEmpleado}
                    type="button"
                    onClick={() => setIdEmpleado(String(emp.idEmpleado))}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      seleccionado
                        ? "bg-indigo-50"
                        : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full grid place-items-center text-xs font-semibold shrink-0 ${
                      seleccionado
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {getInitials(emp.nombre, emp.apellido)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        seleccionado ? "text-indigo-900" : "text-slate-900"
                      }`}>
                        {emp.nombre} {emp.apellido}
                      </div>
                    </div>
                    {seleccionado && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
            {!idEmpleado && (
              <p className="text-xs text-slate-400 mt-1.5">Seleccioná un empleado</p>
            )}
          </div>

          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-slate-700 mb-1">
              Fecha
            </label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
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
              {submitting ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
