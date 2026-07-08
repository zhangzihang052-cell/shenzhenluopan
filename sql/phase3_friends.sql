-- ===================================================================
-- 湾区罗盘 · Phase 3 好友系统数据库迁移
-- 执行方式：在 Supabase Dashboard → SQL Editor 中运行此文件
-- ===================================================================

-- 1. 好友关系表
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(requester_id, addressee_id)
);

-- 2. 用户昵称表（补充 auth.users 不支持直接写入的问题）
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS 策略：好友关系表
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- 用户可以看到与自己相关的好友记录
CREATE POLICY "View own friendships"
  ON friendships FOR SELECT
  USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

-- 用户可以发起好友请求（作为 requester）
CREATE POLICY "Create friendship requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- 用户可以更新自己作为 addressee 的好友状态（接受/拒绝）
CREATE POLICY "Update received friendship requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = addressee_id);

-- 用户可以删除自己的好友关系
CREATE POLICY "Delete own friendships"
  ON friendships FOR DELETE
  USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

-- 4. RLS 策略：用户昵称表
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户可以读取自己的资料
CREATE POLICY "View own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入/更新自己的资料
CREATE POLICY "Upsert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. 好友记忆可见性 RLS 策略（更新 memory_anchors 表）
-- 注意：如果 memory_anchors 已有 RLS，需先 DROP 旧策略再创建
DROP POLICY IF EXISTS "Users can view own and friends' today memories" ON memory_anchors;

CREATE POLICY "Users can view own and friends' today memories"
  ON memory_anchors FOR SELECT
  USING (
    -- 自己的记忆，永久可见
    auth.uid() = user_id
    OR (
      -- 好友的记忆，仅当天可见（Asia/Shanghai 时区）
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

-- 6. 自动维护 user_profiles：用户首次登录时自动插入资料行
-- 通过 trigger 在 auth.users 插入时自动创建 user_profiles 行
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

-- 7. 索引优化
CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id, status);
CREATE INDEX IF NOT EXISTS idx_memory_anchors_date_key ON memory_anchors(date_key);
CREATE INDEX IF NOT EXISTS idx_memory_anchors_author_id ON memory_anchors(author_id);
