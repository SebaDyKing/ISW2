import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MarcarAsistencia from "./MarcarAsistencia";
import api from "../config/axios";

export default function EmpleadoPortal() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nombreCompleto: "Juan Pérez", rol: "empleado" });
  const [initials, setInitials] = useState("JP");

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);
      if (parsed.nombreCompleto) {
        setUser(parsed);
        const parts = parsed.nombreCompleto.split(" ");
        const init = parts.map(p => p[0]).join("").slice(0, 2).toUpperCase();
        setInitials(init || "EM");
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    finally {
      localStorage.removeItem("usuario");
      localStorage.removeItem("idContrato");
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-slate-950 text-white flex flex-col justify-between p-6 shrink-0 border-r border-slate-900">
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-base shadow-md shadow-indigo-600/30">
              C
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wide">CleanOps</span>
              <span className="text-[9px] font-extrabold text-indigo-400 tracking-wider uppercase -mt-0.5">
                PORTAL EMPLEADO
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-900/60 hover:text-white transition-all cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Mi Resumen</span>
            </button>

            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600/10 text-indigo-400 border border-indigo-600/25 shadow-sm shadow-indigo-600/5 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Marcar Asistencia</span>
            </button>

            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-900/60 hover:text-white transition-all cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Hoja de Vida</span>
            </button>

            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-900/60 hover:text-white transition-all cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
              <span>Mis Documentos</span>
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 text-xs font-bold transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>

          <div className="flex items-center space-x-3 pt-4 border-t border-slate-900">
            <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center font-bold text-xs text-indigo-400">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-slate-200">{user.nombreCompleto}</span>
              <span className="text-[9px] font-bold text-slate-500 tracking-wide uppercase mt-0.5">
                {user.rol === "empleado" ? "OPERARIO DE ASEO" : user.rol}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <MarcarAsistencia idContratoProp={1} />
      </main>
    </div>
  );
}