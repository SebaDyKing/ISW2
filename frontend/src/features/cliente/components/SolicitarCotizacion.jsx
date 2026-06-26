import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { obtenerMisInstalacionesService, solicitarCotizacionService, obtenerPlanesService } from "../services/cliente.service";

const PLAN_ESTILOS = [
  { accentBg: "#EEEDFE", accentColor: "#534AB7", borderColor: "#534AB7", tagBg: "#CECBF6", tagColor: "#3C3489" },
  { accentBg: "#E1F5EE", accentColor: "#0F6E56", borderColor: "#0F6E56", tagBg: "#9FE1CB", tagColor: "#085041" },
  { accentBg: "#E6F1FB", accentColor: "#185FA5", borderColor: "#185FA5", tagBg: "#B5D4F4", tagColor: "#0C447C" },
];

const CHIPS_PERSONALIZADO = [
  "Superficie > 500 m²",
  "Más de un piso",
  "Fuera de horario laboral",
  "Acceso restringido",
  "Servicio urgente",
  "Requiere productos certificados",
  "Personal con credenciales",
];

const FRECUENCIAS_PERSONALIZADO = [
  "Diaria",
  "Interdiaria",
  "Semanal",
  "Quincenal",
  "Mensual",
  "A convenir",
];

const MAX_CHARS      = 500;
const MAX_SUPERFICIE = 99999;
const MAX_PERSONAS   = 9999;

