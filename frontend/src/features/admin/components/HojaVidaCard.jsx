function getInitials(nombre = "", apellido = "") {
  return `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase() || "??"
}

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

function formatFecha(fecha) {
  if (!fecha) return ""

  const fechaObj = new Date(fecha)
  const dia = fechaObj.getDate()
  const mes = MESES[fechaObj.getMonth()]
  const anio = fechaObj.getFullYear()

  return `${dia} ${mes} ${anio}`
}

function IconoPulgar({ arriba }) {
  return arriba ? (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H7" />
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17" />
    </svg>
  )
}

function IconoPersona() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconoReloj() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default function HojaVidaCard({ hoja }) {
  const esFelicitacion = hoja.tipo === "positivo"
  const empleadoUsuario = hoja.empleado?.usuario
  const adminUsuario = hoja.administrador?.usuario

  const nombre = empleadoUsuario?.nombre ?? "Empleado"
  const apellido = empleadoUsuario?.apellido ?? ""
  const adminNombre = adminUsuario
    ? `${adminUsuario.nombre} ${adminUsuario.apellido}`
    : "Administrador"
  const subtitulo = hoja.empleado?.instalacion?.nombre ?? "Sin instalación"

  const borderColor = esFelicitacion ? "border-l-emerald-500" : "border-l-rose-500"
  const badgeColor = esFelicitacion
    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
    : "bg-rose-50 text-rose-700 border border-rose-200"

  return (
    <article className={`bg-white rounded-xl shadow-sm border border-slate-200 border-l-4 ${borderColor}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full grid place-items-center text-sm font-semibold shrink-0 bg-slate-100 text-slate-600">
              {getInitials(nombre, apellido)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 truncate">
                {nombre} {apellido}
              </div>
              <div className="text-xs text-slate-500">{subtitulo}</div>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-full whitespace-nowrap ${badgeColor}`}>
            <IconoPulgar arriba={esFelicitacion} />
            {esFelicitacion ? "FELICITACIÓN" : "QUEJA"}
          </span>
        </div>

        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-lg px-4 py-3">
          <p className="text-sm text-slate-700 leading-relaxed">
            {hoja.descripcion}
          </p>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <IconoPersona />
            Reportado por: {adminNombre}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconoReloj />
            {formatFecha(hoja.fecha ?? hoja.createdAt)}
          </span>
        </div>
      </div>
    </article>
  )
}
