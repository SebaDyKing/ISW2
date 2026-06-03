export function getIniciales(nombre = '') {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

const AVATAR_COLORS = ['#ef5350','#66bb6a','#26a69a','#ffa726','#90caf9','#ba68c8','#ff8a65']

export function getAvatarColor(id = '') {
  const idString = String(id);
  const index = idString.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

export function useContratoRow(contrato) {
  const esTraslado = contrato?.tipoContrato === 'traslado'
  const iniciales = getIniciales(contrato?.nombre)
  const avatarColor = getAvatarColor(contrato?.id)

  return {
    esTraslado,
    iniciales,
    avatarColor
  }
}
