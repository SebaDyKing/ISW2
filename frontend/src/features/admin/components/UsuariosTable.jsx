import { useEffect, useState } from "react";
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

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,50}$/;
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

  if (!form.rol)
    errores.rol = "Selecciona un rol.";

  return errores;
}

function Modal({ titulo, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
    }}>
      <div style={{
        background: "#fff", borderRadius: "10px", padding: "2rem",
        width: "100%", maxWidth: 460, boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>{titulo}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#94a3b8" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Campo({ label, type = "text", value, onChange, placeholder, error, maxLength }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: "0.3rem" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: "100%",
          border: `1px solid ${error ? "#f87171" : "#e2e8f0"}`,
          borderRadius: "6px",
          padding: "0.5rem 0.75rem",
          fontSize: "0.875rem",
          color: "#0f172a",
          outline: "none",
          boxSizing: "border-box",
          boxShadow: error ? "0 0 0 3px rgba(248,113,113,0.15)" : "none",
        }}
      />
      {error && (
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function CampoSelect({ label, value, onChange, error }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#475569", marginBottom: "0.3rem" }}>
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          border: `1px solid ${error ? "#f87171" : "#e2e8f0"}`,
          borderRadius: "6px",
          padding: "0.5rem 0.75rem",
          fontSize: "0.875rem",
          color: "#0f172a",
          boxShadow: error ? "0 0 0 3px rgba(248,113,113,0.15)" : "none",
        }}
      >
        <option value="">Selecciona un rol</option>
        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      {error && (
        <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function UsuariosTable() {
  const [usuarios,    setUsuarios]    = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [busqueda,    setBusqueda]    = useState("");
  const [modalCrear,  setModalCrear]  = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [form,        setForm]        = useState(FORM_VACIO);
  const [errores,     setErrores]     = useState({});
  const [guardando,   setGuardando]   = useState(false);

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

  const usuariosFiltrados = usuarios.filter(u => {
    const q = busqueda.toLowerCase();
    return (
      u.nombre?.toLowerCase().includes(q)   ||
      u.apellido?.toLowerCase().includes(q) ||
      u.correo?.toLowerCase().includes(q)   ||
      u.rut?.toLowerCase().includes(q)
    );
  });

  async function eliminar(id) {
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      await eliminarUsuarioService(id);
      toast.success("Usuario eliminado");
      setUsuarios(prev => prev.filter(u => u.idUsuario !== id));
    } catch (e) {
      toast.error(e.response?.data?.message || "Error al eliminar");
    }
  }

  function abrirCrear() {
    setForm(FORM_VACIO);
    setErrores({});
    setModalCrear(true);
  }

  function abrirEditar(u) {
    setForm({ nombre: u.nombre, apellido: u.apellido, rut: u.rut, correo: u.correo, password: "", rol: u.rol });
    setErrores({});
    setModalEditar(u);
  }

  const f = (field) => (e) => {
    let valor = e.target.value;
    if (field === "nombre" || field === "apellido") {
      valor = valor.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, "");
    } else if (field === "rut") {
      valor = normalizarRut(valor);
    }
    setForm(prev => ({ ...prev, [field]: valor }));
    if (errores[field]) setErrores(prev => ({ ...prev, [field]: undefined }));
  };

  async function handleCrear() {
    const nuevosErrores = validarForm(form, false);
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
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
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
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
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Usuarios</h1>
        <button
          onClick={abrirCrear}
          style={{
            background: "#1e293b", color: "#fff", border: "none",
            borderRadius: "6px", padding: "0.5rem 1rem",
            fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
          }}
        >
          + Nuevo usuario
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre, correo o RUT..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{
          width: "100%", maxWidth: 360, border: "1px solid #e2e8f0",
          borderRadius: "6px", padding: "0.5rem 0.75rem",
          fontSize: "0.875rem", marginBottom: "1rem",
          color: "#0f172a", outline: "none", boxSizing: "border-box",
        }}
      />

      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
              {["Nombre", "Correo", "RUT", "Rol", ""].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u, i) => (
              <tr key={u.idUsuario} style={{ borderTop: "1px solid #e2e8f0", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                <td style={{ padding: "0.75rem 1rem", color: "#0f172a" }}>{u.nombre} {u.apellido}</td>
                <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>{u.correo}</td>
                <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>{u.rut}</td>
                <td style={{ padding: "0.75rem 1rem" }}>
                  <span style={{
                    padding: "0.2rem 0.6rem", borderRadius: "999px",
                    fontSize: "0.75rem", fontWeight: 600,
                    background: BADGE_ROL[u.rol]?.bg ?? "#f1f5f9",
                    color:      BADGE_ROL[u.rol]?.color ?? "#475569",
                  }}>
                    {u.rol ?? "—"}
                  </span>
                </td>
                <td style={{ padding: "0.75rem 1rem", display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => abrirEditar(u)}
                    style={{
                      background: "transparent", border: "1px solid #cbd5e1",
                      color: "#475569", borderRadius: "6px",
                      padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.8rem",
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminar(u.idUsuario)}
                    style={{
                      background: "transparent", border: "1px solid #fca5a5",
                      color: "#ef4444", borderRadius: "6px",
                      padding: "0.3rem 0.75rem", cursor: "pointer", fontSize: "0.8rem",
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuariosFiltrados.length === 0 && (
          <p style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
            {busqueda ? "No hay usuarios que coincidan con la búsqueda." : "No hay usuarios registrados."}
          </p>
        )}
      </div>

      {modalCrear && (
        <Modal titulo="Nuevo usuario" onClose={() => setModalCrear(false)}>
          <Campo label="Nombre"     value={form.nombre}   onChange={f("nombre")}   placeholder="Juan"                maxLength={50} error={errores.nombre} />
          <Campo label="Apellido"   value={form.apellido} onChange={f("apellido")} placeholder="Pérez"               maxLength={50} error={errores.apellido} />
          <Campo label="RUT"        value={form.rut}      onChange={f("rut")}      placeholder="12345678-9"          maxLength={10} error={errores.rut} />
          <Campo label="Correo"     value={form.correo}   onChange={f("correo")}   placeholder="juan@ejemplo.cl"     maxLength={100} type="email"    error={errores.correo} />
          <Campo label="Contraseña" value={form.password} onChange={f("password")} placeholder="Mínimo 6 caracteres" maxLength={64} type="password" error={errores.password} />
          <CampoSelect label="Rol" value={form.rol} onChange={f("rol")} error={errores.rol} />
          <button
            onClick={handleCrear}
            disabled={guardando}
            style={{
              width: "100%", background: "#1e293b", color: "#fff", border: "none",
              borderRadius: "6px", padding: "0.6rem", fontWeight: 600,
              fontSize: "0.875rem", cursor: "pointer", opacity: guardando ? 0.6 : 1,
              marginTop: "0.5rem",
            }}
          >
            {guardando ? "Creando..." : "Crear usuario"}
          </button>
        </Modal>
      )}

      {modalEditar && (
        <Modal titulo="Editar usuario" onClose={() => setModalEditar(null)}>
          <Campo label="Nombre"     value={form.nombre}   onChange={f("nombre")}   placeholder="Juan"                    maxLength={50} error={errores.nombre} />
          <Campo label="Apellido"   value={form.apellido} onChange={f("apellido")} placeholder="Pérez"                   maxLength={50} error={errores.apellido} />
          <Campo label="RUT"        value={form.rut}      onChange={f("rut")}      placeholder="12345678-9"              maxLength={10} error={errores.rut} />
          <Campo label="Correo"     value={form.correo}   onChange={f("correo")}   placeholder="juan@ejemplo.cl"         maxLength={100} type="email"    error={errores.correo} />
          <Campo label="Nueva contraseña (opcional)" value={form.password} onChange={f("password")} placeholder="Dejar vacío para no cambiar" maxLength={64} type="password" error={errores.password} />
          <CampoSelect label="Rol" value={form.rol} onChange={f("rol")} error={errores.rol} />
          <button
            onClick={handleEditar}
            disabled={guardando}
            style={{
              width: "100%", background: "#1e293b", color: "#fff", border: "none",
              borderRadius: "6px", padding: "0.6rem", fontWeight: 600,
              fontSize: "0.875rem", cursor: "pointer", opacity: guardando ? 0.6 : 1,
              marginTop: "0.5rem",
            }}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </Modal>
      )}
    </div>
  );
}

export default UsuariosTable;