# Supabase 데이터베이스 스키마

## 📊 ERD 개요

```
users (Supabase Auth)
  ↓ 1:N
surveys
  ↓ 1:N
questions
  ↓ 1:N
question_options
  
surveys ← N:1 → responses → 1:N → answers
users ← 1:N → responses
```

---

## 🗂️ 테이블 상세 정의

### 1. users (Supabase Auth 테이블 확장)

Supabase Auth의 기본 `auth.users` 테이블을 사용하고, 추가 정보는 `profiles` 테이블에 저장

#### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname VARCHAR(50) NOT NULL,
  school_name VARCHAR(100) NOT NULL,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_school ON profiles(school_name);
```

**필드 설명:**
- `id`: Supabase Auth 사용자 ID (UUID)
- `nickname`: 사용자 닉네임
- `school_name`: 학교명
- `avatar_url`: 프로필 이미지 URL (카카오 연동)
- `role`: 사용자 역할 (`user`, `admin`)
- `created_at`: 가입일
- `updated_at`: 수정일

---

### 2. surveys (설문조사)

```sql
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    '학업/진로',
    '대학생활', 
    '취미/관심사',
    '소비/구매',
    '사회/이슈',
    '기타'
  )),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  max_responses INTEGER,
  is_public BOOLEAN DEFAULT true,
  allow_duplicate BOOLEAN DEFAULT false,
  allow_edit BOOLEAN DEFAULT false,
  result_visibility VARCHAR(20) DEFAULT 'all' CHECK (result_visibility IN (
    'all',           -- 모두에게 공개
    'respondents',   -- 응답자에게만
    'creator_only'   -- 생성자만
  )),
  target_school VARCHAR(100),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
    'draft',      -- 임시저장
    'published',  -- 발행됨
    'closed',     -- 마감됨
    'hidden'      -- 숨김 (관리자)
  )),
  response_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_surveys_creator ON surveys(creator_id);
CREATE INDEX idx_surveys_category ON surveys(category);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_deadline ON surveys(deadline);
CREATE INDEX idx_surveys_created_at ON surveys(created_at DESC);
CREATE INDEX idx_surveys_response_count ON surveys(response_count DESC);
```

**필드 설명:**
- `id`: 설문 ID (UUID)
- `creator_id`: 설문 생성자 ID
- `title`: 설문 제목
- `description`: 설문 설명
- `category`: 카테고리
- `deadline`: 마감 기한
- `max_responses`: 최대 응답 수 (null이면 제한 없음)
- `is_public`: 공개 여부
- `allow_duplicate`: 중복 응답 허용 여부
- `allow_edit`: 응답 수정 허용 여부
- `result_visibility`: 결과 공개 설정
- `target_school`: 타겟 학교 (null이면 전체)
- `status`: 설문 상태
- `response_count`: 응답 수 (캐시)
- `created_at`: 생성일
- `updated_at`: 수정일

---

### 3. questions (질문)

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN (
    'single_choice',    -- 객관식 단일
    'multiple_choice',  -- 객관식 복수
    'short_text',       -- 주관식 단답
    'long_text',        -- 주관식 장문
    'scale'             -- 척도형
  )),
  is_required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  scale_min INTEGER,  -- 척도형일 때만 (1 또는 1)
  scale_max INTEGER,  -- 척도형일 때만 (5 또는 10)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_questions_survey ON questions(survey_id);
CREATE INDEX idx_questions_order ON questions(survey_id, order_index);
```

**필드 설명:**
- `id`: 질문 ID (UUID)
- `survey_id`: 소속 설문 ID
- `question_text`: 질문 내용
- `question_type`: 질문 유형
- `is_required`: 필수 응답 여부
- `order_index`: 질문 순서
- `scale_min`: 척도 최소값 (척도형만)
- `scale_max`: 척도 최대값 (척도형만)
- `created_at`: 생성일

---

### 4. question_options (질문 선택지)

```sql
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  option_text VARCHAR(200) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_options_question ON question_options(question_id);
CREATE INDEX idx_options_order ON question_options(question_id, order_index);
```

**필드 설명:**
- `id`: 선택지 ID (UUID)
- `question_id`: 소속 질문 ID
- `option_text`: 선택지 내용
- `order_index`: 선택지 순서
- `created_at`: 생성일

**참고:** 객관식 질문에만 사용됨

---

### 5. responses (응답)

```sql
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  respondent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(survey_id, respondent_id)  -- 설문당 사용자별 1개 응답 (중복 응답 방지용)
);

-- 인덱스
CREATE INDEX idx_responses_survey ON responses(survey_id);
CREATE INDEX idx_responses_respondent ON responses(respondent_id);
CREATE INDEX idx_responses_created_at ON responses(created_at DESC);
```

**필드 설명:**
- `id`: 응답 ID (UUID)
- `survey_id`: 소속 설문 ID
- `respondent_id`: 응답자 ID
- `created_at`: 최초 응답일
- `updated_at`: 최종 수정일

