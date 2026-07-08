-- ===== 好友系统邮箱改造 SQL =====
-- 1. 为 user_profiles 表添加 email 列
-- 2. 更新触发器，在用户注册时自动写入 email
-- 3. 确保 friendships 表和 RLS 策略就绪
-- 4. 启用 Realtime（实时通知）

-- ===== Step 1: 添加 email 列 =====
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email text;

-- 创建唯一索引（允许 NULL，但非 NULL 值唯一）
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_email_unique 
ON public.user_profiles (email) 
WHERE email IS NOT NULL;

-- ===== Step 2: 更新触发器函数 =====
-- 删除旧函数
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 创建新函数：同时写入 email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET email = COALESCE(NEW.email, public.user_profiles.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- ===== Step 4: RLS 策略 =====
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- 用户可以查看与自己相关的好友关系
DROP POLICY IF EXISTS "friendships_select_own" ON public.friendships;
CREATE POLICY "friendships_select_own" ON public.friendships
  FOR SELECT USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
  );

-- 用户可以发送好友请求（requester 是自己）
DROP POLICY IF EXISTS "friendships_insert_requester" ON public.friendships;
CREATE POLICY "friendships_insert_requester" ON public.friendships
  FOR INSERT WITH CHECK (requester_id = auth.uid());

-- 用户可以更新发给自己的请求（接受好友请求）
DROP POLICY IF EXISTS "friendships_update_addressee" ON public.friendships;
CREATE POLICY "friendships_update_addressee" ON public.friendships
  FOR UPDATE USING (addressee_id = auth.uid());

-- 用户可以删除与自己相关的好友关系
DROP POLICY IF EXISTS "friendships_delete_own" ON public.friendships;
CREATE POLICY "friendships_delete_own" ON public.friendships
  FOR DELETE USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
  );

-- ===== Step 5: user_profiles RLS =====
-- 用户可以查看自己的 profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.user_profiles;
CREATE POLICY "profiles_select_own" ON public.user_profiles
  FOR SELECT USING (user_id = auth.uid());

-- 用户可以查看其他用户的 profile（用于好友搜索）
DROP POLICY IF EXISTS "profiles_select_all" ON public.user_profiles;
CREATE POLICY "profiles_select_all" ON public.user_profiles
  FOR SELECT USING (true);

-- 用户可以更新自己的 profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.user_profiles;
CREATE POLICY "profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- ===== Step 6: 为已有用户回填 email =====
UPDATE public.user_profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
  AND (p.email IS NULL OR p.email = '');

-- ===== Step 7: 启用 Realtime =====
-- 将 friendships 表加入 Supabase Realtime，实现好友请求实时通知
ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;

-- ===== 完成 =====
-- 执行完毕后，好友系统将：
-- 1. 支持通过邮箱搜索添加好友
-- 2. 收到好友请求时实时通知（红点 + Toast）
-- 3. 对方接受请求时实时通知
