import styles from './StateMessage.module.css'

export function StateMessage({ title, body, action }) {
  return (
    <div className={styles.wrap} role="status">
      <h2 className={styles.title}>{title}</h2>
      {body ? <p className={styles.body}>{body}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  )
}
