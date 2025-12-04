# Supabase 클라이언트 상세 설명

## 📚 목차
1. [클라이언트 객체 사용처](#1-클라이언트-객체-사용처)
2. [브라우저 vs 서버 클라이언트 차이](#2-브라우저-vs-서버-클라이언트-차이)
3. [싱글톤 패턴 필요성](#3-싱글톤-패턴-필요성)
4. [next/headers와 cookies](#4-nextheaders와-cookies)
5. [코드 상세 분석](#5-코드-상세-분석)

---

## 1. 클라이언트 객체 사용처

### Q: 클라이언트 객체를 만들어서 어디에 쓰나요?

**A: 데이터베이스 작업, 인증, 파일 업로드 등 Supabase의 모든 기능을 사용하는 곳입니다.**

### 1.1 브라우저 클라이언트 사용 예시

#### **데이터 조회**
```javascript
'use client';
import { createClient } from '@/lib/supabase/client';

export default function SurveyList() {
  const supabase = createClient(); // 👈 클라이언트 객체 생성
  
  // 설문 목록 가져오기
  const { data: surveys } = await supabase
    .from('surveys')
    .select('*')
    .eq('is_active', true);
    
  return <div>{surveys.map(s => ...)}</div>;
}
```

#### **데이터 추가**
```javascript
const supabase = createClient();

// 새 설문 생성
const { data, error } = await supabase
  .from('surveys')
  .insert({
    title: '새 설문',
    description: '설명',
    author_id: user.id,
  });
```

#### **인증 (로그인)**
```javascript
const supabase = createClient();

// 카카오 로그인
await supabase.auth.signInWithOAuth({
  provider: 'kakao'
});

// 현재 사용자 확인
const { data: { user } } = await supabase.auth.getUser();
```

#### **파일 업로드**
```javascript
const supabase = createClient();

// 이미지 업로드
await supabase.storage
  .from('avatars')
  .upload('profile.jpg', file);
```

### 1.2 서버 클라이언트 사용 예시

```javascript
// app/surveys/page.js (서버 컴포넌트)
import { createClient } from '@/lib/supabase/server';

export default async function SurveysPage() {
  const supabase = createClient(); // 👈 서버용 클라이언트
  
  // 서버에서 직접 데이터 조회
  const { data: surveys } = await supabase
    .from('surveys')
    .select('*');
    
  return <div>...</div>;
}
```

### 사용처 요약

| 기능 | 클라이언트 객체 사용 예시 |
|------|-------------------------|
| 📊 데이터 조회 | `supabase.from('surveys').select()` |
| ➕ 데이터 추가 | `supabase.from('surveys').insert()` |
| ✏️ 데이터 수정 | `supabase.from('surveys').update()` |
| 🗑️ 데이터 삭제 | `supabase.from('surveys').delete()` |
| 🔐 로그인 | `supabase.auth.signInWithOAuth()` |
| 👤 사용자 정보 | `supabase.auth.getUser()` |
| 🚪 로그아웃 | `supabase.auth.signOut()` |
| 📁 파일 업로드 | `supabase.storage.upload()` |
| 🔔 실시간 구독 | `supabase.from('surveys').on('INSERT', ...)` |

---

## 2. 브라우저 vs 서버 클라이언트 차이

### Q: 서버에서도 클라이언트 객체를 만드는데, 무슨 차이인가요?

**A: 실행 환경과 인증 방식이 다릅니다!**

### 2.1 핵심 차이

| 구분 | 브라우저 클라이언트 | 서버 클라이언트 |
|------|-------------------|----------------|
| **파일** | `lib/supabase/client.js` | `lib/supabase/server.js` |
| **함수** | `createBrowserClient()` | `createServerClient()` |
| **실행 위치** | 사용자의 브라우저 | Next.js 서버 (Node.js) |
| **인증 저장** | `localStorage` | 쿠키 (`cookies`) |
| **사용 컴포넌트** | 클라이언트 컴포넌트 (`'use client'`) | 서버 컴포넌트 |
| **세션 접근** | 브라우저의 저장소 | HTTP 쿠키 |

### 2.2 브라우저 클라이언트 (`client.js`)

```javascript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
```

**특징**:
- ✅ 브라우저의 `localStorage`에 세션 저장
- ✅ 클라이언트 컴포넌트에서 사용
- ✅ 사용자 인터랙션 (버튼 클릭, 폼 제출)
- ❌ 서버 컴포넌트에서 사용 불가

**사용 예시**:
```javascript
'use client'; // 👈 클라이언트 컴포넌트

import { createClient } from '@/lib/supabase/client';

export default function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient(); // 👈 브라우저 클라이언트
    await supabase.auth.signInWithOAuth({ provider: 'kakao' });
  };
  
  return <button onClick={handleLogin}>로그인</button>;
}
```

### 2.3 서버 클라이언트 (`server.js`)

```javascript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

**특징**:
- ✅ HTTP 쿠키에서 세션 읽기
- ✅ 서버 컴포넌트에서 사용
- ✅ 페이지 로드 시 서버에서 데이터 미리 가져오기 (SSR)
- ✅ SEO 최적화 (검색 엔진이 데이터 볼 수 있음)
- ❌ 클라이언트 인터랙션 불가 (`onClick` 등)

**사용 예시**:
```javascript
// 서버 컴포넌트 (기본)
import { createClient } from '@/lib/supabase/server';

export default async function SurveysPage() {
  const supabase = createClient(); // 👈 서버 클라이언트
  
  // 서버에서 데이터 미리 가져오기
  const { data: surveys } = await supabase
    .from('surveys')
    .select('*');
    
  // HTML에 데이터가 이미 포함되어 전송됨 (SEO 좋음!)
  return (
    <div>
      {surveys.map(s => <div key={s.id}>{s.title}</div>)}
    </div>
  );
}
```

### 2.4 왜 두 개가 필요한가?

**브라우저와 서버는 세션을 저장하는 방식이 다르기 때문입니다!**

```
브라우저 환경:
└─ localStorage, sessionStorage 사용 가능
   └─ createBrowserClient() 사용

서버 환경 (Node.js):
└─ localStorage 없음! (브라우저 전용 API)
   └─ HTTP 쿠키만 사용 가능
      └─ createServerClient() + cookies 사용
```

**실생활 비유**:
- 브라우저 클라이언트 = 당신의 지갑 (직접 카드 꺼내서 결제)
- 서버 클라이언트 = 온라인 결제 시스템 (서버가 쿠키로 신원 확인)

---

## 3. 싱글톤 패턴 필요성

### Q: 싱글톤으로 유지 안 해도 괜찮나요?

**A: 괜찮습니다! 오히려 매번 새로 만드는 게 더 좋습니다.**

### 3.1 현재 방식 (매번 생성)

```javascript
// lib/supabase/client.js
export function createClient() {
  return createBrowserClient(url, key); // 👈 호출할 때마다 새로 생성
}

// 사용
const supabase1 = createClient(); // 새 객체
const supabase2 = createClient(); // 또 새 객체
```

**장점**:
- ✅ **메모리 누수 방지**: 사용 후 자동으로 가비지 컬렉션
- ✅ **상태 격리**: 각 요청마다 독립적인 클라이언트
- ✅ **쿠키 동기화**: 항상 최신 쿠키 읽음
- ✅ **Next.js 권장 방식**: 공식 문서에서 이 패턴 사용

### 3.2 싱글톤 패턴 (한 번만 생성)

```javascript
// ❌ 권장하지 않음
let supabaseInstance = null;

export function createClient() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(url, key);
  }
  return supabaseInstance; // 👈 항상 같은 객체 반환
}
```

**단점**:
- ❌ **서버에서 문제**: 여러 사용자의 요청이 같은 객체 공유
- ❌ **쿠키 안 맞음**: 첫 생성 시점의 쿠키만 사용
- ❌ **메모리 누수**: 계속 메모리에 남아있음

### 3.3 왜 매번 생성해도 성능 문제 없나?

**Supabase 클라이언트는 가볍기 때문입니다!**

```javascript
const supabase = createClient();
// 👆 이 작업은 매우 빠름 (밀리초 이하)
// 실제 네트워크 연결은 쿼리 실행 시에만 발생
```

**실제로 비용이 드는 시점**:
```javascript
const supabase = createClient();     // ⚡ 빠름 (객체 생성만)

const { data } = await supabase      // 🐌 여기서 시간 걸림
  .from('surveys')
  .select('*');                      // 실제 네트워크 요청
```

### 3.4 Next.js에서 매번 생성하는 이유

```javascript
// 서버 컴포넌트
export default async function Page() {
  const supabase = createClient(); // 👈 요청마다 새 객체
  
  // 이 요청의 쿠키로 사용자 확인
  const { data: { user } } = await supabase.auth.getUser();
  
  // ✅ 올바른 사용자의 데이터만 조회
  const { data } = await supabase
    .from('surveys')
    .select('*')
    .eq('author_id', user.id);
}
```

**만약 싱글톤이었다면**:
```javascript
// ❌ 문제 발생!
// 사용자 A가 접속 → supabase 객체 생성 (A의 쿠키)
// 사용자 B가 접속 → 같은 객체 재사용 (여전히 A의 쿠키!)
// → B가 A의 데이터를 보게 됨! (보안 문제)
```

### 요약

| 방식 | 브라우저 | 서버 |
|------|---------|-----|
| **매번 생성** | ✅ 괜찮음 | ✅ 필수! |
| **싱글톤** | ⚠️ 가능하지만 불필요 | ❌ 절대 안 됨 (보안 위험) |

**결론**: **매번 생성하는 게 정답입니다!**

---

## 4. next/headers와 cookies

### Q: `next/headers` 패키지와 `cookies`에 대해 설명해주세요

**A: Next.js에서 서버 컴포넌트가 HTTP 쿠키를 읽을 수 있게 해주는 도구입니다.**

### 4.1 `next/headers`란?

**Next.js 15+에서 서버 측 HTTP 헤더와 쿠키에 접근하는 공식 패키지입니다.**

```javascript
import { cookies, headers } from 'next/headers';
```

**제공하는 기능**:
- `cookies()`: HTTP 쿠키 읽기/쓰기
- `headers()`: HTTP 헤더 읽기

### 4.2 쿠키(Cookie)란?

**브라우저와 서버가 주고받는 작은 데이터 조각입니다.**

#### **쿠키의 역할**
```
1. 사용자가 로그인
   └─> 서버: "여기 로그인 토큰이야!" (쿠키로 전송)
   
2. 브라우저가 쿠키 저장
   └─> "이 사이트는 이 토큰을 가지고 있어야 해"
   
3. 다음 요청 시 자동으로 쿠키 전송
   └─> "안녕! 나 로그인한 사람이야!" (쿠키 첨부)
   
4. 서버가 쿠키 확인
   └─> "오케이, 이 사람 맞네!" (인증 완료)
```

#### **쿠키 예시**
```
쿠키 이름: sb-access-token
쿠키 값: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
용도: Supabase 로그인 세션 유지
```

### 4.3 `cookies()` 사용법

#### **쿠키 읽기**
```javascript
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = cookies();
  
  // 특정 쿠키 가져오기
  const token = cookieStore.get('sb-access-token');
  
  console.log(token);
  // {
  //   name: 'sb-access-token',
  //   value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  // }
  
  // 값만 가져오기
  const tokenValue = cookieStore.get('sb-access-token')?.value;
}
```

#### **쿠키 쓰기**
```javascript
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = cookies();
  
  // 쿠키 설정
  cookieStore.set('theme', 'dark', {
    maxAge: 60 * 60 * 24 * 7, // 7일
    httpOnly: true,            // JavaScript 접근 차단 (보안)
    secure: true,              // HTTPS만
    sameSite: 'lax',          // CSRF 방지
  });
}
```

#### **쿠키 삭제**
```javascript
cookieStore.delete('theme');
// 또는
cookieStore.set('theme', '', { maxAge: 0 });
```

### 4.4 왜 `cookies()`가 필요한가?

**서버 컴포넌트는 브라우저 API를 쓸 수 없기 때문입니다!**

```javascript
// ❌ 서버 컴포넌트에서 불가능
export default function Page() {
  const token = document.cookie; // ❌ ReferenceError: document is not defined
}

// ✅ 올바른 방법
import { cookies } from 'next/headers';

export default function Page() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value; // ✅ 작동!
}
```

### 4.5 Supabase와 쿠키

**Supabase는 로그인 세션을 쿠키에 저장합니다.**

```javascript
// 로그인 후 브라우저의 쿠키
sb-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
sb-refresh-token: v1_MQ_fxTl9K...
```

**서버 컴포넌트에서 이 쿠키를 읽어야 "누가 로그인했는지" 알 수 있습니다!**

```javascript
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = createClient();
  
  // 내부적으로 cookies()를 사용해서 세션 확인
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div>로그인이 필요합니다</div>;
  }
  
  return <div>환영합니다, {user.email}님!</div>;
}
```

### 4.6 쿠키 vs localStorage

| 구분 | 쿠키 (Cookie) | localStorage |
|------|--------------|-------------|
| **저장 위치** | 브라우저 + 서버 둘 다 접근 | 브라우저만 |
| **자동 전송** | ✅ 모든 요청에 자동 포함 | ❌ 수동으로 보내야 함 |
| **서버 접근** | ✅ 가능 | ❌ 불가능 |
| **크기 제한** | 4KB | 5-10MB |
| **만료 시간** | 설정 가능 | 없음 (직접 삭제 전까지) |
| **보안** | httpOnly 설정 가능 | JavaScript에서 항상 접근 가능 |

**왜 Supabase는 쿠키를 사용하나?**
- ✅ 서버 컴포넌트에서 세션 확인 가능
- ✅ SSR 시 사용자 정보 알 수 있음
- ✅ 보안 강화 (httpOnly 쿠키)

---

## 5. 코드 상세 분석

### Q: 이 코드를 설명해주세요

```javascript
return createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
    },
  }
);
```

### 5.1 전체 코드 다시 보기

```javascript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}
```

### 5.2 라인별 설명

#### **1번 라인**: `import { createServerClient } from '@supabase/ssr';`
```javascript
// @supabase/ssr 패키지에서 서버용 클라이언트 생성 함수 가져오기
import { createServerClient } from '@supabase/ssr';
```
- `createServerClient`: 서버 환경에서 쿠키 기반 인증을 처리하는 특수 클라이언트

---

#### **2번 라인**: `import { cookies } from 'next/headers';`
```javascript
// Next.js에서 HTTP 쿠키에 접근하는 함수 가져오기
import { cookies } from 'next/headers';
```
- `cookies`: 서버 컴포넌트에서 쿠키를 읽고 쓸 수 있는 Next.js 15+ 함수

---

#### **4번 라인**: `export function createClient() {`
```javascript
// 다른 파일에서 사용할 수 있도록 export
export function createClient() {
```
- 이 함수를 다른 파일에서 `import { createClient } from '@/lib/supabase/server'`로 사용 가능

---

#### **5번 라인**: `const cookieStore = cookies();`
```javascript
const cookieStore = cookies();
```

**역할**: 현재 요청의 쿠키 저장소 가져오기

**내부 동작**:
```javascript
// cookies()가 반환하는 객체
{
  get: (name) => { /* 쿠키 읽기 */ },
  set: (name, value, options) => { /* 쿠키 쓰기 */ },
  delete: (name) => { /* 쿠키 삭제 */ },
  getAll: () => { /* 모든 쿠키 */ },
}
```

**예시**:
```javascript
const cookieStore = cookies();

// 쿠키 읽기
const token = cookieStore.get('sb-access-token');
console.log(token);
// { name: 'sb-access-token', value: 'eyJhbG...' }
```

---

#### **7-17번 라인**: `return createServerClient(...)`
```javascript
return createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
    },
  }
);
```

**파라미터 분석**:

##### **첫 번째 파라미터**: `process.env.NEXT_PUBLIC_SUPABASE_URL`
```javascript
process.env.NEXT_PUBLIC_SUPABASE_URL
```
- 환경 변수에서 Supabase 프로젝트 URL 가져오기
- 예: `https://xxxxx.supabase.co`

