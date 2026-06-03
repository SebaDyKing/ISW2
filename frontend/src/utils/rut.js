export function normalizarRut(valor) {
  return valor.replace(/\./g, "").replace(/k$/, "K");
}

export function validarRut(valor) {
  return /^\d{7,8}-[\dkK]$/.test(valor);
}