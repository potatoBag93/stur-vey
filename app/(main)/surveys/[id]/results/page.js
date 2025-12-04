import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

export default async function SurveyResultsPage({ params }) {
  const supabase = await createClient();
  const surveyId = (await params).id;

  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser();

  // 설문 정보 조회
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .select(`
      *,
      profiles:creator_id (nickname),
      questions (
        id,
        question_text,
        question_type,
        order_index,
        question_options (
          id,
          option_text,
          order_index
        )
      )
    `)
    .eq('id', surveyId)
    .single();

  if (surveyError || !survey) {
    return <div className={styles.error}>설문을 찾을 수 없습니다</div>;
  }

  // 결과 조회 권한 확인
  const isAuthor = user?.id === survey.creator_id;
  
  // 사용자가 응답했는지 확인
  const { data: userResponse } = user ? await supabase
    .from('responses')
    .select('id')
    .eq('survey_id', surveyId)
    .eq('respondent_id', user.id)
    .single() : { data: null };

  const hasResponded = !!userResponse;

  // 권한 체크: 작성자이거나, result_visibility가 'public'이거나, 응답자
  const canViewResults = isAuthor || 
                         survey.result_visibility === 'public' || 
                         (survey.result_visibility === 'respondents' && hasResponded);

  if (!canViewResults) {
    return (
      <div className={styles.accessDenied}>
        <h2>결과 열람 권한이 없습니다</h2>
        <p>
          {survey.result_visibility === 'respondents' 
            ? '설문에 응답한 후 결과를 확인할 수 있습니다.' 
            : '설문 작성자만 결과를 확인할 수 있습니다.'}
        </p>
      </div>
    );
  }

  // 총 응답 수
  const { count: totalResponses } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .eq('survey_id', surveyId);

  // 질문 순서대로 정렬
  const sortedQuestions = [...survey.questions].sort((a, b) => a.question_order - b.question_order);

  // 각 질문별 통계
  const questionsWithStats = await Promise.all(
    sortedQuestions.map(async (question) => {
      // 선택지 순서대로 정렬
      const sortedOptions = question.question_options 
        ? [...question.question_options].sort((a, b) => a.option_order - b.option_order)
        : [];

      if (question.question_type === 'single_choice') {
        // 객관식: 선택지별 개수 집계
        const stats = await Promise.all(
          sortedOptions.map(async (option) => {
            const { count } = await supabase
              .from('answers')
              .select('*', { count: 'exact', head: true })
              .eq('question_id', question.id)
              .eq('selected_option_id', option.id);

            return {
              option_text: option.option_text,
              count: count || 0,
              percentage: totalResponses > 0 ? ((count || 0) / totalResponses * 100).toFixed(1) : 0,
            };
          })
        );

        return { 
          ...question, 
          question_options: sortedOptions,
          stats 
        };
      }else if(question.question_type === 'multiple_choice'){
        // 객관식 복수선택: 배열 필드에서 선택지별 개수 집계
        const stats = await Promise.all(
          sortedOptions.map(async (option) => {
            // selected_option_ids 배열에 option.id가 포함된 응답 개수
            const { count } = await supabase
              .from('answers')
              .select('*', { count: 'exact', head: true })
              .eq('question_id', question.id)
              .contains('selected_option_ids', [option.id]); // 배열에 포함 여부 체크

            return {
              option_text: option.option_text,
              count: count || 0,
              percentage: totalResponses > 0 ? ((count || 0) / totalResponses * 100).toFixed(1) : 0,
            };
          })
        );

        return { 
          ...question, 
          question_options: sortedOptions,
          stats 
        };
      } 
      else if (question.question_type === 'short_text'||question.question_type === 'long_text') {
        // 주관식: 모든 답변 가져오기
        const { data: textAnswers } = await supabase
          .from('answers')
          .select('text_answer, created_at')
          .eq('question_id', question.id)
          .not('text_answer', 'is', null)
          .order('created_at', { ascending: false });

        return {
          ...question,
          textResponses: textAnswers || [],
        };
      }

      return question;
    })
  );

  // 마감 여부 확인 (날짜 문자열 기반)
  const today = new Date().toISOString().split('T')[0];
  const deadlineDay = survey.deadline.split('T')[0];
  const isClosed = deadlineDay < today;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{survey.title}</h1>
          <span className={styles.category}>{survey.category}</span>
        </div>
        <p className={styles.description}>{survey.description}</p>
        <div className={styles.meta}>
          <span>👤 {survey.profiles?.nickname || '익명'}</span>
          <span>📅 마감: {new Date(survey.deadline).toLocaleDateString('ko-KR')}</span>
          <span className={styles.status}>
            {isClosed ? '🔒 마감됨' : '✅ 진행중'}
          </span>
        </div>
      </div>

      <div className={styles.statsBox}>
        <h2>📊 응답 현황</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{totalResponses || 0}</span>
            <span className={styles.statLabel}>총 응답 수</span>
          </div>
          {survey.max_responses && (
            <div className={styles.statItem}>
              <span className={styles.statNumber}>
                {survey.max_responses - (totalResponses || 0)}
              </span>
              <span className={styles.statLabel}>남은 인원</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.results}>
        <h2>질문별 결과</h2>
        
        {questionsWithStats.map((question, index) => (
          <div key={question.id} className={styles.questionResult}>
            <h3 className={styles.questionTitle}>
              Q{index + 1}. {question.question_text}
              <span className={styles.questionType}>
                {question.question_type === 'single_choice' ? '객관식(단일)' : 
                 question.question_type === 'multiple_choice' ? '객관식(복수)' : 
                 '주관식'}
              </span>
            </h3>

            {(question.question_type === 'multiple_choice' || question.question_type === 'single_choice') && (
              <div className={styles.chartContainer}>
                {question.stats?.map((stat, i) => (
                  <div key={i} className={styles.chartBar}>
                    <div className={styles.barLabel}>
                      <span>{stat.option_text}</span>
                      <span className={styles.barStats}>
                        {stat.count}명 ({stat.percentage}%)
                      </span>
                    </div>
                    <div className={styles.barBackground}>
                      <div 
                        className={styles.barFill}
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(question.question_type === 'short_text'||question.question_type==='long_text')  && (
              <div className={styles.textResponses}>
                {question.textResponses?.length > 0 ? (
                  <ul className={styles.responseList}>
                    {question.textResponses.map((response, i) => (
                      <li key={i} className={styles.responseItem}>
                        <span className={styles.responseText}>{response.text_answer}</span>
                        <span className={styles.responseDate}>
                          {new Date(response.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.noResponses}>아직 응답이 없습니다</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {isAuthor && (
        <div className={styles.authorActions}>
          <a href={`/surveys/${surveyId}/edit`} className={styles.editButton}>
            설문 수정
          </a>
        </div>
      )}
    </div>
  );
}
