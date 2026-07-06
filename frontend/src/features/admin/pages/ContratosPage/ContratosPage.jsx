import React from 'react'
import { useContratosPage } from './useContratosPage'
import AlertaRiesgoLegal from '../../components/AlertaRiesgoLegal/AlertaRiesgoLegal'
import ContratosTable from '../../components/ContratosTable/ContratosTable'
import NuevoContratoModal from '../../components/NuevoContratoModal/NuevoContratoModal'
import TrasladoModal from '../../components/TrasladoModal/TrasladoModal'
import AnexoModal from '../../components/AnexoModal/AnexoModal'
import FiniquitoModal from '../../components/FiniquitoModal/FiniquitoModal'
import IndefinidoModal from '../../components/IndefinidoModal/IndefinidoModal'
import AdministrarInstalacionesModal from '../../components/AdministrarInstalacionesModal/AdministrarInstalacionesModal'
import DocumentosModal from '../../components/DocumentosModal/DocumentosModal'
import styles from './ContratosPage.module.css'

export default function ContratosPage() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  const {
    contratos,
    loading,
    error,
    search,
    setSearch,
    showModal,
    setShowModal,
    showTrasladoModal,
    setShowTrasladoModal,
    showAnexoModal,
    setShowAnexoModal,
    selectedContratoForAnexo,
    setSelectedContratoForAnexo,
    showFiniquitoModal,
    setShowFiniquitoModal,
    selectedContratoForFiniquito,
    setSelectedContratoForFiniquito,
    isFiniquitando,
    handleFiniquitar,
    showIndefinidoModal,
    setShowIndefinidoModal,
    selectedContratoForIndefinido,
    setSelectedContratoForIndefinido,
    isAscendiendo,
    handlePasoAIndefinido,
    showAdministrarInstalacionesModal,
    setShowAdministrarInstalacionesModal,
    selectedContratoForInstalaciones,
    setSelectedContratoForInstalaciones,
    alertaTrabajador,
    refetch,
    showDocumentosModal,
    setShowDocumentosModal,
    selectedContratoForDocumentos,
    handleOpenDocumentos,
  } = useContratosPage()

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestión de Contratos</h1>
            <p className={styles.subtitle}>Asignación y traslado de personal por proyecto</p>
          </div>
          {usuario.rol === 'administrador' && (
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
          )}
        </div>

        {alertaTrabajador && (
          <AlertaRiesgoLegal trabajador={`${alertaTrabajador.nombre} (${alertaTrabajador.rol})`} />
        )}

        <ContratosTable
          contratos={contratos}
          loading={loading}
          error={error}
          onSearch={setSearch}
          onAnexo={(contrato) => {
            setSelectedContratoForAnexo(contrato)
            setShowAnexoModal(true)
          }}
          onFiniquitar={(contrato) => {
            setSelectedContratoForFiniquito(contrato)
            setShowFiniquitoModal(true)
          }}
          onIndefinido={(contrato) => {
            setSelectedContratoForIndefinido(contrato)
            setShowIndefinidoModal(true)
          }}
          onAdministrarInstalaciones={(contrato) => {
            setSelectedContratoForInstalaciones(contrato)
            setShowAdministrarInstalacionesModal(true)
          }}
          onVerDocumentos={handleOpenDocumentos}
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
      {showFiniquitoModal && selectedContratoForFiniquito && (
        <FiniquitoModal
          contrato={selectedContratoForFiniquito}
          onClose={() => {
            setShowFiniquitoModal(false)
            setSelectedContratoForFiniquito(null)
          }}
          onConfirm={handleFiniquitar}
          isSubmitting={isFiniquitando}
        />
      )}

      {showIndefinidoModal && selectedContratoForIndefinido && (
        <IndefinidoModal
          contrato={selectedContratoForIndefinido}
          onClose={() => {
            setShowIndefinidoModal(false)
            setSelectedContratoForIndefinido(null)
          }}
          onConfirm={handlePasoAIndefinido}
          isSubmitting={isAscendiendo}
        />
      )}

      {showAdministrarInstalacionesModal && selectedContratoForInstalaciones && (
        <AdministrarInstalacionesModal
          contrato={selectedContratoForInstalaciones}
          onClose={() => {
            setShowAdministrarInstalacionesModal(false)
            setSelectedContratoForInstalaciones(null)
          }}
          onRefresh={refetch}
        />
      )}

      {showDocumentosModal && (
        <DocumentosModal
          isOpen={showDocumentosModal}
          onClose={() => setShowDocumentosModal(false)}
          contrato={selectedContratoForDocumentos}
        />
      )}
    </div>
  )
}
