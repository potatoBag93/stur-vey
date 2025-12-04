'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/common/Button';
import styles from './page.module.css';

export default function AdminDashboard({ stats, surveys: initialSurveys, users: initialUsers }) {
  const [activeTab, setActiveTab] = useState('surveys');
  const [surveys, setSurveys] = useState(initialSurveys);
  const [users, setUsers] = useState(initialUsers);

  const handleDeleteSurvey = async (surveyId) => {
    if (!confirm('정말 이 설문을 삭제하시겠습니까?')) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', surveyId);

    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      alert('삭제되었습니다');
      setSurveys(surveys.filter(s => s.id !== surveyId));
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!confirm(`이 사용자를 ${newRole === 'admin' ? '관리자로' : '일반 사용자로'} 변경하시겠습니까?`)) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert('변경 실패: ' + error.message);
    } else {
      alert('권한이 변경되었습니다');
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('정말 이 사용자를 삭제하시겠습니까? (되돌릴 수 없습니다)')) return;

    const supabase = createClient();
    
    // profiles 테이블에서 삭제 (CASCADE로 연결된 데이터도 삭제됨)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      alert('삭제 실패: ' + error.message);
    } else {
      alert('사용자가 삭제되었습니다');
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>관리자 대시보드</h1>

      {/* 통계 카드 */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{stats.totalUsers}</div>
            <div className={styles.statLabel}>전체 사용자</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{stats.totalSurveys}</div>
            <div className={styles.statLabel}>전체 설문</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{stats.activeSurveys}</div>
            <div className={styles.statLabel}>진행중 설문</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>💬</div>
          <div className={styles.statInfo}>
            <div className={styles.statNumber}>{stats.totalResponses}</div>
            <div className={styles.statLabel}>전체 응답</div>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'surveys' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('surveys')}
        >
          설문 관리
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('users')}
        >
          사용자 관리
        </button>
      </div>

      {/* 설문 관리 */}
      {activeTab === 'surveys' && (
        <div className={styles.tableContainer}>
          <h2>최근 설문 목록</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>제목</th>
                <th>작성자</th>
                <th>작성일</th>
                <th>응답수</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map(survey => (
                <tr key={survey.id}>
                  <td>
                    <a href={`/surveys/${survey.id}`} className={styles.link}>
                      {survey.title}
                    </a>
                  </td>
                  <td>{survey.profiles?.nickname || '익명'}</td>
                  <td>{new Date(survey.created_at).toLocaleDateString('ko-KR')}</td>
                  <td>{survey.responses?.[0]?.count || 0}명</td>
                  <td>
                    <span className={`${styles.badge} ${styles[survey.status]}`}>
                      {survey.status === 'published' ? '발행됨' : 
                       survey.status === 'draft' ? '초안' : '비활성'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <a href={`/surveys/${survey.id}`} className={styles.actionBtn}>
                        보기
                      </a>
                      <button 
                        onClick={() => handleDeleteSurvey(survey.id)}
                        className={`${styles.actionBtn} ${styles.danger}`}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 사용자 관리 */}
      {activeTab === 'users' && (
        <div className={styles.tableContainer}>
          <h2>최근 가입 사용자</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>이메일</th>
                <th>닉네임</th>
                <th>학교</th>
                <th>가입일</th>
                <th>권한</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>{user.nickname || '미설정'}</td>
                  <td>{user.school_name || '미설정'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString('ko-KR')}</td>
                  <td>
                    <span className={`${styles.badge} ${user.role === 'admin' ? styles.admin : styles.user}`}>
                      {user.role === 'admin' ? '관리자' : '일반'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleToggleUserRole(user.id, user.role)}
                        className={styles.actionBtn}
                      >
                        {user.role === 'admin' ? '일반으로' : '관리자로'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className={`${styles.actionBtn} ${styles.danger}`}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
