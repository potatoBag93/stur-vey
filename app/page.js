import { createClient } from '@/lib/supabase/server';
import MainLayout from '@/components/layout/MainLayout';
import SurveyCard from '@/components/survey/SurveyCard';
import Link from 'next/link';
import styles from './page.module.css';

export default async function HomePage() {
  const supabase = await createClient();

  // 사용자 확인 (선택적)
  const { data: { user } } = await supabase.auth.getUser();

  // 전체 통계
  const { count: totalSurveys } = await supabase
    .from('surveys')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  const { count: totalResponses } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true });

  // 인기 설문 Top 5 (응답 수 많은 순)
  const { data: popularSurveys } = await supabase
    .from('surveys')
    .select(`
      *,
      profiles:creator_id (nickname),
      responses (count)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10);

  // 응답 수로 정렬
  const sortedPopular = (popularSurveys || [])
    .sort((a, b) => (b.responses?.[0]?.count || 0) - (a.responses?.[0]?.count || 0))
    .slice(0, 5);

  // 마감 임박 설문 (3개) - 오늘 날짜 이후인 것만
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const { data: urgentSurveys } = await supabase
    .from('surveys')
    .select(`
      *,
      profiles:creator_id (nickname),
      responses (count)
    `)
    .eq('status', 'published')
    .gte('deadline', today)
    .order('deadline', { ascending: true })
    .limit(3);

  // 최신 설문 (3개)
  const { data: latestSurveys } = await supabase
    .from('surveys')
    .select(`
      *,
      profiles:creator_id (nickname),
      responses (count)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(3);

  // 사용자 응답 여부 확인
  let responseMap = new Map();
  if (user) {
    const allSurveyIds = [
      ...sortedPopular.map(s => s.id),
      ...(urgentSurveys || []).map(s => s.id),
      ...(latestSurveys || []).map(s => s.id)
    ];

    if (allSurveyIds.length > 0) {
      const { data: userResponses } = await supabase
        .from('responses')
        .select('survey_id, created_at')
        .eq('respondent_id', user.id)
        .in('survey_id', allSurveyIds);

      responseMap = new Map(
        userResponses?.map(r => [r.survey_id, r.created_at]) || []
      );
    }
  }

  // 응답 여부 추가하는 함수
  const addResponseStatus = (surveys) => 
    surveys?.map(s => ({
      ...s,
      hasResponded: responseMap.has(s.id),
      respondedAt: responseMap.get(s.id)
    })) || [];

  const popularWithStatus = addResponseStatus(sortedPopular);
  const urgentWithStatus = addResponseStatus(urgentSurveys);
  const latestWithStatus = addResponseStatus(latestSurveys);

  return (
    <MainLayout>
      <div className={styles.container}>
        {/* 히어로 섹션 */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>학생 설문조사 플랫폼</h1>
          <p className={styles.heroDescription}>
            다양한 설문에 참여하고, 나만의 설문을 만들어보세요
          </p>
          <div className={styles.heroActions}>
            <Link href="/surveys/create" className={styles.primaryButton}>
              설문 만들기
            </Link>
            <Link href="/surveys" className={styles.secondaryButton}>
              전체 설문 보기
            </Link>
          </div>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalSurveys || 0}</span>
              <span className={styles.statLabel}>진행중인 설문</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{totalResponses || 0}</span>
              <span className={styles.statLabel}>총 응답 수</span>
            </div>
          </div>
        </section>

        {/* 인기 설문 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🔥 인기 설문</h2>
            <Link href="/surveys?sort=popular" className={styles.moreLink}>
              더보기 →
            </Link>
          </div>
          {popularWithStatus.length > 0 ? (
            <div className={styles.surveyGrid}>
              {popularWithStatus.map(survey => (
                <SurveyCard 
                  key={survey.id} 
                  survey={survey}
                  hasResponded={survey.hasResponded}
                  respondedAt={survey.respondedAt}
                />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>아직 설문이 없습니다.</p>
          )}
        </section>

        {/* 마감 임박 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>⏰ 마감 임박</h2>
            <Link href="/surveys?sort=deadline" className={styles.moreLink}>
              더보기 →
            </Link>
          </div>
          {urgentWithStatus.length > 0 ? (
            <div className={styles.surveyGrid}>
              {urgentWithStatus.map(survey => (
                <SurveyCard 
                  key={survey.id} 
                  survey={survey}
                  hasResponded={survey.hasResponded}
                  respondedAt={survey.respondedAt}
                />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>마감 임박 설문이 없습니다.</p>
          )}
        </section>

        {/* 최신 설문 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>✨ 최신 설문</h2>
            <Link href="/surveys?sort=latest" className={styles.moreLink}>
              더보기 →
            </Link>
          </div>
          {latestWithStatus.length > 0 ? (
            <div className={styles.surveyGrid}>
              {latestWithStatus.map(survey => (
                <SurveyCard 
                  key={survey.id} 
                  survey={survey}
                  hasResponded={survey.hasResponded}
                  respondedAt={survey.respondedAt}
                />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>최신 설문이 없습니다.</p>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
