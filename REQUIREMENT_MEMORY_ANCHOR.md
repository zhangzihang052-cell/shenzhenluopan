# 湾区罗盘 · 新增功能需求文档

**版本**: v1.0 Draft
**日期**: 2026-07-03
**功能范围**: 私人记忆锚点 + 用户登录账户系统

---

## 一、功能概述

在现有「官方文化地图」（64 锚点 / 副本 / 印章册 / 路线规划，全部 PGC）之上，新增一层**用户私人记忆**：用户可以在地图上钉下属于自己的记忆锚点（一张照片 + 一个坐标 + 一句话），默认仅自己可见。配套引入轻量账户系统（Supabase），实现跨设备同步与云端持久化，同时保持访客模式完全可用。

---

## 二、现有架构约束（不可违反）

| 约束 | 说明 |
|------|------|
| No-build ESM | 无 React / Vue / Vite / package.json，所有代码通过 `<script type="module">` 直接加载 |
| CDN 依赖 | MapLibre GL JS + deck.gl + Tailwind 均通过 CDN 引入 |
| 持久化 | 现有数据全存 localStorage（`stc_progress` / `bayareaCompass.wantToVisit` / `stc_bgm_muted`） |
| 多语言 | 6 语言 i18n 系统（zh/en/ja/ko/ru/es），所有新增 UI 文案必须走 `getText()` |
| 视觉规范 | 遵循 DESIGN.md：水墨/宣纸材质体系、Apple/Tesla 式克制、map-first、一个动作一个记忆动效 |
| 模块组织 | `main.js` 编排 → `map.js` 地图 → `ui.js` 界面 → `game.js` 游戏逻辑 → `data/*` 数据 → `i18n.js` 文案 |

**新增模块必须以独立 ESM 文件引入，通过 `import` 接入 `main.js`，不改动现有模块的内部实现，仅在 `main.js` 中增加编排接线。**

---

## 三、功能一：私人记忆锚点

### 3.1 核心定义

一个记忆锚点 = **一张照片** + **一个地理坐标** + **一句话** + **时间戳**。

与官方锚点的区别：
- 官方锚点是 PGC 内容，所有用户共享，有副本/印章/全球连线。
- 记忆锚点是 UGC 内容，仅创建者可见，无副本无印章，不可被其他用户看到（MVP 阶段）。
- 记忆锚点在地图上以**金色光点**呈现，区别于官方锚点的朱砂/水墨风格。

### 3.2 数据结构

```javascript
// 记忆锚点数据模型
{
  id: 'mem-1751540000000-rand',     // 唯一 ID：mem-时间戳-随机串
  lat: 22.5173,                      // 纬度
  lng: 113.9347,                     // 经度
  photoUrl: 'blob:... 或 https://...', // 照片 URL（本地模式为 blob/base64，云端模式为 Supabase Storage 公开 URL）
  note: '刚来深圳的那个傍晚',          // 用户写的一句话（最多 200 字）
  createdAt: '2026-07-03T15:52:00Z', // ISO 时间戳
  linkedAnchorId: 'N-SC01',          // [可选] 关联的官方锚点 ID（如果在官方锚点附近创建）
}
```

### 3.3 用户流程

```
用户在地图上长按空白处（或点击官方锚点详情页的「留下记忆」按钮）
  │
  ├─ 弹出记忆锚点创建面板
  │   ├─ 选择/拍摄照片（<input type="file" accept="image/*" capture="environment">）
  │   ├─ 填写一句话（<textarea maxlength="200">）
  │   └─ 坐标自动填充（长按位置 或 官方锚点坐标）
  │
  ├─ 点击「钉下记忆」
  │   ├─ 访客模式 → 照片压缩为 base64/thumbnail 存 localStorage
  │   └─ 登录模式 → 照片上传 Supabase Storage，元数据写 Supabase DB，本地双写
  │
  ├─ 地图上出现金色光点
  │
  └─ 点击金色光点 → 查看记忆详情（照片 + 一句话 + 时间 + 删除按钮）
```

### 3.4 地图渲染

