import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default async function MyPage() {
  const supabase = await createClient();
  
  // 사용자 인증 확인
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // 프로필 정보
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 최근 만든 설문 (최대 3개)
  const { data: recentCreated } = await supabase
    .from('surveys')
    .select('id, title, created_at')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  // 최근 응답한 설문 (최대 3개)
  const { data: recentResponded } = await supabase
    .from('responses')
    .select('created_at, surveys(id, title)')
    .eq('respondent_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>안녕하세요, {profile?.nickname || '사용자'}님!</h1>
        <p className={styles.email}>{user.email}</p>
      </div>

      <div className={styles.menuGrid}>
        <Link href="/my/created" className={styles.menuCard}>
          <div className={styles.menuIcon}>📝</div>
          <h3>내가 만든 설문</h3>
          <p>생성한 설문을 관리하세요</p>
        </Link>

        <Link href="/my/responded" className={styles.menuCard}>
          <div className={styles.menuIcon}>✅</div>
          <h3>응답한 설문</h3>
          <p>참여한 설문을 확인하세요</p>
        </Link>

        <Link href="/my/profile" className={styles.menuCard}>
          <div className={styles.menuIcon}>👤</div>
          <h3>프로필 설정</h3>
          <p>내 정보를 수정하세요</p>
        </Link>
      </div>

    </div>
  );
}