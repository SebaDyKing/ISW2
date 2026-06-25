import { useEffect, useState, useMemo, useRef } from "react";
import { obtenerCotizacionesService, actualizarEstadoCotizacionService } from "../services/admin.service";
import toast from "react-hot-toast";

const BADGE = {
  pendiente: { bg: "#fef9c3", color: "#854d0e" },
  aprobada:  { bg: "#dcfce7", color: "#166534" },
  rechazada: { bg: "#fee2e2", color: "#991b1b" },
  vencida:   { bg: "#f3e8ff", color: "#6b21a8" },
};

function formatFecha(ts, opts = { day: "2-digit", month: "short", year: "numeric" }) {
  return ts ? new Date(ts).toLocaleDateString("es-CL", opts) : "—";
}

function mesAnio(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── Countdown ─────────────────────────────────────────────────────────────────
function TiempoRestante({ fechaLimite, estado }) {
  const calcularSegundos = () =>
    Math.max(0, Math.floor((new Date(fechaLimite) - Date.now()) / 1000));

  const [segundos, setSegundos] = useState(calcularSegundos);
  const intervaloRef = useRef(null);

  useEffect(() => {
    intervaloRef.current = setInterval(() => setSegundos(calcularSegundos()), 1000);
    return () => clearInterval(intervaloRef.current);
  }, [fechaLimite]);

  if (estado !== "Pendiente" || !fechaLimite)
    return <span style={{ color: "#94a3b8", fontSize: "12px" }}>—</span>;

  if (segundos <= 0)
    return <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b21a8" }}>Vencida</span>;

  const color =
    segundos < 3600     ? "#dc2626" :
    segundos < 4 * 3600 ? "#d97706" : "#16a34a";

  if (segundos >= 86400) {
    const dias    = Math.floor(segundos / 86400);
    const horas   = Math.floor((segundos % 86400) / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return (
      <span style={{ fontSize: "12px", fontWeight: 600, color, fontVariantNumeric: "tabular-nums" }}>
        {dias}d {horas}h {minutos}m
      </span>
    );
  }

  const horas   = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs    = segundos % 60;
  return (
    <span style={{ fontSize: "12px", fontWeight: 600, color, fontVariantNumeric: "tabular-nums" }}>
      {String(horas).padStart(2, "0")}:{String(minutos).padStart(2, "0")}:{String(segs).padStart(2, "0")}
    </span>
  );
}

// ── Modal detalle ──────────────────────────────────────────────────────────────
function ModalDetalle({ cotizacion, onCerrar, onResolver }) {
  if (!cotizacion) return null;
  const estadoN = cotizacion.estado?.toLowerCase();
  const badge   = BADGE[estadoN] ?? { bg: "#f1f5f9", color: "#475569" };

  return (
    <div style={overlayStyle}>
      <div style={{ background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>

        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a", marginBottom: "2px" }}>Detalle de solicitud</p>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>{formatFecha(cotizacion.fechaCreacion, { day: "2-digit", month: "long", year: "numeric" })}</p>
          </div>
          <span style={{ padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, background: badge.bg, color: badge.color }}>
            {cotizacion.estado}
          </span>
        </div>

        <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <Seccion titulo="Cliente">
            <Fila label="Empresa"  valor={cotizacion.cliente?.nombreEmpresa || "—"} />
            <Fila label="Teléfono" valor={cotizacion.cliente?.telefono      || "—"} />
          </Seccion>

          {(cotizacion.medioContacto || cotizacion.horarioContacto) && (
            <Seccion titulo="Preferencias de contacto">
              {cotizacion.medioContacto   && <Fila label="Medio"   valor={cotizacion.medioContacto} />}
              {cotizacion.horarioContacto && <Fila label="Horario" valor={cotizacion.horarioContacto} />}
            </Seccion>
          )}

          <Seccion titulo="Instalación">
            <Fila label="Nombre"    valor={cotizacion.instalacion?.nombre    || "—"} />
            <Fila label="Dirección" valor={cotizacion.instalacion?.direccion || "—"} />
          </Seccion>

          <Seccion titulo="Plan solicitado">
            <Fila label="Tipo"       valor={cotizacion.plan?.tipo       || "—"} />
            <Fila label="Frecuencia" valor={cotizacion.plan?.frecuencia || "—"} />
          </Seccion>

          {cotizacion.fechaLimite && (
            <Seccion titulo="Plazo de respuesta">
              <Fila
                label="Vence el"
                valor={formatFecha(cotizacion.fechaLimite, {
                  weekday: "long", day: "numeric", month: "long",
                  year: "numeric", hour: "2-digit", minute: "2-digit"
                })}
              />
              <div style={{ marginTop: "4px" }}>
                <TiempoRestante fechaLimite={cotizacion.fechaLimite} estado={cotizacion.estado} />
              </div>
            </Seccion>
          )}

          {cotizacion.comentarios && (
            <Seccion titulo="Comentarios del cliente">
              <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {cotizacion.comentarios}
              </p>
            </Seccion>
          )}

          {cotizacion.motivo && (
            <Seccion titulo="Motivo de resolución">
              <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {cotizacion.motivo}
              </p>
            </Seccion>
          )}
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", display: "flex", gap: "8px", justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onCerrar} style={btnSecundario}>Cerrar</button>
          {cotizacion.estado === "Pendiente" && (
            <button onClick={() => onResolver(cotizacion)} style={btnPrimario}>
              Resolver solicitud →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Modal resolver ─────────────────────────────────────────────────────────────
function ModalResolver({ cotizacion, onCerrar, onConfirmar, cargando }) {
  const [estado, setEstado] = useState("Aprobada");
  const [motivo, setMotivo] = useState("");
  if (!cotizacion) return null;

  const puedeEnviar = motivo.trim().length >= 10;

  return (
    <div style={{ ...overlayStyle, zIndex: 60 }}>
      <div style={{ background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden" }}>

        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a", marginBottom: "2px" }}>Resolver solicitud</p>
          <p style={{ fontSize: "12px", color: "#94a3b8" }}>
            {cotizacion.cliente?.nombreEmpresa} — {cotizacion.instalacion?.nombre}
          </p>
        </div>

        <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Resolución</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {["Aprobada", "Rechazada"].map((op) => {
                const activo  = estado === op;
                const esAprob = op === "Aprobada";
                return (
                  <button key={op} type="button" onClick={() => setEstado(op)} style={{
                    flex: 1, padding: "8px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all .15s",
                    border:     activo ? `1px solid ${esAprob ? "#16a34a" : "#dc2626"}` : "1px solid #e2e8f0",
                    background: activo ? (esAprob ? "#dcfce7" : "#fee2e2") : "#f8fafc",
                    color:      activo ? (esAprob ? "#166534" : "#991b1b") : "#64748b",
                  }}>
                    {esAprob ? "✓ Aprobar" : "✕ Rechazar"}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              Motivo <span style={{ fontWeight: 400, color: "#94a3b8" }}>(mín. 10 caracteres)</span>
            </label>
            <textarea
              rows={4}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder={estado === "Aprobada"
                ? "Ej: La solicitud cumple con los requisitos..."
                : "Ej: La zona indicada no cuenta con cobertura..."}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
            />
            <p style={{ fontSize: "11px", color: motivo.trim().length < 10 ? "#f59e0b" : "#94a3b8", marginTop: "4px" }}>
              {motivo.trim().length} / 10 caracteres mínimos
            </p>
          </div>
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onCerrar} disabled={cargando} style={btnSecundario}>Cancelar</button>
          <button
            onClick={() => onConfirmar(estado, motivo)}
            disabled={!puedeEnviar || cargando}
            style={{
              ...btnPrimario,
              background: !puedeEnviar || cargando ? "#94a3b8" : estado === "Aprobada" ? "#16a34a" : "#dc2626",
              cursor: !puedeEnviar || cargando ? "not-allowed" : "pointer",
            }}
          >
            {cargando ? "Enviando..." : `Confirmar ${estado === "Aprobada" ? "aprobación" : "rechazo"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componentes auxiliares ─────────────────────────────────────────────────────
function Seccion({ titulo, children }) {
  return (
    <div>
      <p style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
        {titulo}
      </p>
      <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "10px 14px", display: "flex", flexDirection: "column", gap: "6px" }}>
        {children}
      </div>
    </div>
  );
}

function Fila({ label, valor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
      <span style={{ color: "#64748b", flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 500, color: "#0f172a", textAlign: "right", marginLeft: "1rem", wordBreak: "break-word" }}>{valor}</span>
    </div>
  );
}

// ── Tabla principal ────────────────────────────────────────────────────────────
const COLS = [
  { key: "cliente",       label: "Cliente"          },
  { key: "instalacion",   label: "Instalación"      },
  { key: "plan",          label: "Plan"             },
  { key: "estado",        label: "Estado"           },
  { key: "fechaCreacion", label: "Fecha"            },
];

function CotizacionesTable() {
  const [cotizaciones, setCotizaciones]     = useState([]);
  const [cargando, setCargando]             = useState(true);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [modalDetalle, setModalDetalle]     = useState(null);
  const [modalResolver, setModalResolver]   = useState(null);

  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroPlan,    setFiltroPlan]    = useState("");
  const [filtroEstado,  setFiltroEstado]  = useState("");
  const [filtroMes,     setFiltroMes]     = useState("");

  async function cargar() {
    try {
      const res = await obtenerCotizacionesService();
      setCotizaciones(res.data);
    } catch {
      toast.error("Error al cargar cotizaciones");
    } finally {
      setCargando(false);
    }
  }

  async function confirmarResolucion(nuevoEstado, motivo) {
    const c = modalResolver;
    const estadoAnterior = c.estado;

    setCotizaciones((prev) =>
      prev.map((x) => x.idSolicitud === c.idSolicitud ? { ...x, estado: nuevoEstado, motivo } : x)
    );
    setModalResolver(null);
    setModalDetalle(null);
    setActualizandoId(c.idSolicitud);

    toast.promise(
      actualizarEstadoCotizacionService(c.idSolicitud, nuevoEstado, motivo),
      {
        loading: "Enviando correo al cliente...",
        success: "Estado actualizado y correo enviado.",
        error:   "Error al actualizar el estado.",
      }
    ).catch(() => {
      setCotizaciones((prev) =>
        prev.map((x) => x.idSolicitud === c.idSolicitud ? { ...x, estado: estadoAnterior } : x)
      );
    }).finally(() => setActualizandoId(null));
  }

  useEffect(() => { cargar(); }, []);

  const planesUnicos = useMemo(() => [...new Set(cotizaciones.map(c => c.plan?.tipo).filter(Boolean))], [cotizaciones]);
  const mesesUnicos  = useMemo(() => [...new Set(cotizaciones.map(c => mesAnio(c.fechaCreacion)).filter(Boolean))].sort().reverse(), [cotizaciones]);

  const pendientes = cotizaciones.filter(c => c.estado === "Pendiente").length;
  const aprobadas  = cotizaciones.filter(c => c.estado === "Aprobada").length;
  const rechazadas = cotizaciones.filter(c => c.estado === "Rechazada").length;
  const vencidas   = cotizaciones.filter(c => c.estado === "Vencida").length;

  const filas = useMemo(() => {
    let lista = [...cotizaciones];

    if (filtroCliente) lista = lista.filter(c => c.cliente?.nombreEmpresa?.toLowerCase().includes(filtroCliente.toLowerCase()));
    if (filtroPlan)    lista = lista.filter(c => c.plan?.tipo === filtroPlan);
    if (filtroEstado)  lista = lista.filter(c => c.estado === filtroEstado);
    if (filtroMes)     lista = lista.filter(c => mesAnio(c.fechaCreacion) === filtroMes);

    // Siempre por fechaLimite ascendente (más urgentes primero), nulls al final
    lista.sort((a, b) => {
      if (!a.fechaLimite && !b.fechaLimite) return 0;
      if (!a.fechaLimite) return 1;
      if (!b.fechaLimite) return -1;
      return new Date(a.fechaLimite) - new Date(b.fechaLimite);
    });

    return lista;
  }, [cotizaciones, filtroCliente, filtroPlan, filtroEstado, filtroMes]);

  function limpiarFiltros() {
    setFiltroCliente(""); setFiltroPlan(""); setFiltroEstado(""); setFiltroMes("");
  }

  const hayFiltros = filtroCliente || filtroPlan || filtroEstado || filtroMes;

  if (cargando) return <p style={{ color: "#64748b" }}>Cargando...</p>;

  return (
    <>
      {modalDetalle && (
        <ModalDetalle
          cotizacion={modalDetalle}
          onCerrar={() => setModalDetalle(null)}
          onResolver={(c) => setModalResolver(c)}
        />
      )}
      {modalResolver && (
        <ModalResolver
          cotizacion={modalResolver}
          onCerrar={() => setModalResolver(null)}
          onConfirmar={confirmarResolucion}
          cargando={actualizandoId === modalResolver?.idSolicitud}
        />
      )}

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Cotizaciones</h1>
            <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
              <span style={{ color: "#854d0e", fontWeight: 500 }}>● {pendientes} pendiente{pendientes !== 1 ? "s" : ""}</span>
              <span style={{ color: "#166534", fontWeight: 500 }}>● {aprobadas} aprobada{aprobadas !== 1 ? "s" : ""}</span>
              <span style={{ color: "#991b1b", fontWeight: 500 }}>● {rechazadas} rechazada{rechazadas !== 1 ? "s" : ""}</span>
              <span style={{ color: "#6b21a8", fontWeight: 500 }}>● {vencidas} vencida{vencidas !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            style={{ ...inputStyle, maxWidth: "200px" }}
          />
          <select value={filtroPlan} onChange={(e) => setFiltroPlan(e.target.value)} style={{ ...inputStyle, maxWidth: "150px" }}>
            <option value="">Todos los planes</option>
            {planesUnicos.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={{ ...inputStyle, maxWidth: "150px" }}>
            <option value="">Todos los estados</option>
            {["Pendiente", "Aprobada", "Rechazada", "Vencida"].map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} style={{ ...inputStyle, maxWidth: "160px" }}>
            <option value="">Todos los meses</option>
            {mesesUnicos.map(m => {
              const [anio, mes] = m.split("-");
              const label = new Date(Number(anio), Number(mes) - 1).toLocaleDateString("es-CL", { month: "long", year: "numeric" });
              return <option key={m} value={m}>{label}</option>;
            })}
          </select>
          {hayFiltros && (
            <button onClick={limpiarFiltros} style={{ fontSize: "12px", color: "#534AB7", background: "none", border: "none", cursor: "pointer", fontWeight: 500, padding: "0 4px" }}>
              × Limpiar filtros
            </button>
          )}
        </div>

        {/* Tabla */}
        <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                {COLS.map(col => (
                  <th key={col.key} style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600, whiteSpace: "nowrap" }}>
                    {col.label}
                  </th>
                ))}
                <th style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600, whiteSpace: "nowrap" }}>
                  Tiempo restante
                </th>
                <th style={{ padding: "0.75rem 1rem" }} />
              </tr>
            </thead>
            <tbody>
              {filas.map((c, i) => {
                const estadoN    = c.estado?.toLowerCase();
                const badge      = BADGE[estadoN] ?? { bg: "#f1f5f9", color: "#475569" };
                const bloqueado  = actualizandoId === c.idSolicitud;
                const esPendiente = c.estado === "Pendiente";
                const esVencida   = c.estado === "Vencida";

                return (
                  <tr
                    key={c.idSolicitud}
                    style={{
                      borderTop: "1px solid #e2e8f0",
                      background: i % 2 === 0 ? "#fff" : "#f8fafc",
                      opacity: bloqueado ? 0.6 : 1,
                      transition: "opacity .2s",
                      borderLeft: esVencida   ? "3px solid #6b21a8" :
                                  esPendiente ? "3px solid #f59e0b" :
                                  "3px solid transparent",
                    }}
                  >
                    <td style={{ padding: "0.75rem 1rem", color: "#0f172a", fontWeight: 500 }}>
                      {c.cliente?.nombreEmpresa || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>
                      {c.instalacion?.nombre || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>
                      {c.plan?.tipo || "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ padding: "2px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 600, background: badge.bg, color: badge.color }}>
                        {c.estado}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#64748b", fontSize: "13px" }}>
                      {formatFecha(c.fechaCreacion)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <TiempoRestante fechaLimite={c.fechaLimite} estado={c.estado} />
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <button
                        onClick={() => setModalDetalle(c)}
                        style={{ fontSize: "12px", padding: "5px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff", color: "#475569", cursor: "pointer", fontWeight: 500 }}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filas.length === 0 && (
            <p style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
              {hayFiltros ? "No hay cotizaciones que coincidan con los filtros." : "No hay cotizaciones registradas."}
            </p>
          )}
        </div>

        {filas.length > 0 && cotizaciones.length > 0 && (
          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "0.75rem", textAlign: "right" }}>
            Mostrando {filas.length} de {cotizaciones.length} solicitudes
          </p>
        )}
      </div>
    </>
  );
}

// ── Estilos compartidos ────────────────────────────────────────────────────────
const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 50, padding: "1rem",
};
const labelStyle = {
  display: "block", fontSize: "13px", fontWeight: 500, color: "#64748b", marginBottom: "8px",
};
const inputStyle = {
  width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0",
  borderRadius: "8px", fontSize: "13px", background: "#fff", color: "#0f172a", outline: "none",
};
const btnPrimario = {
  padding: "8px 16px", borderRadius: "8px", border: "none",
  background: "#534AB7", color: "#fff", fontSize: "13px", fontWeight: 500, cursor: "pointer",
};
const btnSecundario = {
  padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0",
  background: "#fff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer",
};

export default CotizacionesTable;