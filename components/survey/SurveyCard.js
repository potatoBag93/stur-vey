import Link from 'next/link';
import Button from '@/components/common/Button';
import styles from './SurveyCard.module.css';

export default function SurveyCard({ 
  survey, 
  showEdit = false
}) {
  const {
    id,
    title,
    description,
    category,
    deadline,
    max_responses,
    hasResponded,
    respondedAt,
    profiles,
    responses
  } = survey;

  // Supabase 데이터 형식 지원
  const responseCount = responses?.[0]?.count || 0;
  const maxResponses = max_responses;
  const creatorNickname = profiles?.nickname || '익명';


  // D-day 계산 (날짜 문자열 기반)
  const getDday = (deadline) => {
    if (!deadline) return '마감';
    
    // 오늘 날짜 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // deadline 날짜 (YYYY-MM-DD)
    const deadlineDay = deadline.split('T')[0];
    
    if (deadlineDay < today) return '마감';
    if (deadlineDay === today) return 'D-Day';
    
    // 날짜 차이 계산
    const diff = Math.ceil((new Date(deadlineDay) - new Date(today)) / (1000 * 60 * 60 * 24));
    return `D-${diff}`;
  };

  const dday = getDday(deadline);
  const isClosed = dday === '마감';

  return (
    <div className={`${styles.card} ${isClosed ? styles.closed : ''}`}>
      <div className={styles.header}>
        <span className={styles.category}>{category}</span>
        {hasResponded && <span className={styles.badge}>응답완료</span>}
      </div>

      <Link href={`/surveys/${id}`} className={styles.titleLink}>
        <h3 className={styles.title}>{title}</h3>
      </Link>

      <p className={styles.description}>{description}</p>

      <div className={styles.footer}>
        <div className={styles.info}>
          <span className={styles.creator}>👤 {creatorNickname}</span>
          <span className={styles.deadline}>📅 {dday}</span>
          <span className={styles.responses}>
            💬 {responseCount}{maxResponses ? `/${maxResponses}` : ''}명
          </span>
        </div>

        {/* showEdit이 true이고 응답이 0개일 때만 수정/결과 버튼 표시 */}
        {showEdit ? (
          <div className={styles.editButtons}>
            {responseCount === 0 ? (
              <Link href={`/surveys/${id}/edit`}>
                <Button size="small">수정</Button>
              </Link>
            ) : (
              <Link href={`/surveys/${id}/results`}>
                <Button size="small" variant="secondary">결과</Button>
              </Link>
            )}
          </div>
        ) : (
          hasResponded && isClosed ? (
            <Link 
              href={`/surveys/${id}`} 
              className={`${styles.button} ${styles.viewResultButton}`}
            >
              결과보기 →
            </Link>
          ) : hasResponded ? (
            <span className={`${styles.button} ${styles.disabledButton}`}>
              결과대기중
            </span>
          ) : isClosed ? (
            <span className={`${styles.button} ${styles.closedButton}`}>
              마감됨
            </span>
          ) : (
            <Link href={`/surveys/${id}`} className={styles.button}>
              참여하기 →
            </Link>
          )
        )}
      </div>

      {/* respondedAt이 있으면 응답일 표시 */}
      {respondedAt && (
        <div className={styles.respondedInfo}>
          응답일: {new Date(respondedAt).toLocaleDateString('ko-KR')}
        </div>
      )}
    </div>
  );
}
