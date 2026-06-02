import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginForm    from "../features/auth/components/LoginForm";
import RegisterForm from "../features/auth/components/RegisterForm";
import PrivateRoute from "./PrivateRoute";
import AdminLayout       from "../features/admin/components/AdminLayout";
import UsuariosTable     from "../features/admin/components/UsuariosTable";
import CotizacionesTable from "../features/admin/components/CotizacionesTable";
import LandingPage         from "../features/cliente/components/LandingPage";
import SolicitarCotizacion from "../features/cliente/components/SolicitarCotizacion";

function PanelClienteProximamente() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem" }}>
      <span style={{ fontSize: "14px", color: "#64748b" }}>Panel cliente — próximamente</span>
      <button
        onClick={handleLogout}
        style={{
          padding: ".45rem 1rem",
          border: "1px solid #cbd5e1",
          borderRadius: "6px",
          background: "transparent",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginForm />} />
        <Route path="/registro" element={<RegisterForm />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["administrador"]}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="usuarios" replace />} />
          <Route path="usuarios"     element={<UsuariosTable />} />
          <Route path="cotizaciones" element={<CotizacionesTable />} />
        </Route>

        {/* Cliente */}
        <Route
          path="/cliente/cotizar"
          element={
            <PrivateRoute allowedRoles={["cliente"]}>
              <SolicitarCotizacion />
            </PrivateRoute>
          }
        />

        <Route path="/empleado"   element={<div>Panel empleado — próximamente</div>} />
        <Route path="/supervisor" element={<div>Panel supervisor — próximamente</div>} />
        <Route
          path="/cliente"
          element={
            <PrivateRoute allowedRoles={["cliente"]}>
              <PanelClienteProximamente />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
