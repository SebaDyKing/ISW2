import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPlanesService } from "../services/cliente.service";
import api from "../../../config/axios";

const PLAN_ESTILOS = [
  { bg: "#EEEDFE", color: "#534AB7", border: "#534AB7", tagBg: "#CECBF6", tagColor: "#3C3489" },
  { bg: "#E1F5EE", color: "#0F6E56", border: "#0F6E56", tagBg: "#9FE1CB", tagColor: "#085041" },
  { bg: "#E6F1FB", color: "#185FA5", border: "#185FA5", tagBg: "#B5D4F4", tagColor: "#0C447C" },
];

function LandingPage() {
  const [planes, setPlanes]     = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState(null);
  const navigate = useNavigate();

  // Sesión activa si existe el objeto usuario en localStorage
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
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    finally {
      localStorage.removeItem("usuario");
      navigate("/");
    }
  };

  if (cargando) return <p style={{ padding: "2rem", fontSize: "14px", color: "#64748b" }}>Cargando planes...</p>;
  if (error)    return <p style={{ padding: "2rem", fontSize: "14px", color: "#ef4444" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 500, marginBottom: "4px" }}>Planes de limpieza</h1>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            Elige el plan de referencia que mejor se adapte a tu empresa. Todos los precios son cotizados a medida.
          </p>
        </div>
        {!usuario ? (
          <button
            onClick={() => navigate("/login")}
            style={{ padding: ".45rem 1rem", border: "1px solid #cbd5e1", borderRadius: "6px", background: "transparent", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Iniciar sesión
          </button>
        ) : (
          <button
            onClick={handleLogout}
            style={{ padding: ".45rem 1rem", border: "1px solid #cbd5e1", borderRadius: "6px", background: "transparent", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            Cerrar sesión
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "1rem" }}>
        {planes.map((plan, i) => {
          const estilo = PLAN_ESTILOS[i] || PLAN_ESTILOS[0];
          return (
            <div
              key={plan.idPlan}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: ".75rem",
              }}
            >
              <span style={{
                fontSize: "11px", fontWeight: 500, padding: "3px 10px",
                borderRadius: "20px", width: "fit-content",
                background: estilo.tagBg, color: estilo.tagColor,
              }}>
                {plan.tipo}
              </span>

              <hr style={{ border: "none", borderTop: "1px solid #e2e8f0" }} />

              <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                {plan.descripcion}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: estilo.border, flexShrink: 0, marginTop: "6px", display: "inline-block" }} />
                  <span><strong style={{ fontWeight: 500, color: "#334155" }}>Frecuencia:</strong> {plan.frecuencia}</span>
                </p>
                <p style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: estilo.border, flexShrink: 0, marginTop: "6px", display: "inline-block" }} />
                  <span><strong style={{ fontWeight: 500, color: "#334155" }}>Ideal para:</strong> {plan.idealPara}</span>
                </p>
              </div>

              <button
                onClick={() => handleSolicitarPlan(plan.idPlan)}
                style={{
                  marginTop: "auto",
                  width: "100%",
                  padding: ".6rem",
                  border: `1px solid ${estilo.border}`,
                  borderRadius: "6px",
                  background: plan.esPersonalizado ? estilo.bg : "transparent",
                  color: estilo.color,
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "background .15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = estilo.bg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = plan.esPersonalizado ? estilo.bg : "transparent"; }}
              >
                Solicitar cotización
              </button>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "2rem" }}>
        * Todos los planes son referenciales. Nuestro equipo preparará una cotización personalizada según tus necesidades.
      </p>
    </div>
  );
}

export default LandingPage;