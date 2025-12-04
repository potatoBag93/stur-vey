import styles from './page.module.css';

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>이용약관</h1>
      <p className={styles.updated}>최종 수정일: 2025년 12월 3일</p>

      <section className={styles.section}>
        <h2>제1조 (목적)</h2>
        <p>
          본 약관은 Stur-vey(이하 "서비스")가 제공하는 설문조사 플랫폼 서비스의 이용과 관련하여 
          회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>제2조 (정의)</h2>
        <ol>
          <li>"서비스"란 Stur-vey가 제공하는 설문조사 작성, 배포, 응답, 결과 분석 등의 기능을 말합니다.</li>
          <li>"회원"이란 본 약관에 동의하고 서비스에 가입하여 서비스를 이용하는 자를 말합니다.</li>
          <li>"설문"이란 회원이 서비스를 통해 작성하고 배포하는 질문지를 말합니다.</li>
          <li>"응답"이란 회원이 다른 회원의 설문에 제출하는 답변을 말합니다.</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>제3조 (약관의 효력 및 변경)</h2>
        <ol>
          <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.</li>
          <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있습니다.</li>
          <li>약관이 변경되는 경우 변경 사항은 시행일로부터 최소 7일 전에 공지됩니다.</li>
          <li>회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>제4조 (회원가입)</h2>
        <ol>
          <li>회원가입은 이용자가 본 약관에 동의하고 회사가 정한 가입 양식에 따라 정보를 입력하여 신청합니다.</li>
          <li>회사는 다음 각 호에 해당하는 경우 회원가입을 거부할 수 있습니다:
            <ul>
              <li>타인의 명의를 도용한 경우</li>
              <li>허위 정보를 기재한 경우</li>
              <li>만 14세 미만인 경우 (법정대리인 동의 없이)</li>
              <li>기타 회원으로 등록하는 것이 서비스의 기술상 현저히 지장이 있다고 판단되는 경우</li>
            </ul>
          </li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>제5조 (서비스의 제공 및 변경)</h2>
        <ol>
          <li>서비스는 연중무휴 1일 24시간 제공함을 원칙으로 합니다.</li>
          <li>회사는 시스템 점검, 보수, 교체 등 필요한 경우 서비스 제공을 일시적으로 중단할 수 있습니다.</li>
          <li>회사는 서비스의 내용, 품질 개선을 위해 서비스를 변경할 수 있으며, 변경 시 사전 공지합니다.</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>제6조 (회원의 의무)</h2>
        <ol>
          <li>회원은 다음 행위를 하여서는 안 됩니다:
            <ul>
              <li>타인의 정보 도용</li>
              <li>허위 내용의 설문 작성 및 배포</li>
              <li>음란물, 욕설, 차별적 내용 등이 포함된 설문 작성</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>다른 회원의 개인정보 수집 및 악용</li>
              <li>상업적 광고 및 스팸 설문 배포</li>
            </ul>
          </li>
          <li>회원은 본 약관 및 관련 법령을 준수해야 합니다.</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>제7조 (설문 및 응답 데이터)</h2>
        <ol>
          <li>회원이 작성한 설문의 저작권은 해당 회원에게 있습니다.</li>
          <li>응답 데이터는 설문 작성자가 설정한 공개 범위에 따라 열람할 수 있습니다.</li>
          <li>회사는 서비스 개선 및 통계 목적으로 익명화된 데이터를 활용할 수 있습니다.</li>
          <li>회원은 마감일 이전까지 작성한 설문을 수정하거나 삭제할 수 있습니다.</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>제8조 (서비스 이용 제한)</h2>
        <ol>
          <li>회사는 회원이 본 약관을 위반한 경우 다음과 같이 서비스 이용을 제한할 수 있습니다:
            <ul>
              <li>경고</li>
              <li>일시적 이용 정지 (1주일 ~ 1개월)</li>
              <li>영구 이용 정지 (회원 자격 박탈)</li>
            </ul>
          </li>
          <li>이용 제한 시 회원에게 사전 통지하며, 회원은 이에 대해 이의를 제기할 수 있습니다.</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>제9조 (책임의 제한)</h2>
        <ol>
          <li>회사는 천재지변, 전쟁, 시스템 장애 등 불가항력으로 인해 서비스를 제공할 수 없는 경우 책임이 면제됩니다.</li>
          <li>회사는 회원 간 또는 회원과 제3자 간의 거래나 분쟁에 대해 책임지지 않습니다.</li>
          <li>회사는 회원이 작성한 설문의 내용에 대해 책임지지 않으며, 저작권 침해나 명예훼손 등의 문제는 작성자에게 있습니다.</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>제10조 (탈퇴 및 자격 상실)</h2>
        <ol>
          <li>회원은 언제든지 서비스 내 설정 메뉴를 통해 탈퇴를 요청할 수 있습니다.</li>
          <li>탈퇴 시 회원의 모든 데이터는 삭제되며, 복구할 수 없습니다.</li>
          <li>단, 법령에 따라 보관이 필요한 정보는 일정 기간 보관 후 삭제됩니다.</li>
        </ol>
      </section>

      <section className={styles.section}>
        <h2>제11조 (분쟁 해결)</h2>
        <ol>
          <li>서비스 이용과 관련한 분쟁은 회사와 회원 간의 협의를 통해 해결함을 원칙으로 합니다.</li>
          <li>협의가 이루어지지 않을 경우 대한민국 법령에 따라 관할 법원에서 해결합니다.</li>
        </ol>
      </section>

      <div className={styles.footer}>
        <p>본 약관은 2025년 12월 3일부터 시행됩니다.</p>
        <p>문의: contact@sturvey.com</p>
      </div>
    </div>
  );
}
