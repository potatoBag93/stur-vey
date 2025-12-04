'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import styles from './page.module.css';

export default function MyProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [nickname, setNickname] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setNickname(data.nickname || '');
      setSchoolName(data.school_name || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        nickname,
        school_name: schoolName,
      })
      .eq('id', user.id);

    if (error) {
      alert('저장 실패: ' + error.message);
    } else {
      alert('프로필이 업데이트되었습니다');
      setIsEditing(false);
      loadProfile();
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setNickname(profile.nickname || '');
    setSchoolName(profile.school_name || '');
    setIsEditing(false);
  };

  if (loading) {
    return <LoadingSpinner fullPage message="프로필 정보를 불러오는 중..."/>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileBox}>
        <h1 className={styles.title}>내 프로필</h1>
        
        <div className={styles.profileInfo}>
          <div className={styles.infoItem}>
            <label>이메일</label>
            <p>{user?.email}</p>
          </div>

          <div className={styles.infoItem}>
            <label>닉네임</label>
            {isEditing ? (
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                className={styles.input}
              />
            ) : (
              <p>{profile?.nickname || '미설정'}</p>
            )}
          </div>

          <div className={styles.infoItem}>
            <label>학교명</label>
            {isEditing ? (
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                maxLength={50}
                className={styles.input}
              />
            ) : (
              <p>{profile?.school_name || '미설정'}</p>
            )}
          </div>

          <div className={styles.infoItem}>
            <label>가입일</label>
            <p>{new Date(profile?.created_at).toLocaleDateString('ko-KR')}</p>
          </div>
        </div>

        <div className={styles.buttonGroup}>
          {isEditing ? (
            <>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                취소
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              프로필 수정
            </Button>
          )}
        </div>
      </div>

      {/* 통계 정보 */}
      <ProfileStats userId={user?.id} />
    </div>
  );
}

function ProfileStats({ userId }) {
  const [stats, setStats] = useState({ created: 0, responded: 0 });

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    const supabase = createClient();

    // 내가 만든 설문 수
    const { count: createdCount } = await supabase
      .from('surveys')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', userId);

    // 내가 응답한 설문 수
    const { count: respondedCount } = await supabase
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('respondent_id', userId);

    setStats({
      created: createdCount || 0,
      responded: respondedCount || 0,
    });
  };

  return (
    <div className={styles.statsBox}>
      <h2>활동 통계</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{stats.created}</span>
          <span className={styles.statLabel}>만든 설문</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{stats.responded}</span>
          <span className={styles.statLabel}>응답한 설문</span>
        </div>
      </div>
    </div>
  );
}