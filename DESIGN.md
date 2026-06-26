# DESIGN.md - 湾区罗盘视觉升级规范

version: 0.2
date: 2026-06-26
product: 湾区罗盘 / 时空罗盘
register: product

## 1. Product Posture

湾区罗盘不是传统后台，也不是营销落地页。它是一个「可探索的文化导航仪」：地图、地点、路线、人物和全球影响力连线是主角，界面只提供刚刚好的控制与叙事。

目标气质：Apple 的博物馆式克制 + Tesla 的全屏数字展厅 + 大湾区/岭南文化的东方空间感。界面要高级、清晰、可用，不能只停留在装饰。

## 2. Style North Star

- 地图即 hero：第一屏必须是可操作体验，不做解释型 landing page。
- UI 退后：控件像精密仪器，不像内容卡片墙。
- 文化不是贴花：水墨、印章、纹样只做空间层次和情绪，不堆满边角。
- 单一记忆点：每个核心视图只保留一个强动效或强视觉锚点。
- 信息密度可扫描：面板要适合反复查地点、路线、剧情、印章进度。
- 真实优先：地点、人物、路线、地图状态优先于抽象背景图。
- 奖励反馈要可定位：用户完成副本后，系统必须明确指向刚获得的印章，而不是只给笼统成就感。

## 3. Hard No

- 不做紫蓝渐变、发光球、bokeh、过度玻璃拟态。
- 不做卡片套卡片；卡片只用于具体地点、路线步骤、成就、弹窗。
- 不用营销页式大段功能说明占据第一屏。
- 不引入构建工具、React、Framer Motion、Vite，除非明确进行架构迁移。
- 不把 React Bits 组件直接塞进当前 no-build ESM 架构；当前项目优先用 CSS、原生 JS、MapLibre、deck.gl 实现同类动效。
- 不用看不清的浅灰正文；正文对比度必须达 WCAG AA。

## 4. Visual System

### Core Palette

Use this direction when evolving `src/styles.css` and Tailwind CDN tokens.

- Ink Black: `#171A20` - 主文字、强标题、深色面板。
- Graphite: `#393C41` - 正文、说明文字。
- Porcelain: `#F7F4EC` - 轻量面板，不再让全界面都偏黄。
- Rice Paper: `#ECE2CB` - 当前宣纸底色，作为文化材质点缀。
- Bay Blue: `#3E6AE1` - 主行动色，借 Tesla 式克制，只给关键 CTA。
- Cinnabar: `#B23A2E` - 印章、完成、成就，不做普通按钮色。
- Jade Cyan: `#3F7D6E` - 地图探索、附近、路线辅助。
- Old Gold: `#9A7B32` - 历史/文物线索，少量使用。
- Night Map: `#0F1514` - 沉浸模式、夜航、全球连线背景。

Rule: one screen should not be dominated by beige. Use dark map, porcelain surfaces, and one decisive accent to create contrast.

### Typography

- Chinese UI: `Noto Sans SC`, system sans.
- Cultural title / seal moments: `Ma Shan Zheng` or `Noto Serif SC`, only for short labels.
- Latin UI: `Inter`, system sans.
- H1/H2 use `text-wrap: balance`; long prose use `text-wrap: pretty`.
- Display headings must stay readable: max 72px desktop, max 40px mobile.
- Letter spacing stays `0` for normal UI; avoid tight display tracking in Chinese.

### Surface Rules

- Primary surface: translucent porcelain panel over the map.
- Important modal: solid porcelain or near-black, not heavy glass.
- Borders: 1px hairlines with low opacity.
- Shadows: subtle depth only, never decorative glow around every panel.
- Radius: 4-8px for controls and panels; seal can be square/6px.

## 5. Layout Language

- Full-bleed map/canvas remains the base layer.
- Top controls should feel like a compact instrument cluster.
- Detail panels should dock to edges and preserve map visibility.
- Mobile: bottom sheets and compact tool rows beat floating side panels.
- Desktop: left navigation/filter, right detail/route, center map.
- Fixed-format controls need stable width/height so labels and icons never shift layout.

## 6. Motion Direction

Motion should feel like a calibrated compass, not a theme park.

- Keep one signature motion per workflow:
  - select anchor: camera fly + pin emphasis
  - global impact: arc draw / pulse
  - route: flowing line
  - completion: cinnabar seal press
  - theme switch: measured color/filter tween
- Use CSS transitions/keyframes and `requestAnimationFrame` in this no-build app.
- Always support `prefers-reduced-motion: reduce`.
- Never hide content until animation fires; the static state must already be visible.
- Preferred easing: `cubic-bezier(0.22, 1, 0.36, 1)` or similar ease-out.
- Avoid bounce/elastic unless it is explicitly game-like and rare.
- CTA 与奖励动效要「有存在感但不跳脱」：轻微呼吸、波纹、上浮即可；避免大幅弹跳和强蓝描边抢戏。

