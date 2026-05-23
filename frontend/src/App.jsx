import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ContratosPage from './features/admin/pages/ContratosPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Routes>
          <Route path="/" element={
            <div className="flex h-screen items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-blue-600 mb-4">Bienvenido a ISW2</h1>
                <p className="text-gray-600">El sistema de gestión está listo para ser construido.</p>
              </div>
            </div>
          } />

          <Route path="/admin" element={<AppLayout />}>
            <Route path="contratos" element={<ContratosPage />} />
          </Route>

          <Route path="/cliente/*" element={<div className="p-8"><h1 className="text-2xl font-bold">Cliente Dashboard</h1></div>} />
          <Route path="/empleado/*" element={<div className="p-8"><h1 className="text-2xl font-bold">Empleado Dashboard</h1></div>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App;