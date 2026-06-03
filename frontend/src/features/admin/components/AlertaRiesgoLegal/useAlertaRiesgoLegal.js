export function useAlertaRiesgoLegal(trabajador) {
  const shouldRender = Boolean(trabajador)

  return {
    shouldRender
  }
}
