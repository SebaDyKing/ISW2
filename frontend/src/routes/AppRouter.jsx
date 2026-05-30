import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import App from "../App.jsx"
import AdminPage from "../features/admin/pages/AdminPage.jsx"

/**
 * Router de la aplicación.
 *
 * - "/"       -> App (home actual; el equipo la reemplaza cuando quiera)
 * - "/admin"  -> AdminPage (panel de administración)
 * - "*"       -> cualquier ruta desconocida vuelve a "/"
 *
 * Para sumar más vistas, agregás un <Route> acá. No hace falta tocar main.jsx.
 */
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
