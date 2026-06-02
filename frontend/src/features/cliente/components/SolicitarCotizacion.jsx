import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { obtenerMisInstalacionesService, solicitarCotizacionService } from "../services/cliente.service";

const PLANES = [
  { id: 1, label: "Básico",   bg: "#f1efff", color: "#534AB7", border: "#534AB7" },
  { id: 2, label: "Estándar", bg: "#e1f5ee", color: "#0F6E56", border: "#0F6E56" },
  { id: 3, label: "Premium",  bg: "#faeeda", color: "#854F0B", border: "#854F0B" },
];

function SolicitarCotizacion() {
  const location = useLocation();
  const navigate = useNavigate();

  const planInicial =
    location.state?.idPlan ||
    Number(sessionStorage.getItem("planPreseleccionado")) ||
    null;

  const [instalaciones, setInstalaciones]       = useState([]);
  const [planSeleccionado, setPlanSeleccionado] = useState(planInicial);
  const [idInstalacion, setIdInstalacion]       = useState("");
  const [comentarios, setComentarios]           = useState("");
  const [enviando, setEnviando]                 = useState(false);
  const [cargando, setCargando]                 = useState(true);

  useEffect(() => {
    sessionStorage.removeItem("planPreseleccionado");
    obtenerMisInstalacionesService()
      .then((res) => setInstalaciones(res.data))
      .catch(() => toast.error("No se pudieron cargar tus instalaciones."))
      .finally(() => setCargando(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!planSeleccionado) { toast.error("Debes seleccionar un plan."); return; }
    if (!idInstalacion)    { toast.error("Debes seleccionar una instalación."); return; }

    setEnviando(true);
    try {
      await solicitarCotizacionService({
        id_plan:        Number(planSeleccionado),
        id_instalacion: Number(idInstalacion),
        comentarios,
      });
      toast.success("Solicitud enviada correctamente.");
      setComentarios("");
      setIdInstalacion("");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return <p style={{ padding: "2rem", fontSize: "14px", color: "#64748b" }}>Cargando...</p>;

  const inputStyle = {
    width: "100%", padding: ".55rem .75rem",
    border: "1px solid #e2e8f0", borderRadius: "6px",
    fontSize: "13px", background: "#fff",
  };

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "3rem 2rem", display: "flex", justifyContent: "center" }}>
      <div style={{
        background: "#fff", border: "1px solid #e2e8f0",
        borderRadius: "10px", padding: "1.75rem", maxWidth: "500px",
      }}>

        <button
          onClick={() => navigate("/")}
          style={{
            background: "none", border: "none", padding: 0,
            fontSize: "13px", color: "#64748b", cursor: "pointer",
            marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "4px",
          }}
        >
          ← Volver
        </button>

        <p style={{ fontSize: "17px", fontWeight: 500, marginBottom: ".25rem" }}>Solicitar cotización</p>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "1.5rem" }}>Completa los datos para enviar tu solicitud</p>

        <form onSubmit={handleSubmit}>

          {/* Pills de plan */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#64748b", display: "block", marginBottom: ".35rem" }}>Plan</label>
            <div style={{ display: "flex", gap: ".5rem" }}>
              {PLANES.map((p) => {
                const activo = Number(planSeleccionado) === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setPlanSeleccionado(p.id)}
                    style={{
                      flex: 1, padding: ".45rem", borderRadius: "6px", textAlign: "center",
                      fontSize: "12px", cursor: "pointer",
                      border: activo ? `1px solid ${p.border}` : "1px solid #e2e8f0",
                      background: activo ? p.bg : "transparent",
                      color: activo ? p.color : "#64748b",
                      fontWeight: activo ? 500 : 400,
                    }}
                  >
                    {p.label}
                  </div>
                );
              })}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "1.25rem 0" }} />

          {/* Instalación */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#64748b", display: "block", marginBottom: ".35rem" }}>Instalación</label>
            {instalaciones.length === 0 ? (
              <p style={{ fontSize: "13px", color: "#ef4444" }}>No tienes instalaciones registradas. Contacta al administrador.</p>
            ) : (
              <select value={idInstalacion} onChange={(e) => setIdInstalacion(e.target.value)} style={inputStyle}>
                <option value="" disabled>Selecciona una instalación</option>
                {instalaciones.map((inst) => (
                  <option key={inst.idInstalacion} value={inst.idInstalacion}>
                    {inst.nombre} — {inst.direccion}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Comentarios */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "13px", fontWeight: 500, color: "#64748b", display: "block", marginBottom: ".35rem" }}>
              Comentarios <span style={{ fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={3}
              placeholder="Detalles adicionales para esta cotización..."
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          <button
            type="submit"
            disabled={enviando || instalaciones.length === 0}
            style={{
              width: "100%", padding: ".6rem",
              border: "1px solid #cbd5e1", borderRadius: "6px",
              background: "transparent", fontSize: "13px", fontWeight: 500,
              cursor: enviando ? "not-allowed" : "pointer",
              opacity: enviando ? 0.6 : 1,
              marginTop: ".5rem",
            }}
          >
            {enviando ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SolicitarCotizacion;