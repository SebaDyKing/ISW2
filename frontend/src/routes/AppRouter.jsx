import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginForm    from "../features/auth/components/LoginForm";
import RegisterForm from "../features/auth/components/RegisterForm";
import PrivateRoute from "./PrivateRoute";
import AdminLayout       from "../features/admin/components/AdminLayout";
import UsuariosTable     from "../features/admin/components/UsuariosTable";
import CotizacionesTable from "../features/admin/components/CotizacionesTable";
import LicenciasMedicasView from "../features/admin/components/LicenciasMedicasView";
import HojaVidaView         from "../features/admin/components/HojaVidaView";
import EmpleadoLayout  from "../features/empleado/components/EmpleadoLayout";
import MisLicenciasView from "../features/empleado/components/MisLicenciasView";
import MisHojasVidaView from "../features/empleado/components/MisHojasVidaView";
import MisAsignacionesView from "../features/empleado/components/MisAsignacionesView";
import LandingPage         from "../features/cliente/components/LandingPage";
import SolicitarCotizacion from "../features/cliente/components/SolicitarCotizacion";
import MarcarAsistencia from "../components/MarcarAsistencia";
import AdminDashboard from "../features/admin/pages/AdminDashboard/AdminDashboard";
import ContratosPage from "../features/admin/pages/ContratosPage/ContratosPage";
import api from "../config/axios";

function PanelClienteProximamente() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {
      // si falla igual limpiamos el lado cliente
    } finally {
      localStorage.removeItem("usuario");
      navigate("/");
    }
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
      <Toaster position="top-right" />
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginForm />} />
        <Route path="/registro" element={<RegisterForm />} />

        <Route path="/admin" element={<PrivateRoute allowedRoles={["administrador"]}><AdminLayout /></PrivateRoute>}>
          <Route index               element={<Navigate to="usuarios" replace />} />
          <Route path="usuarios"     element={<UsuariosTable />} />
          <Route path="contratos"    element={<ContratosPage />} />
          <Route path="dashboard"    element={<AdminDashboard />} />
          <Route path="cotizaciones" element={<CotizacionesTable />} />
          <Route path="licencias"    element={<LicenciasMedicasView />} />
          <Route path="hojas-vida"   element={<HojaVidaView />} />
        </Route>

        <Route path="/cliente/cotizar" element={<PrivateRoute allowedRoles={["cliente"]}><SolicitarCotizacion /></PrivateRoute>} />

        <Route path="/empleado" element={<PrivateRoute allowedRoles={["empleado"]}><EmpleadoLayout /></PrivateRoute>}>
          <Route index             element={<Navigate to="asistencia" replace />} />
          <Route path="asistencia" element={<MarcarAsistencia />} />
          <Route path="asignaciones" element={<MisAsignacionesView />} />
          <Route path="licencias"  element={<MisLicenciasView />} />
          <Route path="hoja-vida"  element={<MisHojasVidaView />} />
        </Route>

        <Route path="/supervisor" element={<div>Panel supervisor — próximamente</div>} />
        <Route path="/cliente" element={<PrivateRoute allowedRoles={["cliente"]}><Navigate to="/cliente/cotizar" replace /></PrivateRoute>} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;