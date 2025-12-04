'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import styles from './Header.module.css';
import Button from './Button';

export default function Header() {
  // 나중에 Supabase에서 사용자 정보 가져오기
  const { user, signOut } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* 로고 */}
        <Link href="/" className={styles.logo}>
          <h1>Stur-vey</h1>
        </Link>

        {/* 네비게이션 */}
        <nav className={styles.nav}>
          <Link href="/surveys" className={styles.navLink}>
            설문 목록
          </Link>
          <Link href="/surveys/create" className={styles.navLink}>
            설문 만들기
          </Link>
          <Link href="/my" className={styles.navLink}>
            마이페이지
          </Link>
        </nav>

        {/* 로그인/프로필 */}
        <div className={styles.auth}>
          {user? (
            <div className={styles.userMenu}>
              <Link href="/my">
                <Button variant="secondary" size="small">마이페이지</Button>
              </Link>
              <Button variant="secondary" size="small" onClick={signOut}>
                로그아웃
            </Button>
            </div>
          ) : (
            <Link href="/login" className={styles.loginButton}>
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