## 7. React Bits / Animated Component Gate

The installed `animated-component-libraries` skill is useful for inspiration and for any future React surface. In this repo:

- Local reference copy: `.agent/references/react-bits`.
- Project usage notes: `.agent/references/react-bits-notes.md`.
- Port ideas, not dependencies, unless a React migration is approved.
- Best-fit inspirations: text reveal, aurora/mesh background translated to CSS canvas, dock-like tool cluster, magnetic button, animated tabs, particles for route/global link moments.
- Choose one memorable component per release; do not add a component zoo.
- Keep performance at 60fps on mobile; MapLibre/deck.gl already use the GPU budget.

## 8. Image Generation Rules

Use generated bitmap images when a view needs a real visual anchor, not generic atmosphere.

Current asset policy:

- 地点锚点优先使用真实照片，尤其是建筑、街区、港口、桥梁、校园、科学设施。
- 生成图只用于缺少合适公开图、或需要表达抽象历史场景的锚点。
- 禁止继续使用模板化「文字 + 抽象图标 + 黑条」横幅作为最终视觉。
- 正式路演版本应将图片本地化到 `public/anchors/photos/`，不要依赖远程 Commons 外链。
- 用户上传图片可以使用中文地点名命名，例如 `光明科学城.jpg`；接入时再统一映射为锚点资源路径。

Preferred directions:

- cinematic Greater Bay Area cultural map interface, dark jade sea, precise route arcs, museum-grade UI, no stock people
- Lingnan heritage atlas, porcelain and ink materials, subtle cinnabar seal, premium product UI screenshot
- full-bleed hero image of Shenzhen/Hong Kong bay at night with historical map overlay, restrained Apple-like composition
- cultural landmark detail photography style, clean negative space, documentary realism

Avoid:

- fantasy ancient China cliches
- generic cyberpunk neon city
- random dragon/cloud ornament overload
- blurred stock-photo backgrounds that hide the product
- PPT 式主题横幅、低细节抽象图标、与地点实景无关的占位视觉。

## 8.1 Current UI Decisions - 2026-06-26

### Anchor Detail Panel

- 去掉右侧卡通角色，避免抢占主文案空间。
- 剧情副本入口采用横向卡片：左侧卷轴/印章图标，中间一句行动文案，右侧箭头引导。
- 卡片风格与开放时间等模块一致，使用米色/卡其底板；不使用高饱和红色作为大面积 CTA。
- Hover 仅轻微上浮与阴影扩散，箭头保留细微呼吸/位移动效。

### Stamp Book

- 印章册按主题分区展示。
- 完成副本后打开印章册时，自动滚动到刚获得印章。
- 「刚获得」标签必须独立占位，不覆盖印章图案。
- 目标印章可有一次轻量波纹/盖章反馈，必须支持 `prefers-reduced-motion`。

### Compass Exploration

- 地图底部「开始探索」保留较大的可点击尺寸，但动效控制为低频轻呼吸。
- 面板使用两个 tab：附近锚点 DIY 路线 / 热门推荐路线。
- 路线结果用概览语气，不承诺实时导航；导航动作交给腾讯地图。

## 9. Component Standards

- Buttons: icon first when the action is common; text+icon for primary commands.
- Tabs: segmented controls for map/detail/route/story modes.
- Toggles: use switch/checkbox patterns for binary settings.
- Sliders/steppers: use for radius, time, intensity, map pitch.
- Tooltips: required for unfamiliar icon-only controls.
- Empty states: give a next action, not a paragraph.
- Errors: explain what failed and the fallback, especially GPS/OSRM/Tencent map services.

## 10. QA Before Shipping

Run visual QA after meaningful UI changes:

- Local Impeccable source reference: `.agent/references/impeccable`.
- Project Impeccable notes: `.agent/references/impeccable-notes.md`.
- Check desktop and mobile widths: 390, 768, 1440.
- Confirm no text overlaps controls or map attribution.
- Confirm map/canvas layers are nonblank.
- Confirm contrast for body text and buttons.
- Confirm keyboard ESC closes layers in the intended order.
- Confirm reduced-motion users still see all content.
- Confirm loading, GPS failure, OSRM failure, empty nearby, and long translated labels.

## 11. Source Inspiration

This spec adapts the Apple and Tesla references from `VoltAgent/awesome-design-md` into the current product architecture. Treat those references as direction, not a license to clone brand UI.
