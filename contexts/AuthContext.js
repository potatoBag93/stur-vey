'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // 현재 사용자 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        //언제 실행되나?✅ 로그인 성공 → event: 'SIGNED_IN'
        // ✅ 로그아웃 → event: 'SIGNED_OUT'
        //토큰 갱신 → event: 'TOKEN_REFRESHED'
        //✅ 세션 만료 → event: 'USER_DELETED'
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    // 컴포넌트 언마운트 시 감시 중단
    return () => subscription.unsubscribe();
  }, []);

  const signInWithKakao = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) console.error('카카오 로그인 에러:', error);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) console.error('구글 로그인 에러:', error);
  };

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) console.error('이메일 로그인 에러:', error);
    return { data, error };
  };

  const signUpWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) console.error('회원가입 에러:', error);
    return { data, error };
  };

  const resendSignUpConfirmation = async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) console.error('확인 이메일 재전송 에러:', error);
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('로그아웃 에러:', error);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithKakao, signInWithGoogle, signInWithEmail, signUpWithEmail, resendSignUpConfirmation, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
