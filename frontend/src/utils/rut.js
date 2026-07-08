export function normalizarRut(valor) {
  return valor.replace(/\./g, "").replace(/k$/, "K");
}

export function validarRut(valor) {
  if (!/^\d{7,8}-[\dkK]$/.test(valor)) return false;
  
  const [numero, dv] = valor.split('-');
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = numero.length - 1; i >= 0; i--) {
    suma += parseInt(numero[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const dvEsperadoNum = 11 - (suma % 11);
  let dvEsperadoStr = String(dvEsperadoNum);
  
  if (dvEsperadoNum === 11) dvEsperadoStr = '0';
  else if (dvEsperadoNum === 10) dvEsperadoStr = 'K';
  
  return dv.toUpperCase() === dvEsperadoStr;
}