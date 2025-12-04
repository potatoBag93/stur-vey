
import { createClient } from '@/lib/supabase/server';
import SurveyResponseForm from './SurveyResponseForm';
import Link from 'next/link';
import styles from './page.module.css';

export default async function SurveyDetailPage({ params }) {
  // Next.js 15+에서 params는 Promise이므로 use()로 unwrap
  const { id } = await params;
  const supabase = await createClient();

  // 현재 로그인한 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser();

  // 설문 정보 조회
  const { data: survey, error } = await supabase
    .from('surveys')
    .select(`
      *,
      profiles:creator_id (nickname),
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
        </div>
      </div>
    );
  }

  // 로그인한 사용자의 경우 중복 응답 체크
  let hasResponded = false;
  if (user) {
    const { data: existingResponse } = await supabase
      .from('responses')
      .select('id')
      .eq('survey_id', id)
      .eq('respondent_id', user.id)
      .maybeSingle(); // single() 대신 maybeSingle() 사용 (없어도 에러 안남)

    hasResponded = !!existingResponse;
  }

  // 이미 응답한 경우
  if (hasResponded) {
    return (
      <div className={styles.container}>
        <div className={styles.surveyHeader}>
          <div className={styles.category}>{survey.category}</div>
          <h1>{survey.title}</h1>
        </div>
        <div className={styles.alreadyResponded}>
          <h2>✅ 이미 응답한 설문입니다</h2>
          <p>이 설문에는 한 번만 응답할 수 있습니다.</p>
          <div className={styles.buttonGroup}>
            <Link href="/surveys" className={styles.backButton}>
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
      <SurveyResponseForm survey={survey} />
  );
}