**참고:** `UNIQUE` 제약으로 중복 응답 방지 (설문 설정에 따라 제어)

---

### 6. answers (응답 상세)

```sql
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  
  -- 응답 데이터 (질문 유형에 따라 다른 필드 사용)
  selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,  -- 객관식 단일
  selected_option_ids UUID[],  -- 객관식 복수
  text_answer TEXT,            -- 주관식
  scale_value INTEGER,         -- 척도형
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_answers_response ON answers(response_id);
CREATE INDEX idx_answers_question ON answers(question_id);
```

**필드 설명:**
- `id`: 답변 ID (UUID)
- `response_id`: 소속 응답 ID
- `question_id`: 소속 질문 ID
- `selected_option_id`: 선택한 옵션 ID (객관식 단일)
- `selected_option_ids`: 선택한 옵션 ID 배열 (객관식 복수)
- `text_answer`: 텍스트 답변 (주관식)
- `scale_value`: 척도 값 (척도형)
- `created_at`: 생성일

---

## 🔒 Row Level Security (RLS) 정책

### profiles
```sql
-- 모든 사용자는 자신의 프로필을 읽을 수 있음
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 모든 사용자는 자신의 프로필을 수정할 수 있음
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### surveys
```sql
-- 모든 사용자는 발행된 공개 설문을 볼 수 있음
CREATE POLICY "Anyone can read published public surveys"
  ON surveys FOR SELECT
  USING (status = 'published' AND is_public = true);

-- 생성자는 자신의 설문을 모두 볼 수 있음
CREATE POLICY "Creators can read own surveys"
  ON surveys FOR SELECT
  USING (auth.uid() = creator_id);

-- 생성자는 자신의 설문을 생성할 수 있음
CREATE POLICY "Users can create surveys"
  ON surveys FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- 생성자는 자신의 설문을 수정할 수 있음
CREATE POLICY "Creators can update own surveys"
  ON surveys FOR UPDATE
  USING (auth.uid() = creator_id);

-- 생성자는 응답이 없는 설문만 삭제할 수 있음
CREATE POLICY "Creators can delete surveys without responses"
  ON surveys FOR DELETE
  USING (auth.uid() = creator_id AND response_count = 0);

-- 관리자는 모든 설문을 볼 수 있음
CREATE POLICY "Admins can read all surveys"
  ON surveys FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 관리자는 모든 설문을 수정/삭제할 수 있음
CREATE POLICY "Admins can manage all surveys"
  ON surveys FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### questions & question_options
```sql
-- 발행된 설문의 질문은 모두 볼 수 있음
CREATE POLICY "Anyone can read published survey questions"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE id = survey_id AND status = 'published' AND is_public = true
    )
  );

-- 생성자는 자신의 설문 질문을 관리할 수 있음
CREATE POLICY "Creators can manage own survey questions"
  ON questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE id = survey_id AND creator_id = auth.uid()
    )
  );
```

### responses & answers
```sql
-- 응답자는 자신의 응답을 볼 수 있음
CREATE POLICY "Respondents can read own responses"
  ON responses FOR SELECT
  USING (auth.uid() = respondent_id);

-- 설문 생성자는 자신의 설문에 대한 응답을 볼 수 있음
CREATE POLICY "Creators can read survey responses"
  ON responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE id = survey_id AND creator_id = auth.uid()
    )
  );

-- 사용자는 설문에 응답할 수 있음
CREATE POLICY "Users can submit responses"
  ON responses FOR INSERT
  WITH CHECK (auth.uid() = respondent_id);

-- 응답자는 설문 설정에 따라 응답을 수정할 수 있음
CREATE POLICY "Respondents can update own responses if allowed"
  ON responses FOR UPDATE
  USING (
    auth.uid() = respondent_id AND
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE id = survey_id AND allow_edit = true
    )
  );
```

---

## 🔄 트리거 및 함수

### 1. 응답 수 자동 업데이트

```sql
-- 응답 추가 시 survey.response_count 증가
CREATE OR REPLACE FUNCTION increment_response_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE surveys 
  SET response_count = response_count + 1,
      updated_at = NOW()
  WHERE id = NEW.survey_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_response_count
  AFTER INSERT ON responses
  FOR EACH ROW
  EXECUTE FUNCTION increment_response_count();

-- 응답 삭제 시 survey.response_count 감소
CREATE OR REPLACE FUNCTION decrement_response_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE surveys 
  SET response_count = response_count - 1,
      updated_at = NOW()
  WHERE id = OLD.survey_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_response_count
  AFTER DELETE ON responses
  FOR EACH ROW
  EXECUTE FUNCTION decrement_response_count();
```

### 2. 설문 상태 자동 업데이트 (마감)