- **新增 MapLibre GeoJSON Source + Layer**：`memory-source` / `memory-glow` / `memory-core`
- 金色光点样式：外圈柔和金色光晕（`circle-radius: 16, circle-color: #d4a843, circle-blur: 0.8`）+ 内圈实心金点（`circle-radius: 6, circle-color: #f0c75e`）
- 点击金色光点 → 打开记忆详情面板（复用现有 InfoPanel 的容器机制，或新建独立 `memory-detail` 面板）
- **长按地图空白处**触发创建：监听 `map.on('contextmenu', ...)` 或自定义长按手势（移动端 `touchstart` + `touchend` 500ms 判定）

### 3.5 存储策略

| 模式 | 照片存储 | 元数据存储 | 容量限制 |
|------|----------|------------|----------|
| 访客（未登录） | 压缩为 base64 缩略图（max 200KB），存 localStorage | localStorage key: `bayareaCompass.memories` | localStorage 总量 ~5MB，约存 15-20 条带缩略图的记忆 |
| 登录 | 原图上传 Supabase Storage bucket `memory-photos`，返回公开 URL | Supabase table `memory_anchors` + 本地 localStorage 双写 | Supabase 免费 1GB Storage，约 2000+ 张压缩图 |

**照片压缩**：客户端用 Canvas API 压缩（max-width 1280px, quality 0.75），避免上传原图浪费存储配额。

### 3.6 官方锚点详情页集成

在现有 `openInfoPanel()` 渲染的锚点详情底部，新增一个「📝 留下我的记忆」按钮（横向 CTA 卡片样式，与现有「剧情副本」入口风格一致）。点击后：
- 预填充 `linkedAnchorId` 和坐标（使用当前锚点坐标）
- 弹出记忆创建面板
- 创建后，该官方锚点详情页底部显示「我的这里」区域，展示用户在此处留下的记忆列表

### 3.7 个人中心 · 记忆列表

新增一个「我的记忆」面板（从工具栏入口进入），展示：
- 全部记忆锚点的列表视图（缩略图 + 一句话 + 时间 + 关联锚点名）
- 按时间倒序排列
- 支持删除单条记忆
- 顶部显示统计：「你在湾区留下了 N 个记忆」

---

## 四、功能二：用户登录账户系统

### 4.1 技术选型

**Supabase**（开源 Firebase 替代）：
- Auth：手机号 + 短信 OTP 验证码
- Database：PostgreSQL（table: `memory_anchors`, `user_profiles`）
- Storage：图片存储 bucket
- 客户端集成：通过 Supabase JS SDK（`@supabase/supabase-js`），以 ESM 方式从 CDN 引入

**引入方式**（保持 no-build 架构）：
```html
<!-- index.html 中新增 -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```
或通过 ESM import：
```javascript
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
```

### 4.2 访客模式 vs 登录模式

| 维度 | 访客模式 | 登录模式 |
|------|----------|----------|
| 身份标识 | 设备 ID（`crypto.randomUUID()` 生成，存 localStorage） | 手机号对应的 Supabase Auth UID |
| 数据存储 | 全 localStorage | Supabase 云端 + localStorage 双写 |
| 功能完整性 | 完整可用 | 完整可用 |
| 跨设备同步 | ❌ | ✅ |
| 数据安全 | 清浏览器数据即丢失 | 云端持久 |
| 登录入口 | 工具栏「登录」按钮 | — |
| 迁移 | 首次登录时，自动将 localStorage 中的记忆锚点上传到云端 | — |

### 4.3 登录流程

```
用户点击工具栏「登录」按钮
  │
  ├─ 弹出登录面板
  │   ├─ 选择区号（默认 +86，支持 +852/+853/+886/+1/+81/+82 等）
  │   ├─ 输入手机号
  │   └─ 点击「获取验证码」→ Supabase Auth signInWithOtp({ phone })
  │
  ├─ 输入 6 位验证码
  │   └─ Supabase Auth verifyOtp({ phone, token, type: 'sms' })
  │
  ├─ 验证成功
  │   ├─ 获取 Supabase session
  │   ├─ 检测 localStorage 中是否有访客记忆 → 自动迁移到云端
  │   ├─ 从云端拉取已有记忆锚点 → 合并到本地
  │   └─ UI 切换为「已登录」状态（显示手机号尾号 + 退出按钮）
  │
  └─ 退出登录
      ├─ Supabase Auth signOut()
      ├─ 清除本地 session
      └─ UI 切换为「访客」状态（数据保留在 localStorage）
```

