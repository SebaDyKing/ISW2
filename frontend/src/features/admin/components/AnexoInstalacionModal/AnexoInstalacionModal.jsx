import React from 'react'
import { useAnexoInstalacionModal } from './useAnexoInstalacionModal'
import { LEY_LABORAL_CHILE } from '../../constants/contratos.constants'
import styles from '../AnexoModal/AnexoModal.module.css'

export default function AnexoInstalacionModal({ contrato, onClose, onSuccess }) {
  const {
    form,
    loading,
    error,
    instalaciones,
    handleChange,
    submit,
  } = useAnexoInstalacionModal(contrato, {
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
  })

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <svg className={styles.headerIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className={styles.headerTitle}>Anexo de Nueva Instalación</p>
              <p className={styles.headerSubtitle}>Asigna al empleado a una instalación adicional</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit}>
          <div className={styles.body}>
            <p className={styles.sectionLabel}>Detalles de la Asignación</p>

            <div className={styles.row}>
              <div className={styles.fieldFull}>
                <label className={styles.label}>
                  Nueva Instalación <span className={styles.required}>*</span>
                </label>
                <select
                  name="idInstalacion"
                  value={form.idInstalacion}
                  onChange={handleChange}
                  required
                  className={styles.select}
                >
                  <option value="">Seleccionar Instalación...</option>
                  {instalaciones.map((inst) => (
                    <option key={inst.idInstalacion} value={inst.idInstalacion}>
                      {inst.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Horas Semanales <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="horasSemanales"
                  value={form.horasSemanales}
                  onChange={handleChange}
                  placeholder="Ej: 20"
                  required
                  min={1}
                  max={LEY_LABORAL_CHILE.JORNADA_MAXIMA_ACTUAL}
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Pago Adicional ($)
                </label>
                <input
                  type="number"
                  name="pagoAdicional"
                  value={form.pagoAdicional}
                  onChange={handleChange}
                  placeholder="0"
                  min={0}
                  step="1"
                  className={styles.input}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className={styles.error}>
                <svg className={styles.errorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              {loading ? 'Generando...' : 'Guardar y Generar PDF'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
