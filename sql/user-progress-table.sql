-- 用户进度云端同步表
-- 每个用户的副本通关进度、成就、想去标记都存在这里，按 user_id 隔离

CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  progress JSONB NOT NULL DEFAULT '{"completed":{},"achievements":[]}'::jsonb,
  want_to_visit JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS：用户只能读写自己的数据
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_progress" ON public.user_progress;
CREATE POLICY "users_read_own_progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_write_own_progress" ON public.user_progress;
CREATE POLICY "users_write_own_progress" ON public.user_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 更新时间触发器
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

SELECT 'user_progress table created successfully' AS status;
