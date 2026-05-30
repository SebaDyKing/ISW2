import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginForm    from "../features/auth/components/LoginForm";
import RegisterForm from "../features/auth/components/RegisterForm";
import PrivateRoute from "./PrivateRoute";
import AdminLayout       from "../features/admin/components/AdminLayout";
import UsuariosTable     from "../features/admin/components/UsuariosTable";
import CotizacionesTable from "../features/admin/components/CotizacionesTable";
import LandingPage         from "../features/cliente/components/LandingPage";
import SolicitarCotizacion from "../features/cliente/components/SolicitarCotizacion";

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
        <Route path="/cliente"    element={<div>Panel cliente — próximamente</div>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;