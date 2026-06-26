import { useEffect, useState, useMemo } from "react";
import {
  obtenerUsuariosService,
  eliminarUsuarioService,
  crearUsuarioService,
  actualizarUsuarioService,
} from "../services/admin.service";
import toast from "react-hot-toast";
import { normalizarRut, validarRut } from "../../../utils/rut";

const ROLES = ["cliente", "empleado", "supervisor", "administrador"];

const BADGE_ROL = {
  administrador: { bg: "#dbeafe", color: "#1d4ed8" },
  supervisor:    { bg: "#ede9fe", color: "#6d28d9" },
  empleado:      { bg: "#dcfce7", color: "#166534" },
  cliente:       { bg: "#f1f5f9", color: "#475569" },
};

const FORM_VACIO = { nombre: "", apellido: "", rut: "", correo: "", password: "", rol: "cliente" };
const FILAS_POR_PAGINA = 10;

const soloLetras  = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/;
const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarForm(form, esEditar = false) {
  const errores = {};
  if (!soloLetras.test(form.nombre.trim()))
    errores.nombre = "Solo letras y espacios, entre 2 y 50 caracteres.";
  if (!soloLetras.test(form.apellido.trim()))
    errores.apellido = "Solo letras y espacios, entre 2 y 50 caracteres.";
  if (!validarRut(normalizarRut(form.rut)))
    errores.rut = "Formato inválido. Ej: 12345678-9";
  if (!regexCorreo.test(form.correo.trim()))
    errores.correo = "Ingresa un correo válido.";
  if (!esEditar) {
    if (form.password.length < 6 || form.password.length > 50)
      errores.password = "Debe tener entre 6 y 50 caracteres.";
  } else if (form.password !== "") {
    if (form.password.length < 6 || form.password.length > 50)
      errores.password = "Debe tener entre 6 y 50 caracteres (o déjalo vacío para no cambiar).";
  }
  if (!form.rol) errores.rol = "Selecciona un rol.";
  return errores;
}

// ── Overlay compartido ─────────────────────────────────────────────────────────
const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 50, padding: "1rem",
};

