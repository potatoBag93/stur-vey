import styles from './Button.module.css';

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  type = 'button',
  disabled = false,
  fullWidth = false
}) {
  const className = `
    ${styles.button} 
    ${styles[variant]} 
    ${styles[size]}
    ${fullWidth ? styles.fullWidth : ''}
  `.trim();

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
