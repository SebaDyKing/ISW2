import { useNuevoContratoModal } from './useNuevoContratoModal'
import { TIPOS_CONTRATO, CARGOS_DISPONIBLES, LEY_LABORAL_CHILE } from '../../constants/contratos.constants'
import styles from './NuevoContratoModal.module.css'
export default function NuevoContratoModal({ onClose, onSuccess, defaultUser }) {
  const {
    form,
    empleados,
    clientes,
    instalaciones,
    loading,
    loadingOptions,
    error,
    handleChange,
    submit,
  } = useNuevoContratoModal({
    defaultUser,
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
  })

  const isPlazoFijo = form.tipo === 'Plazo Fijo'
  const isComercial = form.tipoContratoPadre === 'Comercial'

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
              <p className={styles.headerTitle}>Nuevo Contrato</p>
              <p className={styles.headerSubtitle}>Completa los datos del contrato</p>
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
              <div className={styles.field} style={{ marginBottom: '1rem', width: '100%' }}>
                <label className={styles.label}>Modalidad de Contrato</label>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input
                      type="radio"
                      name="tipoContratoPadre"
                      value="Laboral"
                      checked={form.tipoContratoPadre === 'Laboral'}
                      onChange={handleChange}
                    />
                    Laboral (Empleado)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input
                      type="radio"
                      name="tipoContratoPadre"
                      value="Comercial"
                      checked={form.tipoContratoPadre === 'Comercial'}
                      onChange={handleChange}
                    />
                    Comercial (Cliente)
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.row}>
              {!isComercial ? (
                <div className={styles.field}>
                  <label className={styles.label}>
                    Empleado <span className={styles.required}>*</span>
                  </label>
                  <select
                    name="idEmpleado"
                    value={form.idEmpleado}
                    onChange={handleChange}
                    required={!isComercial}
                    disabled={loadingOptions}
                    className={`${styles.select} ${loadingOptions ? styles.selectDisabled : ''}`}
                  >
                    <option value="">Seleccionar...</option>
                    {empleados.map((e) => (
                      <option key={e.idEmpleado} value={e.idEmpleado}>
                        {e.nombre} {e.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className={styles.field}>
                  <label className={styles.label}>
                    Cliente <span className={styles.required}>*</span>
                  </label>
                  <select
                    name="idCliente"
                    value={form.idCliente}
                    onChange={handleChange}
                    required={isComercial}
                    disabled={loadingOptions}
                    className={`${styles.select} ${loadingOptions ? styles.selectDisabled : ''}`}
                  >
                    <option value="">Seleccionar...</option>
                    {clientes?.map((c) => (
                      <option key={c.idCliente} value={c.idCliente}>
                        {c.nombreEmpresa || c.usuario?.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label}>
                  Instalación <span className={styles.required}>*</span>
                </label>
                <select
                  name="idInstalacion"
                  value={form.idInstalacion}
                  onChange={handleChange}
                  required
                  disabled={loadingOptions}
                  className={`${styles.select} ${loadingOptions ? styles.selectDisabled : ''}`}
                >
                  <option value="">Seleccionar...</option>
                  {instalaciones?.map((i) => (
                    <option key={i.idInstalacion} value={i.idInstalacion}>
                      {i.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.divider} />

            {/* Contrato */}
            <p className={styles.sectionLabel}>Contrato</p>

            <div className={styles.row}>
              {!isComercial && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    Tipo <span className={styles.required}>*</span>
                  </label>
                  <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    required={!isComercial}
                    className={styles.select}
                  >
                    <option value="">Seleccionar...</option>
                    {TIPOS_CONTRATO.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {!isComercial && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    Cargo <span className={styles.required}>*</span>
                  </label>
                  <select
                    name="cargo"
                    value={form.cargo}
                    onChange={handleChange}
                    required={!isComercial}
                    className={styles.select}
                  >
                    <option value="">Seleccionar...</option>
                    {CARGOS_DISPONIBLES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className={styles.row}>
              {!isComercial ? (
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
                    required={!isComercial}
                    min={LEY_LABORAL_CHILE.SUELDO_MINIMO_CLP}
                    step="1"
                    className={styles.input}
                  />
                </div>
              ) : (
                <div className={styles.fieldFull}>
                  <label className={styles.label}>
                    Valor del Servicio (CLP) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="montoServicio"
                    value={form.montoServicio}
                    onChange={handleChange}
                    placeholder="Ej: 500000"
                    required={isComercial}
                    min="1"
                    step="1"
                    className={styles.input}
                  />
                </div>
              )}

              {!isComercial && (
                <div className={styles.field}>
                  <label className={styles.label}>
                    Jornada Semanal (Hrs) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="jornadaHoras"
                    value={form.jornadaHoras}
                    onChange={handleChange}
                    placeholder="Ej: 42"
                    required={!isComercial}
                    min="1"
                    max={LEY_LABORAL_CHILE.MAX_HORAS_SEMANALES}
                    className={styles.input}
                  />
                </div>
              )}
            </div>

            {isComercial && (
              <div className={styles.row}>
                <div className={styles.fieldFull}>
                  <label className={styles.label}>
                    Descripción de Servicios/Productos <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    name="descripcionServicio"
                    value={form.descripcionServicio}
                    onChange={handleChange}
                    placeholder="Descripción detallada del servicio a realizar."
                    required={isComercial}
                    rows={3}
                    className={styles.input}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            )}

            {isComercial && (
              <div className={styles.row}>
                <div className={styles.fieldFull}>
                  <label className={styles.label}>
                    Condiciones de Pago <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="condicionPago"
                    value={form.condicionPago}
                    onChange={handleChange}
                    placeholder="Ej: 50% al inicio, 50% al finalizar"
                    required={isComercial}
                    className={styles.input}
                  />
                </div>
              </div>
            )}

            <div className={styles.divider} />

            {/* Datos Personales */}
            {!isComercial && (
              <>
                <p className={styles.sectionLabel}>Datos Personales del Contrato</p>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Nacionalidad <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="nacionalidad"
                      value={form.nacionalidad}
                      onChange={handleChange}
                      placeholder="Ej: Chilena"
                      required={!isComercial}
                      maxLength={100}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      Estado Civil <span className={styles.required}>*</span>
                    </label>
                    <select
                      name="estadoCivil"
                      value={form.estadoCivil}
                      onChange={handleChange}
                      required={!isComercial}
                      className={styles.select}
                    >
                      <option value="">Seleccione...</option>
                      <option value="Soltero/a">Soltero/a</option>
                      <option value="Casado/a">Casado/a</option>
                      <option value="Divorciado/a">Divorciado/a</option>
                      <option value="Viudo/a">Viudo/a</option>
                      <option value="Conviviente Civil">Conviviente Civil</option>
                    </select>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Fecha Nacimiento <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={form.fechaNacimiento}
                      onChange={handleChange}
                      required={!isComercial}
                      className={styles.input}
                    />
                  </div>
                </div>
              </>
            )}

            <div className={styles.row}>
              <div className={isComercial ? styles.fieldFull : styles.field}>
                <label className={styles.label}>
                  {isComercial ? 'Dirección Empresa' : 'Domicilio'} <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="domicilio"
                  value={form.domicilio}
                  onChange={handleChange}
                  placeholder="Ej: Pasaje Los Aromos 123, Concepción"
                  required
                  maxLength={255}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.divider} />

            {/* Período */}
            <p className={styles.sectionLabel}>Período</p>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>
                  Fecha Inicio <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={form.fechaInicio}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Fecha Fin {(isPlazoFijo || isComercial) && <span className={styles.required}>*</span>}
                </label>
                <input
                  type="date"
                  name="fechaFin"
                  value={form.fechaFin}
                  onChange={handleChange}
                  min={form.fechaInicio || undefined}
                  required={isPlazoFijo || isComercial}
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
            <button type="submit" className={styles.btnSubmit} disabled={loading || loadingOptions}>
              {loading ? <span className={styles.spinner} /> : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
              {loading ? 'Creando...' : 'Crear Contrato'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}