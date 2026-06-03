import { formatFecha } from "../utils/fecha"
import { getEstado } from "../utils/estadoLicencia"

function getInitials(nombre = "", apellido = "") {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase() || "LM"
}
function datosEmpleado(empleado) {
  const u = empleado?.usuario
  const nombre = u?.nombre ?? ""
  const apellido = u?.apellido ?? ""
  const display = nombre
    ? `${nombre} ${apellido}`.trim()
    : empleado?.rut
      ? `RUT ${empleado.rut}`
      : `Empleado #${empleado?.idEmpleado ?? "?"}`
  return { nombre, apellido, display }
}

function IconEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export default function LicenciaMedicaCard({
  licencia,
  procesando,
  onVerPdf,
  onAprobar,
  onRechazar,
}) {
  const estado = getEstado(licencia.estado)
  const emp = datosEmpleado(licencia.empleado)
  const esPendiente = licencia.estado === "pendiente"
  const tienePdf = Boolean(licencia.archivoPdf)
  const enProceso = procesando === licencia.idLicencia

  return (
    <article className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${estado.borderL}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full grid place-items-center text-sm font-semibold shrink-0 bg-slate-100 text-slate-600">
              {getInitials(emp.nombre, emp.apellido)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 truncate">{emp.display}</div>
              <div className="text-xs text-slate-500 inline-flex items-center gap-1.5 mt-0.5">
                <IconCalendar />
                {formatFecha(licencia.fechaInicio)} → {formatFecha(licencia.fechaFin)}
              </div>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap uppercase ${estado.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
            {estado.label}
          </span>
        </div>

        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            Diagnóstico
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {licencia.diagnostico || "Sin diagnóstico"}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <button
            type="button"
            onClick={() => onVerPdf(licencia)}
            disabled={!tienePdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <IconEye /> {tienePdf ? "Ver PDF" : "Sin PDF"}
          </button>

          {esPendiente ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onRechazar(licencia)}
                disabled={enProceso}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-50 disabled:opacity-50"
              >
                <IconX /> Rechazar
              </button>
              <button
                type="button"
                onClick={() => onAprobar(licencia)}
                disabled={enProceso}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                <IconCheck /> {enProceso ? "Guardando..." : "Aprobar"}
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400">Decisión registrada</span>
          )}
        </div>
      </div>
    </article>
  )
}