##### **두 번째 파라미터**: `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`
```javascript
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
```
- 환경 변수에서 Supabase 공개 키(anon key) 가져오기
- 예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

##### **세 번째 파라미터**: 설정 객체
```javascript
{
  cookies: {
    get(name) {
      return cookieStore.get(name)?.value;
    },
  },
}
```

**이 설정이 하는 일**:
> "Supabase야, 세션 정보가 필요하면 이 함수를 사용해서 쿠키를 읽어!"

---

### 5.3 `get(name)` 함수 상세 분석

```javascript
get(name) {
  return cookieStore.get(name)?.value;
}
```

#### **파라미터**: `name`
```javascript
// Supabase가 전달하는 쿠키 이름
// 예: 'sb-access-token', 'sb-refresh-token'
```

#### **동작**:
```javascript
cookieStore.get(name)?.value;
// 👇 단계별 설명

// 1. cookieStore.get(name)
//    → 쿠키 객체 반환: { name: '...', value: '...' }

// 2. ?. (옵셔널 체이닝)
//    → 쿠키가 없으면 undefined 반환 (에러 방지)

// 3. .value
//    → 쿠키의 값만 추출
```

#### **예시**:
```javascript
// Supabase가 내부적으로 호출
get('sb-access-token')

// 실제 실행
cookieStore.get('sb-access-token')?.value
// 👇
// {
//   name: 'sb-access-token',
//   value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
// }
// 👇
// 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' (값만 반환)
```