### 4.4 数据迁移逻辑

首次登录时的迁移流程：
1. 读取 localStorage 中 `bayareaCompass.memories` 的所有记忆
2. 对每条记忆：如果 `photoUrl` 是 base64 → 上传到 Supabase Storage → 替换为公开 URL
3. 将元数据插入 Supabase `memory_anchors` 表
4. 标记 localStorage 数据为「已迁移」（添加 `migrated: true` 字段），不删除（作为本地缓存）
5. 后续新建记忆：同时写 localStorage 和 Supabase

### 4.5 Supabase 数据库设计

```sql
-- 记忆锚点表
CREATE TABLE memory_anchors (
  id TEXT PRIMARY KEY,              -- 客户端生成的唯一 ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  photo_url TEXT NOT NULL,
  note TEXT DEFAULT '',
  linked_anchor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 策略：用户只能看到自己的记忆
ALTER TABLE memory_anchors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memories" ON memory_anchors
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON memory_anchors
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON memory_anchors
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON memory_anchors
  FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('memory-photos', 'memory-photos', true);

-- Storage RLS
CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'memory-photos' AND auth.uid() = storage.foldername(name));
CREATE POLICY "Users can view all photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'memory-photos');
CREATE POLICY "Users can delete own photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'memory-photos' AND auth.uid() = storage.foldername(name));
```

### 4.6 Supabase 配置

新增配置文件 `public/supabase.config.js`（git ignored，类似现有 `tencent-map.config.js`）：
```javascript
window.SUPABASE_CONFIG = {
  url: 'https://xxx.supabase.co',
  anonKey: 'xxx-anon-key',
};
```
缺失时自动降级为纯访客模式，不报错。

---

## 五、新增文件清单

| 文件 | 职责 | 大小预估 |
|------|------|----------|
| `src/memory.js` | 记忆锚点核心模块：数据模型、CRUD、存储策略（localStorage / Supabase 双模式）、照片压缩 | ~400 行 |
| `src/auth.js` | 账户模块：Supabase Auth 封装、OTP 登录流程、会话管理、数据迁移 | ~300 行 |
| `public/supabase.config.js` | Supabase 连接配置（git ignored） | <10 行 |
| `src/i18n.js`（修改） | 新增约 40 条 i18n key（memory.* / auth.* 命名空间） | +200 行 |
| `src/styles.css`（修改） | 新增金色光点、记忆面板、登录面板、记忆列表样式 | +300 行 |
| `src/ui.js`（修改） | 新增 `renderMemoryPanel` / `renderAuthPanel` / 记忆详情面板渲染 | +250 行 |
| `src/map.js`（修改） | 新增记忆锚点 Source/Layer、长按创建交互、金色光点点击 | +100 行 |
| `src/main.js`（修改） | 新增模块 import 和事件编排接线 | +80 行 |
| `index.html`（修改） | 引入 Supabase JS SDK CDN、supabase.config.js | +3 行 |

---

## 六、UI 入口设计

### 6.1 工具栏新增按钮

在现有 `renderToolCluster` 的工具按钮组中新增：
- **「我的记忆」按钮**：金色圆点图标 + 文案，点击打开记忆列表面板
- **「登录」/「已登录」按钮**：未登录时显示「登录」文案，已登录时显示手机号尾 4 位 + 退出选项

### 6.2 地图交互

- **长按地图空白处**：弹出记忆创建面板（桌面端右键 `contextmenu`，移动端长按 500ms）
- **点击金色光点**：打开记忆详情面板
- **官方锚点详情底部**：新增「📝 留下我的记忆」CTA 卡片

### 6.3 视觉规范（遵循 DESIGN.md）

