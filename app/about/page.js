import styles from './page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>서비스 소개</h1>
        <p className={styles.subtitle}>학생들을 위한 설문조사 플랫폼, Stur-vey</p>
      </div>

      <section className={styles.section}>
        <h2>🎯 Stur-vey란?</h2>
        <p>
          Stur-vey는 학생들이 쉽고 빠르게 설문조사를 만들고 참여할 수 있는 플랫폼입니다.
          학교 생활, 학업, 진로, 취미 등 다양한 주제로 설문을 진행하고 
          실시간으로 결과를 확인할 수 있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>✨ 주요 기능</h2>
        <div className={styles.featureGrid}>
          <div className={styles.feature}>
            <div className={styles.icon}>📝</div>
            <h3>간편한 설문 작성</h3>
            <p>객관식, 복수선택, 주관식 등 다양한 질문 유형으로 설문을 쉽게 만들 수 있습니다.</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.icon}>📊</div>
            <h3>실시간 결과 확인</h3>
            <p>응답이 들어오는 즉시 통계와 차트로 결과를 확인할 수 있습니다.</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.icon}>🔒</div>
            <h3>결과 공개 설정</h3>
            <p>전체 공개, 응답자만 공개, 작성자만 공개 중 선택할 수 있습니다.</p>
          </div>
          <div className={styles.feature}>
            <div className={styles.icon}>⏰</div>
            <h3>마감일 설정</h3>
            <p>설문 기간을 설정하여 효율적으로 응답을 수집할 수 있습니다.</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>🎓 이런 분들께 추천합니다</h2>
        <ul className={styles.targetList}>
          <li>학교 과제로 설문조사가 필요한 학생</li>
          <li>동아리나 학생회에서 의견을 수렴하고 싶은 분</li>
          <li>학급 회의나 행사 준비를 위해 투표가 필요한 분</li>
          <li>진로나 취미에 대한 또래들의 생각이 궁금한 분</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>🚀 시작하기</h2>
        <p>
          간단한 회원가입만으로 바로 설문을 만들고 참여할 수 있습니다.
          카카오, 구글 계정으로 3초 만에 시작하세요!
        </p>
      </section>

      <section className={styles.contact}>
        <h2>📧 문의하기</h2>
        <p>서비스 이용 중 문의사항이 있으시면 언제든 연락주세요.</p>
        <a href="mailto:contact@sturvey.com" className={styles.email}>
          contact@sturvey.com
        </a>
      </section>
    </div>
  );
}
