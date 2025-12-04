import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <h3>Stur-vey</h3>
          <p>학생 설문조사 플랫폼</p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4>서비스</h4>
            <Link href="/surveys">설문 목록</Link>
            <Link href="/surveys/create">설문 만들기</Link>
            <Link href="/my">마이페이지</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4>정보</h4>
            <Link href="/about">서비스 소개</Link>
            <Link href="/terms">이용약관</Link>
            <Link href="/privacy">개인정보처리방침</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4>문의</h4>
            <a href="mailto:contact@sturvey.com">contact@sturvey.com</a>
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        <p>&copy; 2025 Stur-vey. All rights reserved.</p>
      </div>
    </footer>
  );
}
