import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginService } from "../services/auth.service";

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
    marginBottom: "2rem",
  },
  logoIcon: {
    width: "32px", height: "32px", borderRadius: "8px",
    background: "rgba(255,255,255,0.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "16px", color: "#fff",
    border: "1px solid rgba(255,255,255,0.25)",
  },
  logoText: {
    fontSize: "15px", fontWeight: 600, color: "#fff", letterSpacing: "-0.2px",
  },
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
    display: "flex", alignItems: "center", justifyContent: "center",
    flex: 1, padding: "2rem",
  },
  card: {
    background: "#f4f5f8",
    borderRadius: "14px",
    padding: "2rem",
    width: "100%", maxWidth: "400px",
    border: "1px solid #dde1e9",
  },
  backBtn: {
    background: "none", border: "none", padding: 0,
    fontSize: "13px", color: "#64748b", cursor: "pointer",
    marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "6px",
    fontFamily: "inherit",
  },
  title: {
    fontSize: "20px", fontWeight: 600, color: "#0f172a", marginBottom: "4px",
  },
  subtitle: {
    fontSize: "13px", color: "#64748b", marginBottom: "1.75rem",
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
  fieldWrap: { marginBottom: "1rem" },
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
    marginTop: "0.5rem", transition: "background .15s",
  },
  btnDisabled: {
    background: "#94a3b8", cursor: "not-allowed",
  },
  footer: {
    textAlign: "center", fontSize: "13px",
    color: "#64748b", marginTop: "1.25rem",
  },
  link: { color: "#534AB7", textDecoration: "none", fontWeight: 500 },
};

function LoginForm() {
  const [correo, setCorreo]         = useState("");
  const [password, setPassword]     = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando]     = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const data = await loginService(correo, password);

      const nombreReal      = data.usuario.nombre   || "Usuario";
      const apellidoReal    = data.usuario.apellido || "";
      const nombreCompleto  = `${nombreReal} ${apellidoReal}`.trim();
      const inicialApellido = apellidoReal ? `${apellidoReal.charAt(0).toUpperCase()}.` : "";
      const nombreMostrar   = `${nombreReal} ${inicialApellido}`.trim();

      localStorage.setItem("usuario", JSON.stringify({
        idUsuario: data.usuario.id,
        nombreCompleto,
        nombreMostrar,
        rol: data.usuario.rol,
      }));

      toast.success("¡Bienvenido!");

      const rol = data.usuario.rol;
      if      (rol === "administrador") navigate("/admin");
      else if (rol === "empleado")      navigate("/empleado");
      else if (rol === "supervisor")    navigate("/supervisor");
      else {
        const planGuardado = sessionStorage.getItem("planPreseleccionado");
        navigate(planGuardado ? "/cliente/cotizar" : "/cliente");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Fondo */}
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
          <h1 style={S.heroH1}>Bienvenido<br />de vuelta</h1>
          <p style={S.heroP}>
            Accede a tu cuenta para gestionar tus instalaciones,
            revisar cotizaciones y coordinar con nuestro equipo.
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

          <p style={S.title}>Iniciar sesión</p>
          <p style={S.subtitle}>Ingresa tus credenciales para continuar.</p>

          <form onSubmit={handleSubmit}>
            <div style={S.fieldWrap}>
              <label style={S.label}>Correo electrónico</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tucorreo@ejemplo.cl"
                required
                style={S.input}
              />
            </div>

            <div style={S.fieldWrap}>
              <label style={S.label}>Contraseña</label>
              <input
                type={verPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={S.input}
              />
              <label style={S.checkRow}>
                <input
                  type="checkbox"
                  checked={verPassword}
                  onChange={() => setVerPassword(!verPassword)}
                  style={{ cursor: "pointer" }}
                />
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
              {cargando ? "Iniciando sesión..." : "Iniciar sesión →"}
            </button>
          </form>

          <p style={S.footer}>
            ¿No tienes cuenta?{" "}
            <a href="/registro" style={S.link}>Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;