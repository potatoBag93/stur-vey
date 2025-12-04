-- ====================================
-- 중복 응답 방지 UNIQUE 제약 추가
-- ====================================

-- responses 테이블에 (survey_id, respondent_id) 조합이 중복되지 않도록 제약
ALTER TABLE responses 
ADD CONSTRAINT unique_survey_respondent 
UNIQUE (survey_id, respondent_id);

-- 확인
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'responses'::regclass
  AND conname = 'unique_survey_respondent';
