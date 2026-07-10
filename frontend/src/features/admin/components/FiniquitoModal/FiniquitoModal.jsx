import React, { useState } from 'react'
import styles from './FiniquitoModal.module.css'

export default function FiniquitoModal({ contrato, onClose, onConfirm, isSubmitting }) {
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
  const [causalTermino, setCausalTermino] = useState('')
  const [error, setError] = useState(null)

  if (!contrato) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    if (!fechaFin) {
      setError("La fecha de término es obligatoria.")
      return
    }

    if (new Date(fechaFin) < new Date(contrato.periodoInicio)) {
      setError("La fecha de término no puede ser anterior a la fecha de inicio del contrato.")
      return
    }

    if (!causalTermino.trim()) {
      setError("La causal de término es obligatoria.")
      return
    }

    onConfirm(contrato.id, fechaFin, causalTermino)
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <svg className={styles.headerIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className={styles.headerTitle}>Finiquitar Contrato</h2>
              <p className={styles.headerSubtitle}>
                {contrato.nombre} - {contrato.tipo || 'Indefinido'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn} type="button">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.body}>
            <p className="text-sm text-slate-600 mb-2">
              Seleccione la fecha exacta en la que se hace efectivo el término de este contrato.
            </p>

            <div className={styles.field}>
              <label className={styles.label}>
                Fecha de Término <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                required
                className={styles.input}
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>

            <div className={styles.field} style={{ marginTop: '1rem' }}>
              <label className={styles.label}>
                Causal de Término / Motivo <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Necesidades de la empresa, Renuncia, etc."
                className={styles.input}
                value={causalTermino}
                onChange={(e) => setCausalTermino(e.target.value)}
              />
            </div>

            {error && (
              <div className={styles.error}>
                <svg className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Finiquitar y Finalizar</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
