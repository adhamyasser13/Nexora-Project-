import styles from './Card.module.css'

export function Card({ children, className = '', as: Tag = 'article', ...rest }) {
  return (
    <Tag className={`${styles.card} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  )
}
