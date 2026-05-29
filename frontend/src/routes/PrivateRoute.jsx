import { Navigate } from "react-router-dom";

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(payload.rol)) {
      return <Navigate to="/login" replace />;
    }

    return children;

  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
}

export default PrivateRoute;