- 金色光点色值：`#d4a843`（外圈光晕）/ `#f0c75e`（内圈实心），区别于官方锚点的朱砂 `#b23a2e`
- 记忆面板：使用 Porcelain `#F7F4EC` 底板，与现有 InfoPanel 一致
- 登录面板：简洁模态弹窗，居中，Bay Blue `#3E6AE1` 主行动色
- 记忆创建动效：金色涟漪扩散（一次 signature motion，复用现有 `ink-ripple` 风格）
- 支持 `prefers-reduced-motion`

---

## 七、i18n 文案 Key 规划

```
memory.btn                → 我的记忆
memory.create             → 钉下记忆
memory.create_hint        → 在地图上留下属于你的瞬间
memory.photo_label        → 选择照片
memory.note_label         → 写一句话
memory.note_placeholder   → 这个瞬间对你意味着什么？
memory.save               → 保存记忆
memory.delete             → 删除
memory.delete_confirm     → 确定删除这条记忆吗？
memory.empty              → 还没有记忆，长按地图钉下第一个吧
memory.count              → 你在湾区留下了 {n} 个记忆
memory.linked_anchor      → 关联锚点
memory.detail_title       → 我的记忆
memory.add_at_anchor      → 留下我的记忆
memory.my_memories_here   → 我的这里
memory.migrating          → 正在迁移你的记忆到云端…
memory.migration_done     → 迁移完成！{n} 条记忆已安全保存

auth.btn_login            → 登录
auth.btn_logout           → 退出
auth.title                → 登录湾区罗盘
auth.phone_label          → 手机号
auth.code_label           → 验证码
auth.send_code            → 获取验证码
auth.verify               → 验证
auth.code_sent            → 验证码已发送
auth.code_error           → 验证码错误
auth.logged_in_as         → 已登录：{phone}
auth.guest_mode           → 访客模式
auth.login_benefit_1      → 云端保存所有记忆
auth.login_benefit_2      → 跨设备同步
auth.login_benefit_3      → 换手机不丢数据
```
（每种语言需翻译 6 份：zh/en/ja/ko/ru/es）

---

## 八、风险与降级

| 风险 | 降级方案 |
|------|----------|
| Supabase 配置缺失 | 自动降级为纯访客模式，UI 不显示登录入口，记忆锚点仍可用（仅本地） |
| Supabase 网络不可达 | 照片和元数据写 localStorage，后台静默重试同步 |
| localStorage 容量满 | 提示用户「本地存储已满，请登录后同步到云端」 |
| 短信验证码服务不可用 | 提示「验证码服务暂时不可用，请稍后重试」 |
| 用户清浏览器数据（访客模式） | 数据丢失，无法恢复（这是访客模式的固有限制，登录可解决） |
| Supabase 免费额度用尽 | Storage 满时提示用户清理旧记忆；Auth 50K MAU 远超需求 |

---

## 九、实施阶段建议

**Phase 1 — 记忆锚点（纯本地）**：实现 `src/memory.js` + 地图金色光点 + 创建/查看/删除面板 + 官方锚点详情页「留下记忆」入口。全 localStorage，不依赖 Supabase。可独立交付。

**Phase 2 — 账户系统 + 云端同步**：实现 `src/auth.js` + Supabase 集成 + 登录面板 + 数据迁移逻辑。登录后记忆双写云端。

**Phase 3 — 个人中心**：实现记忆列表面板 + 统计信息 + 批量管理。从工具栏入口进入。

---

## 十、验收标准

- 访客模式下：长按地图可创建记忆锚点，金色光点正常显示，点击可查看详情，可删除
- 登录模式下：记忆自动同步云端，换设备登录后可看到之前的记忆
- 首次登录时：localStorage 中的访客记忆自动迁移到云端，不丢失不重复
- Supabase 配置缺失时：不报错，降级为纯访客模式
- 所有新增 UI 文案支持 6 语言
- 所有动效支持 `prefers-reduced-motion`
- 移动端 390px / 桌面端 1440px 均正常显示
- 照片上传前经过 Canvas 压缩（max-width 1280px, quality ≤ 0.75）
- 官方锚点详情页底部「留下记忆」入口与现有「剧情副本」入口视觉风格一致
