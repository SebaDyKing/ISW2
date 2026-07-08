import { useState, useEffect } from "react";
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
const MAX_EMPLEADOS  = 50;

function ModalConfirmacion({ estilo, onVolver }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 60, padding: "1rem",
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
          Cerrar
        </button>
      </div>
    </div>
  );
}

function ModalCotizacion({ onClose, planPreseleccionado }) {
  const [planes, setPlanes]                       = useState([]);
  const [instalaciones, setInstalaciones]         = useState([]);
  const [planSeleccionado, setPlanSeleccionado]   = useState(planPreseleccionado || null);
  const [idInstalacion, setIdInstalacion]         = useState("");
  const [comentarios, setComentarios]             = useState("");
  const [superficie, setSuperficie]               = useState("");
  const [frecuenciaDeseada, setFrecuenciaDeseada] = useState("");
  const [numPersonas, setNumPersonas]             = useState("");
  const [cantidadEmpleados, setCantidadEmpleados] = useState("1");
  const [medioContacto, setMedioContacto]         = useState("");
  const [horarioContacto, setHorarioContacto]     = useState("");
  const [enviando, setEnviando]                   = useState(false);
  const [cargando, setCargando]                   = useState(true);
  const [modalVisible, setModalVisible]           = useState(false);
  const [estiloModal, setEstiloModal]             = useState(null);

  useEffect(() => {
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

  const handleCantidadEmpleados = (e) => {
    const raw = e.target.value;
    if (raw === "") { setCantidadEmpleados(""); return; }
    const num = Math.min(Math.max(1, parseInt(raw, 10) || 1), MAX_EMPLEADOS);
    setCantidadEmpleados(String(num));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!planSeleccionado) { toast.error("Debes seleccionar un plan."); return; }
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
        id_plan:           Number(planSeleccionado),
        id_instalacion:    (idInstalacion && idInstalacion !== "nueva") ? Number(idInstalacion) : null,
        comentarios:       comentarioFinal,
        medioContacto:     medioContacto   || null,
        horarioContacto:   horarioContacto || null,
        cantidadEmpleados: Number(cantidadEmpleados),
      });
      setEstiloModal(estiloActual);
      setModalVisible(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al enviar la solicitud.");
    } finally {
      setEnviando(false);
    }
  };

  const planIndex         = planes.findIndex((p) => p.idPlan === Number(planSeleccionado));
  const planActual        = planIndex >= 0 ? planes[planIndex] : null;
  const estiloActual      = planIndex >= 0 ? (PLAN_ESTILOS[planIndex] || PLAN_ESTILOS[0]) : null;
  const esPersonalizado   = planActual?.esPersonalizado;
  const instalacionActual = instalaciones.find((i) => i.idInstalacion === Number(idInstalacion));
  const charsRestantes    = MAX_CHARS - comentarios.length;
  const contadorColor     = charsRestantes < 100 ? "#854F0B" : "#94a3b8";
  
  const instalacionValida = instalaciones.length === 0 || idInstalacion !== "";
  let pasoActual = 1;
  if (planSeleccionado) {
    pasoActual = 2;
    if (instalacionValida) {
      pasoActual = 3;
      if (comentarios.trim().length > 0) {
        pasoActual = 4;
      }
    }
  }

  const btnDeshabilitado  = enviando || !instalacionValida || !cantidadEmpleados || (esPersonalizado && !comentarios.trim());

  return (
    <>
      {modalVisible && (
        <ModalConfirmacion estilo={estiloModal} onVolver={() => onClose(true)} />
      )}

      <div style={{
        position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50, padding: "1rem", backdropFilter: "blur(4px)"
      }}>
        <div style={{
          background: "#f4f5f8",
          borderRadius: "14px",
          width: "100%", maxWidth: "560px",
          maxHeight: "90vh",
          display: "flex", flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}>
          {/* Header */}
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #dde1e9", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", margin: 0 }}>Nueva Cotización</p>
            </div>
            <button onClick={() => onClose(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1 }}>✕</button>
          </div>

          {/* Body */}
          <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
            {cargando ? (
              <p style={{ fontSize: "14px", color: "#64748b", textAlign: "center", padding: "2rem" }}>
                Cargando datos...
              </p>
            ) : (
              <>
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

                  <hr style={{ border: "none", borderTop: "1px solid #dde1e9", margin: "1.25rem 0" }} />

                  {/* Instalación */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
                      <label style={{...labelStyle, marginBottom: 0}}>Instalación a cotizar</label>
                    </div>

                    {instalaciones.length === 0 ? (
                      <div style={{
                        display: "flex", gap: "12px", alignItems: "flex-start",
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        borderRadius: "8px", padding: "16px", marginBottom: "12px"
                      }}>
                        <div style={{ color: "#64748b", marginTop: "2px" }}>
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", marginBottom: "4px" }}>
                            Sin instalaciones registradas
                          </p>
                          <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                            Actualmente no posees recintos en tu cuenta. Puedes continuar y enviar esta solicitud de cotización definiendo los detalles de la nueva ubicación en los comentarios.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <select value={idInstalacion} onChange={(e) => setIdInstalacion(e.target.value)} style={inputStyle}>
                        <option value="" disabled>Selecciona una instalación</option>
                        <option value="nueva" style={{ fontWeight: 500 }}>Cotizar para una nueva ubicación / Sin asignar</option>
                        {instalaciones.map((inst) => (
                          <option key={inst.idInstalacion} value={inst.idInstalacion}>
                            {inst.nombre} — {inst.direccion}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid #dde1e9", margin: "1.25rem 0" }} />

                  {/* Empleados necesarios */}
                  <div style={{ marginBottom: "1.25rem" }}>
                    <label style={labelStyle}>Empleados necesarios</label>
                    <input
                      type="number" min="1" max={MAX_EMPLEADOS}
                      value={cantidadEmpleados} onChange={handleCantidadEmpleados}
                      placeholder="Ej: 2" style={inputStyle}
                    />
                  </div>

                  <hr style={{ border: "none", borderTop: "1px solid #dde1e9", margin: "1.25rem 0" }} />

                  {/* Comentarios */}
                  {esPersonalizado ? (
                    <div style={{ marginBottom: "1.25rem" }}>
                      <label style={labelStyle}>Detalles del servicio</label>
                      <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>
                        Para preparar una propuesta precisa, completa la siguiente información.
                      </p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                        <div>
                          <label style={{ ...labelStyle, fontSize: "12px" }}>
                            Superficie aprox. (m²)
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
                          placeholder="Describe el tipo de instalación, requerimientos especiales..."
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

                  {/* Botón enviar */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "2rem" }}>
                    <button
                      type="button"
                      onClick={() => onClose(false)}
                      style={{
                        padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1",
                        background: "#fff", color: "#475569", fontSize: "14px", fontWeight: 500,
                        cursor: "pointer", transition: "all .15s", flexShrink: 0
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={btnDeshabilitado}
                      style={{
                        flex: 1, padding: "10px", borderRadius: "8px", border: "none",
                        background: btnDeshabilitado ? "#94a3b8" : "#534AB7",
                        color: "#fff", fontSize: "14px", fontWeight: 500,
                        cursor: btnDeshabilitado ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        transition: "background .15s", fontFamily: "inherit",
                      }}
                    >
                      {enviando ? "Enviando..." : "Enviar solicitud →"}
                    </button>
                  </div>

                </form>
              </>
            )}
          </div>
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

export default ModalCotizacion;
