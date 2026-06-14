import React from 'react'
import { useAdminDashboard } from './useAdminDashboard'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const { data, loading } = useAdminDashboard()

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  const { metricas, alertas, historial } = data
  
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Resumen operativo del día</p>
      </div>

      <div className={styles.metricsGrid}>
        {/* Trabajadores Activos */}
        <div className={`${styles.metricCard} ${styles.borderIndigo}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Trabajadores Activos</span>
            <div className={`${styles.iconBox} ${styles.bgIndigo}`}>
              <svg className={styles.iconSm} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className={styles.cardBody}>
            <h2 className={styles.cardValue}>{metricas.personalActivo}</h2>

          </div>
        </div>

        {/* Instalaciones Totales */}
        <div className={`${styles.metricCard} ${styles.borderSlate}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Instalaciones Totales</span>
            <div className={`${styles.iconBox} ${styles.bgSlate}`}>
              <svg className={styles.iconSm} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className={styles.cardBody}>
            <h2 className={styles.cardValue}>{metricas.instalacionesTotales ?? 0}</h2>
          </div>
        </div>

        {/* Instalaciones Activas */}
        <div className={`${styles.metricCard} ${styles.borderSlate}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Instalaciones Activas</span>
            <div className={`${styles.iconBox} ${styles.bgSlate}`}>
              <svg className={styles.iconSm} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className={styles.cardBody}>
            <h2 className={styles.cardValue}>{metricas.instalacionesEnCurso}</h2>
          </div>
        </div>

        {/* Alertas Pendientes */}
        <div className={`${styles.metricCard} ${styles.borderRed}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Alertas Pendientes</span>
            <div className={`${styles.iconBox} ${styles.bgRed}`}>
              <svg className={styles.iconSm} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className={styles.cardBody}>
            <h2 className={styles.cardValue}>{alertas.length}</h2>
          </div>
        </div>

        {/* Asistencia Hoy */}
        <div className={`${styles.metricCard} ${styles.borderEmerald}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Asistencia Hoy</span>
            <div className={`${styles.iconBox} ${styles.bgEmerald}`}>
              <svg className={styles.iconSm} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className={styles.cardBody}>
            <h2 className={styles.cardValue}>{metricas.asistenciaHoy}%</h2>
          </div>
        </div>
      </div>

      <div className={styles.listsGrid}>
        {/* Alertas Operativas */}
        <div className={styles.alertListContainer}>
          <div className={styles.listHeader}>
            <div className={styles.listHeaderTitle}>
              <svg className={styles.alertIconHeader} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className={styles.listTitle}>Alertas Operativas</h3>
            </div>
            <button className={styles.viewAllBtn}>Ver todas</button>
          </div>
          
          <div className={styles.alertList}>
            {alertas.length === 0 ? (
              <p className={styles.emptyText}>No hay alertas pendientes.</p>
            ) : (
              alertas.map((alerta, idx) => (
                <div key={alerta.idAlerta || idx} className={styles.alertItem}>
                  <div className={styles.alertItemContent}>
                    <div className={styles.alertItemIconBox}>
                      <svg className={styles.alertItemIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className={styles.alertItemMessage}>{alerta.mensaje}</p>
                      <p className={styles.alertItemTime}>
                        {alerta.FechaCreacion ? new Date(alerta.FechaCreacion).toLocaleString() : 'Recientemente'}
                      </p>
                    </div>
                  </div>
                  <svg className={styles.chevronIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Historial Reciente */}
        <div className={styles.historyContainer}>
          <div className={styles.historyHeaderBox}>
            <svg className={styles.historyIconHeader} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className={styles.listTitle}>Historial Reciente</h3>
          </div>

          <div className={styles.timeline}>
            {historial.length === 0 ? (
              <p className={styles.emptyText}>No hay actividad reciente.</p>
            ) : (
              historial.map((item, idx) => (
                <div key={idx} className={styles.timelineItem}>
                  <div className={styles.timelineIconBox}>
                    <svg className={styles.iconSm} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className={styles.timelineContent}>
                    <p className={styles.timelineTitle}>{item.tipo}</p>
                    <p className={styles.timelineDesc}>{item.descripcion}</p>
                    <p className={styles.timelineTime}>{new Date(item.fecha).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
