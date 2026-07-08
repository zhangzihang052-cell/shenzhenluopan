-- ===================================================================
-- 湾区罗盘 · 完整数据库初始化（Phase 1-3 合并 + 好友邮箱修复 + 用户进度表）
-- 包含：好友关系 + 用户资料(含email) + 用户进度 + 记忆锚点 + 存储桶 + RLS + 触发器 + Realtime
-- 一次执行即可完成全部建表，无需再跑 fix-friends-*.sql 或 user-progress-table.sql
-- ===================================================================

-- =========================================================
-- 1. 好友关系表
-- =========================================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(requester_id, addressee_id)
);

-- =========================================================
-- 2. 用户资料表（含 email 列，好友搜索依赖）
-- =========================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- email 唯一索引（允许 NULL，非 NULL 值唯一）
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_email_unique
ON public.user_profiles (email)
WHERE email IS NOT NULL;

-- =========================================================
-- 3. 用户进度表（副本通关进度 + 想去标记，按 user_id 隔离）
-- =========================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  progress JSONB NOT NULL DEFAULT '{"completed":{},"achievements":[]}'::jsonb,
  want_to_visit JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 4. 记忆锚点表
-- =========================================================
CREATE TABLE IF NOT EXISTS public.memory_anchors (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  media_type TEXT DEFAULT 'photo',
  photo_url TEXT,
  voice_url TEXT,
  note TEXT DEFAULT '',
  date_key TEXT,
  author_id UUID,
  author_name TEXT DEFAULT '',
  linked_anchor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 5. 开启 RLS
-- =========================================================
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_anchors ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 6. friendships RLS 策略
-- =========================================================
DROP POLICY IF EXISTS "friendships_select_own" ON public.friendships;
DROP POLICY IF EXISTS "View own friendships" ON public.friendships;
CREATE POLICY "friendships_select_own" ON public.friendships
  FOR SELECT USING (requester_id = auth.uid() OR addressee_id = auth.uid());

DROP POLICY IF EXISTS "friendships_insert_requester" ON public.friendships;
DROP POLICY IF EXISTS "Create friendship requests" ON public.friendships;
CREATE POLICY "friendships_insert_requester" ON public.friendships
  FOR INSERT WITH CHECK (requester_id = auth.uid());

DROP POLICY IF EXISTS "friendships_update_addressee" ON public.friendships;
DROP POLICY IF EXISTS "Update received friendship requests" ON public.friendships;
CREATE POLICY "friendships_update_addressee" ON public.friendships
  FOR UPDATE USING (addressee_id = auth.uid());

DROP POLICY IF EXISTS "friendships_delete_own" ON public.friendships;
DROP POLICY IF EXISTS "Delete own friendships" ON public.friendships;
CREATE POLICY "friendships_delete_own" ON public.friendships
  FOR DELETE USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- =========================================================
-- 7. user_profiles RLS 策略
-- =========================================================
-- 所有人可查看 profile（好友搜索需要）
DROP POLICY IF EXISTS "profiles_select_all" ON public.user_profiles;
DROP POLICY IF EXISTS "View own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "View friends profile" ON public.user_profiles;
CREATE POLICY "profiles_select_all" ON public.user_profiles
  FOR SELECT USING (true);

-- 用户可插入自己的 profile
DROP POLICY IF EXISTS "profiles_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "Upsert own profile" ON public.user_profiles;
CREATE POLICY "profiles_insert_own" ON public.user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- 用户可更新自己的 profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.user_profiles;
CREATE POLICY "profiles_update_own" ON public.user_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- =========================================================
-- 8. user_progress RLS 策略
-- =========================================================
DROP POLICY IF EXISTS "users_read_own_progress" ON public.user_progress;
CREATE POLICY "users_read_own_progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_write_own_progress" ON public.user_progress;
CREATE POLICY "users_write_own_progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========================================================
-- 9. memory_anchors RLS 策略
-- =========================================================
DROP POLICY IF EXISTS "Users can view own memories" ON public.memory_anchors;
CREATE POLICY "Users can view own memories"
  ON public.memory_anchors FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own memories" ON public.memory_anchors;
CREATE POLICY "Users can insert own memories"
  ON public.memory_anchors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own memories" ON public.memory_anchors;
CREATE POLICY "Users can update own memories"
  ON public.memory_anchors FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own memories" ON public.memory_anchors;
CREATE POLICY "Users can delete own memories"
  ON public.memory_anchors FOR DELETE
  USING (auth.uid() = user_id);

-- 好友当天记忆可见
DROP POLICY IF EXISTS "Users can view friends today memories" ON public.memory_anchors;
CREATE POLICY "Users can view friends today memories"
  ON public.memory_anchors FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      author_id IN (
        SELECT requester_id FROM public.friendships
          WHERE addressee_id = auth.uid() AND status = 'accepted'
        UNION
        SELECT addressee_id FROM public.friendships
          WHERE requester_id = auth.uid() AND status = 'accepted'
      )
      AND date_key = to_char(NOW() AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD')
    )
  );

-- =========================================================
-- 10. 存储桶（照片 + 语音）
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-photos', 'memory-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-voices', 'memory-voices', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS：照片
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'memory-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view all photos" ON storage.objects;
CREATE POLICY "Users can view all photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memory-photos');

DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'memory-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage RLS：语音
DROP POLICY IF EXISTS "Users can upload own voices" ON storage.objects;
CREATE POLICY "Users can upload own voices"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'memory-voices' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view all voices" ON storage.objects;
CREATE POLICY "Users can view all voices"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memory-voices');

DROP POLICY IF EXISTS "Users can delete own voices" ON storage.objects;
CREATE POLICY "Users can delete own voices"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'memory-voices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =========================================================
-- 11. 触发器：注册时自动创建用户资料（含 email）
-- =========================================================
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 12. user_progress 更新时间触发器
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_user_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_progress_update ON public.user_progress;
CREATE TRIGGER on_user_progress_update
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_user_progress_timestamp();

-- =========================================================
-- 13. 为已有用户回填 email
-- =========================================================
UPDATE public.user_profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
  AND (p.email IS NULL OR p.email = '');

-- =========================================================
-- 14. 索引
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON public.friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON public.friendships(addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_memory_anchors_date_key ON public.memory_anchors(date_key);
CREATE INDEX IF NOT EXISTS idx_memory_anchors_author_id ON public.memory_anchors(author_id);
CREATE INDEX IF NOT EXISTS idx_memory_anchors_user_id ON public.memory_anchors(user_id);

-- =========================================================
-- 15. 启用 Realtime（好友请求实时通知）
-- =========================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- =========================================================
-- 完成
-- =========================================================
SELECT 'init_all.sql executed successfully' AS status;
