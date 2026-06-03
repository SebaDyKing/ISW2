import { useState, useEffect } from "react";
import MarcarAsistencia from "./components/MarcarAsistencia";
import "./App.css";

function App() {
  // Estado para el token JWT
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [tempToken, setTempToken] = useState("");
  const [showTokenModal, setShowTokenModal] = useState(!localStorage.getItem("token"));

  // Sincronizar token en localStorage
  const handleSaveToken = (newToken) => {
    localStorage.setItem("token", newToken);
    // Simular que el ID de contrato de Juan Pérez es 1
    localStorage.setItem("idContrato", "1");
    setToken(newToken);
    setShowTokenModal(false);
    window.location.reload(); // Recargar para aplicar cambios en Axios
  };

  const handleClearToken = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("idContrato");
    setToken("");
    setShowTokenModal(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* SIDEBAR FIJO A LA IZQUIERDA */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col justify-between p-6 shrink-0 border-r border-slate-900">
        {/* LOGO Y ENCABEZADO */}
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

          {/* MENÚ DE NAVEGACIÓN */}
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

        {/* PERFIL O CONTROL DE TOKEN EN SIDEBAR */}
        <div className="space-y-4">
          {token ? (
            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-3 flex flex-col space-y-2">
              <span className="text-[9px] font-extrabold text-slate-500 tracking-wider uppercase">
                API TOKEN CONFIGURADO
              </span>
              <button
                onClick={handleClearToken}
                className="w-full py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-950/80 border border-red-900/40 text-red-400 text-[10px] font-bold transition-all cursor-pointer"
              >
                Cerrar Sesión / Borrar Token
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTokenModal(true)}
              className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Configurar Token JWT
            </button>
          )}

          {/* PERFIL DEL EMPLEADO */}
          <div className="flex items-center space-x-3 pt-4 border-t border-slate-900">
            <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center font-bold text-xs text-indigo-400">
              JP
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-slate-200">Juan Pérez</span>
              <span className="text-[9px] font-bold text-slate-500 tracking-wide uppercase mt-0.5">
                GUARDIA DE SEGURIDAD
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col">
        {token ? (
          <MarcarAsistencia idContratoProp={1} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
            <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-lg mb-4">
                🔑
              </div>
              <h2 className="text-base font-extrabold text-slate-800">Se requiere Token de Autenticación</h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                El módulo de asistencia requiere estar autenticado como <strong>empleado</strong>.
                Por favor, configura tu token de sesión para poder registrar asistencia.
              </p>
              <button
                onClick={() => setShowTokenModal(true)}
                className="mt-5 py-2.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/10 transition-colors cursor-pointer"
              >
                Configurar Token
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL / OVERLAY PARA CONFIGURAR TOKEN */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-100 shadow-xl flex flex-col">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
              Configurar Token de Pruebas
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Pega aquí el token JWT firmado para el empleado. Si no tienes uno, ejecuta el script de generación de tokens en tu backend o usa el token generado para tus pruebas de rol <strong>empleado</strong>.
            </p>

            <textarea
              placeholder="Pegar token JWT (Bearer...) aquí"
              value={tempToken}
              onChange={(e) => setTempToken(e.target.value)}
              className="mt-4 w-full h-24 p-3 border border-slate-200 rounded-xl text-[10px] font-mono text-slate-600 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none bg-slate-50/50"
            />

            <div className="mt-5 flex space-x-3 justify-end text-xs font-bold">
              {token && (
                <button
                  onClick={() => setShowTokenModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                disabled={!tempToken.trim()}
                onClick={() => handleSaveToken(tempToken.trim())}
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar y Conectar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
