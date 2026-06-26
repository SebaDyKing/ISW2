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

/* ─── estilos reutilizables ─────────────────────────────────────── */
const S = {
  page: {
    minHeight: "100vh",
    background: "#eef0f4",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    color: "#1e293b",
  },

  /* NAV */
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 2.5rem",
    height: "60px",
    background: "#f1f3f7",
    borderBottom: "1px solid #dde1e9",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logoWrap: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: {
    width: "32px", height: "32px", borderRadius: "8px",
    background: "#EEEDFE", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "16px",
  },
  logoText: { fontSize: "15px", fontWeight: 600, color: "#1e293b", letterSpacing: "-0.2px" },
  navBtn: {
    padding: "0.4rem 1rem",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    background: "transparent",
    fontSize: "13px",
    cursor: "pointer",
    color: "#475569",
    fontFamily: "inherit",
    transition: "border-color .15s, color .15s",
  },

  /* HERO */
  heroOuter: {
    position: "relative",
    width: "100%",
    minHeight: "480px",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
  },
  heroBg: {
    position: "absolute", inset: 0,
    backgroundImage: "url('/Fondo_LandingPage.png')",
    backgroundSize: "cover",
    backgroundPosition: "center 20%",
    filter: "blur(2px) brightness(0.6)",
    transform: "scale(1.04)",
  },
  heroOverlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to right, rgba(10,18,40,0.82) 40%, rgba(10,18,40,0.45) 100%)",
  },
  heroContent: {
    position: "relative", zIndex: 1,
    maxWidth: "860px", margin: "0 auto",
    padding: "5rem 2.5rem 4rem",
    textAlign: "left",
  },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "rgba(255,255,255,0.15)", color: "#e0e7ff",
    fontSize: "12px", fontWeight: 500,
    padding: "5px 14px", borderRadius: "20px",
    marginBottom: "1.5rem",
    backdropFilter: "blur(4px)",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  heroH1: {
    fontSize: "42px", fontWeight: 700,
    color: "#ffffff", lineHeight: 1.15,
    letterSpacing: "-0.8px", marginBottom: "1rem",
    maxWidth: "520px",
  },
  heroP: {
    fontSize: "15px", color: "rgba(255,255,255,0.75)",
    lineHeight: 1.7, maxWidth: "440px",
    marginBottom: "2rem",
  },
  ctaRow: { display: "flex", gap: "10px" },
  btnPrimary: {
    padding: "0.7rem 1.6rem",
    background: "#534AB7", color: "#fff",
    border: "none", borderRadius: "6px",
    fontSize: "14px", fontWeight: 500,
    cursor: "pointer", fontFamily: "inherit",
    transition: "background .15s",
  },
  btnGhost: {
    padding: "0.7rem 1.6rem",
    background: "rgba(255,255,255,0.1)", color: "#fff",
    border: "1px solid rgba(255,255,255,0.35)", borderRadius: "6px",
    fontSize: "14px", cursor: "pointer",
    fontFamily: "inherit", transition: "background .15s",
    backdropFilter: "blur(4px)",
  },

  /* STATS */
  statsBar: {
    background: "#e8eaef",
    borderTop: "1px solid #d4d8e2",
    borderBottom: "1px solid #d4d8e2",
    display: "flex", justifyContent: "center",
    gap: "0", marginBottom: "3rem",
  },
  statItem: {
    textAlign: "center", padding: "1.4rem 3rem",
    borderRight: "1px solid #d4d8e2",
  },
  statNum: { fontSize: "22px", fontWeight: 700, color: "#0f172a" },
  statLbl: { fontSize: "12px", color: "#94a3b8", marginTop: "2px" },

  /* PLANS */
  planesSection: { maxWidth: "860px", margin: "0 auto", padding: "0 2.5rem 2rem" },
  planesHeader: { marginBottom: "1.5rem" },
  planesH2: { fontSize: "18px", fontWeight: 600, color: "#0f172a", marginBottom: "4px" },
  planesSubtitle: { fontSize: "13px", color: "#64748b" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "1rem",
  },
  card: {
    background: "#f4f5f8",
    border: "1px solid #dde1e9",
    borderRadius: "12px",
    padding: "1.5rem",
    display: "flex", flexDirection: "column", gap: "0.85rem",
    transition: "box-shadow .15s",
  },
  tag: {
    fontSize: "11px", fontWeight: 500,
    padding: "4px 12px", borderRadius: "20px",
    width: "fit-content",
  },
  cardName: { fontSize: "15px", fontWeight: 600, color: "#0f172a" },
  cardDesc: { fontSize: "13px", color: "#64748b", lineHeight: 1.6 },
  divider: { border: "none", borderTop: "1px solid #f1f5f9" },
  detailRow: {
    fontSize: "13px", color: "#64748b",
    display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "4px",
  },
  dot: {
    width: "5px", height: "5px", borderRadius: "50%",
    flexShrink: 0, marginTop: "6px", display: "inline-block",
  },
  popularBadge: {
    fontSize: "11px", fontWeight: 500,
    background: "#E1F5EE", color: "#085041",
    padding: "5px 10px", borderRadius: "6px",
    textAlign: "center",
  },
  planBtn: {
    marginTop: "auto", width: "100%",
    padding: "0.6rem", borderRadius: "6px",
    fontSize: "13px", fontWeight: 500,
    cursor: "pointer", fontFamily: "inherit",
    transition: "opacity .15s",
  },

  /* TRUST */
  trustRow: {
    display: "flex", justifyContent: "center",
    flexWrap: "wrap", gap: "1.5rem",
    padding: "2rem 2.5rem",
    marginTop: "1rem",
    borderTop: "1px solid #d4d8e2",
  },
  trustItem: {
    display: "flex", alignItems: "center", gap: "8px",
    fontSize: "13px", color: "#64748b",
  },

  /* FOOTER */
  footer: {
    padding: "1.25rem 2.5rem",
    borderTop: "1px solid #d4d8e2",
    background: "#e8eaef",
    display: "flex", justifyContent: "space-between",
    alignItems: "center", flexWrap: "wrap", gap: "8px",
  },
  footerCopy: { fontSize: "12px", color: "#94a3b8" },

  /* LOADING / ERROR */
  center: { padding: "3rem 2rem", fontSize: "14px" },
};

