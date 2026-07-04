import React from 'react'
import styles from './IndefinidoModal.module.css'

export default function IndefinidoModal({ contrato, onClose, onConfirm, isSubmitting }) {
  if (!contrato) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <svg className={styles.headerIconSvg} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <h2 className={styles.headerTitle}>Ascender a Indefinido</h2>
              <p className={styles.headerSubtitle}>
                {contrato.nombre}
              </p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn} type="button">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <p className="text-sm text-slate-600">
            ¿Estás seguro de que deseas transformar este contrato de Plazo Fijo a <strong>Indefinido</strong>?
          </p>
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-800">
            <strong>Acciones automáticas:</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Se actualizará el contrato en el sistema.</li>
              <li>La fecha de término actual quedará anulada.</li>
              <li>Se descargará un PDF del Anexo de Paso a Indefinido para que ambas partes lo firmen.</li>
            </ul>
          </div>
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
            type="button"
            className={styles.btnSubmit}
            disabled={isSubmitting}
            onClick={() => onConfirm(contrato)}
          >
            {isSubmitting ? (
              <>
                <div className={styles.spinner}></div>
                <span>Procesando...</span>
              </>
            ) : (
              <span>Generar Anexo y Ascender</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
