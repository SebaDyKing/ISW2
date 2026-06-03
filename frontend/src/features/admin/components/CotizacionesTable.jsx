import { useEffect, useState } from "react";
import { obtenerCotizacionesService, actualizarEstadoCotizacionService } from "../services/admin.service";
import toast from "react-hot-toast";

const ESTADOS = ["Pendiente", "Aprobada", "Rechazada"];

const BADGE = {
  pendiente:  { bg: "#fef9c3", color: "#854d0e" },
  aprobada:   { bg: "#dcfce7", color: "#166534" },
  rechazada:  { bg: "#fee2e2", color: "#991b1b" },
};

function CotizacionesTable() {
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cargando, setCargando]         = useState(true);
  
  // Nuevo estado para saber qué fila específica se está actualizando
  const [actualizandoId, setActualizandoId] = useState(null);

  async function cargar() {
    try {
      const res = await obtenerCotizacionesService();
      setCotizaciones(res.data);
    } catch {
      toast.error("Error al cargar cotizaciones");
    } finally {
      setCargando(false);
    }
  }

  async function cambiarEstado(id, nuevoEstado) {
    // 1. Respaldar el estado anterior por si el backend falla
    const cotizacionOriginal = cotizaciones.find(c => c.idSolicitud === id);
    const estadoAnterior = cotizacionOriginal.estado;

    if (estadoAnterior === nuevoEstado) return;

    // 2. Actualización Optimista: Cambiamos la UI al instante
    setCotizaciones(prev =>
      prev.map(c => c.idSolicitud === id ? { ...c, estado: nuevoEstado } : c)
    );
    
    // Bloqueamos el selector de esta fila mientras trabaja el backend
    setActualizandoId(id);

    // 3. Lanzamos una promesa visual elegante (Toast interactivo)
    toast.promise(
      actualizarEstadoCotizacionService(id, nuevoEstado),
      {
        loading: 'Enviando correo al cliente...',
        success: '¡Estado actualizado y correo enviado!',
        error: 'Error al actualizar el estado',
      }
    ).then(() => {
      // Éxito: Desbloqueamos el selector
      setActualizandoId(null);
    }).catch((error) => {
      // Fallo: Revertimos la UI al estado original y desbloqueamos
      setCotizaciones(prev =>
        prev.map(c => c.idSolicitud === id ? { ...c, estado: estadoAnterior } : c)
      );
      setActualizandoId(null);
    });
  }

  useEffect(() => { cargar(); }, []);

  if (cargando) return <p style={{ color: "#64748b" }}>Cargando...</p>;

  return (
    <div>
      <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", color: "#0f172a" }}>
        Cotizaciones
      </h1>

      <div style={{ background: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
              {["ID", "Cliente", "Plan", "Estado", "Fecha", "Cambiar estado"].map(h => (
                <th key={h} style={{ padding: "0.75rem 1rem", color: "#475569", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cotizaciones.map((c, i) => {
              const estadoNormalizado = c.estado?.toLowerCase();
              const estaCargando = actualizandoId === c.idSolicitud; // Verificamos si esta fila está bloqueada

              return (
                <tr
                  key={c.idSolicitud}
                  style={{ 
                    borderTop: "1px solid #e2e8f0", 
                    background: i % 2 === 0 ? "#fff" : "#f8fafc",
                    opacity: estaCargando ? 0.6 : 1, // Damos un ligero efecto de transparencia si está cargando
                    transition: "opacity 0.2s"
                  }}
                >
                  <td style={{ padding: "0.75rem 1rem", color: "#94a3b8" }}>#{c.idSolicitud}</td>
                  <td style={{ padding: "0.75rem 1rem", color: "#0f172a" }}>{c.cliente?.nombreEmpresa || "—"}</td>
                  
                  <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>
                    {c.plan?.tipo || "Sin Plan"}
                  </td>

                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span style={{
                      padding: "0.2rem 0.6rem",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: BADGE[estadoNormalizado]?.bg ?? "#f1f5f9",
                      color:      BADGE[estadoNormalizado]?.color ?? "#475569",
                    }}>
                      {c.estado}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "#475569" }}>
                    {c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleDateString("es-CL") : "—"}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <select
                      value={c.estado}
                      onChange={e => cambiarEstado(c.idSolicitud, e.target.value)}
                      disabled={estaCargando} // Bloquea el selector
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        padding: "0.3rem 0.5rem",
                        fontSize: "0.8rem",
                        color: estaCargando ? "#94a3b8" : "#0f172a",
                        cursor: estaCargando ? "not-allowed" : "pointer",
                        background: estaCargando ? "#f1f5f9" : "#fff"
                      }}
                    >
                      {ESTADOS.map(est => (
                        <option key={est} value={est}>{est}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {cotizaciones.length === 0 && (
          <p style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
            No hay cotizaciones registradas.
          </p>
        )}
      </div>
    </div>
  );
}

export default CotizacionesTable;