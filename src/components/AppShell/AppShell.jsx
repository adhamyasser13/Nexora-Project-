import { NavLink } from 'react-router-dom'
import styles from './AppShell.module.css'

const links = [
  { to: '/tracks', label: 'Tracks' },
  { to: '/discover', label: 'Discover' },
  { to: '/dashboard', label: 'Dashboard' },
]

export function AppShell({ children }) {
  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>
      <header className={styles.header}>
        <NavLink to="/" className={styles.brand} end>
          Career<span className={styles.x}>X</span>
        </NavLink>
        <nav className={styles.nav} aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ''}`.trim()
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="main" className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <p>CareerX — Know where to start. Know what&apos;s next.</p>
      </footer>
    </div>
  )
}
