import React, { useEffect, useState, useMemo } from "react";
import { obtenerMisAsignacionesService } from "../services/asignacion.service";
import { toast } from "react-hot-toast";

export default function MisAsignacionesView() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [activeTab, setActiveTab] = useState("activas");

  async function cargarDatos() {
    try {
      const res = await obtenerMisAsignacionesService();
      setAsignaciones(res.data);
    } catch (error) {
      toast.error("Error al cargar las asignaciones");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  const asignacionesFiltradas = useMemo(() => {
    return asignaciones.filter((c) => {
      if (activeTab === "activas") {
        return c.estado === "ACTIVO" || c.estado === "POR VENCER";
      } else {
        return c.estado === "FINALIZADO";
      }
    });
  }, [asignaciones, activeTab]);

  const activasCount = asignaciones.filter((c) => c.estado === "ACTIVO" || c.estado === "POR VENCER").length;
  const historialCount = asignaciones.filter((c) => c.estado === "FINALIZADO").length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "Indefinida";
    return new Date(dateStr).toLocaleDateString("es-CL");
  };

  if (cargando) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-slate-500">Cargando tus asignaciones...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mis Asignaciones</h1>
        <p className="text-sm text-slate-500 mt-1">
          Revisa los proyectos e instalaciones en los que estás o has estado trabajando.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 gap-6">
        <button
          onClick={() => setActiveTab("activas")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "activas" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Proyectos Activos ({activasCount})
        </button>
        <button
          onClick={() => setActiveTab("historial")}
          className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === "historial" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Historial ({historialCount})
        </button>
      </div>

      {/* Grid de Asignaciones */}
      {asignacionesFiltradas.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl px-6 py-12 text-center">
          <p className="text-slate-500 text-sm font-medium">
            {activeTab === "activas" ? "No tienes proyectos activos en este momento." : "No tienes historial de proyectos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {asignacionesFiltradas.map((c) => {
            const isActivo = c.estado === "ACTIVO";
            const isPorVencer = c.estado === "POR VENCER";
            const isFinalizado = c.estado === "FINALIZADO";

            let badgeClasses = "bg-slate-100 text-slate-600";
            if (isActivo) badgeClasses = "bg-green-100 text-green-800";
            else if (isPorVencer) badgeClasses = "bg-amber-100 text-amber-800";
            else if (isFinalizado) badgeClasses = "bg-rose-100 text-rose-800";

            return (
              <div key={c.idContrato} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col gap-4 transition-shadow hover:shadow-md">
                
                {/* Header Card */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {c.instalacion?.nombre || "Instalación Desconocida"}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      📍 {c.instalacion?.direccion || "Sin dirección"}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${badgeClasses}`}>
                    {c.estado}
                  </span>
                </div>

                {/* Cliente */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Empresa Cliente</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {c.instalacion?.cliente?.nombreEmpresa || "—"}
                  </p>
                </div>

                {/* Detalles Contrato */}
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Cargo</p>
                    <p className="text-sm font-semibold text-slate-900">{c.cargo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Jornada</p>
                    <p className="text-sm font-semibold text-slate-900">{c.jornadaHoras} hrs</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Tipo</p>
                    <p className="text-sm font-semibold text-slate-900">{c.tipo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Sueldo Bruto</p>
                    <p className="text-sm font-semibold text-slate-900">${Number(c.sueldo).toLocaleString("es-CL")}</p>
                  </div>
                </div>

                {/* Footer Card */}
                <div className="border-t border-slate-100 pt-3 mt-1 flex justify-between">
                  <div className="text-xs">
                    <span className="text-slate-500">Inicio: </span>
                    <span className="font-semibold text-slate-700">{formatDate(c.fechaInicio)}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-500">Fin: </span>
                    <span className="font-semibold text-slate-700">{formatDate(c.fechaFin)}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