function LandingPage() {
  const [planes, setPlanes]     = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);
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
      navigate("/cliente/cotizar", { state: { idPlan } });
    }
  };

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch (_) {}
    finally {
      localStorage.removeItem("usuario");
      navigate("/");
    }
  };

  if (cargando) return <p style={{ ...S.center, color: "#64748b" }}>Cargando planes…</p>;
  if (error)    return <p style={{ ...S.center, color: "#ef4444" }}>{error}</p>;

  return (
    <div style={S.page}>

      {/* ── NAVBAR ───────────────────────────────────────────────── */}
      <nav style={S.nav}>
        <div style={S.logoWrap}>
          <div style={S.logoIcon}>✦</div>
          <span style={S.logoText}>CleanPro</span>
        </div>
        {!usuario ? (
          <button
            style={S.navBtn}
            onClick={() => navigate("/login")}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.color = "#1e293b"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
          >
            Iniciar sesión
          </button>
        ) : (
          <button
            style={S.navBtn}
            onClick={handleLogout}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#94a3b8"; e.currentTarget.style.color = "#1e293b"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#475569"; }}
          >
            Cerrar sesión
          </button>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={S.heroOuter}>
        <div style={S.heroBg} />
        <div style={S.heroOverlay} />
        <div style={S.heroContent}>
          <div style={S.heroBadge}>
            <span>✓</span> Servicio profesional certificado
          </div>
          <h1 style={S.heroH1}>
            Limpieza empresarial<br />que se adapta a ti
          </h1>
          <p style={S.heroP}>
            Cotizaciones personalizadas en menos de 24 horas hábiles.
            Elige el plan que mejor se ajuste al tamaño y ritmo de tu empresa.
          </p>
          <div style={S.ctaRow}>
            <button
              style={S.btnPrimary}
              onClick={() => navigate(usuario ? "/cliente/cotizar" : "/login")}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#4238a3"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#534AB7"; }}
            >
              Solicitar cotización
            </button>
            <button
              style={S.btnGhost}
              onClick={() => document.getElementById("planes-section")?.scrollIntoView({ behavior: "smooth" })}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            >
              Ver planes
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <div style={S.statsBar}>
        {STATS.map((s, i) => (
          <div
            key={i}
            style={{
              ...S.statItem,
              ...(i === STATS.length - 1 ? { borderRight: "none" } : {}),
            }}
          >
            <div style={S.statNum}>{s.num}</div>
            <div style={S.statLbl}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── PLANES ───────────────────────────────────────────────── */}
      <section id="planes-section" style={S.planesSection}>
        <div style={S.planesHeader}>
          <h2 style={S.planesH2}>Planes de limpieza</h2>
          <p style={S.planesSubtitle}>
            Todos los precios son cotizados a medida según tus necesidades.
          </p>
        </div>

        <div style={S.grid}>
          {planes.map((plan, i) => {
            const est = PLAN_ESTILOS[i] || PLAN_ESTILOS[0];
            const esMasPopular = i === 1;

            return (
              <div
                key={plan.idPlan}
                style={{
                  ...S.card,
                  ...(esMasPopular ? { border: `1.5px solid ${est.border}` } : {}),
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                <span style={{ ...S.tag, background: est.tagBg, color: est.tagColor }}>
                  {plan.tipo}
                </span>

                <p style={S.cardName}>{plan.nombre ?? `Plan ${plan.tipo}`}</p>

                <hr style={S.divider} />

                <p style={S.cardDesc}>{plan.descripcion}</p>

                <div>
                  <div style={S.detailRow}>
                    <span style={{ ...S.dot, background: est.border }} />
                    <span>
                      <strong style={{ fontWeight: 500, color: "#334155" }}>Frecuencia:</strong>{" "}
                      {plan.frecuencia}
                    </span>
                  </div>
                  <div style={S.detailRow}>
                    <span style={{ ...S.dot, background: est.border }} />
                    <span>
                      <strong style={{ fontWeight: 500, color: "#334155" }}>Ideal para:</strong>{" "}
                      {plan.idealPara}
                    </span>
                  </div>
                </div>

                {esMasPopular && <div style={S.popularBadge}>Más solicitado</div>}

                <button
                  onClick={() => handleSolicitarPlan(plan.idPlan)}
                  style={{
                    ...S.planBtn,
                    border: est.btnSolid ? "none" : `1px solid ${est.border}`,
                    background: est.btnSolid ? est.border : "transparent",
                    color: est.btnSolid ? "#fff" : est.color,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.85";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  Solicitar cotización
                </button>
              </div>
            );
          })}
        </div>

        {/* ── TRUST SIGNALS ──────────────────────────────────────── */}
        <div style={S.trustRow}>
          {TRUST.map((t, i) => (
            <div key={i} style={S.trustItem}>
              <span style={{ fontSize: "15px" }}>{t.icon}</span>
              {t.text}
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={S.footer}>
        <span style={S.footerCopy}>© 2026 CleanPro · Todos los derechos reservados</span>
        <span style={S.footerCopy}>
          * Los planes son referenciales. Precio final según cotización personalizada.
        </span>
      </footer>
    </div>
  );
}

export default LandingPage;