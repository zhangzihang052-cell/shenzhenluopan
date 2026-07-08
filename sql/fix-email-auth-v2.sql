-- 彻底修复邮箱注册 500 错误
-- 步骤1: 删除 auth.users 上所有自定义 trigger
-- 步骤2: 删除有问题的函数
-- 步骤3: 重建一个安全的版本

-- ===== 1. 删除所有自定义 trigger =====
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;

-- ===== 2. 删除旧函数（所有 schema 下的同名函数）=====
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- ===== 3. 检查 user_profiles 表结构是否正确 =====
-- 如果表不存在就创建（确保 phone 可为 NULL）
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY,
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 确保 phone 列允许 NULL（如果之前被设为 NOT NULL）
ALTER TABLE public.user_profiles ALTER COLUMN phone DROP NOT NULL;

-- ===== 4. 创建安全的 trigger 函数 =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.email, 'Anonymous'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ===== 5. 重新创建 trigger =====
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== 6. 确认 =====
SELECT 'Fix applied successfully' AS status;
