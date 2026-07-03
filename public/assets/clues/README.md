# Nearby Clues Cover Image System

This directory stores the cover-image plan and generated assets for Nearby Clues cards. The existing images in `public/hero` remain untouched; five of them have been copied/converted into this unified directory as WebP cover assets.

## Counts

- Total anchors: 64
- Existing style-reference hero images: 5
- Generated clue images: 9
- Done cover images: 14
- Pending new cover images: 50
- Output directory: `public/assets/clues/`
- Naming rule: `{anchorId}-cover.webp`
- Fallback image: `/assets/clues/fallback-cover.webp`

## Existing Reference Mapping

- P01 罗湖桥: /public/hero/qianxuesen.jpg -> /assets/clues/P01-cover.webp
- P02 广九铁路旧址: /public/hero/zhantianou.jpg -> /assets/clues/P02-cover.webp
- M01 赤湾天后宫: /public/hero/zhenghe.jpg -> /assets/clues/M01-cover.webp
- M02 葛洪炼丹遗迹 · 罗浮山: /public/hero/gehong.jpg -> /assets/clues/M02-cover.webp
- M03 南头古城: /public/hero/nantou.jpg -> /assets/clues/M03-cover.webp

## Generated Covers

- M06 蛇口工业区: /assets/clues/M06-cover.webp (reform)
- M07 深圳河 · 红树林: /assets/clues/M07-cover.webp (ecology)
- M08 前海深港合作区: /assets/clues/M08-cover.webp (archive)
- M11 莲花山 · 改革开放: /assets/clues/M11-cover.webp (reform)
- N-EG01 深圳国贸大厦: /assets/clues/N-EG01-cover.webp (reform)
- N-EG02 深圳证券交易所: /assets/clues/N-EG02-cover.webp (archive)
- N-SC01 华强北电子市场: /assets/clues/N-SC01-cover.webp (innovation)
- N-SC02 腾讯滨海大厦: /assets/clues/N-SC02-cover.webp (innovation)
- N-SC03 大疆天空之城: /assets/clues/N-SC03-cover.webp (innovation)

## Priority Batch

1. N-EG02 深圳证券交易所 (done, archive)
2. M11 莲花山 · 改革开放 (done, reform)
3. N-SC01 华强北电子市场 (done, innovation)
4. M07 深圳河 · 红树林 (done, ecology)
5. M08 前海深港合作区 (done, archive)
6. N-SC02 腾讯滨海大厦 (done, innovation)
7. M03 南头古城 (done, history)
8. M06 蛇口工业区 (done, reform)
9. M01 赤湾天后宫 (done, maritime)
10. N-EG01 深圳国贸大厦 (done, reform)

## Style Lock

Use the five existing `public/hero` images as the visual reference set. New images should share this direction:

- Chinese ink-wash illustration
- Lingnan landscape and historical-cultural atmosphere
- aged warm paper texture
- low saturation
- ink lines, subtle color wash, light ochre, old gold, jade green accents
- historical, restrained, exploratory, and suitable for a narrative quest card
- not photorealistic, not a tourism poster, not childish cartoon, not cyber neon
- no text, no title, no logo, no watermark, no gibberish characters

## Files

- `clue-image-manifest.json`: full anchor-to-cover manifest with generation status.
- `clue-image-prompts.json`: prompt queue for all 64 anchors.
- `README.md`: this guide.

## Batch Generation Workflow

1. Open `clue-image-prompts.json`.
2. For every item whose manifest status is `pending`, send `promptZh` or `promptEn` plus `negativePrompt` to the image-generation service.
3. Use the five files in `public/hero` as image/style references where the tool supports reference images.
4. Export each result as WebP to `public/assets/clues/{anchorId}-cover.webp`.
5. Keep composition suitable for a compact card background or top strip. Avoid embedded text.
6. After generation, update that anchor in `clue-image-manifest.json`: set `sourceType` to `generated` and `status` to `done`.

## Pending Covers

