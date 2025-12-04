# 📊 Stur-vey

학생 설문조사 플랫폼 - 쉽고 빠르게 설문을 만들고 참여하세요

## ✨ 주요 기능

### 🎯 설문 관리
- **설문 생성**: 객관식(단일/복수), 주관식(단답/서술), 척도형 질문 지원
- **설문 수정**: 마감 전까지 설문 내용 수정 가능
- **결과 확인**: 실시간 통계 및 그래프로 응답 결과 시각화
- **마감 관리**: 자동 마감 처리 및 마감 임박 알림

### 👤 사용자 기능
- **소셜 로그인**: 카카오, Google 간편 로그인
- **이메일 인증**: 이메일/비밀번호 회원가입 및 로그인
- **마이페이지**: 내가 만든 설문, 응답한 설문 관리
- **프로필 관리**: 닉네임, 학교명 설정

### 🔐 권한 관리
- **설문 작성자**: 설문 수정, 삭제, 전체 결과 확인
- **설문 응답자**: 결과 확인 (설정에 따라)
- **관리자**: 전체 설문/사용자 관리

### 📈 대시보드
- 인기 설문 Top 5
- 마감 임박 설문
- 최신 설문
- 전체 통계 현황

## 🛠 기술 스택

### Frontend
- **Next.js 16**: React 19, App Router, Server Components
- **CSS Modules**: 컴포넌트 단위 스타일링
- **React Hooks**: useState, useEffect, useContext

### Backend
- **Supabase**: PostgreSQL 데이터베이스
- **Supabase Auth**: 소셜 로그인 및 이메일 인증
- **Row Level Security**: 데이터 접근 제어

### 배포
- **Vercel**: 프론트엔드 호스팅
- **Supabase Cloud**: 백엔드 및 데이터베이스

## 📁 프로젝트 구조

```
stur-vey/
├── app/                      # Next.js App Router
│   ├── (auth)/              # 인증 관련 페이지
│   │   ├── login/           # 로그인
│   │   └── signup/          # 회원가입
│   ├── (main)/              # 메인 레이아웃
│   │   ├── my/              # 마이페이지
│   │   └── surveys/         # 설문 관련
│   ├── admin/               # 관리자 페이지
│   ├── about/               # 서비스 소개
│   ├── terms/               # 이용약관
│   └── privacy/             # 개인정보처리방침
├── components/              # 재사용 컴포넌트
│   ├── common/              # 공통 컴포넌트
│   ├── layout/              # 레이아웃 컴포넌트
│   └── survey/              # 설문 관련 컴포넌트
├── contexts/                # React Context
│   └── AuthContext.js       # 인증 상태 관리
├── lib/                     # 유틸리티 및 설정
│   └── supabase/            # Supabase 클라이언트
└── docs/                    # 프로젝트 문서
```

## 🚀 시작하기

### 1. 환경 설정

```bash
# 저장소 클론
git clone <repository-url>
cd stur-vey

# 의존성 설치
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 Supabase 정보를 입력하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 📋 데이터베이스 스키마

주요 테이블:
- `profiles`: 사용자 프로필
- `surveys`: 설문 정보
- `questions`: 질문
- `question_options`: 선택지
- `responses`: 응답
- `answers`: 개별 답변

자세한 스키마는 `docs/database-schema.md`를 참조하세요.

## 🔑 주요 기능 가이드

### 설문 만들기
1. 로그인 후 "설문 만들기" 클릭
2. 제목, 설명, 카테고리, 마감일 입력
3. 질문 추가 및 유형 선택
4. 선택지 입력 (객관식인 경우)
5. 생성 완료

### 설문 응답하기
1. 설문 목록에서 원하는 설문 선택
2. 모든 필수 질문에 답변
3. 제출하기
4. 결과 확인 (권한에 따라)

### 결과 확인
- **작성자**: 항상 확인 가능
- **응답자**: 설문 설정에 따라
- **비공개**: 작성자만 확인

## 📚 문서

- [기능명세서](docs/기능명세서.md)
- [데이터베이스 스키마](docs/database-schema.md)
- [백엔드 연동 가이드](docs/백엔드연동가이드.md)
- [Supabase 클라이언트 상세 설명](docs/Supabase클라이언트-상세설명.md)

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

This project is licensed under the MIT License.

## 👥 개발팀

- **프론트엔드**: Next.js, React
- **백엔드**: Supabase
- **디자인**: CSS Modules

## 📞 문의

- 이메일: contact@sturvey.com
- GitHub Issues: 버그 리포트 및 기능 제안

---

Made with ❤️ by Stur-vey Team