// ── Modal de formulario ────────────────────────────────────────────────────────
function ModalForm({ titulo, onClose, children }) {
  return (
    <div style={overlayStyle}>
      <div style={{
        background: "#fff", borderRadius: "12px", width: "100%", maxWidth: 460,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", maxHeight: "90vh",
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a", margin: 0 }}>{titulo}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "#94a3b8", lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: "1.25rem 1.5rem", overflowY: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Modal confirmación de eliminación ─────────────────────────────────────────
function ModalConfirmarEliminar({ usuario, onCerrar, onConfirmar, cargando }) {
  if (!usuario) return null;
  return (
    <div style={{ ...overlayStyle, zIndex: 60 }}>
      <div style={{
        background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "400px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden",
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a", marginBottom: "2px" }}>Eliminar usuario</p>
          <p style={{ fontSize: "12px", color: "#94a3b8" }}>Esta acción no se puede deshacer.</p>
        </div>
        <div style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 14px" }}>
            <p style={{ fontSize: "13px", color: "#991b1b", fontWeight: 500, marginBottom: "4px" }}>
              ¿Eliminar a {usuario.nombre} {usuario.apellido}?
            </p>
            <p style={{ fontSize: "12px", color: "#b91c1c" }}>
              {usuario.correo} · <span style={{
                background: BADGE_ROL[usuario.rol]?.bg ?? "#f1f5f9",
                color: BADGE_ROL[usuario.rol]?.color ?? "#475569",
                padding: "1px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: 600,
              }}>{usuario.rol}</span>
            </p>
          </div>
        </div>
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e2e8f0", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onCerrar} disabled={cargando} style={btnSecundario}>Cancelar</button>
          <button
            onClick={onConfirmar}
            disabled={cargando}
            style={{
              ...btnPrimario,
              background: cargando ? "#94a3b8" : "#dc2626",
              cursor: cargando ? "not-allowed" : "pointer",
            }}
          >
            {cargando ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Campos de formulario ───────────────────────────────────────────────────────
function Campo({ label, type = "text", value, onChange, placeholder, error, maxLength }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          ...inputStyle,
          border: `1px solid ${error ? "#f87171" : "#e2e8f0"}`,
          boxShadow: error ? "0 0 0 3px rgba(248,113,113,0.15)" : "none",
        }}
      />
      {error && <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

function CampoSelect({ label, value, onChange, error }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={labelStyle}>{label}</label>
      <select
        value={value}
        onChange={onChange}
        style={{
          ...inputStyle,
          border: `1px solid ${error ? "#f87171" : "#e2e8f0"}`,
          boxShadow: error ? "0 0 0 3px rgba(248,113,113,0.15)" : "none",
        }}
      >
        <option value="">Selecciona un rol</option>
        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      {error && <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

// ── Paginación ─────────────────────────────────────────────────────────────────
function Paginacion({ paginaActual, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "1rem" }}>
      <button
        onClick={() => onChange(paginaActual - 1)}
        disabled={paginaActual === 1}
        style={btnPag(paginaActual === 1)}
      >
        ‹ Anterior
      </button>
      {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            padding: "5px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
            border: n === paginaActual ? "1px solid #534AB7" : "1px solid #e2e8f0",
            background: n === paginaActual ? "#534AB7" : "#fff",
            color: n === paginaActual ? "#fff" : "#475569",
            cursor: "pointer",
          }}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onChange(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        style={btnPag(paginaActual === totalPaginas)}
      >
        Siguiente ›
      </button>
    </div>
  );
}

// ── Tabla principal ────────────────────────────────────────────────────────────
function UsuariosTable() {
  const [usuarios,       setUsuarios]       = useState([]);
  const [cargando,       setCargando]       = useState(true);
  const [eliminandoId,   setEliminandoId]   = useState(null);
  const [modalCrear,     setModalCrear]     = useState(false);
  const [modalEditar,    setModalEditar]    = useState(null);
  const [modalEliminar,  setModalEliminar]  = useState(null);
  const [form,           setForm]           = useState(FORM_VACIO);
  const [errores,        setErrores]        = useState({});
  const [guardando,      setGuardando]      = useState(false);
  const [pagina,         setPagina]         = useState(1);

  // Filtros
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroRol,      setFiltroRol]      = useState("");

  async function cargar() {
    try {
      const res = await obtenerUsuariosService();
      setUsuarios(res.data);
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  // Conteos por rol
  const conteos = useMemo(() => {
    const c = { administrador: 0, supervisor: 0, empleado: 0, cliente: 0 };
    usuarios.forEach(u => { if (c[u.rol] !== undefined) c[u.rol]++; });
    return c;
  }, [usuarios]);

  const filasFiltradas = useMemo(() => {
    let lista = [...usuarios];
    if (filtroBusqueda) {
      const q = filtroBusqueda.toLowerCase();
      lista = lista.filter(u =>
        u.nombre?.toLowerCase().includes(q)   ||
        u.apellido?.toLowerCase().includes(q) ||
        u.correo?.toLowerCase().includes(q)   ||
        u.rut?.toLowerCase().includes(q)
      );
    }
    if (filtroRol) lista = lista.filter(u => u.rol === filtroRol);
    return lista;
  }, [usuarios, filtroBusqueda, filtroRol]);

  const totalPaginas  = Math.max(1, Math.ceil(filasFiltradas.length / FILAS_POR_PAGINA));
  const paginaReal    = Math.min(pagina, totalPaginas);
  const filasPagina   = filasFiltradas.slice((paginaReal - 1) * FILAS_POR_PAGINA, paginaReal * FILAS_POR_PAGINA);
  const hayFiltros    = filtroBusqueda || filtroRol;

  function limpiarFiltros() { setFiltroBusqueda(""); setFiltroRol(""); setPagina(1); }

  function cambiarPagina(n) { setPagina(n); }

  // Resetear página cuando cambian filtros
  useEffect(() => { setPagina(1); }, [filtroBusqueda, filtroRol]);

  async function confirmarEliminar() {
    const u = modalEliminar;
    setEliminandoId(u.idUsuario);
    try {
      await eliminarUsuarioService(u.idUsuario);
      toast.success("Usuario eliminado");
      setUsuarios(prev => prev.filter(x => x.idUsuario !== u.idUsuario));
      setModalEliminar(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Error al eliminar");
    } finally {
      setEliminandoId(null);
    }
  }

  function abrirCrear() { setForm(FORM_VACIO); setErrores({}); setModalCrear(true); }
  function abrirEditar(u) {
    setForm({ nombre: u.nombre, apellido: u.apellido, rut: u.rut, correo: u.correo, password: "", rol: u.rol });
    setErrores({});
    setModalEditar(u);
  }

  const f = (field) => (e) => {
    let valor = e.target.value;
    if (field === "nombre" || field === "apellido") valor = valor.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, "");
    else if (field === "rut") valor = normalizarRut(valor);
    setForm(prev => ({ ...prev, [field]: valor }));
    if (errores[field]) setErrores(prev => ({ ...prev, [field]: undefined }));
  };

  async function handleCrear() {
    const nuevosErrores = validarForm(form, false);
    if (Object.keys(nuevosErrores).length > 0) { setErrores(nuevosErrores); return; }
    setGuardando(true);
    try {
      const res = await crearUsuarioService(form);
      toast.success("Usuario creado");
      setUsuarios(prev => [...prev, res.data]);
      setModalCrear(false);
    } catch (e) {
      toast.error(e.response?.data?.message || e.response?.data?.detalle || "Error al crear");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEditar() {
    const nuevosErrores = validarForm(form, true);
    if (Object.keys(nuevosErrores).length > 0) { setErrores(nuevosErrores); return; }
    setGuardando(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      const res = await actualizarUsuarioService(modalEditar.idUsuario, payload);
      toast.success("Usuario actualizado");
      setUsuarios(prev => prev.map(u => u.idUsuario === modalEditar.idUsuario ? res.data : u));
      setModalEditar(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Error al actualizar");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <p style={{ color: "#64748b" }}>Cargando...</p>;

  return (
    <>
      {modalEliminar && (
        <ModalConfirmarEliminar
          usuario={modalEliminar}
          onCerrar={() => setModalEliminar(null)}
          onConfirmar={confirmarEliminar}
          cargando={eliminandoId === modalEliminar?.idUsuario}
        />
      )}

      {modalCrear && (
        <ModalForm titulo="Nuevo usuario" onClose={() => setModalCrear(false)}>
          <Campo label="Nombre"     value={form.nombre}   onChange={f("nombre")}   placeholder="Juan"                maxLength={50} error={errores.nombre} />
          <Campo label="Apellido"   value={form.apellido} onChange={f("apellido")} placeholder="Pérez"               maxLength={50} error={errores.apellido} />
          <Campo label="RUT"        value={form.rut}      onChange={f("rut")}      placeholder="12345678-9"          maxLength={10} error={errores.rut} />
          <Campo label="Correo"     value={form.correo}   onChange={f("correo")}   placeholder="juan@ejemplo.cl"     maxLength={100} type="email"   error={errores.correo} />
          <Campo label="Contraseña" value={form.password} onChange={f("password")} placeholder="Mínimo 6 caracteres" maxLength={64} type="password" error={errores.password} />
          <CampoSelect label="Rol" value={form.rol} onChange={f("rol")} error={errores.rol} />
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button onClick={() => setModalCrear(false)} style={btnSecundario}>Cancelar</button>
            <button onClick={handleCrear} disabled={guardando} style={{ ...btnPrimario, opacity: guardando ? 0.7 : 1, cursor: guardando ? "not-allowed" : "pointer" }}>
              {guardando ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </ModalForm>
      )}

      {modalEditar && (
        <ModalForm titulo="Editar usuario" onClose={() => setModalEditar(null)}>
          <Campo label="Nombre"     value={form.nombre}   onChange={f("nombre")}   placeholder="Juan"                    maxLength={50} error={errores.nombre} />
          <Campo label="Apellido"   value={form.apellido} onChange={f("apellido")} placeholder="Pérez"                   maxLength={50} error={errores.apellido} />
          <Campo label="RUT"        value={form.rut}      onChange={f("rut")}      placeholder="12345678-9"              maxLength={10} error={errores.rut} />
          <Campo label="Correo"     value={form.correo}   onChange={f("correo")}   placeholder="juan@ejemplo.cl"         maxLength={100} type="email"   error={errores.correo} />
          <Campo label="Nueva contraseña (opcional)" value={form.password} onChange={f("password")} placeholder="Dejar vacío para no cambiar" maxLength={64} type="password" error={errores.password} />
          <CampoSelect label="Rol" value={form.rol} onChange={f("rol")} error={errores.rol} />
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button onClick={() => setModalEditar(null)} style={btnSecundario}>Cancelar</button>
            <button onClick={handleEditar} disabled={guardando} style={{ ...btnPrimario, opacity: guardando ? 0.7 : 1, cursor: guardando ? "not-allowed" : "pointer" }}>
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </ModalForm>
      )}

      <div>
        {/* Encabezado */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>Usuarios</h1>
            <div style={{ display: "flex", gap: "12px", fontSize: "12px", flexWrap: "wrap" }}>
              <span style={{ color: "#1d4ed8", fontWeight: 500 }}>● {conteos.administrador} admin{conteos.administrador !== 1 ? "s" : ""}</span>
              <span style={{ color: "#6d28d9", fontWeight: 500 }}>● {conteos.supervisor} supervisor{conteos.supervisor !== 1 ? "es" : ""}</span>
              <span style={{ color: "#166534", fontWeight: 500 }}>● {conteos.empleado} empleado{conteos.empleado !== 1 ? "s" : ""}</span>
              <span style={{ color: "#475569", fontWeight: 500 }}>● {conteos.cliente} cliente{conteos.cliente !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <button onClick={abrirCrear} style={btnPrimario}>
            + Nuevo usuario
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o RUT..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
            style={{ ...inputStyle, maxWidth: "260px" }}
          />
          <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} style={{ ...inputStyle, maxWidth: "160px" }}>
            <option value="">Todos los roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
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
                {["Nombre", "Correo", "RUT", "Rol", ""].map((h, i) => (
                  <th key={i} style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filasPagina.map((u, i) => (
                <tr
                  key={u.idUsuario}
                  style={{
                    borderTop: "1px solid #e2e8f0",
                    background: i % 2 === 0 ? "#fff" : "#f8fafc",
                    opacity: eliminandoId === u.idUsuario ? 0.5 : 1,
                    transition: "opacity .2s",
                  }}
                >
                  <td style={{ padding: "0.75rem 1rem", color: "#0f172a", fontWeight: 500 }}>{u.nombre} {u.apellido}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>{u.correo}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>{u.rut}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{
                      padding: "2px 10px", borderRadius: "999px",
                      fontSize: "12px", fontWeight: 600,
                      background: BADGE_ROL[u.rol]?.bg ?? "#f1f5f9",
                      color:      BADGE_ROL[u.rol]?.color ?? "#475569",
                    }}>
                      {u.rol ?? "—"}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => abrirEditar(u)}
                        style={{ fontSize: "12px", padding: "5px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", background: "#fff", color: "#475569", cursor: "pointer", fontWeight: 500 }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setModalEliminar(u)}
                        style={{ fontSize: "12px", padding: "5px 12px", border: "1px solid #fca5a5", borderRadius: "6px", background: "#fff", color: "#ef4444", cursor: "pointer", fontWeight: 500 }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filasPagina.length === 0 && (
            <p style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
              {hayFiltros ? "No hay usuarios que coincidan con los filtros." : "No hay usuarios registrados."}
            </p>
          )}
        </div>

        {/* Paginación + conteo */}
        <Paginacion paginaActual={paginaReal} totalPaginas={totalPaginas} onChange={cambiarPagina} />

        {filasFiltradas.length > 0 && (
          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "0.75rem", textAlign: "right" }}>
            Mostrando {Math.min((paginaReal - 1) * FILAS_POR_PAGINA + 1, filasFiltradas.length)}–{Math.min(paginaReal * FILAS_POR_PAGINA, filasFiltradas.length)} de {filasFiltradas.length} usuario{filasFiltradas.length !== 1 ? "s" : ""}
            {hayFiltros && usuarios.length !== filasFiltradas.length && ` (${usuarios.length} en total)`}
          </p>
        )}
      </div>
    </>
  );
}

// ── Estilos compartidos ────────────────────────────────────────────────────────
const labelStyle = {
  display: "block", fontSize: "13px", fontWeight: 500, color: "#64748b", marginBottom: "8px",
};
const inputStyle = {
  width: "100%", padding: "8px 12px", border: "1px solid #e2e8f0",
  borderRadius: "8px", fontSize: "13px", background: "#fff", color: "#0f172a",
  outline: "none", boxSizing: "border-box",
};
const btnPrimario = {
  padding: "8px 16px", borderRadius: "8px", border: "none",
  background: "#534AB7", color: "#fff", fontSize: "13px", fontWeight: 500, cursor: "pointer",
};
const btnSecundario = {
  padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0",
  background: "#fff", color: "#475569", fontSize: "13px", fontWeight: 500, cursor: "pointer",
};
const btnPag = (disabled) => ({
  padding: "5px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 500,
  border: "1px solid #e2e8f0", background: "#fff", color: disabled ? "#cbd5e1" : "#475569",
  cursor: disabled ? "not-allowed" : "pointer",
});

export default UsuariosTable;