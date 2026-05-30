import { useState } from "react"
import { Toaster } from "react-hot-toast"
import AdminSidebar from "../components/AdminSidebar"
import LicenciasMedicasView from "../components/LicenciasMedicasView"
import HojaVidaView from "../components/HojaVidaView"

function IconLicencia() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="12" y1="11" x2="12" y2="17" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  )
}

function IconHojaVida() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="13" y2="16" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

// Secciones del panel admin. Para sumar una nueva, ensamblás su <XxxView />,
// le das un icon y agregás una entrada acá. El sidebar se actualiza solo.
const SECCIONES = [
  { key: "licencias", label: "Licencias Médicas", icon: IconLicencia, render: () => <LicenciasMedicasView /> },
  { key: "hojas", label: "Hojas de Vida", icon: IconHojaVida, render: () => <HojaVidaView /> },
]

export default function AdminPage() {
  const [seccion, setSeccion] = useState(SECCIONES[0].key)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const activa = SECCIONES.find((s) => s.key === seccion) ?? SECCIONES[0]

  // En mobile, elegir una sección cierra el drawer. En desktop no tiene efecto visible.
  const handleSelect = (key) => {
    setSeccion(key)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <Toaster position="top-right" />

      <AdminSidebar
        secciones={SECCIONES}
        activa={seccion}
        onSelect={handleSelect}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0">
        {/* Topbar: solo mobile. En desktop el sidebar ya está siempre visible. */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 flex items-center gap-3 px-4 h-14">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 hover:text-slate-900"
            aria-label="Abrir menú"
          >
            <IconMenu />
          </button>
          <span className="font-semibold text-slate-900">{activa.label}</span>
        </div>

        <main>{activa.render()}</main>
      </div>
    </div>
  )
}
