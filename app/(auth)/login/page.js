'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import styles from './page.module.css';
import Link from 'next/link';

export default function LoginPage() {
  const { user, signInWithGoogle, signInWithEmail, resendSignUpConfirmation } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowResend(false); // Reset on new login attempt

    const { error } = await signInWithEmail(email, password);

    if (error) {
      if (error.message === 'Email not confirmed') {
        setShowResend(true);
        alert('이메일 인증이 필요합니다. 전송된 이메일의 확인 링크를 클릭해주세요.');
      } else {
        alert('로그인 실패: ' + error.message);
      }
    }
    setLoading(false);
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    const { error } = await resendSignUpConfirmation(email);
    if (error) {
      alert('이메일 재전송 실패: ' + error.message);
    } else {
      alert('확인 이메일을 다시 전송했습니다. 이메일함을 확인해주세요.');
      setShowResend(false);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.logo}>
          <Link href="/" passHref>
            <h1>Stur-vey</h1>
          </Link>
          <p>학생 설문조사 플랫폼</p>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.loginForm}>
          <h2>로그인</h2>
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className={styles.inputGroup}>
              <input 
                type="email" 
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input 
                type="password" 
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} fullWidth>
              {loading && !showResend ? '로그인 중...' : '이메일로 로그인'}
            </Button>
          </form>
          
          {showResend && (
            <div className={styles.resendContainer}>
              <p>이메일을 받지 못하셨나요?</p>
              <Button onClick={handleResendConfirmation} disabled={loading} variant="link">
                {loading ? '전송 중...' : '확인 이메일 재전송'}
              </Button>
            </div>
          )}

          <div className={styles.separator}>
            <span>또는</span>
          </div>

          <Button onClick={signInWithGoogle} variant="secondary" fullWidth>
            Google로 로그인
          </Button>

          <p className={styles.info}>
            계정이 없으신가요? 
            <Link href="/signup" className={styles.link}>
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}