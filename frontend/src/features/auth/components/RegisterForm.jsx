import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registroService } from "../services/auth.service";
import { normalizarRut } from "../../../utils/rut";

const S = {
  page: {
    height: "100vh",
    display: "flex",
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bg: {
    position: "absolute", inset: 0,
    backgroundImage: "url('/Fondo_LandingPage.png')",
    backgroundSize: "cover",
    backgroundPosition: "center 20%",
    filter: "blur(2px) brightness(0.55)",
    transform: "scale(1.04)",
    zIndex: 0,
  },
  overlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to right, rgba(10,18,40,0.80) 40%, rgba(10,18,40,0.50) 100%)",
    zIndex: 1,
  },
  left: {
    position: "relative", zIndex: 2,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "3rem 3rem 3rem 4rem",
    maxWidth: "480px",
  },
  leftInner: {
    display: "flex",
    flexDirection: "column",
  },
  logoWrap: {
    display: "flex", alignItems: "center", gap: "10px",
    marginBottom: "3rem",
  },
  logoIcon: {
    width: "32px", height: "32px", borderRadius: "8px",
    background: "rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "16px", color: "#fff",
    border: "1px solid rgba(255,255,255,0.25)",
  },
  logoText: { fontSize: "15px", fontWeight: 600, color: "#fff", letterSpacing: "-0.2px" },
  heroTagline: {
    fontSize: "11px", fontWeight: 500,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: "0.1em", textTransform: "uppercase",
    marginBottom: "1rem",
  },
  heroH1: {
    fontSize: "32px", fontWeight: 700,
    color: "#fff", lineHeight: 1.2,
    letterSpacing: "-0.5px", marginBottom: "1rem",
  },
  heroP: {
    fontSize: "14px", color: "rgba(255,255,255,0.65)",
    lineHeight: 1.7, maxWidth: "360px",
  },
  right: {
    position: "relative", zIndex: 2,
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    flex: 1, padding: "2rem",
    height: "100%",
    overflowY: "auto",
  },
  card: {
    background: "#f4f5f8",
    borderRadius: "14px",
    padding: "2rem",
    width: "100%", maxWidth: "420px",
    border: "1px solid #dde1e9",
    marginTop: "1rem", marginBottom: "1rem",
  },
  backBtn: {
    background: "none", border: "none", padding: 0,
    fontSize: "13px", color: "#64748b", cursor: "pointer",
    marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "6px",
    fontFamily: "inherit",
  },
  title: { fontSize: "20px", fontWeight: 600, color: "#0f172a", marginBottom: "4px" },
  subtitle: { fontSize: "13px", color: "#64748b", marginBottom: "1.75rem" },
  sectionLabel: {
    fontSize: "11px", fontWeight: 600, color: "#94a3b8",
    letterSpacing: "0.08em", textTransform: "uppercase",
    marginBottom: "0.75rem", marginTop: "1.25rem",
    paddingBottom: "6px", borderBottom: "1px solid #dde1e9",
    display: "block",
  },
  label: {
    display: "block", fontSize: "13px", fontWeight: 500,
    color: "#475569", marginBottom: "6px",
  },
  input: {
    width: "100%", padding: "9px 12px",
    border: "1px solid #dde1e9", borderRadius: "8px",
    fontSize: "13px", background: "#fff", color: "#0f172a",
    outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  },
  fieldWrap: { marginBottom: "0.85rem" },
  row: { display: "flex", gap: "10px" },
  phoneWrap: { display: "flex" },
  phonePrefix: {
    display: "inline-flex", alignItems: "center",
    padding: "9px 12px",
    border: "1px solid #dde1e9", borderRight: "none",
    borderRadius: "8px 0 0 8px",
    background: "#eef0f4", color: "#64748b",
    fontSize: "13px", whiteSpace: "nowrap",
  },
  phoneInput: {
    flex: 1, padding: "9px 12px",
    border: "1px solid #dde1e9", borderRadius: "0 8px 8px 0",
    fontSize: "13px", background: "#fff", color: "#0f172a",
    outline: "none", fontFamily: "inherit",
  },
  checkRow: {
    display: "flex", alignItems: "center", gap: "8px",
    marginTop: "8px", fontSize: "13px", color: "#64748b", cursor: "pointer",
  },
  btnPrimary: {
    width: "100%", padding: "10px",
    background: "#534AB7", color: "#fff",
    border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: 500,
    cursor: "pointer", fontFamily: "inherit",
    marginTop: "1.25rem", transition: "background .15s",
  },
  btnDisabled: { background: "#94a3b8", cursor: "not-allowed" },
  footer: { textAlign: "center", fontSize: "13px", color: "#64748b", marginTop: "1.25rem" },
  link: { color: "#534AB7", textDecoration: "none", fontWeight: 500 },
};

