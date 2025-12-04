import { createClient } from '@/lib/supabase/server';

export default async function TestPage() {
  const supabase = await createClient();
  
  // 테스트 쿼리
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  return (
    <div>
      <h1>Supabase 연결 테스트</h1>
      {error ? (
        <p style={{ color: 'red' }}>에러: {error.message}</p>
      ) : (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      )}
    </div>
  );
}