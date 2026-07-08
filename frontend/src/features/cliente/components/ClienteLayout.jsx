import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import api from "../../../config/axios";

function IconLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconCotizar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconMisCotizaciones() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconInstalacion() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

const NAV = [
  { to: "/cliente/mis-cotizaciones", label: "Cotizaciones", icon: IconMisCotizaciones },
  { to: "/cliente/instalaciones", label: "Instalaciones", icon: IconInstalacion },
];

function ClienteLayout() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nombreMostrar: "Cliente", rol: "" });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const userGuardado = localStorage.getItem("usuario");
    if (userGuardado) setUsuario(JSON.parse(userGuardado));
  }, []);

  async function cerrarSesion() {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    finally {
      localStorage.removeItem("usuario");
      navigate("/login");
    }
  }

  const inicial = (usuario.nombreMostrar || "C").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen lg:flex bg-slate-50">
      {/* Backdrop para mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col border-r border-white/5
          fixed top-0 left-0 z-50 h-screen transition-transform duration-300
          lg:sticky lg:z-auto lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700 grid place-items-center text-white shrink-0">
            <IconLogo />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-white">CleanPro</div>
            <div className="text-[10px] tracking-widest text-slate-500">PORTAL CLIENTE</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            aria-label="Cerrar menú"
          >
            <IconClose />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white text-slate-900"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/5 p-3 space-y-2">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg" title={usuario.nombreCompleto}>
            <div className="w-9 h-9 rounded-full bg-slate-700 grid place-items-center text-white text-xs font-semibold shrink-0">
              {inicial}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="text-sm font-medium text-white truncate">{usuario.nombreMostrar}</div>
              <div className="text-[10px] tracking-wider text-slate-500 capitalize">{usuario.rol}</div>
            </div>
          </div>
          <button
            onClick={cerrarSesion}
            className="w-full text-sm text-slate-400 border border-white/10 rounded-lg py-2 hover:bg-white/5 hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 flex items-center gap-3 px-4 h-14 shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="text-slate-600 hover:text-slate-900"
            aria-label="Abrir menú"
          >
            <IconMenu />
          </button>
          <span className="font-semibold text-slate-900">CleanPro</span>
        </div>

        <main className="flex-1 flex flex-col min-h-0 bg-slate-50 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ClienteLayout;
