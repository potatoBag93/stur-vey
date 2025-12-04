import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ 
  size = 'medium', 
  message = '로딩 중...',
  fullPage = false 
}) {
  const sizeClass = styles[size] || styles.medium;
  
  if (fullPage) {
    return (
      <div className={styles.fullPageContainer}>
        <div className={styles.spinnerBox}>
          <div className={`${styles.spinner} ${sizeClass}`}></div>
          {message && <p className={styles.message}>{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${sizeClass}`}></div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
