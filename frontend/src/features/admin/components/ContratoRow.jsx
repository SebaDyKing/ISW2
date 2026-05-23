import ContratoEstadoBadge from './ContratoEstadoBadge'

function IconDocumento() {
  return (
    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function IconTraslado() {
  return (
    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  )
}

function IconPersona() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

// Genera iniciales desde el nombre completo
function getIniciales(nombre = '') {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// Color de avatar determinístico por id (sin datos hardcodeados)
const AVATAR_COLORS = ['#ef5350','#66bb6a','#26a69a','#ffa726','#90caf9','#ba68c8','#ff8a65']
function getAvatarColor(id = '') {
  const index = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

export default function ContratoRow({ contrato }) {
  const esTraslado = contrato.tipoContrato === 'traslado'
  const iniciales = getIniciales(contrato.nombre)
  const avatarColor = getAvatarColor(contrato.id)

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors cursor-pointer">
      {/* Trabajador */}
      <td className="py-4 px-5">
        <div className="flex items-center gap-3">
          <div
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
            style={{ backgroundColor: avatarColor }}
          >
            {iniciales}
            {contrato.tieneAlerta && (
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 leading-tight">{contrato.nombre}</p>
            <p className="text-xs text-slate-400 mt-0.5">{contrato.codigo} · {contrato.rut}</p>
          </div>
        </div>
      </td>

      {/* Instalación & Rol */}
      <td className="py-4 px-5">
        <p className="text-sm font-medium text-slate-700">{contrato.instalacion}</p>
        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
          <IconPersona />
          {contrato.rol}
        </p>
      </td>

      {/* Contrato */}
      <td className="py-4 px-5">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          {esTraslado ? <IconTraslado /> : <IconDocumento />}
          <span>{esTraslado ? 'Traslado' : 'Plazo Fijo'}</span>
        </div>
      </td>

      {/* Período */}
      <td className="py-4 px-5">
        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md whitespace-nowrap">
          {contrato.periodoInicio} — {contrato.periodoFin}
        </span>
      </td>

      {/* Estado */}
      <td className="py-4 px-5">
        <ContratoEstadoBadge estado={contrato.estado} />
      </td>
    </tr>
  )
}