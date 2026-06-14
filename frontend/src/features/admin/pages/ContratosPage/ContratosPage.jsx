import React from 'react'
import { useContratosPage } from './useContratosPage'
import AlertaRiesgoLegal from '../../components/AlertaRiesgoLegal/AlertaRiesgoLegal'
import ContratosTable from '../../components/ContratosTable/ContratosTable'
import NuevoContratoModal from '../../components/NuevoContratoModal/NuevoContratoModal'
import TrasladoModal from '../../components/TrasladoModal/TrasladoModal'
import AnexoModal from '../../components/AnexoModal/AnexoModal'
import styles from './ContratosPage.module.css'

export default function ContratosPage() {
  const {
    contratosFiltrados,
    alertaTrabajador,
    loading,
    error,
    setSearch,
    showModal,
    setShowModal,
    showTrasladoModal,
    setShowTrasladoModal,
    showAnexoModal,
    setShowAnexoModal,
    selectedContratoForAnexo,
    setSelectedContratoForAnexo,
    refetch,
    handleDelete
  } = useContratosPage()

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestión de Contratos</h1>
            <p className={styles.subtitle}>Asignación y traslado de personal por proyecto</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={() => setShowTrasladoModal(true)}>
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
          onDelete={handleDelete}
          onAnexo={(contrato) => {
            setSelectedContratoForAnexo(contrato)
            setShowAnexoModal(true)
          }}
        />
      </div>

      {showModal && (
        <NuevoContratoModal
          onClose={() => setShowModal(false)}
          onSuccess={refetch}
        />
      )}

      {showTrasladoModal && (
        <TrasladoModal
          onClose={() => setShowTrasladoModal(false)}
          onSuccess={refetch}
        />
      )}

      {showAnexoModal && selectedContratoForAnexo && (
        <AnexoModal
          contrato={selectedContratoForAnexo}
          onClose={() => {
            setShowAnexoModal(false)
            setSelectedContratoForAnexo(null)
          }}
          onSuccess={refetch}
        />
      )}
    </div>
  )
}
