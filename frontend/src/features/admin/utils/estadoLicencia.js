// Estados posibles de una licencia médica.
// Deben coincidir EXACTAMENTE con el backend:
// backend/src/validations/licenciamedica.validations.js -> "pendiente" | "aprobada" | "rechazada"
export const ESTADOS = {
  pendiente: {
    label: "Pendiente",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-500",
    borderL: "border-l-amber-400",
  },
  aprobada: {
    label: "Aprobada",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
    borderL: "border-l-emerald-500",
  },
  rechazada: {
    label: "Rechazada",
    badge: "bg-rose-50 text-rose-700 border border-rose-200",
    dot: "bg-rose-500",
    borderL: "border-l-rose-500",
  },
}

export const getEstado = (estado) => ESTADOS[estado] ?? ESTADOS.pendiente
