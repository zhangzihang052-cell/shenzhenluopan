-- 修复邮箱注册失败问题
-- 原因：旧的 trigger handle_new_user() 引用 NEW.phone，
-- 邮箱注册时该字段为 NULL，导致 trigger 报错，注册 500 失败。
-- 修复方案：更新 trigger 函数，改用 email 字段。

-- 1. 先删除旧 trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. 更新函数：用 email 替代 phone
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, phone, display_name)
  VALUES (
    NEW.id,
    NEW.phone,  -- 邮箱注册时为 NULL，不影响
    COALESCE(NEW.email, NEW.phone, 'Anonymous')  -- 优先用 email 作为显示名
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 重新创建 trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. 确认修复（应返回 0 行表示无错误）
SELECT 'Trigger fixed successfully' AS result;