---

### 5.4 전체 흐름 시각화

```javascript
// 1. 사용자가 페이지 요청
//    브라우저 → 서버
//    쿠키 포함: sb-access-token=eyJhbG...

// 2. 서버 컴포넌트 실행
const supabase = createClient();
// 👇

// 3. createClient() 함수 실행
const cookieStore = cookies();
// 👇 현재 요청의 쿠키 가져오기

// 4. Supabase 클라이언트 생성
return createServerClient(url, key, {
  cookies: {
    get(name) {
      return cookieStore.get(name)?.value;
    }
  }
});
// 👇 Supabase에게 "쿠키는 이렇게 읽어!" 알려줌

// 5. Supabase가 사용자 확인
const { data: { user } } = await supabase.auth.getUser();
// 👇 내부적으로 get('sb-access-token') 호출
// 👇 쿠키에서 토큰 읽기
// 👇 토큰 검증
// 👇 사용자 정보 반환

// 6. 서버가 HTML 생성
return <div>환영합니다, {user.email}님!</div>;
// 👇

// 7. 브라우저로 HTML 전송
```

---

### 5.5 왜 이렇게 복잡하게 만들었나?

**Supabase는 쿠키를 어떻게 읽는지 모르기 때문입니다!**

```javascript
// Supabase 입장:
// "나는 쿠키가 필요한데, Next.js에서 어떻게 읽는지 몰라!"
// "너희가 읽는 방법을 알려줘!"

// 우리가 알려주는 방법:
{
  cookies: {
    get(name) {
      return cookieStore.get(name)?.value; // 👈 "이렇게 읽으면 돼!"
    }
  }
}
```

