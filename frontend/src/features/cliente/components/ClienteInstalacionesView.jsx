import { useEffect, useState } from "react";
import {
  obtenerMisInstalacionesService,
  crearInstalacionService,
  actualizarInstalacionService,
  eliminarInstalacionService
} from "../services/cliente.service";
import toast from "react-hot-toast";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Configuración del icono de Leaflet usando CDN para evitar problemas de Vite
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Componente para manejar clicks en el mapa
function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    }
  });
  return null;
}

// Componente para recentrar el mapa cuando cambian las coordenadas externamente (al editar)
function ChangeMapView({ center }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

const FORM_VACIO = {
  nombre: "",
  direccion: "",
  latitud: -33.45694, // Santiago por defecto
  longitud: -70.64827,
  telefono: ""
};

export default function ClienteInstalacionesView() {
  const [instalaciones, setInstalaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [editingId, setEditingId] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const resInst = await obtenerMisInstalacionesService();
      if (resInst) {
        setInstalaciones(resInst);
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

  const handleOpenCrear = () => {
    setForm(FORM_VACIO);
    setEditingId(null);
    setModalOpen(true);
  };

  const handleOpenEditar = (inst) => {
    setEditingId(inst.idInstalacion);
    setForm({
      nombre: inst.nombre,
      direccion: inst.direccion,
      latitud: Number(inst.latitud),
      longitud: Number(inst.longitud),
      telefono: inst.telefono || ""
    });
    setModalOpen(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta instalación?")) return;

    try {
      await eliminarInstalacionService(id);
      toast.success("Instalación eliminada con éxito.");
      cargarDatos();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Error al eliminar la instalación.";
      toast.error(errorMsg);
    }
  };

  const handleMapClick = (latlng) => {
    const wrapped = latlng.wrap();
    setForm((prev) => ({
      ...prev,
      latitud: parseFloat(wrapped.lat.toFixed(6)),
      longitud: parseFloat(wrapped.lng.toFixed(6))
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.direccion.trim()) {
      toast.error("Por favor completa los campos obligatorios.");
      return;
    }

    try {
      if (editingId) {
        await actualizarInstalacionService(editingId, {
          ...form,
          latitud: Number(form.latitud),
          longitud: Number(form.longitud)
        });
        toast.success("Instalación actualizada correctamente.");
      } else {
        await crearInstalacionService({
          ...form,
          latitud: Number(form.latitud),
          longitud: Number(form.longitud)
        });
        toast.success("Instalación creada con éxito.");
      }
      setModalOpen(false);
      cargarDatos();
    } catch (error) {
      const msg = error.response?.data?.message || "Error al guardar la instalación.";
      toast.error(msg);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mis Instalaciones</h1>
          <p className="text-slate-500 text-sm">Gestiona tus recintos para cotizaciones y servicios.</p>
        </div>
        <button
          onClick={handleOpenCrear}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all text-sm cursor-pointer"
        >
          + Nueva Instalación
        </button>
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 font-semibold">Cargando instalaciones...</div>
      ) : instalaciones.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 font-medium">
          No tienes instalaciones registradas en tu cuenta.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Dirección</th>
                  <th className="p-4">Coordenadas GPS</th>
                  <th className="p-4">Teléfono</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {instalaciones.map((inst) => (
                  <tr key={inst.idInstalacion} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">{inst.nombre}</td>
                    <td className="p-4">{inst.direccion}</td>
                    <td className="p-4 font-mono text-[12px] text-slate-500">
                      {inst.latitud}, {inst.longitud}
                    </td>
                    <td className="p-4 text-slate-600">{inst.telefono || "—"}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditar(inst)}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/20 px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(inst.idInstalacion)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-500/20 px-3 py-1.5 rounded-lg text-[12px] font-bold cursor-pointer transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Formulario con Mapa */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? "Editar Instalación" : "Registrar Instalación"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Nombre de la Instalación *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Oficina Central Valparaíso"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Dirección Completa *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                    placeholder="Ej. Avenida Valparaíso 123, Viña del Mar"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="Ej. +569 1234 5678"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Latitud GPS
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.latitud}
                      onChange={(e) => setForm({ ...form, latitud: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Longitud GPS
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={form.longitud}
                      onChange={(e) => setForm({ ...form, longitud: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Mapa Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Ubicación Geográfica (Haz clic en el mapa para posicionar el pin)
                </label>
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-inner relative z-10">
                  <MapContainer
                    center={[form.latitud, form.longitud]}
                    zoom={14}
                    style={{ height: "260px", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MapClickHandler onClick={handleMapClick} />
                    <ChangeMapView center={[form.latitud, form.longitud]} />
                    <Marker position={[form.latitud, form.longitud]} icon={defaultIcon} />
                  </MapContainer>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Guardar Instalación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
