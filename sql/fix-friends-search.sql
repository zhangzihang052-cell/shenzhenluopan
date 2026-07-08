-- ===== 彻底修复好友邮箱搜索 =====
-- 解决问题：user_profiles 表缺少 email 列，或触发器未写入 email
-- 执行后：好友搜索、添加、通知全部恢复正常

-- ===== Step 1: 确保 email 列存在 =====
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email text;

-- 创建唯一索引（允许 NULL，但非 NULL 值唯一）
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_email_unique 
ON public.user_profiles (email) 
WHERE email IS NOT NULL;

-- ===== Step 2: 重建触发器函数（写入 email）=====
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, display_name, created_at)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.email, 'Anonymous'), NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET 
    email = COALESCE(NEW.email, public.user_profiles.email),
    display_name = COALESCE(public.user_profiles.display_name, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 重建触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== Step 3: 确保 friendships 表存在 =====
CREATE TABLE IF NOT EXISTS public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  accepted_at timestamptz,
  UNIQUE(requester_id, addressee_id)
);

-- ===== Step 4: friendships RLS =====
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "friendships_select_own" ON public.friendships;
CREATE POLICY "friendships_select_own" ON public.friendships
  FOR SELECT USING (requester_id = auth.uid() OR addressee_id = auth.uid());

DROP POLICY IF EXISTS "friendships_insert_requester" ON public.friendships;
CREATE POLICY "friendships_insert_requester" ON public.friendships
  FOR INSERT WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "friendships_update_addressee" ON public.friendships;
CREATE POLICY "friendships_update_addressee" ON public.friendships
  FOR UPDATE USING (addressee_id = auth.uid());

DROP POLICY IF EXISTS "friendships_delete_own" ON public.friendships;
CREATE POLICY "friendships_delete_own" ON public.friendships
  FOR DELETE USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- ===== Step 5: user_profiles RLS =====
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 删除可能冲突的旧策略
DROP POLICY IF EXISTS "anon_all_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_select_all" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.user_profiles;

-- 所有人可查看 profile（好友搜索需要）
CREATE POLICY "profiles_select_all" ON public.user_profiles
  FOR SELECT USING (true);

-- 用户可更新自己的 profile
CREATE POLICY "profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- ===== Step 6: 为所有已有用户回填 email =====
UPDATE public.user_profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
  AND (p.email IS NULL OR p.email = '');

-- ===== Step 7: 验证回填结果 =====
SELECT user_id, email, display_name FROM public.user_profiles LIMIT 10;

-- ===== Step 8: 启用 Realtime =====
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;

-- ===== 完成 =====
