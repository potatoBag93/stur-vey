-- ====================================
-- Stur-vey 프로필 자동 생성 트리거 수정
-- ====================================

-- 1. 기존 트리거 삭제 (있다면)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 기존 함수 삭제 (있다면)
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. 새로운 함수 생성 (Google OAuth 메타데이터 처리 개선)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, school_name, avatar_url)
  VALUES (
    NEW.id,
    -- Google: full_name 또는 name, Kakao: nickname, 없으면 이메일 앞부분 또는 '익명'
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'nickname',
      SPLIT_PART(NEW.email, '@', 1),
      '익명'
    ),
    '', -- school_name은 나중에 프로필 페이지에서 입력
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture' -- Google uses 'picture'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. 기존 사용자들의 프로필 생성 (이미 가입했지만 프로필이 없는 경우)
INSERT INTO public.profiles (id, nickname, school_name, avatar_url)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'nickname',
    SPLIT_PART(u.email, '@', 1),
    '익명'
  ),
  '',
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  )
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- 6. 확인 쿼리
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.nickname,
  p.school_name,
  p.avatar_url,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;