```sql
-- 마감 시간이 지나면 status를 'closed'로 변경
CREATE OR REPLACE FUNCTION auto_close_expired_surveys()
RETURNS void AS $$
BEGIN
  UPDATE surveys 
  SET status = 'closed',
      updated_at = NOW()
  WHERE status = 'published' 
    AND deadline < NOW();
END;
$$ LANGUAGE plpgsql;

-- 주기적으로 실행 (Supabase Edge Functions 또는 Cron Job)
```

### 3. updated_at 자동 업데이트

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 모든 테이블에 적용
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_responses_updated_at
  BEFORE UPDATE ON responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## 📈 쿼리 예시

### 1. 메인 페이지 - 설문 목록 (최신순)
```sql
SELECT 
  s.id,
  s.title,
  s.description,
  s.category,
  s.deadline,
  s.response_count,
  s.created_at,
  p.nickname as creator_nickname,
  p.school_name as creator_school,
  CASE 
    WHEN s.deadline < NOW() THEN 'closed'
    WHEN s.max_responses IS NOT NULL AND s.response_count >= s.max_responses THEN 'closed'
    ELSE 'active'
  END as actual_status,
  EXISTS(
    SELECT 1 FROM responses r 
    WHERE r.survey_id = s.id AND r.respondent_id = $1
  ) as has_responded
FROM surveys s
JOIN profiles p ON s.creator_id = p.id
WHERE s.status = 'published' AND s.is_public = true
ORDER BY s.created_at DESC
LIMIT 20 OFFSET $2;
```

### 2. 설문 상세 + 질문 + 선택지
```sql
-- 설문 정보
SELECT s.*, p.nickname as creator_nickname
FROM surveys s
JOIN profiles p ON s.creator_id = p.id
WHERE s.id = $1;

-- 질문 + 선택지
SELECT 
  q.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', qo.id,
        'option_text', qo.option_text,
        'order_index', qo.order_index
      ) ORDER BY qo.order_index
    ) FILTER (WHERE qo.id IS NOT NULL),
    '[]'
  ) as options
FROM questions q
LEFT JOIN question_options qo ON q.id = qo.question_id
WHERE q.survey_id = $1
GROUP BY q.id
ORDER BY q.order_index;
```

### 3. 결과 통계 - 객관식 질문
```sql
SELECT 
  qo.id,
  qo.option_text,
  COUNT(a.id) as vote_count,
  ROUND(COUNT(a.id) * 100.0 / (
    SELECT COUNT(*) FROM answers 
    WHERE question_id = $1
  ), 2) as percentage
FROM question_options qo
LEFT JOIN answers a ON qo.id = a.selected_option_id
WHERE qo.question_id = $1
GROUP BY qo.id, qo.option_text
ORDER BY qo.order_index;
```

### 4. 결과 통계 - 척도형 질문
```sql
SELECT 
  AVG(scale_value) as avg_value,
  COUNT(*) as total_responses,
  scale_value,
  COUNT(*) as count
FROM answers
WHERE question_id = $1
GROUP BY scale_value
ORDER BY scale_value;
```

### 5. 내가 만든 설문 목록
```sql
SELECT 
  s.*,
  CASE 
    WHEN s.deadline < NOW() THEN 'closed'
    WHEN s.max_responses IS NOT NULL AND s.response_count >= s.max_responses THEN 'closed'
    ELSE s.status
  END as actual_status
FROM surveys s
WHERE s.creator_id = $1
ORDER BY s.created_at DESC;
```

### 6. 내가 참여한 설문 목록
```sql
SELECT 
  s.*,
  p.nickname as creator_nickname,
  r.created_at as responded_at
FROM responses r
JOIN surveys s ON r.survey_id = s.id
JOIN profiles p ON s.creator_id = p.id
WHERE r.respondent_id = $1
ORDER BY r.created_at DESC;
```

---

## 🔐 Supabase Auth 설정

### Kakao OAuth 설정
1. Kakao Developers에서 앱 생성
2. Redirect URI 설정: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Supabase Dashboard → Authentication → Providers → Kakao 활성화
4. Client ID, Client Secret 입력

### JWT 커스텀 클레임
```sql
-- profiles 테이블 생성 후 자동으로 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, school_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', '익명'),
    '',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 📦 마이그레이션 순서

1. `profiles` 테이블 생성
2. `surveys` 테이블 생성
3. `questions` 테이블 생성
4. `question_options` 테이블 생성
5. `responses` 테이블 생성
6. `answers` 테이블 생성
7. 인덱스 생성
8. RLS 정책 적용
9. 트리거 및 함수 생성
10. Auth 트리거 생성

---

## 🧪 테스트 데이터

```sql
-- 관리자 계정 생성 (Supabase Dashboard에서 수동 추가)
-- 테스트 설문 생성
-- 테스트 응답 생성
```

이 스키마는 MVP 기능을 완벽히 지원하며, 향후 확장 가능한 구조로 설계되었습니다.
