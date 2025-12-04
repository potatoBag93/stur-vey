import styles from './ErrorMessage.module.css';
import Link from 'next/link';

export default function ErrorMessage({ 
  title = "오류가 발생했습니다",
  message = "요청을 처리하는 중 문제가 발생했습니다.",
  actionText = "돌아가기",
  actionHref = "/",
  showRetry = false,
  onRetry
}) {
  return (
    <div className={styles.container}>
      <div className={styles.errorBox}>
        <div className={styles.icon}>⚠️</div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        
        <div className={styles.actions}>
          {showRetry && onRetry && (
            <button onClick={onRetry} className={styles.retryButton}>
              🔄 다시 시도
            </button>
          )}
          <Link href={actionHref} className={styles.actionButton}>
            {actionText}
          </Link>
        </div>
      </div>
    </div>
  );
}