function ModalConfirmacion({ estilo, onVolver }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50, padding: "1rem",
    }}>
      <div style={{
        background: "#f4f5f8", borderRadius: "14px", padding: "2rem",
        width: "100%", maxWidth: "420px", textAlign: "center",
        border: "1px solid #dde1e9",
      }}>
        <div style={{
          width: "52px", height: "52px", borderRadius: "50%",
          background: estilo?.accentBg || "#EEEDFE",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 1.25rem", fontSize: "22px",
          color: estilo?.accentColor || "#534AB7",
        }}>
          ✓
        </div>
        <p style={{ fontSize: "17px", fontWeight: 600, color: "#0f172a", marginBottom: "8px" }}>
          Solicitud recibida
        </p>
        <p style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.6", marginBottom: "1.75rem" }}>
          Hemos recibido tu solicitud de cotización correctamente. Nuestro equipo la revisará
          y te notificaremos por correo en un plazo máximo de{" "}
          <strong style={{ color: "#0f172a" }}>24 horas hábiles</strong>.
        </p>
        <button
          onClick={onVolver}
          style={{
            width: "100%", padding: "10px", borderRadius: "8px", border: "none",
            background: estilo?.accentColor || "#534AB7",
            color: "#fff", fontSize: "14px", fontWeight: 500, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

function SolicitarCotizacion() {
  const location = useLocation();
  const navigate = useNavigate();

  const planInicial =
    location.state?.idPlan ||
    Number(sessionStorage.getItem("planPreseleccionado")) ||
    null;

  const [planes, setPlanes]                       = useState([]);
  const [instalaciones, setInstalaciones]         = useState([]);
  const [planSeleccionado, setPlanSeleccionado]   = useState(planInicial);
  const [idInstalacion, setIdInstalacion]         = useState("");
  const [comentarios, setComentarios]             = useState("");
  const [superficie, setSuperficie]               = useState("");
  const [frecuenciaDeseada, setFrecuenciaDeseada] = useState("");
  const [numPersonas, setNumPersonas]             = useState("");
  const [medioContacto, setMedioContacto]         = useState("");
  const [horarioContacto, setHorarioContacto]     = useState("");
  const [enviando, setEnviando]                   = useState(false);
  const [cargando, setCargando]                   = useState(true);
  const [modalVisible, setModalVisible]           = useState(false);
  const [estiloModal, setEstiloModal]             = useState(null);

  useEffect(() => {
    sessionStorage.removeItem("planPreseleccionado");
    Promise.all([
      obtenerPlanesService(),
      obtenerMisInstalacionesService(),
    ])
      .then(([planesData, instalacionesData]) => {
        setPlanes(planesData);
        setInstalaciones(instalacionesData);
      })
      .catch(() => toast.error("Error al cargar los datos."))
      .finally(() => setCargando(false));
  }, []);

  const handleChip = (texto) => {
    setComentarios((prev) => prev ? `${prev} ${texto}.` : `${texto}.`);
  };

  const handleSuperficie = (e) => {
    const raw = e.target.value;
    if (raw === "") { setSuperficie(""); return; }
    const num = Math.min(Math.max(1, parseInt(raw, 10) || 1), MAX_SUPERFICIE);
    setSuperficie(String(num));
  };

  const handleNumPersonas = (e) => {
    const raw = e.target.value;
    if (raw === "") { setNumPersonas(""); return; }
    const num = Math.min(Math.max(1, parseInt(raw, 10) || 1), MAX_PERSONAS);
    setNumPersonas(String(num));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!planSeleccionado) { toast.error("Debes seleccionar un plan."); return; }
    if (!idInstalacion)    { toast.error("Debes seleccionar una instalación."); return; }
    if (esPersonalizado && !comentarios.trim()) {
      toast.error("El plan personalizado requiere que describas tus necesidades en comentarios.");
      return;
    }

    let comentarioFinal = comentarios;
    if (esPersonalizado) {
      const extras = [];
      if (superficie)        extras.push(`Superficie aproximada: ${superficie} m²`);
      if (frecuenciaDeseada) extras.push(`Frecuencia deseada: ${frecuenciaDeseada}`);
      if (numPersonas)       extras.push(`Personas en el recinto: ${numPersonas}`);
      if (extras.length > 0) {
        comentarioFinal = `${extras.join(" | ")}${comentarios.trim() ? ` | ${comentarios.trim()}` : ""}`;
      }
    }

    setEnviando(true);
    try {
      await solicitarCotizacionService({
        id_plan:         Number(planSeleccionado),
        id_instalacion:  Number(idInstalacion),
        comentarios:     comentarioFinal,
        medioContacto:   medioContacto   || null,
        horarioContacto: horarioContacto || null,
      });
      setEstiloModal(estiloActual);
      setModalVisible(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('/Fondo_LandingPage.png')",
        backgroundSize: "cover", backgroundPosition: "center 20%",
        filter: "blur(2px) brightness(0.55)", transform: "scale(1.04)", zIndex: 0,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to right, rgba(10,18,40,0.80) 40%, rgba(10,18,40,0.50) 100%)",
        zIndex: 1,
      }} />
      <p style={{ position: "relative", zIndex: 2, fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
        Cargando...
      </p>
    </div>
  );

  const planIndex         = planes.findIndex((p) => p.idPlan === Number(planSeleccionado));
  const planActual        = planIndex >= 0 ? planes[planIndex] : null;
  const estiloActual      = planIndex >= 0 ? (PLAN_ESTILOS[planIndex] || PLAN_ESTILOS[0]) : null;
  const esPersonalizado   = planActual?.esPersonalizado;
  const instalacionActual = instalaciones.find((i) => i.idInstalacion === Number(idInstalacion));
  const charsRestantes    = MAX_CHARS - comentarios.length;
  const contadorColor     = charsRestantes < 100 ? "#854F0B" : "#94a3b8";
  const pasoActual        = !planSeleccionado ? 1 : !idInstalacion ? 2 : !comentarios ? 3 : 4;
  const btnDeshabilitado  = enviando || instalaciones.length === 0 || (esPersonalizado && !comentarios.trim());

  return (
    <>
      {modalVisible && (
        <ModalConfirmacion estilo={estiloModal} onVolver={() => navigate("/")} />
      )}

      {/* Página con imagen de fondo igual que Login/Register */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: "3rem 1rem",
      }}>

        {/* Fondo con blur */}
        <div style={{
          position: "fixed", inset: 0,
          backgroundImage: "url('/Fondo_LandingPage.png')",
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          filter: "blur(2px) brightness(0.55)",
          transform: "scale(1.04)",
          zIndex: 0,
        }} />

        {/* Overlay oscuro */}
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(10,18,40,0.65)",
          zIndex: 1,
        }} />

        {/* Card del formulario */}
        <div style={{
          position: "relative", zIndex: 2,
          background: "#f4f5f8",
          border: "1px solid #dde1e9",
          borderRadius: "14px",
          padding: "2rem",
          width: "100%", maxWidth: "500px",
        }}>

          {/* Volver */}
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none", border: "none", padding: 0,
              fontSize: "13px", color: "#64748b", cursor: "pointer",
              marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "6px",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#0f172a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; }}
          >
            ← Volver
          </button>

          {/* Encabezado */}
          <p style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px", color: "#0f172a" }}>
            Solicitar cotización
          </p>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "1.5rem" }}>
            Completa los datos para enviar tu solicitud al equipo de CleanPro.
          </p>

          {/* Stepper */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1.75rem" }}>
            {["Plan", "Instalación", "Comentarios", "Confirmar"].map((paso, i) => {
              const num      = i + 1;
              const activo   = num === pasoActual;
              const completo = num < pasoActual;
              return (
                <div key={paso} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{
                      width: "24px", height: "24px", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: 500,
                      background: completo ? "#534AB7" : activo ? "#EEEDFE" : "#e2e5ea",
                      color:      completo ? "#fff"    : activo ? "#534AB7" : "#94a3b8",
                      border:     activo   ? "1px solid #534AB7" : "1px solid transparent",
                    }}>
                      {completo ? "✓" : num}
                    </div>
                    <span style={{
                      fontSize: "11px",
                      color: activo ? "#534AB7" : completo ? "#334155" : "#94a3b8",
                      fontWeight: activo ? 500 : 400,
                      whiteSpace: "nowrap",
                    }}>
                      {paso}
                    </span>
                  </div>
                  {i < 3 && (
                    <div style={{
                      flex: 1, height: "1px",
                      background: completo ? "#534AB7" : "#dde1e9",
                      margin: "0 6px", marginBottom: "18px",
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit}>

            {/* Planes */}
            <label style={labelStyle}>Plan de servicio</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {planes.map((p, i) => {
                const estilo = PLAN_ESTILOS[i] || PLAN_ESTILOS[0];
                const activo = Number(planSeleccionado) === p.idPlan;
                return (
                  <div
                    key={p.idPlan}
                    onClick={() => {
                      setPlanSeleccionado(p.idPlan);
                      setComentarios(""); setSuperficie("");
                      setFrecuenciaDeseada(""); setNumPersonas("");
                    }}
                    style={{
                      border: activo ? `1px solid ${estilo.borderColor}` : "1px solid #dde1e9",
                      background: activo ? estilo.accentBg : "#eef0f4",
                      borderRadius: "8px", padding: "12px 8px",
                      textAlign: "center", cursor: "pointer", transition: "all .15s",
                    }}
                  >
                    <p style={{ fontSize: "13px", fontWeight: 500, marginBottom: "4px", color: activo ? estilo.accentColor : "#334155" }}>
                      {p.tipo}
                    </p>
                    <p style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {p.esPersonalizado ? "A convenir" : p.frecuencia}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Detalle del plan */}
            {planActual && estiloActual && (
              <div style={{
                marginTop: "10px", padding: "12px 14px",
                background: estiloActual.accentBg,
                borderRadius: "8px", borderLeft: `3px solid ${estiloActual.borderColor}`,
              }}>
                <p style={{ fontSize: "12px", fontWeight: 500, color: estiloActual.accentColor, marginBottom: "4px" }}>
                  Ideal para: {planActual.idealPara}
                </p>
                <p style={{ fontSize: "12px", color: estiloActual.accentColor, opacity: 0.85 }}>
                  {planActual.descripcion}
                </p>
              </div>
            )}

            <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>
              * Todos los planes se cotizan a medida. Los valores finales serán informados por nuestro equipo.
            </p>

            <hr style={{ border: "none", borderTop: "1px solid #dde1e9", margin: "1.25rem 0" }} />

            {/* Instalación */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Instalación</label>
              {instalaciones.length === 0 ? (
                <p style={{ fontSize: "13px", color: "#ef4444" }}>
                  No tienes instalaciones registradas. Contacta al administrador.
                </p>
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

            <hr style={{ border: "none", borderTop: "1px solid #dde1e9", margin: "1.25rem 0" }} />

            {/* Comentarios */}
            {esPersonalizado ? (
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Detalles del servicio</label>
                <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>
                  Para preparar una propuesta precisa, completa la siguiente información sobre tu instalación.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ ...labelStyle, fontSize: "12px" }}>
                      Superficie aprox. (m²)
                      <span style={{ fontWeight: 400, color: "#94a3b8" }}> máx. {MAX_SUPERFICIE.toLocaleString("es-CL")}</span>
                    </label>
                    <input
                      type="number" min="1" max={MAX_SUPERFICIE}
                      value={superficie} onChange={handleSuperficie}
                      placeholder="Ej: 800" style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, fontSize: "12px" }}>
                      Personas en el recinto
                      <span style={{ fontWeight: 400, color: "#94a3b8" }}> máx. {MAX_PERSONAS.toLocaleString("es-CL")}</span>
                    </label>
                    <input
                      type="number" min="1" max={MAX_PERSONAS}
                      value={numPersonas} onChange={handleNumPersonas}
                      placeholder="Ej: 50" style={inputStyle}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ ...labelStyle, fontSize: "12px" }}>Frecuencia deseada</label>
                  <select value={frecuenciaDeseada} onChange={(e) => setFrecuenciaDeseada(e.target.value)} style={inputStyle}>
                    <option value="">Selecciona una frecuencia</option>
                    {FRECUENCIAS_PERSONALIZADO.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <label style={{ ...labelStyle, fontSize: "12px" }}>
                  Comentarios <span style={{ fontWeight: 400, color: "#94a3b8" }}>(requerido)</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                  {CHIPS_PERSONALIZADO.map((chip) => (
                    <span
                      key={chip}
                      onClick={() => handleChip(chip)}
                      style={{ fontSize: "12px", padding: "4px 10px", border: "1px solid #dde1e9", borderRadius: "20px", cursor: "pointer", color: "#64748b", background: "#eef0f4", userSelect: "none" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#185FA5"; e.currentTarget.style.color = "#0C447C"; e.currentTarget.style.background = "#E6F1FB"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#dde1e9"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "#eef0f4"; }}
                    >
                      + {chip}
                    </span>
                  ))}
                </div>
                <div style={{ position: "relative" }}>
                  <textarea
                    value={comentarios}
                    onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setComentarios(e.target.value); }}
                    rows={4}
                    placeholder="Describe el tipo de instalación, requerimientos especiales, horarios preferidos y cualquier detalle relevante..."
                    style={{ ...inputStyle, resize: "vertical", paddingBottom: "28px", lineHeight: "1.5" }}
                  />
                  <span style={{ position: "absolute", bottom: "8px", right: "10px", fontSize: "11px", color: contadorColor }}>
                    {comentarios.length} / {MAX_CHARS}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>
                  Comentarios <span style={{ fontWeight: 400, color: "#94a3b8" }}>(opcional)</span>
                </label>
                <div style={{ position: "relative" }}>
                  <textarea
                    value={comentarios}
                    onChange={(e) => { if (e.target.value.length <= MAX_CHARS) setComentarios(e.target.value); }}
                    rows={4}
                    placeholder="Describe detalles adicionales relevantes para tu cotización..."
                    style={{ ...inputStyle, resize: "vertical", paddingBottom: "28px", lineHeight: "1.5" }}
                  />
                  <span style={{ position: "absolute", bottom: "8px", right: "10px", fontSize: "11px", color: contadorColor }}>
                    {comentarios.length} / {MAX_CHARS}
                  </span>
                </div>
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid #dde1e9", margin: "1.25rem 0" }} />

            {/* Preferencias de contacto */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={labelStyle}>
                Preferencias de contacto{" "}
                <span style={{ fontWeight: 400, color: "#94a3b8" }}>(opcional)</span>
              </label>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>
                Indícanos cómo y cuándo prefieres que te contactemos una vez revisada tu solicitud.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ ...labelStyle, fontSize: "12px" }}>Medio preferido</label>
                  <select value={medioContacto} onChange={(e) => setMedioContacto(e.target.value)} style={inputStyle}>
                    <option value="">Sin preferencia</option>
                    <option>WhatsApp</option>
                    <option>Llamada</option>
                    <option>Correo electrónico</option>
                  </select>
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: "12px" }}>Horario preferido</label>
                  <select value={horarioContacto} onChange={(e) => setHorarioContacto(e.target.value)} style={inputStyle}>
                    <option value="">Sin preferencia</option>
                    <option>Mañana (9:00 - 13:00)</option>
                    <option>Tarde (13:00 - 18:00)</option>
                    <option>Indiferente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Resumen */}
            {(planActual || instalacionActual) && (
              <>
                <hr style={{ border: "none", borderTop: "1px solid #dde1e9", margin: "1.25rem 0" }} />
                <div style={{
                  background: "#eef0f4", border: "1px solid #dde1e9",
                  borderRadius: "8px", padding: "12px 14px", marginBottom: "1.25rem",
                }}>
                  <p style={{ fontSize: "11px", fontWeight: 500, color: "#94a3b8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Resumen de solicitud
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Plan</span>
                      <span style={{ fontWeight: 500, color: estiloActual?.accentColor || "#0f172a" }}>
                        {planActual ? planActual.tipo : "—"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Instalación</span>
                      <span style={{ fontWeight: 500, color: "#0f172a" }}>
                        {instalacionActual ? instalacionActual.nombre : "—"}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Comentarios</span>
                      <span style={{ fontWeight: 500, color: "#0f172a" }}>
                        {comentarios.trim() ? "Incluidos" : "Sin comentarios"}
                      </span>
                    </div>
                    {(medioContacto || horarioContacto) && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#64748b" }}>Contacto</span>
                        <span style={{ fontWeight: 500, color: "#0f172a" }}>
                          {[medioContacto, horarioContacto].filter(Boolean).join(" · ")}
                        </span>
                      </div>
                    )}
                    <div style={{ borderTop: "1px solid #dde1e9", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                      <span style={{ color: "#64748b" }}>Precio</span>
                      <span style={{ fontWeight: 500, color: "#0f172a" }}>A cotizar</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Botón enviar */}
            <button
              type="submit"
              disabled={btnDeshabilitado}
              style={{
                width: "100%", padding: "10px", borderRadius: "8px", border: "none",
                background: btnDeshabilitado ? "#94a3b8" : "#534AB7",
                color: "#fff", fontSize: "14px", fontWeight: 500,
                cursor: btnDeshabilitado ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "background .15s", fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { if (!btnDeshabilitado) e.currentTarget.style.background = "#4238a3"; }}
              onMouseLeave={(e) => { if (!btnDeshabilitado) e.currentTarget.style.background = "#534AB7"; }}
            >
              {enviando ? "Enviando..." : "Enviar solicitud →"}
            </button>

            <p style={{ textAlign: "center", fontSize: "12px", color: "#94a3b8", marginTop: "1rem" }}>
              ¿Tienes dudas? Contáctate con nuestro equipo de ventas.
            </p>

          </form>
        </div>
      </div>
    </>
  );
}

const labelStyle = {
  display: "block", fontSize: "13px", fontWeight: 500, color: "#64748b", marginBottom: "8px",
};

const inputStyle = {
  width: "100%", padding: "9px 12px", border: "1px solid #dde1e9",
  borderRadius: "8px", fontSize: "13px", background: "#fff", color: "#0f172a",
  outline: "none", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  boxSizing: "border-box",
};

export default SolicitarCotizacion;