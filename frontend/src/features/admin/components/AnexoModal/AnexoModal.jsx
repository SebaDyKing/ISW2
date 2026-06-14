import { useAnexoModal } from './useAnexoModal'
import { TIPOS_CONTRATO, LEY_LABORAL_CHILE } from '../../constants/contratos.constants'
import styles from './AnexoModal.module.css'

export default function AnexoModal({ contrato, onClose, onSuccess }) {
  const {
    form,
    loading,
    error,
    handleChange,
    submit,
  } = useAnexoModal(contrato, {
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
  })

  const isPlazoFijo = form.tipo === 'Plazo Fijo'

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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className={styles.headerTitle}>Anexo de Contrato</p>
              <p className={styles.headerSubtitle}>Modifica las condiciones actuales para generar un anexo</p>
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

            {/* Condiciones Laborales */}
            <p className={styles.sectionLabel}>Condiciones Laborales</p>

            <div className={styles.row}>
              <div className={styles.fieldFull}>
                <label className={styles.label}>
                  Cargo <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="cargo"
                  value={form.cargo}
                  onChange={handleChange}
                  placeholder="Ej: Supervisor de Aseo"
                  required
                  maxLength={100}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Sueldo (CLP) <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="sueldo"
                  value={form.sueldo}
                  onChange={handleChange}
                  placeholder={LEY_LABORAL_CHILE.SUELDO_MINIMO_CLP.toString()}
                  required
                  min={LEY_LABORAL_CHILE.SUELDO_MINIMO_CLP}
                  step="1"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Jornada (horas) <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  name="jornadaHoras"
                  value={form.jornadaHoras}
                  onChange={handleChange}
                  placeholder={LEY_LABORAL_CHILE.JORNADA_MAXIMA_ACTUAL.toString()}
                  required
                  min={1}
                  max={LEY_LABORAL_CHILE.JORNADA_MAXIMA_ACTUAL}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.divider} />

            {/* Duración */}
            <p className={styles.sectionLabel}>Duración del Contrato</p>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Tipo <span className={styles.required}>*</span>
                </label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handleChange}
                  required
                  className={styles.select}
                >
                  <option value="">Seleccionar...</option>
                  {TIPOS_CONTRATO.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Fecha Fin {isPlazoFijo && <span className={styles.required}>*</span>}
                </label>
                <input
                  type="date"
                  name="fechaFin"
                  value={form.fechaFin}
                  onChange={handleChange}
                  required={isPlazoFijo}
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
