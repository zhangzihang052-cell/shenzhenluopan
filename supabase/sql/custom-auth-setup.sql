-- ===== 湾区罗盘 自建OTP认证系统 SQL =====
-- 在 Supabase SQL Editor 中执行此脚本

-- 1. 创建用户表（自建用户系统，不依赖 Supabase Auth）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 创建验证码表
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 为验证码表添加索引（按手机号查询最新验证码）
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON public.otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_used ON public.otp_codes(phone, used);

-- 4. 确保现有表存在（如果之前已创建则跳过）
CREATE TABLE IF NOT EXISTS public.memory_anchors (
  id TEXT PRIMARY KEY,
  user_id UUID,
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

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY,
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(requester_id, addressee_id)
);

-- 5. 关闭 RLS（自建认证系统不使用 Supabase Auth，RLS 无法用 auth.uid()）
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- 6. 创建宽松策略（允许 anon 角色访问，安全性由前端逻辑控制）
-- 对于演示项目，这是可接受的方案
DROP POLICY IF EXISTS "anon_all_users" ON public.users;
CREATE POLICY "anon_all_users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_otp" ON public.otp_codes;
CREATE POLICY "anon_all_otp" ON public.otp_codes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_memory" ON public.memory_anchors;
CREATE POLICY "anon_all_memory" ON public.memory_anchors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_profiles" ON public.user_profiles;
CREATE POLICY "anon_all_profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_friendships" ON public.friendships;
CREATE POLICY "anon_all_friendships" ON public.friendships FOR ALL USING (true) WITH CHECK (true);

-- 7. 创建触发器：新用户注册时自动创建 user_profiles 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, phone, display_name)
  VALUES (NEW.id, NEW.phone, NULL)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. 启用 Storage bucket（如果不存在）
INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-photos', 'memory-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-voices', 'memory-voices', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Storage RLS 策略
DROP POLICY IF EXISTS "anon_all_storage_photos" ON storage.objects;
CREATE POLICY "anon_all_storage_photos" ON storage.objects
  FOR ALL USING (bucket_id IN ('memory-photos', 'memory-voices'))
  WITH CHECK (bucket_id IN ('memory-photos', 'memory-voices'));
