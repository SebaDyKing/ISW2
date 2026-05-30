import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout/AppLayout';
import WelcomePage from '../features/public/WelcomePage/WelcomePage';
import ContratosPage from '../features/admin/pages/ContratosPage/ContratosPage';
import AdminDashboard from '../features/admin/pages/AdminDashboard/AdminDashboard';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Routes>
          {/* Landing / Welcome Page */}
          <Route path="/" element={<WelcomePage />} />

          {/* Rutas de Administración */}
          <Route path="/admin" element={<AppLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="contratos" element={<ContratosPage />} />
          </Route>

          {/* Placeholders para Cliente y Empleado */}
          <Route path="/cliente/*" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">Cliente Dashboard</h1>
            </div>
          } />
          <Route path="/empleado/*" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold">Empleado Dashboard</h1>
            </div>
          } />

          {/* Catch-all redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
