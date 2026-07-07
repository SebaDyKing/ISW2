import React from 'react';
import { useSolicitudTrasladoModal } from './useSolicitudTrasladoModal';
import styles from './SolicitudTrasladoModal.module.css';

export default function SolicitudTrasladoModal({ contrato, onClose, onSuccess }) {
  const {
    form,
    instalaciones,
    loading,
    loadingOptions,
    error,
    handleChange,
    submit,
  } = useSolicitudTrasladoModal({
    contrato,
    onSuccess: () => {
      onSuccess?.();
      onClose();
    },
  });

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

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
              <p className={styles.headerTitle}>Solicitar Traslado</p>
              <p className={styles.headerSubtitle}>Envía una solicitud al administrador para trasladar a este trabajador</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className={styles.form}>
          <div className={styles.formBody}>
            
            {error && (
              <div className={styles.errorAlert}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>Instalación de Destino <span style={{color: 'red'}}>*</span></label>
              <select
                name="idInstalacion"
                value={form.idInstalacion}
                onChange={handleChange}
                className={styles.input}
                disabled={loadingOptions || loading}
                required
              >
                <option value="">Selecciona una instalación</option>
                {instalaciones.map((inst) => (
                  <option key={inst.idInstalacion} value={inst.idInstalacion}>
                    {inst.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Motivo del Traslado <span style={{color: 'red'}}>*</span></label>
              <textarea
                name="motivo"
                value={form.motivo}
                onChange={handleChange}
                className={styles.input}
                rows="3"
                placeholder="Indica la razón por la que solicitas el traslado de este trabajador"
                disabled={loading}
                required
              ></textarea>
            </div>

          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || loadingOptions}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