- M04 大鹏所城 -> /assets/clues/M04-cover.webp (maritime)
- M05 中英街 -> /assets/clues/M05-cover.webp (archive)
- M09 文天祥后人聚居地 -> /assets/clues/M09-cover.webp (character)
- M10 观澜版画基地 -> /assets/clues/M10-cover.webp (craft)
- M12 大梅沙 · 海上丝路 -> /assets/clues/M12-cover.webp (maritime)
- N-CV01 东莞可园 -> /assets/clues/N-CV01-cover.webp (history)
- N-CV02 南越王宫博物馆 -> /assets/clues/N-CV02-cover.webp (history)
- N-CV03 鹤湖新居·客家围龙屋 -> /assets/clues/N-CV03-cover.webp (history)
- N-CV04 开平碉楼·自力村 -> /assets/clues/N-CV04-cover.webp (history)
- N-EG03 港珠澳大桥人工岛 -> /assets/clues/N-EG03-cover.webp (maritime)
- N-EG04 东深供水工程纪念馆 -> /assets/clues/N-EG04-cover.webp (archive)
- N-SC04 光明科学城 -> /assets/clues/N-SC04-cover.webp (innovation)
- N-AW01 沙井蚝文化园 -> /assets/clues/N-AW01-cover.webp (ecology)
- N-AW02 深井烧鹅发源地 -> /assets/clues/N-AW02-cover.webp (craft)
- N-AW03 顺德·粤菜宗师之乡 -> /assets/clues/N-AW03-cover.webp (craft)
- N-AW04 盆菜文化发源地·元朗 -> /assets/clues/N-AW04-cover.webp (craft)
- N-NA01 屯门·唐代季风港 -> /assets/clues/N-NA01-cover.webp (maritime)
- N-NA02 伶仃洋·古战场 -> /assets/clues/N-NA02-cover.webp (maritime)
- N-NA03 香港维多利亚港 -> /assets/clues/N-NA03-cover.webp (maritime)
- N-NA04 广州黄埔古港 -> /assets/clues/N-NA04-cover.webp (maritime)
- N-CV05 广州陈家祠 -> /assets/clues/N-CV05-cover.webp (craft)
- N-CV06 佛山祖庙 -> /assets/clues/N-CV06-cover.webp (maritime)
- N-CV07 肇庆七星岩摩崖石刻 -> /assets/clues/N-CV07-cover.webp (character)
- N-CV08 澳门大三巴牌坊 -> /assets/clues/N-CV08-cover.webp (maritime)
- N-CV09 惠州西湖 -> /assets/clues/N-CV09-cover.webp (archive)
- N-CV10 东莞南社明清古村 -> /assets/clues/N-CV10-cover.webp (innovation)
- N-EG05 虎门大桥 -> /assets/clues/N-EG05-cover.webp (archive)
- N-EG06 广州南沙港 -> /assets/clues/N-EG06-cover.webp (maritime)
- N-EG07 横琴粤澳深度合作区 -> /assets/clues/N-EG07-cover.webp (innovation)
- N-EG08 广州塔 -> /assets/clues/N-EG08-cover.webp (archive)
- N-EG09 香港西九龙站 -> /assets/clues/N-EG09-cover.webp (archive)
- N-EG10 深中通道 -> /assets/clues/N-EG10-cover.webp (archive)
- N-SC05 香港科技大学 -> /assets/clues/N-SC05-cover.webp (innovation)
- N-SC06 中山大学广州校区南校园 -> /assets/clues/N-SC06-cover.webp (innovation)
- N-SC07 广东科学中心 -> /assets/clues/N-SC07-cover.webp (innovation)
- N-SC08 中国散裂中子源 -> /assets/clues/N-SC08-cover.webp (innovation)
- N-SC09 香港数码港 -> /assets/clues/N-SC09-cover.webp (innovation)
- N-SC10 澳门大学横琴校区 -> /assets/clues/N-SC10-cover.webp (innovation)
- N-AW05 广州西关永庆坊 -> /assets/clues/N-AW05-cover.webp (city)
- N-AW06 佛山南风古灶 -> /assets/clues/N-AW06-cover.webp (craft)
- N-AW07 中山石岐老街 -> /assets/clues/N-AW07-cover.webp (city)
- N-AW08 澳门官也街 -> /assets/clues/N-AW08-cover.webp (city)
- N-AW09 香港大澳渔村 -> /assets/clues/N-AW09-cover.webp (archive)
- N-AW10 东莞道滘水乡 -> /assets/clues/N-AW10-cover.webp (innovation)
- N-NA05 广州南沙天后宫 -> /assets/clues/N-NA05-cover.webp (maritime)
- N-NA06 澳门妈阁庙 -> /assets/clues/N-NA06-cover.webp (maritime)
- N-NA07 珠海桂山岛 -> /assets/clues/N-NA07-cover.webp (maritime)
- N-NA08 惠东平海古城 -> /assets/clues/N-NA08-cover.webp (maritime)
- N-NA09 香港长洲岛 -> /assets/clues/N-NA09-cover.webp (maritime)
- N-NA10 广州沙面岛 -> /assets/clues/N-NA10-cover.webp (maritime)
