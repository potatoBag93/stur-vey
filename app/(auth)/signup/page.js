'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import styles from './page.module.css';
import Link from 'next/link';

export default function SignupPage() {
  const { user, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    const { data, error } = await signUpWithEmail(email, password);

    if (error) {
      alert('회원가입 실패: ' + error.message);
    } else if (data.user) {
      // Assuming a successful signup immediately logs the user in,
      // or at least creates the user account and we can redirect to login.
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.signupBox}>
        <div className={styles.logo}>
          <Link href="/" passHref>
            <h1>Stur-vey</h1>
          </Link>
          <p>학생 설문조사 플랫폼</p>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.signupForm}>
          <h2>회원가입</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className={styles.inputGroup}>
              <label htmlFor="email">이메일 *</label>
              <input
                id="email"
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">비밀번호 *</label>
              <input
                id="password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">비밀번호 확인 *</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" size="large" disabled={loading} fullWidth>
              {loading ? '회원가입 중...' : '회원가입'}
            </Button>
          </form>
          <p className={styles.info}>
            이미 계정이 있으신가요?
            <Link href="/login" className={styles.link}>
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}