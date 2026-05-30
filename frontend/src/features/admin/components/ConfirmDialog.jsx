/**
 * Diálogo de confirmación genérico. Lo usamos para acciones con peso
 * (ej: rechazar una licencia), para evitar clicks accidentales.
 */
export default function ConfirmDialog({
  isOpen,
  titulo,
  mensaje,
  confirmLabel = "Confirmar",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  const confirmClass =
    tone === "danger"
      ? "bg-rose-600 hover:bg-rose-700"
      : "bg-emerald-600 hover:bg-emerald-700"

  return (
    <div
      className="fixed inset-0 bg-black/50 grid place-items-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-900">{titulo}</h3>
        <p className="text-sm text-slate-600 mt-2">{mensaje}</p>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white text-sm font-medium rounded-lg disabled:opacity-50 ${confirmClass}`}
          >
            {loading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
