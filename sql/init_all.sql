-- ===================================================================
-- 湾区罗盘 · 完整数据库初始化（Phase 1-3 合并）
-- 包含：记忆锚点表 + 存储桶 + 好友系统 + 用户资料 + RLS + 触发器
-- ===================================================================

-- =========================================================
-- 1. 好友关系表（先建，后续策略会引用）
-- =========================================================
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(requester_id, addressee_id)
);

-- =========================================================
-- 2. 用户资料表
-- =========================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- 3. 记忆锚点表
-- =========================================================
CREATE TABLE IF NOT EXISTS memory_anchors (
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
-- 4. 开启 RLS
-- =========================================================
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_anchors ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 5. friendships 策略
-- =========================================================
DROP POLICY IF EXISTS "View own friendships" ON friendships;
CREATE POLICY "View own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

DROP POLICY IF EXISTS "Create friendship requests" ON friendships;
CREATE POLICY "Create friendship requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Update received friendship requests" ON friendships;
CREATE POLICY "Update received friendship requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = addressee_id);

DROP POLICY IF EXISTS "Delete own friendships" ON friendships;
CREATE POLICY "Delete own friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- =========================================================
-- 6. user_profiles 策略
-- =========================================================
DROP POLICY IF EXISTS "View own profile" ON user_profiles;
CREATE POLICY "View own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "View friends profile" ON user_profiles;
CREATE POLICY "View friends profile"
  ON user_profiles FOR SELECT
  USING (
    auth.uid() IN (
      SELECT requester_id FROM friendships
        WHERE addressee_id = user_profiles.user_id AND status = 'accepted'
      UNION
      SELECT addressee_id FROM friendships
        WHERE requester_id = user_profiles.user_id AND status = 'accepted'
    )
  );

DROP POLICY IF EXISTS "Upsert own profile" ON user_profiles;
CREATE POLICY "Upsert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Update own profile" ON user_profiles;
CREATE POLICY "Update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- =========================================================
-- 7. memory_anchors 策略
-- =========================================================
DROP POLICY IF EXISTS "Users can view own memories" ON memory_anchors;
CREATE POLICY "Users can view own memories"
  ON memory_anchors FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own memories" ON memory_anchors;
CREATE POLICY "Users can insert own memories"
  ON memory_anchors FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own memories" ON memory_anchors;
CREATE POLICY "Users can update own memories"
  ON memory_anchors FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own memories" ON memory_anchors;
CREATE POLICY "Users can delete own memories"
  ON memory_anchors FOR DELETE
  USING (auth.uid() = user_id);

-- 好友当天记忆可见
DROP POLICY IF EXISTS "Users can view friends today memories" ON memory_anchors;
CREATE POLICY "Users can view friends today memories"
  ON memory_anchors FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      author_id IN (
        SELECT requester_id FROM friendships
          WHERE addressee_id = auth.uid() AND status = 'accepted'
        UNION
        SELECT addressee_id FROM friendships
          WHERE requester_id = auth.uid() AND status = 'accepted'
      )
      AND date_key = to_char(NOW() AT TIME ZONE 'Asia/Shanghai', 'YYYY-MM-DD')
    )
  );

-- =========================================================
-- 8. 存储桶（照片 + 语音）
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-photos', 'memory-photos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('memory-voices', 'memory-voices', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS：照片（auth.uid() 需转 text，foldername 取数组第一个元素）
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
-- 5. 自动创建用户资料（注册时触发）
-- =========================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, phone, display_name)
  VALUES (NEW.id, NEW.phone, COALESCE(NEW.phone, 'Anonymous'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =========================================================
-- 6. 索引
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_memory_anchors_date_key ON memory_anchors(date_key);
CREATE INDEX IF NOT EXISTS idx_memory_anchors_author_id ON memory_anchors(author_id);
CREATE INDEX IF NOT EXISTS idx_memory_anchors_user_id ON memory_anchors(user_id);
