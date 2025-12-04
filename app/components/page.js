import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';
import SurveyCard from '@/components/survey/SurveyCard';
import styles from './page.module.css';

export default function ComponentsPage() {
  // 샘플 설문 데이터
  const sampleSurveys = [
    {
      id: '1',
      title: '2025년 대학생 진로 설문조사',
      description: '대학생 여러분의 진로 선택과 취업 준비에 대한 의견을 듣고 싶습니다. 여러분의 소중한 의견을 들려주세요!',
      category: '학업/진로',
      deadline: '2025-12-31',
      responseCount: 32,
      maxResponses: 50,
      creatorNickname: '홍길동',
      hasResponded: false
    },
    {
      id: '2',
      title: '캠퍼스 식당 만족도 조사',
      description: '학교 식당의 메뉴와 서비스 개선을 위한 설문입니다.',
      category: '대학생활',
      deadline: '2025-11-25',
      responseCount: 45,
      maxResponses: 100,
      creatorNickname: '김철수',
      hasResponded: true
    },
    {
      id: '3',
      title: '주말 여가 활동 선호도',
      description: '대학생들의 주말 여가 활동에 대한 통계를 내기 위한 설문입니다.',
      category: '취미/관심사',
      deadline: '2025-11-20',
      responseCount: 100,
      maxResponses: 100,
      creatorNickname: '이영희',
      hasResponded: false
    }
  ];

  return (
    <div>
      <Header />
      
      <main className={styles.main}>
        <h1 className={styles.pageTitle}>컴포넌트 갤러리</h1>
        <p className={styles.subtitle}>Stur-vey 프로젝트의 모든 공통 컴포넌트를 한눈에 확인할 수 있습니다.</p>

        {/* Buttons */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Button 컴포넌트</h2>
          <p className={styles.description}>다양한 스타일과 크기의 버튼을 제공합니다.</p>
          
          <div className={styles.demo}>
            <h3 className={styles.demoTitle}>Variants (스타일)</h3>
            <div className={styles.buttonGroup}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          <div className={styles.demo}>
            <h3 className={styles.demoTitle}>Sizes (크기)</h3>
            <div className={styles.buttonGroup}>
              <Button size="small">Small</Button>
              <Button size="medium">Medium</Button>
              <Button size="large">Large</Button>
            </div>
          </div>

          <div className={styles.demo}>
            <h3 className={styles.demoTitle}>States (상태)</h3>
            <div className={styles.buttonGroup}>
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>

          <div className={styles.demo}>
            <h3 className={styles.demoTitle}>Full Width</h3>
            <Button fullWidth variant="primary">전체 너비 버튼</Button>
          </div>

          <div className={styles.codeBlock}>
            <h4>사용 예시:</h4>
            <pre>{`<Button variant="primary" size="medium">클릭</Button>
<Button variant="secondary" disabled>비활성화</Button>
<Button variant="danger" fullWidth>삭제</Button>`}</pre>
          </div>
        </section>

        {/* Survey Card */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. SurveyCard 컴포넌트</h2>
          <p className={styles.description}>설문 목록에서 사용되는 카드 컴포넌트입니다.</p>
          
          <div className={styles.demo}>
            <h3 className={styles.demoTitle}>기본 상태</h3>
            <div className={styles.cardGrid}>
              <SurveyCard survey={sampleSurveys[0]} />
            </div>
          </div>

          <div className={styles.demo}>
            <h3 className={styles.demoTitle}>응답 완료 상태</h3>
            <div className={styles.cardGrid}>
              <SurveyCard survey={sampleSurveys[1]} />
            </div>
          </div>

          <div className={styles.demo}>
            <h3 className={styles.demoTitle}>마감된 설문</h3>
            <div className={styles.cardGrid}>
              <SurveyCard survey={sampleSurveys[2]} />
            </div>
          </div>

          <div className={styles.codeBlock}>
            <h4>사용 예시:</h4>
            <pre>{`<SurveyCard survey={{
  id: '123',
  title: '설문 제목',
  description: '설명...',
  category: '학업/진로',
  deadline: '2025-12-31',
  responseCount: 32,
  maxResponses: 50,
  creatorNickname: '홍길동',
  hasResponded: false
}} />`}</pre>
          </div>
        </section>

        {/* Header */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Header 컴포넌트</h2>
          <p className={styles.description}>모든 페이지 상단에 표시되는 헤더입니다. (현재 페이지 상단 참고)</p>
          
          <div className={styles.codeBlock}>
            <h4>기능:</h4>
            <ul>
              <li>로고 (Stur-vey)</li>
              <li>검색창</li>
              <li>네비게이션 (설문목록, 설문만들기, 마이페이지)</li>
              <li>로그인/사용자 프로필</li>
              <li>반응형 디자인 (모바일 대응)</li>
            </ul>
          </div>

          <div className={styles.codeBlock}>
            <h4>사용 예시:</h4>
            <pre>{`<Header />`}</pre>
          </div>
        </section>

        {/* Footer */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Footer 컴포넌트</h2>
          <p className={styles.description}>모든 페이지 하단에 표시되는 푸터입니다. (현재 페이지 하단 참고)</p>
          
          <div className={styles.codeBlock}>
            <h4>기능:</h4>
            <ul>
              <li>브랜드 정보</li>
              <li>서비스 링크</li>
              <li>정보/문의 링크</li>
              <li>저작권 표시</li>
            </ul>
          </div>

          <div className={styles.codeBlock}>
            <h4>사용 예시:</h4>
            <pre>{`<Footer />`}</pre>
          </div>
        </section>

        {/* Layout */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. MainLayout 컴포넌트</h2>
          <p className={styles.description}>Header와 Footer를 포함한 전체 레이아웃 컴포넌트입니다.</p>
          
          <div className={styles.codeBlock}>
            <h4>사용 예시:</h4>
            <pre>{`import MainLayout from '@/components/layout/MainLayout';

export default function Page() {
  return (
    <MainLayout>
      <h1>페이지 내용</h1>
    </MainLayout>
  );
}`}</pre>
          </div>
        </section>

        {/* 컴포넌트 구조 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. 컴포넌트 구조</h2>
          <div className={styles.codeBlock}>
            <pre>{`components/
├── common/
│   ├── Header.js          # 헤더
│   ├── Header.module.css
│   ├── Footer.js          # 푸터
│   ├── Footer.module.css
│   ├── Button.js          # 버튼
│   └── Button.module.css
│
├── survey/
│   ├── SurveyCard.js      # 설문 카드
│   └── SurveyCard.module.css
│
└── layout/
    ├── MainLayout.js      # 메인 레이아웃
    └── MainLayout.module.css`}</pre>
          </div>
        </section>

        {/* Import 경로 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Import 경로</h2>
          <div className={styles.codeBlock}>
            <pre>{`// @ 별칭 사용 (프로젝트 루트 기준)
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Button from '@/components/common/Button';
import SurveyCard from '@/components/survey/SurveyCard';
import MainLayout from '@/components/layout/MainLayout';`}</pre>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
