"use strict";

// Lunes a viernes, 9:00 a 18:00, hora Chile (UTC-3)
const HORA_INICIO = 9;
const HORA_FIN = 18;

function esHabilDia(fecha) {
  const dia = fecha.getDay(); // 0=dom, 6=sab
  return dia >= 1 && dia <= 5;
}

function avanzarAHoraHabil(fecha) {
  const d = new Date(fecha);

  // Si es fin de semana, avanzar al lunes
  while (!esHabilDia(d)) {
    d.setDate(d.getDate() + 1);
    d.setHours(HORA_INICIO, 0, 0, 0);
  }

  const hora = d.getHours();

  if (hora < HORA_INICIO) {
    d.setHours(HORA_INICIO, 0, 0, 0);
  } else if (hora >= HORA_FIN) {
    d.setDate(d.getDate() + 1);
    d.setHours(HORA_INICIO, 0, 0, 0);
    while (!esHabilDia(d)) {
      d.setDate(d.getDate() + 1);
    }
  }

  return d;
}

export function agregarHorasHabiles(fechaInicio, horas) {
  let actual = avanzarAHoraHabil(new Date(fechaInicio));
  let horasRestantes = horas;

  while (horasRestantes > 0) {
    const finDelDia = new Date(actual);
    finDelDia.setHours(HORA_FIN, 0, 0, 0);

    const horasHastaFinDelDia = (finDelDia - actual) / (1000 * 60 * 60);

    if (horasRestantes <= horasHastaFinDelDia) {
      actual = new Date(actual.getTime() + horasRestantes * 3600000);
      horasRestantes = 0;
    } else {
      horasRestantes -= horasHastaFinDelDia;
      actual.setDate(actual.getDate() + 1);
      actual.setHours(HORA_INICIO, 0, 0, 0);
      while (!esHabilDia(actual)) {
        actual.setDate(actual.getDate() + 1);
      }
    }
  }

  return actual;
}