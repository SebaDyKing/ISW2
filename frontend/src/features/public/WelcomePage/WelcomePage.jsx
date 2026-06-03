import React from 'react';
import { Link } from 'react-router-dom';
import styles from './WelcomePage.module.css';

export default function WelcomePage() {
  return (
    <div className={styles.page}>
      {/* Luces de fondo difusas */}
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoBox}>
          <svg className={styles.logoIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>

        {/* Textos */}
        <h1 className={styles.title}>Bienvenido a CleanOps</h1>
        <p className={styles.subtitle}>
          El sistema inteligente de gestión de operaciones, personal y contratos. Selecciona tu portal de acceso para continuar.
        </p>

        {/* Grid de Portales */}
        <div className={styles.grid}>
          <Link to="/admin" className={`${styles.portalBtn} group`}>
            <div className={styles.btnIconBox}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className={styles.btnTitle}>Administrador</span>
          </Link>

          <Link to="/cliente" className={`${styles.portalBtn} group`}>
            <div className={styles.btnIconBox}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className={styles.btnTitle}>Cliente</span>
          </Link>

          <Link to="/empleado" className={`${styles.portalBtn} group`}>
            <div className={styles.btnIconBox}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className={styles.btnTitle}>Empleado</span>
          </Link>
        </div>

        {/* Estado del sistema */}
        <div className={styles.footer}>
          <span className={styles.pulseDot} />
          <span className={styles.dotText}>Servidor Operativo · v1.0.0</span>
        </div>
      </div>
    </div>
  );
}
