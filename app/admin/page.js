import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { checkAdmin } from '@/lib/checkAdmin';
import AdminDashboard from './AdminDashboard';
import styles from './page.module.css';

export default async function AdminPage() {
  // 관리자 권한 확인
  const isAdmin = await checkAdmin();
  
  if (!isAdmin) {
    redirect('/');
  }

  const supabase = await createClient();

  // 통계 데이터 수집
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalSurveys } = await supabase
    .from('surveys')
    .select('*', { count: 'exact', head: true });

  const { count: activeSurveys } = await supabase
    .from('surveys')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  const { count: totalResponses } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true });

  // 최근 설문 목록
  const { data: recentSurveys } = await supabase
    .from('surveys')
    .select(`
      id,
      title,
      creator_id,
      created_at,
      status,
      profiles:creator_id (nickname),
      responses (count)
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  // 최근 가입 사용자
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, nickname, school_name, created_at, role')
    .order('created_at', { ascending: false })
    .limit(10);

  const stats = {
    totalUsers: totalUsers || 0,
    totalSurveys: totalSurveys || 0,
    activeSurveys: activeSurveys || 0,
    totalResponses: totalResponses || 0,
  };

  return (
    <AdminDashboard 
      stats={stats}
      surveys={recentSurveys || []}
      users={recentUsers || []}
    />
  );
}
