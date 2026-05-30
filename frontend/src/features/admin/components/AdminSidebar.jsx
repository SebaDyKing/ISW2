function IconLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

/**
 * Sidebar lateral del panel de administración.
 *
 * Navega por estado local (no por rutas) para no depender del router.
 * Recibe las secciones como data (key, label, icon) y se renderiza solo:
 * sumar una sección en AdminPage actualiza este menú sin tocar nada acá.
 */
export default function AdminSidebar({ secciones, activa, onSelect }) {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-slate-900 text-slate-300 flex flex-col border-r border-white/5">
      {/* Marca */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-white shrink-0">
          <IconLogo />
        </div>
        <div className="leading-tight">
          <div className="font-bold text-white">CleanOps</div>
          <div className="text-[10px] tracking-widest text-slate-500">PANEL ADMIN</div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {secciones.map((s) => {
          const activo = s.key === activa
          const Icon = s.icon
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onSelect(s.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activo
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-900/40"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {Icon ? <Icon /> : null}
              <span>{s.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Usuario */}
      {/* TODO: reemplazar por el usuario logueado cuando exista auth/contexto de sesión */}
      <div className="border-t border-white/5 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-white text-xs font-semibold shrink-0">
            AD
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-sm font-medium text-white truncate">Administrador</div>
            <div className="text-[10px] tracking-wider text-slate-500">PANEL ADMIN</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
