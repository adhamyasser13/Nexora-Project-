import styles from './ProgressBar.module.css'

export function ProgressBar({ value = 0, label, className = '' }) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className={`${styles.wrap} ${className}`.trim()}>
      {label ? (
        <div className={styles.meta}>
          <span>{label}</span>
          <span className={styles.value}>{clamped}%</span>
        </div>
      ) : null}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div className={styles.fill} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
