# 개발 과정 중 질문 & 답변 정리

## 📚 목차
1. [Next.js 아키텍처 이해](#1-nextjs-아키텍처-이해)
2. [라우트 그룹과 레이아웃](#2-라우트-그룹과-레이아웃)
3. [서버 컴포넌트 vs 클라이언트 컴포넌트](#3-서버-컴포넌트-vs-클라이언트-컴포넌트)
4. [데이터베이스 개념](#4-데이터베이스-개념)
5. [Supabase 패키지](#5-supabase-패키지)
6. [프로젝트 구조](#6-프로젝트-구조)

---

## 1. Next.js 아키텍처 이해

### Q1: `(main)` 폴더 내의 `layout.js` 역할이 뭔가요?

**A:** Next.js의 자동 레이아웃 시스템입니다.

- **자동 적용**: `(main)` 폴더 안의 모든 페이지에 자동으로 적용됨
- **계층 구조**: 
  ```
  app/layout.js (전역)
    └── app/(main)/layout.js (main 그룹 전용)
        └── app/(main)/page.js (홈페이지)
  ```
- **장점**: 각 페이지에서 일일이 import할 필요 없음
- **사용법**: `layout.js`에 공통 UI (헤더, 푸터 등) 작성하면 자동으로 감싸짐

**핵심**: 폴더 내 `layout.js`는 Next.js가 자동으로 인식하고 적용하는 특수 파일!

---

### Q2: 왜 `app`하고 `(main)` 폴더에만 `layout.js`가 있나요?

**A:** 레이아웃 계층 구조 때문입니다.

1. **`app/layout.js`**: 
   - 전체 앱의 최상위 레이아웃 (필수)
   - `<html>`, `<body>` 태그 포함
   - 모든 페이지에 공통 적용

2. **`app/(main)/layout.js`**:
   - `(main)` 그룹 전용 레이아웃
   - 일반 사용자용 헤더/푸터
   - `(main)` 폴더 내 페이지에만 적용

3. **`app/(auth)/layout.js`** (만들 수 있음):
   - 로그인/회원가입 페이지 전용
   - 다른 디자인의 레이아웃 적용 가능

**계층 예시**:
```
app/layout.js (전역: html, body, 폰트 등)
├── (main)/layout.js (일반 사용자: 헤더, 푸터)
│   ├── page.js
│   ├── surveys/page.js
│   └── my/page.js
└── (auth)/layout.js (인증: 로고만 있는 심플한 레이아웃)
    ├── login/page.js
    └── signup/page.js
```

---

### Q3: `components/common/MainLayout.js`를 import하는 방식과 어떤 차이가 있나요?

**A:** 두 방식의 차이점:

| 구분 | `layout.js` (Next.js 자동) | `<MainLayout>` (수동 import) |
|------|---------------------------|------------------------------|
| 적용 방식 | 폴더 내 자동 적용 | 각 페이지에서 직접 import |
| 코드 중복 | 없음 | 모든 페이지에서 반복 |
| 유지보수 | 쉬움 (한 곳만 수정) | 어려움 (여러 곳 수정) |
| Next.js 권장 | ✅ 권장 | ❌ 비권장 |

**결론**: `layout.js`를 사용하면 자동으로 적용되니 일일이 import할 필요 없음!

---

## 2. 라우트 그룹과 레이아웃

### Q4: 라우트 그룹 `(main)`, `(auth)`는 URL에 영향을 주나요?

**A:** 아니요! **URL에 전혀 영향 없습니다.**

라우트 그룹은 **조직화 목적**일 뿐입니다:

```
app/
├── (main)/
│   ├── page.js                → URL: /
│   ├── surveys/page.js        → URL: /surveys
│   └── my/page.js             → URL: /my
└── (auth)/
    ├── login/page.js          → URL: /login
    └── signup/page.js         → URL: /signup
```

**괄호 `()`의 의미**: "이건 URL에 포함시키지 마!" → Next.js가 무시

**사용 이유**:
- 다른 레이아웃 적용
- 코드 구조 정리
- 팀 협업 시 역할 구분

---

### Q5: `MainLayout` 컴포넌트와 `layout.js` 중복 아닌가요?

**A:** 맞습니다! 현재 중복된 상태입니다.

**권장 구조**:

#### 방법 1: `layout.js`에서 `MainLayout` 사용 (추천)
```javascript
// app/(main)/layout.js
import MainLayout from '@/components/common/MainLayout';

export default function Layout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}
```

#### 방법 2: `layout.js`에 직접 작성
```javascript
// app/(main)/layout.js
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

**그러면 각 페이지에서는**:
```javascript
// app/(main)/page.js
export default function HomePage() {
  return <div>홈페이지 내용</div>;
  // MainLayout 감싸기 불필요! layout.js가 자동으로 해줌
}
```

---

## 3. 서버 컴포넌트 vs 클라이언트 컴포넌트

### Q6: "Event handlers cannot be passed to Client Component props" 에러가 뭔가요?

**A:** 서버 컴포넌트에서 이벤트 핸들러를 클라이언트 컴포넌트에 전달하려고 해서 발생한 에러입니다.

**문제 상황**:
```javascript
// app/page.js (서버 컴포넌트)
export default function HomePage() {
  const handleClick = () => { /* ... */ }; // ❌ 서버에서 함수 정의
  
  return <Button onClick={handleClick}>클릭</Button>; // ❌ 에러!
}
```

**해결 방법**: 페이지를 클라이언트 컴포넌트로 변경
```javascript
'use client'; // ✅ 추가

export default function HomePage() {
  const handleClick = () => { /* ... */ };
  
  return <Button onClick={handleClick}>클릭</Button>; // ✅ 정상 작동
}
```

---

### Q7: 다른 `page.js`들도 다 클라이언트 컴포넌트 아닌가요?

**A:** 아니요! **Next.js는 기본적으로 모든 컴포넌트를 서버 컴포넌트로 만듭니다.**

- **서버 컴포넌트** (기본): `'use client'` 없는 모든 컴포넌트
- **클라이언트 컴포넌트**: `'use client'` 있는 컴포넌트만

**예시**:
```javascript
// app/surveys/page.js (서버 컴포넌트)
export default function SurveysPage() {
  // 데이터베이스 직접 조회 가능
  // onClick 같은 이벤트 핸들러 불가능
  return <div>설문 목록</div>;
}

// app/page.js (클라이언트 컴포넌트)
'use client';

export default function HomePage() {
  // useState, useEffect 사용 가능
  // onClick 이벤트 핸들러 사용 가능
  return <div>홈페이지</div>;
}
```

---

### Q8: 서버 컴포넌트와 클라이언트 컴포넌트의 차이가 뭔가요?

**A:** 두 방식의 핵심 차이:

| 구분 | 서버 컴포�트 | 클라이언트 컴포넌트 |
|------|--------------|-------------------|
| 기본 설정 | `'use client'` 없음 (기본) | `'use client'` 필요 |
| 실행 위치 | 서버에서만 | 서버 + 브라우저 둘 다 |
| 데이터베이스 | 직접 접근 가능 | 불가능 (API 필요) |
| 번들 크기 | JavaScript 안 보냄 (가벼움) | JavaScript 보냄 (무거움) |
| 인터랙션 | `onClick` 등 불가능 | `onClick`, `useState` 가능 |
| 사용 시기 | 정적 콘텐츠, 데이터 조회 | 버튼 클릭, 상태 관리 |

**언제 뭘 써야 하나?**
- ✅ **서버 컴포넌트**: 데이터만 보여주는 페이지
- ✅ **클라이언트 컴포넌트**: 사용자가 클릭하고 입력하는 페이지

---

### Q9: 클라이언트 컴포넌트도 서버에서 렌더링되나요? (SSR)

**A:** 네! **클라이언트 컴포넌트도 서버에서 먼저 HTML을 만듭니다.**

**과정**:
```
1. 서버에서 HTML 생성 (SSR)
   └─> 사용자에게 빠르게 화면 표시

2. 브라우저에서 JavaScript 다운로드
   └─> React가 HTML에 이벤트 연결 (Hydration)

3. 이제 onClick 같은 인터랙션 작동!
```

**예시**:
```javascript
'use client';

export default function Counter() {
  const [count, setCount] = useState(0);
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**브라우저에서 일어나는 일**:
1. 서버가 `<button>0</button>` HTML을 먼저 보냄 → 즉시 화면 표시
2. JavaScript 다운로드 → `onClick` 이벤트 연결 (Hydration)
3. 이제 버튼 클릭 가능!

**핵심**: 
- 서버 컴포넌트 = HTML만 (JavaScript 없음)
- 클라이언트 컴포넌트 = HTML + JavaScript (무거움)

---

### Q10: `onClick`은 왜 브라우저에서만 작동하나요?

**A:** **서버에는 마우스가 없기 때문입니다!**

**서버 환경**:
- 컴퓨터 (Node.js 프로세스)
- 사용자 없음, 마우스 없음
- 클릭 이벤트가 발생할 수 없음
- HTML만 만들어서 전달하는 역할

**브라우저 환경**:
- 사용자의 컴퓨터
- 마우스, 키보드, 터치 존재
- 이벤트가 실제로 발생함

**그래서**:
- `onClick`, `onChange` → 브라우저 전용 → `'use client'` 필요
- 데이터베이스 조회 → 서버 전용 → `'use client'` 불필요

---

## 4. 데이터베이스 개념

### Q11: 데이터베이스의 "인덱스"는 무슨 의미인가요?

**A:** **데이터베이스의 "목차"입니다!**

**비유**:
- 📕 책에서 특정 단어 찾기
  - 인덱스 없음 → 1페이지부터 끝까지 전부 읽기 (느림)
  - 인덱스 있음 → 뒤의 찾아보기에서 페이지 번호 확인 (빠름)

**데이터베이스도 동일**:
```sql
-- 인덱스 없이 검색
SELECT * FROM surveys WHERE author_id = 123;
-- → 1만 개 행 전부 확인 (느림)

-- 인덱스 있으면
CREATE INDEX idx_surveys_author_id ON surveys(author_id);
SELECT * FROM surveys WHERE author_id = 123;
-- → 인덱스에서 바로 찾기 (빠름)
```

**실제 사용 예시**:
```sql
-- 설문 조회 시 작성자로 자주 검색
CREATE INDEX idx_surveys_author_id ON surveys(author_id);

-- 카테고리로 자주 필터링
CREATE INDEX idx_surveys_category ON surveys(category);

-- 활성 상태 확인
CREATE INDEX idx_surveys_is_active ON surveys(is_active);
```

**주의점**:
- ✅ 장점: 검색 빨라짐 (10배~1000배)
- ❌ 단점: 데이터 추가/수정 시 인덱스도 업데이트 (약간 느려짐)

**언제 만드나?**
- WHERE 절에 자주 사용되는 컬럼
- JOIN 조건에 사용되는 컬럼
- ORDER BY에 사용되는 컬럼

---

### Q12: "트리거 및 함수"가 뭔가요?

**A:** 데이터베이스에서 자동으로 실행되는 코드입니다.

#### **트리거 (Trigger)**: "~하면 자동으로 이것을 해라"

**예시 1**: 새 사용자가 회원가입하면 자동으로 프로필 생성
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

**예시 2**: 응답이 제출되면 설문의 응답 수 자동 증가
```sql
CREATE TRIGGER update_survey_response_count
  AFTER INSERT ON responses
  FOR EACH ROW
  EXECUTE FUNCTION increment_response_count();
```

#### **함수 (Function)**: 재사용 가능한 로직

```sql
CREATE OR REPLACE FUNCTION increment_response_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE surveys
  SET response_count = response_count + 1
  WHERE id = NEW.survey_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**실생활 비유**:
- 트리거 = 자동 알림 (예: "메시지가 오면 알림 울려라")
- 함수 = 매크로 (예: "버튼 누르면 이 작업들을 순서대로 해라")

**우리 프로젝트에서 사용**:
```
1. 회원가입 → 자동으로 profiles 테이블에 사용자 정보 추가
2. 응답 제출 → 자동으로 surveys.response_count 증가
3. 데이터 수정 → 자동으로 updated_at 시간 업데이트
```

**장점**:
- ✅ 코드에서 신경 쓸 필요 없음 (자동 처리)
- ✅ 실수 방지 (깜빡해도 DB가 알아서 처리)
- ✅ 데이터 일관성 보장

---

## 5. Supabase 패키지

### Q13: `@supabase/supabase-js`와 `@supabase/ssr` 설치 이유가 뭔가요?

**A:** 두 패키지의 역할이 다릅니다!

#### **`@supabase/supabase-js`**: 핵심 라이브러리
```javascript
// 데이터베이스 작업
supabase.from('surveys').select('*');

// 인증
supabase.auth.signInWithOAuth({ provider: 'kakao' });

// 스토리지
supabase.storage.from('images').upload('photo.jpg', file);
```

**역할**: Supabase와 통신하는 모든 기능 제공

#### **`@supabase/ssr`**: Next.js App Router 전용 헬퍼
```javascript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 서버 컴포넌트에서 쿠키 기반 인증
const supabase = createServerClient(url, key, {
  cookies: {
    get(name) {
      return cookies().get(name)?.value;
    }
  }
});
```

**역할**: 
- Next.js의 서버/클라이언트 환경에서 세션 관리
- 쿠키 기반 인증 처리
- SSR 시 사용자 정보 유지

**왜 둘 다 필요?**

| 상황 | 사용 패키지 | 함수 |
|------|-----------|------|
| 브라우저 (클라이언트 컴포넌트) | `@supabase/ssr` | `createBrowserClient()` |
| 서버 컴포넌트 | `@supabase/ssr` | `createServerClient()` |
| 미들웨어 | `@supabase/ssr` | `createServerClient()` |

**간단 정리**:
- `@supabase/supabase-js`: 기본 기능 (DB, Auth, Storage)
- `@supabase/ssr`: Next.js에서 쿠키/세션 관리하는 헬퍼

---

## 6. 프로젝트 구조

### Q14: `lib` 폴더 이름을 쓰는 특별한 이유가 있나요?

**A:** Next.js의 **관례**입니다 (강제는 아님).

**`lib` 폴더의 의미**:
- "library"의 약자
- 재사용 가능한 유틸리티, 헬퍼 함수, 외부 서비스 클라이언트를 모아두는 곳
- Next.js 공식 문서와 예제에서 사용하는 표준 패턴

**다른 이름도 가능**:
```
lib/          ← Next.js 표준 (가장 보편적)
utils/        ← 유틸리티 강조
helpers/      ← 헬퍼 함수 강조
services/     ← 외부 서비스 강조
config/       ← 설정 강조
```

**실제 구조**:
```
lib/
├── supabase/       ← Supabase 관련
├── kakao/          ← 카카오 API 관련
├── utils.js        ← 일반 유틸리티
└── constants.js    ← 상수
```

**결론**: `lib`은 관례일 뿐이고, 원하는 이름으로 바꿔도 전혀 문제없습니다!

---

### Q15: 미들웨어를 루트 폴더에 만드는 이유가 있나요?

**A:** 이건 **Next.js의 강제 규칙**입니다!

**Next.js 미들웨어 규칙**:
- ✅ `/middleware.js` → 작동함
- ❌ `/lib/middleware.js` → 작동 안 함
- ❌ `/app/middleware.js` → 작동 안 함
- ❌ `/utils/middleware.js` → 작동 안 함

**이유**:
1. **요청 처리 우선순위**: 라우팅 시스템보다 먼저 실행되어야 함
2. **전역 레벨**: 모든 요청을 가로채서 처리
3. **설정 파일 성격**: `next.config.js`, `package.json`처럼 프로젝트 전체에 영향

**실제 구조**:
```
프로젝트 루트/
├── middleware.js                    ← Next.js가 자동 인식 (루트만!)
├── lib/
│   └── supabase/
│       ├── client.js
│       ├── server.js
│       └── middleware.js            ← 실제 로직 (import용)
└── app/
    └── ...
```

**사용 예시**:
```javascript
// middleware.js (루트)
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request) {
  return await updateSession(request);
}
```

**핵심**: 미들웨어는 Next.js 특수 파일이라 위치를 바꿀 수 없음!

---

## 🎯 핵심 요약

### Next.js 기본 개념
- `layout.js` = 폴더 내 모든 페이지에 자동 적용되는 레이아웃
- `(그룹)` = URL에 영향 없는 조직화용 폴더
- 서버 컴포넌트 = 기본 (HTML만)
- 클라이언트 컴포넌트 = `'use client'` 필요 (HTML + JavaScript)

### 언제 뭘 써야 하나?
- **서버 컴포넌트**: 데이터 조회, 정적 콘텐츠
- **클라이언트 컴포넌트**: `onClick`, `useState`, 사용자 인터랙션

### 데이터베이스
- **인덱스** = 검색 속도를 높이는 "목차"
- **트리거** = 특정 이벤트 발생 시 자동 실행
- **함수** = 재사용 가능한 데이터베이스 로직

### Supabase
- `@supabase/supabase-js` = 핵심 기능 (DB, Auth, Storage)
- `@supabase/ssr` = Next.js 세션/쿠키 관리

### 프로젝트 구조
- `lib/` = 관례 (변경 가능)
- `middleware.js` = 루트만 가능 (Next.js 강제)

---

## 7. Supabase 클라이언트 세부 사항

### Q16: 클라이언트 컴포넌트와 서버 컴포넌트에서 각각 어떤 Supabase 클라이언트를 사용하나요?

**A: 클라이언트 컴포넌트는 `client.js`, 서버 컴포넌트는 `server.js`를 사용합니다.**

#### **사용 규칙**

| 컴포넌트 유형 | Import 경로 | 사용 함수 |
|--------------|------------|----------|
| `'use client'` 있음 | `@/lib/supabase/client` | `createBrowserClient()` |
| `'use client'` 없음 | `@/lib/supabase/server` | `createServerClient()` |

#### **클라이언트 컴포넌트 예시**
```javascript
'use client';

import { createClient } from '@/lib/supabase/client'; // 👈 client.js

export default function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({ provider: 'kakao' });
  };
  
  return <button onClick={handleLogin}>로그인</button>;
}
```

#### **서버 컴포넌트 예시**
```javascript
import { createClient } from '@/lib/supabase/server'; // 👈 server.js

export default async function SurveysPage() {
  const supabase = createClient();
  const { data: surveys } = await supabase.from('surveys').select('*');
  
  return <div>...</div>;
}
```

---

### Q17: 왜 Supabase 클라이언트를 두 종류로 나눴나요?

**A: 브라우저와 서버의 세션 저장 방식이 다르기 때문입니다.**

#### **환경별 세션 저장 방식**

| 환경 | 세션 저장소 | 이유 |
|------|-----------|------|
| **브라우저** | `localStorage` | 브라우저 API 사용 가능 |
| **서버 (Node.js)** | `쿠키` | localStorage 없음 (브라우저 전용) |

#### **브라우저 환경**
```javascript
// localStorage 사용 가능
localStorage.setItem('token', 'abc123');
const token = localStorage.getItem('token'); // ✅ 작동
```

#### **서버 환경**
```javascript
// localStorage 없음!
const token = localStorage.getItem('token'); 
// ❌ ReferenceError: localStorage is not defined

// 대신 쿠키 사용
import { cookies } from 'next/headers';
const cookieStore = cookies();
const token = cookieStore.get('token')?.value; // ✅ 작동
```

#### **왜 서버에서 사용자를 알아야 하나?**

**서버 컴포넌트가 사용자별 데이터를 미리 조회해서 HTML을 만들어야 하기 때문입니다 (SSR).**

```javascript
// 서버 컴포넌트
export default async function MyPage() {
  const supabase = createClient();
  
  // 쿠키에서 사용자 확인
  const { data: { user } } = await supabase.auth.getUser();
  
  // 사용자별 데이터 조회
  const { data: mySurveys } = await supabase
    .from('surveys')
    .select('*')
    .eq('author_id', user.id); // 내 설문만!
  
  // 서버에서 HTML 미리 생성 (SEO 좋음, 빠름)
  return <div>{mySurveys.map(...)}</div>;
}
```

---

### Q18: 로그인 후 세션을 양쪽에 다 저장해야 하나요?

**A: 아니요! Supabase가 자동으로 localStorage와 쿠키 양쪽에 저장합니다.**

#### **자동 저장**
```javascript
'use client';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
await supabase.auth.signInWithOAuth({ provider: 'kakao' });

// 👇 Supabase가 자동으로:
// 1. localStorage에 저장 ✅
// 2. 쿠키에도 저장 ✅
```

#### **브라우저에서 확인 (F12 → Application)**
```
📦 Local Storage:
└─ sb-access-token: eyJhbG...
└─ sb-refresh-token: v1_MQ...

🍪 Cookies:
└─ sb-access-token: eyJhbG...
└─ sb-refresh-token: v1_MQ...
```

#### **우리가 할 일**
```javascript
// ✅ 로그인/로그아웃만 호출하면 끝!
await supabase.auth.signInWithOAuth({ provider: 'kakao' });
await supabase.auth.signOut();

// 👇 자동으로
// - localStorage 저장/삭제
// - 쿠키 저장/삭제
// - 토큰 만료 시 자동 갱신
```

---

### Q19: 왜 통합 클라이언트를 만들지 않았나요?

**A: Next.js의 서버 전용 패키지를 클라이언트 컴포넌트에서 import할 수 없기 때문입니다.**

#### **문제 1: `cookies()`는 서버에서만 사용 가능**
```javascript
import { cookies } from 'next/headers';

// ✅ 서버 컴포넌트
export default async function ServerPage() {
  const cookieStore = cookies(); // 작동!
}

// ❌ 클라이언트 컴포넌트
'use client';
export default function ClientPage() {
  const cookieStore = cookies(); 
  // ❌ Error: cookies() is only allowed in Server Components
}
```

#### **문제 2: 모듈 번들링 에러**
```javascript
// ❌ 통합 파일을 만든다면?
// lib/supabase/unified.js
import { cookies } from 'next/headers'; // 👈 서버 전용 패키지!

export function createClient() { ... }

// 클라이언트 컴포넌트에서 import
'use client';
import { createClient } from '@/lib/supabase/unified';
// ❌ 에러! next/headers를 브라우저 번들에 포함할 수 없음
```

#### **문제 3: React 규칙 위반**
```javascript
// ❌ 조건부로 사용 불가
function createClient() {
  if (typeof window === 'undefined') {
    const cookieStore = cookies(); // ❌ React 규칙 위반
    // cookies()를 조건문 안에서 호출 불가!
  }
}
```

#### **해결책: 파일 분리**
```javascript
// ✅ lib/supabase/server.js (서버 전용)
import { cookies } from 'next/headers'; // 서버 전용 import
export function createClient() { ... }

// ✅ lib/supabase/client.js (브라우저 전용)
// next/headers import 없음
export function createClient() { ... }
```

---

### Q20: Next.js 서버 전용 패키지를 클라이언트 컴포넌트에서 사용할 수 없나요?

**A: 네, 사용할 수 없습니다!**

#### **클라이언트 컴포넌트에서 사용 불가능**

```javascript
'use client';

import { cookies } from 'next/headers';      // ❌ 에러!
import { headers } from 'next/headers';      // ❌ 에러!
import { redirect } from 'next/navigation';  // ❌ 에러! (서버 전용)
import { notFound } from 'next/navigation';  // ❌ 에러! (서버 전용)
```

**에러 메시지**:
```
Error: `cookies` is only allowed in Server Components
```

#### **Next.js 패키지 분류표**

| 패키지/함수 | 서버 컴포넌트 | 클라이언트 컴포넌트 |
|------------|-------------|------------------|
| `cookies()` from `next/headers` | ✅ | ❌ |
| `headers()` from `next/headers` | ✅ | ❌ |
| `redirect()` from `next/navigation` | ✅ | ❌ |
| `notFound()` from `next/navigation` | ✅ | ❌ |
| `useRouter()` from `next/navigation` | ❌ | ✅ |
| `usePathname()` from `next/navigation` | ❌ | ✅ |
| `useSearchParams()` from `next/navigation` | ❌ | ✅ |
| `useState` from `react` | ❌ | ✅ |
| `useEffect` from `react` | ❌ | ✅ |

#### **올바른 사용**

```javascript
// ✅ 서버 컴포넌트
import { cookies, headers } from 'next/headers';

export default async function ServerPage() {
  const cookieStore = cookies();
  const headersList = headers();
  return <div>...</div>;
}

// ✅ 클라이언트 컴포넌트
'use client';
import { useRouter, usePathname } from 'next/navigation';

export default function ClientPage() {
  const router = useRouter();
  const pathname = usePathname();
  return <div>...</div>;
}
```

**핵심**: 서버 전용 패키지는 서버 컴포넌트에서만, 클라이언트 전용 Hooks는 클라이언트 컴포넌트에서만 사용 가능!

---

**작성일**: 2024년 11월 23일  
**프로젝트**: Stur-vey (학생 설문조사 플랫폼)  
**기술 스택**: Next.js 16 + React 19 + Supabase + JavaScript
