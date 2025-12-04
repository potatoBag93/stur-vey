'use client'

import SurveyCard from '@/components/survey/SurveyCard';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import styles from './page.module.css';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState([]);
  const [showClosed, setShowClosed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchSurveys();
  }, [user]);

  async function fetchSurveys() {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      // 설문 목록 조회
      const { data: surveysData, error: surveys_error } = await supabase
        .from('surveys')
        .select(`
          *,
          profiles:creator_id (nickname, school_name),
          responses (count)
        `)
        .eq('status', 'published')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (surveys_error) {
        throw new Error('설문 목록을 불러오는 중 오류가 발생했습니다.');
      }

      let userResponses = [];
      if (user) {
        const { data, error: responses_error } = await supabase
          .from('responses')
          .select('survey_id, created_at')
          .eq('respondent_id', user.id)
          .in('survey_id', surveysData.map(s => s.id));

        if (!responses_error) {
          userResponses = data || [];
        }
      }

      // Map으로 빠르게 매칭
      const responseMap = new Map(
        userResponses.map(r => [r.survey_id, r.created_at])
      );

      // surveys에 hasResponded, respondedAt 추가
      const surveysWithStatus = surveysData.map(s => ({
        ...s,
        hasResponded: responseMap.has(s.id),
        respondedAt: responseMap.get(s.id)
      }));

      setSurveys(surveysWithStatus);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 마감 여부 체크 함수 (날짜 문자열 기반)
  const isClosedSurvey = (deadline) => {
    const today = new Date().toISOString().split('T')[0];
    const deadlineDay = deadline.split('T')[0];
    return deadlineDay < today;
  };

  // 필터링된 설문 목록
  const filteredSurveys = showClosed 
    ? surveys 
    : surveys.filter(s => !isClosedSurvey(s.deadline));

  if (loading) {
    return <LoadingSpinner fullPage message="설문 목록을 불러오는 중..."/>;
  }

  if (error) {
    return (
      <ErrorMessage 
        title="오류가 발생했습니다"
        message={error}
        actionText="메인으로 돌아가기"
        actionHref="/"
        showRetry
        onRetry={fetchSurveys}
      />
    );
  }

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>전체 설문</h1>
        <label className={styles.filterLabel}>
          <input
            type="checkbox"
            checked={showClosed}
            onChange={(e) => setShowClosed(e.target.checked)}
          />
          <span>마감된 설문 포함</span>
        </label>
      </div>
      
      <div className={styles.surveyList}>
        {filteredSurveys.length > 0 ? (
          filteredSurveys.map(survey => (
            <SurveyCard key={survey.id} survey={survey} />
          ))
        ) : (
          <p className={styles.empty}>설문이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
//   {
//     // surveys 테이블의 모든 컬럼
//     id: "uuid-1",
//     creator_id: "uuid-creator-1",
//     title: "학교 급식 만족도 조사",
//     description: "급식에 대한 의견을 들려주세요",
//     category: "학업/진로",
//     deadline: "2025-12-31T23:59:59",
//     max_responses: null,
//     is_public: true,
//     status: "published",
//     response_count: 42,
//     created_at: "2025-11-27T10:00:00",
//     // ...
    
//     // JOIN으로 가져온 profiles 데이터
//     profiles: {
//       nickname: "홍길동",
//       school_name: "서울대학교"
//     },
    
//     // COUNT로 계산한 responses 개수
//     responses: [
//       { count: 42 }
//     ]
//   },
//   {
//     id: "uuid-2",
//     // ...
//   }
// ]