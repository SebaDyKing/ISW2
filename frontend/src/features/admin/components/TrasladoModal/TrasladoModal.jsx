import { useTrasladoModal } from './useTrasladoModal'
import styles from './TrasladoModal.module.css'

export default function TrasladoModal({ onClose, onSuccess }) {
  const {
    form,
    empleados,
    instalaciones,
    loading,
    loadingOptions,
    error,
    handleChange,
    submit,
  } = useTrasladoModal({
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
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <p className={styles.headerTitle}>Traslado de Personal</p>
              <p className={styles.headerSubtitle}>Asigna una nueva instalación al trabajador</p>
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

            {/* Asignación */}
            <p className={styles.sectionLabel}>Asignación</p>

            <div className={styles.row}>
              <div className={styles.fieldFull}>
                <label className={styles.label}>
                  Empleado a trasladar <span className={styles.required}>*</span>
                </label>
                <select
                  name="idEmpleado"
                  value={form.idEmpleado}
                  onChange={handleChange}
                  required
                  disabled={loadingOptions}
                  className={`${styles.select} ${loadingOptions ? styles.selectDisabled : ''}`}
                >
                  <option value="">Seleccionar empleado...</option>
                  {empleados.map((e) => (
                    <option key={e.idEmpleado} value={e.idEmpleado}>
                      {e.nombre} {e.apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldFull}>
                <label className={styles.label}>
                  Nueva Instalación Destino <span className={styles.required}>*</span>
                </label>
                <select
                  name="idInstalacion"
                  value={form.idInstalacion}
                  onChange={handleChange}
                  required
                  disabled={loadingOptions}
                  className={`${styles.select} ${loadingOptions ? styles.selectDisabled : ''}`}
                >
                  <option value="">Seleccionar nueva instalación...</option>
                  {instalaciones.map((i) => (
                    <option key={i.idInstalacion} value={i.idInstalacion}>
                      {i.nombre}
                    </option>
                  ))}
                </select>
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
            <button type="submit" className={styles.btnSubmit} disabled={loading || loadingOptions}>
              {loading ? <span className={styles.spinner} /> : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {loading ? 'Trasladando...' : 'Confirmar Traslado'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
