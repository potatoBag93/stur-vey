import styles from './page.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>개인정보처리방침</h1>
      <p className={styles.updated}>최종 수정일: 2025년 12월 3일</p>

      <section className={styles.section}>
        <h2>1. 개인정보의 수집 및 이용 목적</h2>
        <p>
          Stur-vey(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다. 
          처리하는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 
          이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행합니다.
        </p>
        <ul>
          <li>회원 가입 및 관리: 회원 식별, 본인 확인, 부정 이용 방지</li>
          <li>서비스 제공: 설문 작성, 배포, 응답, 결과 분석 기능 제공</li>
          <li>서비스 개선: 이용 통계 분석, 맞춤형 서비스 제공</li>
          <li>고객 지원: 문의 응대, 공지사항 전달</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>2. 수집하는 개인정보 항목</h2>
        
        <h3>필수 항목</h3>
        <ul>
          <li><strong>회원가입 시:</strong> 이메일 주소, 비밀번호 (이메일 가입 시)</li>
          <li><strong>소셜 로그인 시:</strong> 소셜 계정 정보 (카카오, 구글)</li>
          <li><strong>프로필 정보:</strong> 닉네임, 학교명</li>
        </ul>

        <h3>선택 항목</h3>
        <ul>
          <li>프로필 사진, 자기소개</li>
        </ul>

        <h3>자동 수집 항목</h3>
        <ul>
          <li>서비스 이용 기록, IP 주소, 쿠키, 접속 로그</li>
          <li>기기 정보 (OS, 브라우저 종류)</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>3. 개인정보의 보유 및 이용 기간</h2>
        <p>
          회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시 
          동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
        </p>
        
        <h3>회원 정보</h3>
        <ul>
          <li>보유 기간: 회원 탈퇴 시까지</li>
          <li>탈퇴 후 즉시 삭제 (단, 아래 법령에 따른 보관 정보 제외)</li>
        </ul>

        <h3>법령에 따른 보관</h3>
        <ul>
          <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
          <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
          <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
          <li>로그인 기록: 3개월 (통신비밀보호법)</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>4. 개인정보의 제3자 제공</h2>
        <p>
          회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 
          다만, 다음의 경우에는 예외로 합니다:
        </p>
        <ul>
          <li>이용자가 사전에 동의한 경우</li>
          <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
        </ul>

        <h3>소셜 로그인 제공자</h3>
        <ul>
          <li><strong>카카오:</strong> 사용자 식별자, 이메일 (선택)</li>
          <li><strong>구글:</strong> 사용자 식별자, 이메일</li>
        </ul>
        <p className={styles.note}>
          * 소셜 로그인 사용 시 해당 서비스의 개인정보처리방침이 적용됩니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. 개인정보 처리의 위탁</h2>
        <p>회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다:</p>
        
        <table className={styles.table}>
          <thead>
            <tr>
              <th>수탁업체</th>
              <th>위탁 업무 내용</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Supabase (미국)</td>
              <td>데이터베이스 관리, 사용자 인증</td>
            </tr>
            <tr>
              <td>Vercel (미국)</td>
              <td>서비스 호스팅</td>
            </tr>
          </tbody>
        </table>

        <p>
          회사는 위탁계약 체결 시 개인정보보호법에 따라 위탁업무 수행목적 외 개인정보 처리금지, 
          기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독 등을 규정하고 있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. 정보주체의 권리·의무 및 행사방법</h2>
        <p>이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:</p>
        <ul>
          <li>개인정보 열람 요구</li>
          <li>개인정보 정정·삭제 요구</li>
          <li>개인정보 처리 정지 요구</li>
          <li>회원 탈퇴 (동의 철회)</li>
        </ul>
        <p>
          권리 행사는 서비스 내 '마이페이지 {'>'} 프로필 설정' 또는 
          개인정보보호 담당자에게 이메일(contact@sturvey.com)로 요청하실 수 있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. 개인정보의 파기</h2>
        <p>
          회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 
          지체 없이 해당 개인정보를 파기합니다.
        </p>
        
        <h3>파기 절차</h3>
        <p>
          이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류) 
          내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 파기됩니다.
        </p>

        <h3>파기 방법</h3>
        <ul>
          <li>전자적 파일 형태: 복구 불가능한 방법으로 영구 삭제</li>
          <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>8. 개인정보 자동 수집 장치의 설치·운영 및 거부</h2>
        <p>
          회사는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 이용 정보를 저장하고 
          수시로 불러오는 '쿠키(cookie)'를 사용합니다.
        </p>
        
        <h3>쿠키의 사용 목적</h3>
        <ul>
          <li>로그인 상태 유지</li>
          <li>이용자의 서비스 이용 패턴 분석</li>
          <li>맞춤형 서비스 제공</li>
        </ul>

        <h3>쿠키 설정 거부 방법</h3>
        <p>
          이용자는 웹 브라우저의 옵션을 설정함으로써 모든 쿠키를 허용하거나, 
          쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
        </p>
        <p className={styles.note}>
          * 단, 쿠키 설정을 거부하는 경우 일부 서비스 이용에 어려움이 있을 수 있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. 개인정보 보호책임자</h2>
        <p>
          회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 
          개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제를 위하여 
          아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
        </p>
        
        <div className={styles.contact}>
          <h3>개인정보 보호책임자</h3>
          <ul>
            <li>담당자: Stur-vey 운영팀</li>
            <li>이메일: contact@sturvey.com</li>
            <li>처리기한: 접수 후 7일 이내</li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2>10. 개인정보 처리방침 변경</h2>
        <p>
          본 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 
          삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2>11. 개인정보의 안전성 확보 조치</h2>
        <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
        <ul>
          <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육</li>
          <li>기술적 조치: 개인정보처리시스템 접근권한 관리, 고유식별정보 암호화, 보안프로그램 설치</li>
          <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
        </ul>
      </section>

      <div className={styles.footer}>
        <p>본 개인정보처리방침은 2025년 12월 3일부터 시행됩니다.</p>
        <p>문의: contact@sturvey.com</p>
      </div>
    </div>
  );
}
