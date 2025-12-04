'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/common/Button';
import styles from './page.module.css';

export default function EditSurveyForm({ survey }) {
  const router = useRouter();
  const [title, setTitle] = useState(survey.title);
  const [description, setDescription] = useState(survey.description || '');
  const [category, setCategory] = useState(survey.category);
  const [deadline, setDeadline] = useState(survey.deadline.split('T')[0]); // YYYY-MM-DD 형식으로 변환
  
  // questions를 state로 변환 (question_options 포함)
  const [questions, setQuestions] = useState(
    survey.questions.map(q => ({
      id: q.id,
      type: q.question_type,
      text: q.question_text,
      order_index: q.order_index,
      options: q.question_options?.map(opt => opt.option_text) || []
    }))
  );

  const addQuestion = () => {
    setQuestions([...questions, {
      id: `new-${Date.now()}`, // 임시 ID (새 질문)
      type: 'single_choice',
      text: '',
      order_index: questions.length + 1,
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
    if (questions.length <= 1) {
      alert('최소 1개의 질문이 필요합니다.');
      return;
    }
    setQuestions(questions.filter(q => q.id !== id));
  };

  const removeOption = (questionId, optionIndex) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options.length > 2) {
        const newOptions = q.options.filter((_, i) => i !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    for (const question of questions) {
      if ((question.type === 'single_choice' || question.type === 'multiple_choice')) {
        const validOptions = question.options.filter(opt => opt.trim() !== '');
        
        if (validOptions.length < 2) {
          alert(`"${question.text || '질문'}"에 최소 2개의 선택지가 필요합니다.`);
          return;
        }

        const uniqueOptions = new Set(validOptions.map(opt => opt.trim().toLowerCase()));
        if (uniqueOptions.size !== validOptions.length) {
          alert(`"${question.text || '질문'}"에 중복된 선택지가 있습니다.`);
          return;
        }
      }
    }

    const supabase = createClient();

    try {
      // 1. 설문 기본 정보 업데이트
      const { error: surveyError } = await supabase
        .from('surveys')
        .update({
          title,
          description,
          category,
          deadline,
          updated_at: new Date().toISOString(),
        })
        .eq('id', survey.id);

      if (surveyError) {
        throw new Error('설문 수정 실패: ' + surveyError.message);
      }

      // 2. 기존 질문 및 선택지 삭제
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('survey_id', survey.id);

      if (deleteError) {
        throw new Error('기존 질문 삭제 실패: ' + deleteError.message);
      }

      // 3. 새로운 질문들 생성
      for (const [index, question] of questions.entries()) {
        const { data: q, error: qError } = await supabase
          .from('questions')
          .insert({
            survey_id: survey.id,
            question_text: question.text,
            question_type: question.type,
            order_index: index + 1,
          })
          .select()
          .single();

        if (qError) {
          throw new Error('질문 생성 실패: ' + qError.message);
        }

        // 4. 선택지 생성 (객관식인 경우)
        if (question.type === 'multiple_choice' || question.type === 'single_choice') {
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
              throw new Error('선택지 생성 실패: ' + optError.message);
            }
          }
        }
      }

      alert('설문이 수정되었습니다!');
      router.push(`/surveys/${survey.id}`);

    } catch (error) {
      console.error('설문 수정 에러:', error);
      alert(error.message || '설문 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 이 설문을 삭제하시겠습니까?\n모든 응답도 함께 삭제됩니다.')) {
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', survey.id);

      if (error) {
        throw new Error('설문 삭제 실패: ' + error.message);
      }

      alert('설문이 삭제되었습니다.');
      router.push('/surveys');

    } catch (error) {
      console.error('설문 삭제 에러:', error);
      alert(error.message || '설문 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>설문 수정하기</h1>
        <p>설문 정보를 수정할 수 있습니다</p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
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

        <div className={styles.actionSection}>
          <Button type="button" variant="danger" onClick={handleDelete}>
            설문 삭제
          </Button>
          <Button type="submit" size="large">수정 완료</Button>
        </div>
      </form>
    </div>
  );
}
