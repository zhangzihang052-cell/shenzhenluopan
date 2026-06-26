# PRODUCT.md - 湾区罗盘产品上下文

version: 0.2
date: 2026-06-26
register: product

## Product

湾区罗盘 / 时空罗盘是一个面向 APEC 外宾接待与路演展示的「大湾区历史文化百科」。它用一张全屏 3D 交互地图，把真实地理坐标、历史人物、文化锚点、路线规划、剧情副本和全球影响力连线组织成可演示、可探索的文化导航体验。

核心叙事：

地理坐标 + 古代微小事件/人物 = 对现代中国与世界的巨大影响。

## Audience

- 主要用户：APEC 外宾、政商精英、国际观众。
- 操作者：现场讲解员、路演人员、产品团队。
- 阅读场景：大屏演示、现场讲解、移动端实地走访。

## Jobs To Be Done

- 让外宾在 10 秒内理解一个地点为什么重要。
- 打破「深圳只有 40 年历史」的刻板印象。
- 用地图、路线、人物和世界连线制造可信的 wow moment。
- 让讲解员可以围绕主题图层快速组织故事线。
- 让实地用户通过定位、附近锚点、路线和印章获得探索动力。

## Core Experience

- 第一屏是全屏地图，不是营销页。
- 点击锚点触发电影感 fly-to、信息面板和历史叙事。
- 世界级锚点用 deck.gl 弧线展示全球影响。
- 罗盘探索支持 GPS，失败时回退福田中心模拟定位。
- 「开始探索」分为附近锚点 DIY 路线与热门推荐路线；产品只提供大致路线与时间，具体导航跳转腾讯地图。
- 用户生成/选择的路线最终会展示在地图上，网络不可用时回退为直线概览。
- 剧情副本、印章册和成就系统让文化探索有进度感；完成副本后进入印章册会自动定位到刚获得的印章。
- 支持 zh / en / ja / ko / ru / es 六语言。

## Current Version Snapshot - 2026-06-26

这一版是「大湾区扩容 + 副本闭环 + 路线探索 + 视觉素材治理」保存点。

### Content Scope

- 文化锚点总数：64 个。
- 新增大湾区锚点：30 个，覆盖广州、佛山、肇庆、澳门、惠州、东莞、珠海、香港等城市。
- 每个锚点均有剧情副本与印章奖励。
- 副本题量规则：所有副本至少 2 题，重点锚点 3 题。
- 印章册覆盖全部 64 个副本，并按主题展示进度。

### Exploration Flow

- 地图中心保留「开始探索」入口，但动效控制为轻微呼吸/波纹，不喧宾夺主。
- 探索面板分为两个 tab：
  - 附近锚点 DIY 路线：用户勾选锚点后生成概览路线。
  - 热门推荐路线：产品预设主题路线，用户一键使用。
- 生成路线后在地图上绘制路线，并展示预计距离与时间。
- 产品仅给出大致路线概览；实时导航交给腾讯地图。

### Story / Stamp Loop

- 锚点详情底部的「剧情副本」入口改为横向 CTA 卡片：纯文案 + 图标 + 箭头，不再使用右侧卡通角色。
- 副本完成后点亮印章；点击「查看印章册」会直接滚动到本次获得的印章。
- 首次获得显示「刚获得」，重温副本显示「当前印章」。
- 目标印章有轻量高亮与盖章反馈，并支持 reduced-motion。

### Anchor Detail Template

- 卡片标签按内容类型动态显示：
  - 人物类：核心人物。
  - 主题/路线类：主题关键词。
  - 建筑/地点类：文化地标。
- 去掉无意义的「世界级影响」独立模块和底部标签堆叠，减少信息噪音。
- 描述文字行距提升，增强长文可读性。

### Visual Asset Direction

- 当前图片策略从「生成主题横幅」转向「优先真实照片」。
- 已为 16 个锚点接入 Wikimedia Commons 公开实景图作为过渡验证。
- 正式路演版本建议将公开图或用户提供图下载到本地 `public/anchors/photos/`，避免网络波动和外链限流。
- 用户可用中文地点名上传图片，系统后续按锚点中文名匹配。

## Technical Reality

This is a no-build static frontend:

- No React, no Vue, no Vite, no package.json.
- Native ES Modules loaded directly by `index.html`.
- MapLibre GL JS 4.7.1 via CDN.
- deck.gl 8.9.35 via CDN.
- Tailwind CDN plus `src/styles.css`.
- Motion uses CSS transitions/keyframes and `requestAnimationFrame`.
- Persistence uses localStorage only.
- 路线规划支持腾讯地图 WebService；未配置或失败时使用 OSRM/直线概览降级。
- 视觉素材目前支持本地图片与远程图片，正式版本优先本地化。

Any design or animation upgrade must preserve the no-build architecture unless the user explicitly approves a migration.

## Success Criteria

- No white screen or blank map during roadshow demos.
- Anchor click to readable panel feels fast and smooth.
- Text is readable on projector, laptop, and mobile.
- UI never blocks the map more than necessary.
- Visual quality feels premium, restrained, and culturally specific.
- English summaries are understandable to international guests within seconds.
- 副本完成后的奖励反馈必须让用户明确知道「刚获得的是哪一枚印章」。
- 路线功能必须让用户知道这是概览而非实时导航，避免误导。

## Current Product Surface

- `index.html` - app entry, CDN dependencies, root layers, loading overlay.
- `src/main.js` - orchestration and state.
- `src/map.js` - MapLibre/deck.gl controller.
- `src/ui.js` - DOM UI components.
- `src/game.js` - episodes, stamps, achievements, geofence prompts.
- `src/route.js` - route planning and OSRM fallback.
- `src/i18n.js` - six-language text helpers.
- `src/styles.css` - full custom visual layer.
- `src/data/*` - anchors, themes, episodes.
- `src/data/episode-expansions.js` - 副本扩展题库，用于保证题量与叙事层次。

## Design Context

Use root `DESIGN.md` as the visual source of truth. The intended upgrade direction is Apple/Tesla-level restraint adapted to a cultural map product: map-first, fewer generic cards, stronger typography, clear controls, one memorable motion moment per workflow, and better use of generated imagery only when it clarifies the product experience.