**각 프레임워크마다 쿠키 읽는 방법이 다름**:
```javascript
// Next.js
const value = cookies().get(name)?.value;

// Express.js
const value = req.cookies[name];

// Fastify
const value = request.cookies[name];
```

**Supabase는 범용 라이브러리**라서 모든 프레임워크를 지원하기 위해 "쿠키 읽는 함수"를 주입받는 방식을 사용합니다!

---

## 🎯 핵심 요약

### 1. 클라이언트 객체 사용처
- 데이터 조회, 추가, 수정, 삭제
- 로그인, 로그아웃, 사용자 정보
- 파일 업로드, 실시간 구독

### 2. 브라우저 vs 서버 클라이언트
- 브라우저: localStorage 사용, 클라이언트 컴포넌트
- 서버: 쿠키 사용, 서버 컴포넌트, SEO 좋음

### 3. 싱글톤 불필요
- 매번 생성해도 성능 문제 없음
- 서버에서는 매번 생성 필수 (보안)
- Next.js 공식 권장 방식

### 4. `next/headers`와 `cookies`
- Next.js에서 서버 측 쿠키 접근 도구
- `cookies().get(name)?.value`로 쿠키 읽기
- 서버 컴포넌트에서 사용자 세션 확인 가능

### 5. 코드 의미
```javascript
// Supabase에게 "쿠키 읽는 방법"을 알려주는 코드
{
  cookies: {
    get(name) {
      return cookieStore.get(name)?.value;
    }
  }
}
```

---

**작성일**: 2024년 11월 23일  
**프로젝트**: Stur-vey  
**관련 파일**: `lib/supabase/server.js`, `lib/supabase/client.js`
