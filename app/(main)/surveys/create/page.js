'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import styles from './page.module.css';

export default function CreateSurveyPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('학업/진로');
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState([
    { id: 1, type: 'single_choice', text: '', options: ['', ''] }
  ]);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !user) {
      // 리다이렉트 없이 UI로 표시
    }
  }, [user, authLoading]);

  // 로딩 중
  if (authLoading) {
    return <LoadingSpinner fullPage message="로그인 상태 확인 중..."/>;
  }

  // 로그인 필요
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.authRequired}>
          <div className={styles.authIcon}>🔒</div>
          <h2>로그인이 필요합니다</h2>
          <p>설문을 만들기 위해서는 로그인이 필요합니다.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
            <Button onClick={() => router.push('/login')} fullWidth>
              로그인하기
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => router.push('/signup')}
              fullWidth
            >
              회원가입하기
            </Button>
          </div>
        </div>
      </div>
    );
  }
  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      type: 'single_choice',
      text: '',
      options: ['', '']
    }]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const addOption = (questionId) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, options: [...q.options, ''] } : q
    ));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => {

      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return; // 이미 제출 중이면 무시
    
    setLoading(true);

    try {
      // 유효성 검사: 선택지 중복 및 빈 값 체크
      for (const question of questions) {
        if ((question.type === 'single_choice' || question.type === 'multiple_choice')) {
          // 빈 선택지 제거
          const validOptions = question.options.filter(opt => opt.trim() !== '');
          
          if (validOptions.length < 2) {
            alert(`"${question.text || '질문'}"에 최소 2개의 선택지가 필요합니다.`);
            setLoading(false);
            return;
          }

          // 중복 검사
          const uniqueOptions = new Set(validOptions.map(opt => opt.trim().toLowerCase()));
          if (uniqueOptions.size !== validOptions.length) {
            alert(`"${question.text || '질문'}"에 중복된 선택지가 있습니다.`);
            setLoading(false);
            return;
          }
        }
      }

      const supabase = createClient();

      // 1. 설문 생성
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .insert({
          title,
          description,
          category,
          deadline: deadline,
          creator_id: user.id,
          is_public: true,
          status: 'published',
        })
        .select()
        .single();

      if (surveyError) {
        alert('설문 생성 실패: ' + surveyError.message);
        setLoading(false);
        return;
      }

      // 2. 질문들 생성
      for (const [index, question] of questions.entries()) {
        const { data: q, error: qError } = await supabase
          .from('questions')
          .insert({
            survey_id: survey.id,
            question_text: question.text,
            question_type: question.type,
            order_index: index + 1,
            is_required: true

          })
          .select()
          .single();

        if (qError) {
          alert('질문 생성 실패: ' + qError.message);
          setLoading(false);
          return;
        }

        // 3. 선택지 생성 (객관식인 경우)
        if (question.type === 'multiple_choice' || question.type === 'single_choice') {
          // 빈 선택지 제거하고 저장
          const validOptions = question.options
            .filter(opt => opt.trim() !== '')
            .map((opt, i) => ({
              question_id: q.id,
              option_text: opt.trim(),
              order_index: i + 1,
            }));

          if (validOptions.length > 0) {
            const { error: optError } = await supabase
              .from('question_options')
              .insert(validOptions);

            if (optError) {
              alert('선택지 생성 실패: ' + optError.message);
              setLoading(false);
              return;
            }
          }
        }
      }

      alert('설문이 생성되었습니다!');
      router.push(`/surveys/${survey.id}`);
    } catch (error) {
      console.error('설문 생성 오류:', error);
      alert('설문 생성 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>새 설문 만들기</h1>
          <p>학생들에게 필요한 설문을 만들어보세요</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <fieldset disabled={loading} style={{ border: 'none', padding: 0, margin: 0 }}>
          <div className={styles.basicInfo}>
            <div className={styles.formGroup}>
              <label>설문 제목 *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="설문 제목을 입력하세요"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>설문 설명</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="설문에 대한 간단한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>카테고리 *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="학업/진로">학업/진로</option>
                  <option value="대학생활">대학생활</option>
                  <option value="취미/관심사">취미/관심사</option>
                  <option value="소비/구매">소비/구매</option>
                  <option value="사회/이슈">사회/이슈</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>마감일 *</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.questionsSection}>
            <div className={styles.sectionHeader}>
              <h2>질문 작성</h2>
              <Button onClick={addQuestion} size="small">+ 질문 추가</Button>
            </div>

            {questions.map((question, qIndex) => (
              <div key={question.id} className={styles.questionCard}>
                <div className={styles.questionHeader}>
                  <span className={styles.questionNumber}>질문 {qIndex + 1}</span>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className={styles.removeBtn}
                    >
                      삭제
                    </button>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>질문 유형</label>
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                  >
                    <option value="single_choice">객관식 (단일선택)</option>
                    <option value="multiple_choice">객관식 (복수선택)</option>
                    <option value="short_text">주관식 (단답형)</option>
                    <option value="long_text">주관식 (서술형)</option>
                    <option value="scale">척도형</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>질문 내용 *</label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                    placeholder="질문을 입력하세요"
                    required
                  />
                </div>

                {(question.type === 'multiple_choice' || question.type === 'single_choice') && (
                  <div className={styles.optionsSection}>
                    <label>선택지</label>
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className={styles.optionRow}>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(question.id, oIndex, e.target.value)}
                          placeholder={`선택지 ${oIndex + 1}`}
                        />
                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(question.id, oIndex)}
                            className={styles.removeOptionBtn}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <Button
                      onClick={() => addOption(question.id)}
                      variant="secondary"
                      size="small"
                    >
                      + 선택지 추가
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className={styles.submitSection}>
            <Button type="submit" size="large" disabled={loading}>
              {loading ? '생성 중...' : '설문 생성하기'}
            </Button>
          </div>
          </fieldset>
        </form>
      </div>
  );
}
