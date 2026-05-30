import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPlanesService } from "../services/cliente.service";

const PLAN_STYLES = {
  1: { tag: "Básico",   bg: "#f1efff", color: "#534AB7", border: "#534AB7" },
  2: { tag: "Estándar", bg: "#e1f5ee", color: "#0F6E56", border: "#0F6E56" },
  3: { tag: "Premium",  bg: "#faeeda", color: "#854F0B", border: "#854F0B" },
};

function LandingPage() {
  const [planes, setPlanes]   = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerPlanesService()
      .then((res) => setPlanes(res.data))
      .catch(() => setError("No se pudieron cargar los planes."))
      .finally(() => setCargando(false));
  }, []);

  const handleSolicitarPlan = (idPlan) => {
    const token = localStorage.getItem("token");
    if (!token) {
      sessionStorage.setItem("planPreseleccionado", idPlan);
      navigate("/login");
    } else {
      navigate("/cliente/cotizar", { state: { idPlan } });
    }
  };

  if (cargando) return <p style={{ padding: "2rem", fontSize: "14px", color: "#64748b" }}>Cargando planes...</p>;
  if (error)    return <p style={{ padding: "2rem", fontSize: "14px", color: "#ef4444" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "3rem 2rem" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 500, marginBottom: ".4rem" }}>Planes de limpieza</h1>
      <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "2rem" }}>Elige el plan que mejor se adapte a tu empresa</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "1rem" }}>
        {planes.map((plan) => {
          const style = PLAN_STYLES[plan.idPlan] || PLAN_STYLES[1];
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
                borderRadius: "4px", width: "fit-content",
                background: style.bg, color: style.color,
              }}>
                {plan.tipo}
              </span>

              <p style={{ fontSize: "22px", fontWeight: 500 }}>
                ${Number(plan.precio).toLocaleString("es-CL")}
                <span style={{ fontSize: "13px", fontWeight: 400, color: "#64748b" }}> / mes</span>
              </p>

              <hr style={{ border: "none", borderTop: "1px solid #e2e8f0" }} />

              <p style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#cbd5e1", flexShrink: 0, display: "inline-block" }} />
                {plan.cantidadEmpleados} empleados asignados
              </p>
              <p style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#cbd5e1", flexShrink: 0, display: "inline-block" }} />
                {plan.cantidadProductos} productos incluidos
              </p>

              <button
                onClick={() => handleSolicitarPlan(plan.idPlan)}
                style={{
                  marginTop: ".25rem", width: "100%", padding: ".55rem",
                  border: "1px solid #cbd5e1", borderRadius: "6px",
                  background: "transparent", fontSize: "13px", cursor: "pointer",
                }}
              >
                Solicitar cotización
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LandingPage;