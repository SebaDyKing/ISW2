import React from 'react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { NAV_ITEMS } from './Sidebar.constants';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>

      {/* Marca */}
      <div className={styles.brandContainer}>
        <div className={styles.brandFlex}>
          <div className={styles.brandLogoBox}>
            <svg className={styles.brandLogoIcon} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" clipRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" />
            </svg>
          </div>
          <div>
            <p className={styles.brandName}>CleanOps</p>
            <p className={styles.brandTag}>
              Gestión Pro
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                styles.navLink,
                'group',
                isActive && styles.navLinkActive
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className={clsx(
                  styles.iconSpan,
                  isActive && styles.iconSpanActive
                )}>
                  {item.icon}
                </span>
                <span className={styles.label}>{item.label}</span>
                {item.badge && (
                  <span className={styles.badge}>
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Usuario */}
      <div className={styles.userSection}>
        <div className={styles.userFlex}>
          <div className={styles.avatar}>
            AM
          </div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>Admin RRHH</p>
            <p className={styles.userRole}>Operaciones</p>
          </div>
          <button className={styles.actionBtn}>
            <svg className={styles.btnIcon} fill="currentColor" viewBox="0 0 20 20">
              <circle cx="10" cy="3" r="1.5" />
              <circle cx="10" cy="10" r="1.5" />
              <circle cx="10" cy="17" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

    </aside>
  );
}
