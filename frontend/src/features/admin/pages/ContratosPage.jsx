import { useState, useMemo } from 'react'
import { useContratos } from '../hooks/useContratos'
import AlertaRiesgoLegal from '../components/AlertaRiesgoLegal'
import ContratosTable from '../components/ContratosTable'
import NuevoContratoModal from '../components/NuevoContratoModal'
import styles from './ContratosPage.module.css'

export default function ContratosPage() {
  const { contratos, loading, error, refetch } = useContratos()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const contratosFiltrados = useMemo(() => {
    if (!search) return contratos
    const q = search.toLowerCase()
    return contratos.filter((c) =>
      c.nombre?.toLowerCase().includes(q) ||
      c.rut?.includes(q) ||
      c.instalacion?.toLowerCase().includes(q)
    )
  }, [contratos, search])

  const alertaTrabajador = useMemo(
    () => contratos.find((c) => c.tieneAlerta) ?? null,
    [contratos]
  )

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestión de Contratos</h1>
            <p className={styles.subtitle}>Asignación y traslado de personal por proyecto</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.btnSecondary}>
              <svg className={styles.btnIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Traslado
            </button>
            <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
              <svg className={styles.btnIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Contrato
            </button>
          </div>
        </div>

        {alertaTrabajador && (
          <AlertaRiesgoLegal trabajador={`${alertaTrabajador.nombre} (${alertaTrabajador.rol})`} />
        )}

        <ContratosTable
          contratos={contratosFiltrados}
          loading={loading}
          error={error}
          onSearch={setSearch}
        />
      </div>

      {showModal && (
        <NuevoContratoModal
          onClose={() => setShowModal(false)}
          onSuccess={refetch}
        />
      )}
    </div>
  )
}