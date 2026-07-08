import { useEffect, useState } from "react";
import { getInstalaciones } from "../services/admin.service";
import toast from "react-hot-toast";

export default function InstalacionesView() {
  const [instalaciones, setInstalaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroCliente, setFiltroCliente] = useState("");

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const resInst = await getInstalaciones();
      if (resInst && resInst.data) {
        setInstalaciones(resInst.data);
      }
    } catch (error) {
      toast.error("Error al cargar la información del servidor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrar instalaciones por nombre de la empresa del cliente o su nombre/apellido
  const instalacionesFiltradas = instalaciones.filter((inst) => {
    if (!filtroCliente.trim()) return true;
    const query = filtroCliente.toLowerCase();
    
    const nombreEmpresa = inst.cliente?.nombreEmpresa || "";
    const nombreUsuario = inst.cliente?.usuario?.nombre || "";
    const apellidoUsuario = inst.cliente?.usuario?.apellido || "";
    const nombreCompleto = `${nombreUsuario} ${apellidoUsuario}`.trim();

    return (
      nombreEmpresa.toLowerCase().includes(query) ||
      nombreCompleto.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Encabezado y Barra de Filtro */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Instalaciones de Clientes</h1>
          <p className="text-slate-500 text-sm">Visualiza los recintos y lugares de trabajo asignados a clientes.</p>
        </div>

        {/* Input de Filtro */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            placeholder="Filtrar por cliente..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all placeholder-slate-400 text-slate-700 shadow-sm"
          />
          <div className="absolute left-3.5 top-3.5 text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-semibold">Cargando instalaciones...</div>
      ) : instalaciones.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 font-medium">
          No hay instalaciones registradas en el sistema.
        </div>
      ) : instalacionesFiltradas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 font-medium">
          No se encontraron instalaciones para el cliente "{filtroCliente}".
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-4">Nombre de la Instalación</th>
                  <th className="p-4">Dirección</th>
                  <th className="p-4">Coordenadas GPS</th>
                  <th className="p-4">Teléfono</th>
                  <th className="p-4">Cliente Asociado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {instalacionesFiltradas.map((inst) => {
                  const labelCliente = inst.cliente?.nombreEmpresa || 
                    `${inst.cliente?.usuario?.nombre || ""} ${inst.cliente?.usuario?.apellido || ""}`.trim() || 
                    "Sin cliente";
                  
                  return (
                    <tr key={inst.idInstalacion} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{inst.nombre}</td>
                      <td className="p-4 text-slate-600">{inst.direccion}</td>
                      <td className="p-4 font-mono text-[12px] text-slate-500">
                        {inst.latitud}, {inst.longitud}
                      </td>
                      <td className="p-4 text-slate-500">{inst.telefono || "—"}</td>
                      <td className="p-4 font-semibold text-slate-800">
                        {labelCliente}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
