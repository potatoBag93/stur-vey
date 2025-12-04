import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SurveyCard from '@/components/survey/SurveyCard';
import ErrorMessage from '@/components/common/ErrorMessage';
import styles from './page.module.css';

export default async function MyRespondedSurveysPage() {
  const supabase = await createClient();
  
  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // 내가 응답한 설문 조회
  const { data: responses, error } = await supabase
    .from('responses')
    .select(`
      *,
      surveys (
        *,
        profiles:creator_id (nickname)
      )
    `)
    .eq('respondent_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <ErrorMessage 
        title="오류가 발생했습니다"
        message="응답한 설문 목록을 불러오는 중 문제가 발생했습니다."
        actionText="메인으로 돌아가기"
        actionHref="/"
      />
    );
  }

  // 설문 정보만 추출
  const surveys = responses?.map(r => ({
    ...r.surveys,
    responded_at: r.created_at,
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>내가 응답한 설문</h1>
      {surveys?.length === 0 ? (
        <div className={styles.empty}>
          <p>아직 응답한 설문이 없습니다.</p>
          <a href="/surveys" className={styles.browseLink}>
            설문 둘러보기
          </a>
        </div>
      ) : (
        <div className={styles.surveyGrid}>
          {surveys?.map(survey => (
            <SurveyCard 
              key={survey.id} 
              survey={survey} 
              showRespondedDate={true}
              respondedAt={survey.responded_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}