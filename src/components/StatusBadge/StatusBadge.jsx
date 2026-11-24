import styles from './StatusBadge.module.css'

const LABELS = {
  completed: 'Completed',
  'in-progress': 'In progress',
  locked: 'Locked',
  available: 'Available',
}

export function StatusBadge({ status = 'available', className = '' }) {
  return (
    <span className={`${styles.badge} ${styles[status] ?? ''} ${className}`.trim()}>
      {LABELS[status] ?? status}
    </span>
  )
}
