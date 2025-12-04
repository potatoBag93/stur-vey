'use client'

import Button from '@/components/common/Button';
import styles from './page.module.css';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';


export default function SurveyResponseForm({ survey }) {
  const [responses, setResponses] = useState({});
  const { user } = useAuth();

  const handleMultipleChoice = (questionId, value) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const handleCheckbox = (questionId, value) => {
    const current = responses[questionId] || [];
    if (current.includes(value)) {
      setResponses({
        ...responses,
        [questionId]: current.filter(v => v !== value)
      });
    } else {
      setResponses({
        ...responses,
        [questionId]: [...current, value]
      });
    }
  };

  const handleTextInput = (questionId, value) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 질문 검증
    const unansweredRequired = survey.questions.filter(q => {
      if (!q.is_required) return false;
      
      const answer = responses[q.id];
      
      // 답변이 없는 경우
      if (!answer) return true;
      
      // 배열인 경우 (multiple_choice) 길이 체크
      if (Array.isArray(answer) && answer.length === 0) return true;
      
      // 문자열인 경우 (text) 공백 체크
      if (typeof answer === 'string' && answer.trim() === '') return true;
      
      return false;
    });

    if (unansweredRequired.length > 0) {
      const questionNumbers = unansweredRequired
        .map(q => survey.questions.indexOf(q) + 1)
        .join(', ');
      alert(`필수 질문에 답변해주세요: Q${questionNumbers}`);
      return;
    }

    const supabase = createClient();

    try {
      // 1. 먼저 답변 데이터를 검증하고 준비
      const answerData = Object.entries(responses).map(([questionId, answer]) => {
        const question = survey.questions.find(q => q.id === questionId);
        
        if (!question) {
          throw new Error(`질문을 찾을 수 없습니다 (ID: ${questionId})`);
        }

        if (question.question_type === 'single_choice') {
          const option = question.question_options.find(opt => opt.option_text === answer);
          if (!option) {
            throw new Error(`선택지를 찾을 수 없습니다: ${answer}`);
          }
          return {
            questionId,
            type: 'single_choice',
            selected_option_id: option.id,
          };
        } else if (question.question_type === 'multiple_choice') {
          const optionIds = answer.map(optText => {
            const option = question.question_options.find(opt => opt.option_text === optText);
            if (!option) {
              throw new Error(`선택지를 찾을 수 없습니다: ${optText}`);
            }
            return option.id;
          });
          return {
            questionId,
            type: 'multiple_choice',
            selected_option_ids: optionIds,
          };
        } else {
          return {
            questionId,
            type: question.question_type,
            text_answer: answer,
          };
        }
      });

      // 2. 응답 레코드 생성
      const { data: response, error: responseError } = await supabase
        .from('responses')
        .insert({
          survey_id: survey.id,
          respondent_id: user.id,
        })
        .select()
        .single();

      if (responseError) {
        throw new Error('응답 제출 실패: ' + responseError.message);
      }

      // 3. 답변 레코드 생성 (검증된 데이터 사용)
      const answers = answerData.map(data => ({
        response_id: response.id,
        question_id: data.questionId,
        ...(data.type === 'single_choice' && { selected_option_id: data.selected_option_id }),
        ...(data.type === 'multiple_choice' && { selected_option_ids: data.selected_option_ids }),
        ...(data.type === 'short_text' || data.type === 'long_text' ? { text_answer: data.text_answer } : {}),
      }));

      const { error: answersError } = await supabase
        .from('answers')
        .insert(answers);

      if (answersError) {
        // 답변 저장 실패 시 응답 레코드 삭제 (롤백)
        await supabase
          .from('responses')
          .delete()
          .eq('id', response.id);
        
        throw new Error('답변 저장 실패: ' + answersError.message);
      }

      alert('응답이 제출되었습니다!');
      window.location.href = '/surveys';

    } catch (error) {
      console.error('응답 제출 에러:', error);
      alert(error.message || '응답 제출 중 오류가 발생했습니다.');
    }
  };

  const getDday = (endDate) => {
    // 오늘 날짜 (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // deadline 날짜 (YYYY-MM-DD)
    const deadlineDay = endDate.split('T')[0];
    
    // 날짜 차이 계산
    const diff = Math.ceil((new Date(deadlineDay) - new Date(today)) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const dday = getDday(survey.deadline);

  // 디버깅: 데이터 구조 확인
  console.log('Survey data:', survey);
  console.log('Questions:', survey.questions);
  if (survey.questions && survey.questions.length > 0) {
    console.log('First question:', survey.questions[0]);
    console.log('Question options:', survey.questions[0].question_options);
  }

  return (
      <div className={styles.container}>
        <div className={styles.surveyHeader}>
          <div className={styles.category}>{survey.category}</div>
          <h1>{survey.title}</h1>
          <p className={styles.description}>{survey.description}</p>
          
          <div className={styles.meta}>
            <span>작성자: {survey.profiles?.nickname || '익명'}</span>
            <span>•</span>
            <span>응답: {survey.response_count || 0}명</span>
            <span>•</span>
            <span className={dday > 0 ? styles.active : styles.closed}>
              {dday > 0 ? `D-${dday}` : '마감'}
            </span>
          </div>
        </div>

        {!user ? (
          // 로그인하지 않은 경우
          <div className={styles.loginRequired}>
            <div className={styles.loginBox}>
              <div className={styles.lockIcon}>🔒</div>
              <h2>로그인이 필요합니다</h2>
              <p>설문에 응답하려면 로그인해주세요.</p>
              <div className={styles.loginButtons}>
                <Button onClick={() => window.location.href = '/login'}>
                  로그인하기
                </Button>
                <Button variant="secondary" onClick={() => window.location.href = '/signup'}>
                  회원가입하기
                </Button>
              </div>
            </div>
          </div>
        ) : dday > 0 ? (
          <form className={styles.responseForm} onSubmit={handleSubmit}>
            {survey.questions.map((question, index) => (
              <div key={question.id} className={styles.questionBox}>
                <div className={styles.questionTitle}>
                  <span className={styles.qNumber}>Q{index + 1}</span>
                  {question.question_text}
                  {question.is_required && <span className={styles.required}>*</span>}
                </div>

                {question.question_type === 'single_choice' && (
                  <div className={styles.optionsList}>
                    {question.question_options?.map((option, oIndex) => (
                      <label key={option.id} className={styles.optionLabel}>
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.option_text}
                          checked={responses[question.id] === option.option_text}
                          onChange={(e) => handleMultipleChoice(question.id, e.target.value)}
                        />
                        <span>{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.question_type === 'multiple_choice' && (
                  <div className={styles.optionsList}>
                    {question.question_options?.map((option, oIndex) => (
                      <label key={option.id} className={styles.optionLabel}>
                        <input
                          type="checkbox"
                          value={option.option_text}
                          checked={(responses[question.id] || []).includes(option.option_text)}
                          onChange={(e) => handleCheckbox(question.id, e.target.value)}
                        />
                        <span>{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                )}

                {(question.question_type === 'short_text' || question.question_type === 'long_text') && (
                  <textarea
                    className={styles.textInput}
                    value={responses[question.id] || ''}
                    onChange={(e) => handleTextInput(question.id, e.target.value)}
                    placeholder="답변을 입력하세요"
                    rows={question.question_type === 'long_text' ? 5 : 2}
                  />
                )}
              </div>
            ))}

            <div className={styles.submitSection}>
              <Button type="submit" size="large">응답 제출하기</Button>
            </div>
          </form>
        ) : (
          <div className={styles.closedMessage}>
            <p>이 설문은 마감되었습니다.</p>
            <Button onClick={() => window.history.back()}>목록으로 돌아가기</Button>
          </div>
        )}
      </div>
  );
}
