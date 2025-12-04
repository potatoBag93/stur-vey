import SurveyCard from '@/components/survey/SurveyCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import styles from './page.module.css';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/common/Button.js'

export default async function MyCreatedSurveysPage() {

  const supabase = await createClient();
  
  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // 내가 만든 설문 조회
  const { data: surveys, error } = await supabase
    .from('surveys')
    .select(`
      *,
      profiles:creator_id (nickname),
      responses (count)
    `)
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <ErrorMessage 
        title="오류가 발생했습니다"
        message="설문 목록을 불러오는 중 문제가 발생했습니다."
        actionText="메인으로 돌아가기"
        actionHref="/"
      />
    );
  }


 return (
    <div className={styles.container}>
      <h1 className={styles.title}>내가 만든 설문</h1>
      {surveys?.length === 0 ? (
        <div className={styles.empty}>
          <p>아직 만든 설문이 없습니다.</p>
          <a href="/surveys/create" className={styles.createLink}>
            첫 설문 만들기
          </a>
        </div>
      ) : (
        <div className={styles.surveyGrid}>
          {surveys?.map(survey => (
            <SurveyCard key={survey.id} survey={survey} showEdit={true} />
          ))}
        </div>
      )}
    </div>
  );
}
