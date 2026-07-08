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

  const avatarChar = user.nombreCompleto ? user.nombreCompleto[0].toUpperCase() : "E";
  const formattedName = (() => {
    if (!user.nombreCompleto) return "Juan P.";
    const parts = user.nombreCompleto.split(" ");
    if (parts.length > 1 && parts[1]) {
      return `${parts[0]} ${parts[1][0]}.`;
    }
    return parts[0];
  })();

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] font-sans">
      {/* SIDEBAR FIJO A LA IZQUIERDA */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col justify-between p-6 shrink-0 border-r border-[#94a3b8]/30">
        <div className="space-y-8">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#0f172a] flex items-center justify-center font-bold text-base shadow-md shadow-black/20">
              ⬜
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-wide">CleanPro</span>
              <span className="text-[10px] font-semibold text-[#94a3b8] tracking-wider uppercase -mt-0.5">
                PORTAL EMPLEADO
              </span>
            </div>
          </div>

          <nav className="space-y-1">
            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#dcfce7] text-[#166534] border border-[#166534]/30 shadow-sm transition-all">
              <span>🕐 Marcar Asistencia</span>
            </button>

            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#94a3b8] hover:bg-[#0f172a]/60 hover:text-white transition-all cursor-not-allowed">
              <span>📄 Mis Licencias</span>
            </button>

            <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium text-[#94a3b8] hover:bg-[#0f172a]/60 hover:text-white transition-all cursor-not-allowed">
              <span>📋 Mi Hoja de Vida</span>
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl bg-[#ef4444]/10 hover:bg-[#ef4444]/20 border border-[#ef4444]/30 text-[#ef4444] text-xs font-bold transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>

          {/* PERFIL DEL EMPLEADO */}
          <div className="flex items-center space-x-3 pt-4 border-t border-[#94a3b8]/30">
            <div className="w-9 h-9 rounded-full bg-[#dcfce7] border border-[#166534]/30 flex items-center justify-center font-bold text-sm text-[#166534]">
              {avatarChar}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-white">{formattedName}</span>
              <span className="text-[9px] font-bold text-[#94a3b8] tracking-wide uppercase mt-0.5">
                {user.rol === "empleado" ? "Empleado" : user.rol}
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