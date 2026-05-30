import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const NAV = [
  { to: "/admin/usuarios",     label: "Usuarios" },
  { to: "/admin/cotizaciones", label: "Cotizaciones" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ 
    nombreCompleto: "Cargando...", 
    nombreMostrar: "Cargando...", 
    rol: "" 
  });

  useEffect(() => {
    const userGuardado = localStorage.getItem("usuario");
    if (userGuardado) {
      setUsuario(JSON.parse(userGuardado));
    } else {
      setUsuario({ 
        nombreCompleto: "Administrador", 
        nombreMostrar: "Admin", 
        rol: "admin" 
      });
    }
  }, []);

  function cerrarSesion() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  }

  const getInicial = () => usuario.nombreMostrar.charAt(0).toUpperCase();

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <aside style={{
        width: 200,
        background: "#1e293b",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 1rem",
        position: "fixed",
        top: 0, bottom: 0,
        boxSizing: "border-box"
      }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: "2rem", paddingLeft: "0.5rem" }}>
          CleanPro
        </span>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                padding: "0.5rem 0.75rem",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "0.875rem",
                color: isActive ? "#fff" : "#94a3b8",
                background: isActive ? "#334155" : "transparent",
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{
          marginTop: "auto",
          marginBottom: "1rem",
          padding: "0.75rem",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#475569",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "0.875rem",
            flexShrink: 0
          }}>
            {getInicial()}
          </div>
          
          <div 
            style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
            title={usuario.nombreCompleto}
          >
            <span style={{ 
              color: "#fff", 
              fontSize: "0.875rem", 
              fontWeight: 600, 
              whiteSpace: "nowrap", 
              textOverflow: "ellipsis", 
              overflow: "hidden" 
            }}>
              {usuario.nombreMostrar}
            </span>
            <span style={{ 
              color: "#94a3b8", 
              fontSize: "0.75rem", 
              textTransform: "capitalize" 
            }}>
              {usuario.rol}
            </span>
          </div>
        </div>

        <button
          onClick={cerrarSesion}
          style={{
            background: "transparent",
            border: "1px solid #475569",
            color: "#94a3b8",
            borderRadius: "6px",
            padding: "0.5rem",
            cursor: "pointer",
            fontSize: "0.8rem",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#334155";
            e.target.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#94a3b8";
          }}
        >
          Cerrar sesión
        </button>
      </aside>

      <main style={{ marginLeft: 200, flex: 1, padding: "2rem", background: "#f8fafc" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;