import { Link } from 'react-router-dom'
import styles from './Button.module.css'

export function Button({
  children,
  to,
  variant = 'primary',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
  ...rest
}) {
  const classNames = `${styles.btn} ${styles[variant]} ${className}`.trim()

  if (to && !disabled) {
    return (
      <Link to={to} className={classNames} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  )
}
