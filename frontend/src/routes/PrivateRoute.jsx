import { Navigate } from "react-router-dom";

function PrivateRoute({ children, allowedRoles }) {
  const raw = localStorage.getItem("usuario");

  if (!raw) return <Navigate to="/login" replace />;

  try {
    const usuario = JSON.parse(raw);

    if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
      return <Navigate to="/login" replace />;
    }

    return children;

  } catch {
    localStorage.removeItem("usuario");
    return <Navigate to="/login" replace />;
  }
}

export default PrivateRoute;