import { use } from 'react';
import { createClient } from '@/lib/supabase/server';
import EditSurveyForm from './EditSurveyForm';
import Link from 'next/link';
import styles from './page.module.css';

export default async function EditSurveyPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // 현재 로그인한 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>로그인이 필요합니다</h2>
          <p>설문을 수정하려면 로그인해주세요.</p>
          <Link href="/login" className={styles.backButton}>
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  // 설문 정보 조회
  const { data: survey, error } = await supabase
    .from('surveys')
    .select(`
      *,
      questions (
        *,
        question_options (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !survey) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>설문을 찾을 수 없습니다</h2>
          <p>삭제되었거나 존재하지 않는 설문입니다.</p>
          <Link href="/surveys" className={styles.backButton}>
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 권한 확인: 본인이 작성한 설문만 수정 가능
  if (survey.creator_id !== user.id) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>⛔ 권한이 없습니다</h2>
          <p>본인이 작성한 설문만 수정할 수 있습니다.</p>
          <Link href="/surveys" className={styles.backButton}>
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 마감 여부 확인: 마감된 설문은 수정 불가
  const today = new Date().toISOString().split('T')[0];
  const deadlineDay = survey.deadline.split('T')[0];
  const isClosed = deadlineDay < today;

  if (isClosed) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          <h2>⏰ 마감된 설문입니다</h2>
          <p>마감된 설문은 수정할 수 없습니다.</p>
          <Link href="/my/created" className={styles.backButton}>
            내 설문 목록으로
          </Link>
        </div>
      </div>
    );
  }

  // questions를 order_index 순으로 정렬
  const sortedSurvey = {
    ...survey,
    questions: survey.questions
      .sort((a, b) => a.order_index - b.order_index)
      .map(q => ({
        ...q,
        question_options: q.question_options?.sort((a, b) => a.order_index - b.order_index) || []
      }))
  };

  return <EditSurveyForm survey={sortedSurvey} />;
}
