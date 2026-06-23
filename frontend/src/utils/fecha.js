const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function formatFecha(fecha) {
  if (!fecha) return "—"
  const d = new Date(fecha)
  if (Number.isNaN(d.getTime())) return "—"
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}