function RegisterForm() {
  const [form, setForm] = useState({
    nombre_empresa: "",
    telefono: "",
    nombre: "",
    apellido: "",
    rut: "",
    correo: "",
    password: "",
    confirmarPassword: "",
  });
  const [verPassword, setVerPassword]   = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [cargando, setCargando]         = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "telefono") {
      setForm({ ...form, telefono: e.target.value.replace(/\D/g, "") });
    } else if (e.target.name === "nombre" || e.target.name === "apellido") {
      setForm({ ...form, [e.target.name]: e.target.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, "") });
    } else if (e.target.name === "rut") {
      setForm({ ...form, rut: normalizarRut(e.target.value) });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmarPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setCargando(true);
    try {
      const { confirmarPassword, ...datosParaEnviar } = form;
      datosParaEnviar.telefono = `+569${form.telefono}`;
      await registroService(datosParaEnviar);
      toast.success("¡Cuenta creada correctamente!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al registrarse");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.bg} />
      <div style={S.overlay} />

      {/* Panel izquierdo — branding */}
      <div style={S.left}>
        <div style={S.leftInner}>
          <div style={S.logoWrap}>
            <div style={S.logoIcon}>✦</div>
            <span style={S.logoText}>CleanPro</span>
          </div>
          <p style={S.heroTagline}>Plataforma empresarial</p>
          <h1 style={S.heroH1}>Empieza hoy<br />con CleanPro</h1>
          <p style={S.heroP}>
            Crea tu cuenta y accede a cotizaciones personalizadas,
            seguimiento de servicios y atención dedicada para tu empresa.
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div style={S.right}>
        <div style={S.card}>
          <button
            style={S.backBtn}
            onClick={() => navigate("/")}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#0f172a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#64748b"; }}
          >
            ← Volver al inicio
          </button>

          <p style={S.title}>Crear cuenta</p>
          <p style={S.subtitle}>Completa los datos para registrar tu empresa.</p>

          <form onSubmit={handleSubmit}>

            {/* Datos empresa */}
            <span style={S.sectionLabel}>Datos de la empresa</span>

            <div style={S.fieldWrap}>
              <label style={S.label}>Nombre de empresa</label>
              <input
                type="text" name="nombre_empresa"
                value={form.nombre_empresa} onChange={handleChange}
                placeholder="Mi Empresa SpA" required style={S.input}
              />
            </div>

            <div style={S.fieldWrap}>
              <label style={S.label}>Teléfono de contacto</label>
              <div style={S.phoneWrap}>
                <span style={S.phonePrefix}>+569</span>
                <input
                  type="text" name="telefono"
                  value={form.telefono} onChange={handleChange}
                  placeholder="12345678" maxLength={8} required
                  style={S.phoneInput}
                />
              </div>
            </div>

            {/* Datos representante */}
            <span style={S.sectionLabel}>Datos del representante</span>

            <div style={{ ...S.row, ...S.fieldWrap }}>
              <div style={{ flex: 1 }}>
                <label style={S.label}>Nombre</label>
                <input
                  type="text" name="nombre" maxLength={50}
                  value={form.nombre} onChange={handleChange}
                  placeholder="Juan" required style={S.input}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={S.label}>Apellido</label>
                <input
                  type="text" name="apellido" maxLength={50}
                  value={form.apellido} onChange={handleChange}
                  placeholder="Pérez" required style={S.input}
                />
              </div>
            </div>

            <div style={S.fieldWrap}>
              <label style={S.label}>RUT</label>
              <input
                type="text" name="rut" maxLength={10}
                value={form.rut} onChange={handleChange}
                placeholder="12345678-9" required style={S.input}
              />
            </div>

            <div style={S.fieldWrap}>
              <label style={S.label}>Correo electrónico</label>
              <input
                type="email" name="correo"
                value={form.correo} onChange={handleChange}
                placeholder="tucorreo@ejemplo.cl" required style={S.input}
              />
            </div>

            {/* Credenciales */}
            <span style={S.sectionLabel}>Credenciales de acceso</span>

            <div style={S.fieldWrap}>
              <label style={S.label}>Contraseña</label>
              <input
                type={verPassword ? "text" : "password"}
                name="password" maxLength={64}
                value={form.password} onChange={handleChange}
                placeholder="••••••••" required style={S.input}
              />
              <label style={S.checkRow}>
                <input type="checkbox" checked={verPassword} onChange={() => setVerPassword(!verPassword)} style={{ cursor: "pointer" }} />
                Mostrar contraseña
              </label>
            </div>

            <div style={S.fieldWrap}>
              <label style={S.label}>Confirmar contraseña</label>
              <input
                type={verConfirmar ? "text" : "password"}
                name="confirmarPassword" maxLength={64}
                value={form.confirmarPassword} onChange={handleChange}
                placeholder="••••••••" required style={S.input}
              />
              <label style={S.checkRow}>
                <input type="checkbox" checked={verConfirmar} onChange={() => setVerConfirmar(!verConfirmar)} style={{ cursor: "pointer" }} />
                Mostrar contraseña
              </label>
            </div>

            <button
              type="submit"
              disabled={cargando}
              style={{ ...S.btnPrimary, ...(cargando ? S.btnDisabled : {}) }}
              onMouseEnter={(e) => { if (!cargando) e.currentTarget.style.background = "#4238a3"; }}
              onMouseLeave={(e) => { if (!cargando) e.currentTarget.style.background = "#534AB7"; }}
            >
              {cargando ? "Registrando..." : "Crear cuenta →"}
            </button>
          </form>

          <p style={S.footer}>
            ¿Ya tienes cuenta?{" "}
            <a href="/login" style={S.link}>Inicia sesión aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;