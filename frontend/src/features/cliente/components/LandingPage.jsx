import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPlanesService } from "../services/cliente.service";
import api from "../../../config/axios";

const PLAN_ESTILOS = [
  { bg: "#EEEDFE", color: "#534AB7", border: "#534AB7", tagBg: "#CECBF6", tagColor: "#3C3489", btnSolid: false },
  { bg: "#E1F5EE", color: "#0F6E56", border: "#0F6E56", tagBg: "#9FE1CB", tagColor: "#085041", btnSolid: true },
  { bg: "#E6F1FB", color: "#185FA5", border: "#185FA5", tagBg: "#B5D4F4", tagColor: "#0C447C", btnSolid: false },
];

const STATS = [
  { num: "+200", lbl: "Empresas atendidas" },
  { num: "24h",  lbl: "Tiempo de respuesta" },
  { num: "98%",  lbl: "Satisfacción" },
  { num: "3",    lbl: "Planes disponibles" },
];

const TRUST = [
  { icon: "⏱", text: "Respuesta en 24h hábiles" },
  { icon: "✓",  text: "Personal certificado" },
  { icon: "📄", text: "Cotización sin costo" },
  { icon: "🎧", text: "Soporte dedicado" },
];

function LandingPage() {
  const [planes, setPlanes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const usuario = localStorage.getItem("usuario");

  useEffect(() => {
    obtenerPlanesService()
      .then((res) => setPlanes(res))
      .catch(() => setError("No se pudieron cargar los planes."))
      .finally(() => setCargando(false));
  }, []);

  const handleSolicitarPlan = (idPlan) => {
    if (!usuario) {
      sessionStorage.setItem("planPreseleccionado", idPlan);
      navigate("/login");
    } else {
      navigate("/cliente/mis-cotizaciones", { state: { abrirModal: true, idPlan } });
    }
  };

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch (_) {}
    finally {
      localStorage.removeItem("usuario");
      navigate("/");
    }
  };

  if (cargando) return <p className="py-12 px-8 text-sm text-slate-500 text-center">Cargando planes…</p>;
  if (error)    return <p className="py-12 px-8 text-sm text-red-500 text-center">{error}</p>;

  return (
    <div className="min-h-screen bg-[#eef0f4] text-slate-900 font-sans">

      {/* ── NAVBAR ───────────────────────────────────────────────── */}
      <nav className="flex justify-between items-center px-6 lg:px-10 h-[60px] bg-[#f1f3f7] border-b border-[#dde1e9] sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EEEDFE] flex items-center justify-center text-base">✦</div>
          <span className="text-[15px] font-semibold text-slate-900 tracking-tight">CleanPro</span>
        </div>
        {!usuario ? (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-1.5 border border-slate-300 rounded-md bg-transparent text-[13px] text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors"
          >
            Iniciar sesión
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="px-4 py-1.5 border border-slate-300 rounded-md bg-transparent text-[13px] text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors"
          >
            Cerrar sesión
          </button>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[480px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/Fondo_LandingPage.png')] bg-cover bg-[center_20%] blur-[2px] brightness-[0.6] scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1228d1] from-40% to-[#0a122873]" />
        
        <div className="relative z-10 w-full max-w-[860px] mx-auto px-6 lg:px-10 py-16 lg:py-20 text-left">
          <div className="inline-flex items-center gap-1.5 bg-white/15 text-indigo-100 text-xs font-medium px-3.5 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-white/20">
            <span>✓</span> Servicio profesional certificado
          </div>
          <h1 className="text-4xl lg:text-[42px] font-bold text-white leading-[1.15] tracking-tight mb-4 max-w-[520px]">
            Limpieza empresarial<br />que se adapta a ti
          </h1>
          <p className="text-[15px] text-white/75 leading-relaxed max-w-[440px] mb-8">
            Cotizaciones personalizadas en menos de 24 horas hábiles.
            Elige el plan que mejor se ajuste al tamaño y ritmo de tu empresa.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(usuario ? "/cliente/mis-cotizaciones" : "/login", usuario ? { state: { abrirModal: true } } : undefined)}
              className="px-6 py-3 bg-[#534AB7] text-white rounded-md text-sm font-medium hover:bg-[#4238a3] transition-colors"
            >
              Solicitar cotización
            </button>
            <button
              onClick={() => document.getElementById("planes-section")?.scrollIntoView({ behavior: "smooth" })}
              className="px-6 py-3 bg-white/10 text-white border border-white/30 rounded-md text-sm font-medium hover:bg-white/20 backdrop-blur-sm transition-colors"
            >
              Ver planes
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <div className="bg-[#e8eaef] border-y border-[#d4d8e2] mb-12">
        <div className="flex flex-wrap justify-center max-w-[860px] mx-auto">
          {STATS.map((s, i) => (
            <div
              key={i}
              className={`text-center py-5 lg:py-6 px-6 lg:px-12 flex-1 min-w-[140px] ${
                i !== STATS.length - 1 ? "border-r border-[#d4d8e2]" : ""
              } ${i === 1 || i === 3 ? "border-b lg:border-b-0 border-[#d4d8e2]" : ""}`}
            >
              <div className="text-[22px] font-bold text-slate-900">{s.num}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PLANES ───────────────────────────────────────────────── */}
      <section id="planes-section" className="max-w-[860px] mx-auto px-6 lg:px-10 pb-8">
        <div className="mb-6 text-center lg:text-left">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Planes de limpieza</h2>
          <p className="text-[13px] text-slate-500">
            Todos los precios son cotizados a medida según tus necesidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {planes.map((plan, i) => {
            const est = PLAN_ESTILOS[i] || PLAN_ESTILOS[0];
            const esMasPopular = i === 1;

            return (
              <div
                key={plan.idPlan}
                className={`bg-[#f4f5f8] border border-[#dde1e9] rounded-xl p-6 flex flex-col gap-3.5 transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] ${
                  esMasPopular ? `border-[1.5px]` : ""
                }`}
                style={esMasPopular ? { borderColor: est.border } : {}}
              >
                <span
                  className="text-[11px] font-medium px-3 py-1 rounded-full w-fit"
                  style={{ background: est.tagBg, color: est.tagColor }}
                >
                  {plan.tipo}
                </span>

                <p className="text-[15px] font-semibold text-slate-900">{plan.nombre ?? `Plan ${plan.tipo}`}</p>

                <hr className="border-t border-slate-200" />

                <p className="text-[13px] text-slate-500 leading-relaxed">{plan.descripcion}</p>

                <div className="flex-1">
                  <div className="text-[13px] text-slate-500 flex items-start gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 inline-block" style={{ background: est.border }} />
                    <span>
                      <strong className="font-medium text-slate-700">Frecuencia:</strong> {plan.frecuencia}
                    </span>
                  </div>
                  <div className="text-[13px] text-slate-500 flex items-start gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 inline-block" style={{ background: est.border }} />
                    <span>
                      <strong className="font-medium text-slate-700">Ideal para:</strong> {plan.idealPara}
                    </span>
                  </div>
                </div>

                {esMasPopular && (
                  <div className="text-[11px] font-medium bg-[#E1F5EE] text-[#085041] px-2.5 py-1.5 rounded-md text-center mt-2">
                    Más solicitado
                  </div>
                )}

                <button
                  onClick={() => handleSolicitarPlan(plan.idPlan)}
                  className="mt-4 w-full py-2.5 rounded-md text-[13px] font-medium transition-opacity hover:opacity-85"
                  style={{
                    border: est.btnSolid ? "none" : `1px solid ${est.border}`,
                    background: est.btnSolid ? est.border : "transparent",
                    color: est.btnSolid ? "#fff" : est.color,
                  }}
                >
                  Solicitar cotización
                </button>
              </div>
            );
          })}
        </div>

        {/* ── TRUST SIGNALS ──────────────────────────────────────── */}
        <div className="flex justify-center flex-wrap gap-4 sm:gap-6 pt-8 mt-8 border-t border-[#d4d8e2]">
          {TRUST.map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-[13px] text-slate-500">
              <span className="text-[15px]">{t.icon}</span>
              {t.text}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="py-5 px-6 lg:px-10 border-t border-[#d4d8e2] bg-[#e8eaef] flex flex-col md:flex-row justify-between items-center gap-2">
        <span className="text-xs text-slate-500 text-center md:text-left">© 2026 CleanPro · Todos los derechos reservados</span>
        <span className="text-xs text-slate-500 text-center md:text-right">
          * Los planes son referenciales. Precio final según cotización personalizada.
        </span>
      </footer>
    </div>
  );
}

export default LandingPage;