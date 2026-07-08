// 主题吉祥物数据模块 —— 每个主题对应一个古风可爱的卡通角色
// 角色风格：古风 + 可爱 + 中国风 + 简洁
// build: 2026-06-18

/**
 * @typedef {Object} ThemeMascot
 * @property {string} img       角色图片路径
 * @property {Object} name      角色名（多语）
 * @property {Object} role      角色称谓（多语）
 * @property {string} greeting  招呼语（仅中文，UI 展示）
 */

/** @type {Record<string, ThemeMascot>} */
export const MASCOTS = {
  navigation: {
    img: './public/mascots/transparent/nav.webp',
    name: { zh: '小海图', en: 'Little Sea Chart', ja: '小海図', ko: '꼬마 해도' },
    role: { zh: '海路引路人', en: 'Sea Route Guide', ja: '海路の案内人', ko: '해로 안내자' },
    greeting: '扬帆起航，四海为家！',
  },
  science: {
    img: './public/mascots/transparent/sci.webp',
    name: { zh: '小星火', en: 'Little Spark', ja: '小星火', ko: '꼬마 불씨' },
    role: { zh: '科学精灵', en: 'Science Spirit', ja: '科学の精', ko: '과학 요정' },
    greeting: '探索未知，点燃智慧！',
  },
  engineering: {
    img: './public/mascots/transparent/eng.webp',
    name: { zh: '小匠人', en: 'Little Craftsman', ja: '小職人', ko: '꼬마 장인' },
    role: { zh: '工程守护者', en: 'Engineering Guardian', ja: '工学の守護者', ko: '공학 수호자' },
    greeting: '匠心筑梦，百年传承！',
  },
  reform: {
    img: './public/mascots/transparent/reform.webp',
    name: { zh: '小拓荒', en: 'Little Pioneer', ja: '小開拓者', ko: '꼬마 개척자' },
    role: { zh: '改革见证者', en: 'Reform Witness', ja: '改革の証人', ko: '개혁의 증인' },
    greeting: '敢闯敢试，开路向前！',
  },
  awakening: {
    img: './public/mascots/transparent/food.webp',
    name: { zh: '小烟火', en: 'Little Folk Life', ja: '小にぎわい', ko: '꼬마 생활길잡이' },
    role: { zh: '风味民俗使者', en: 'Folk Life Envoy', ja: '民俗生活の使者', ko: '민속 생활 사절' },
    greeting: '烟火民俗，处处有故事！',
  },
  civilization: {
    img: './public/mascots/transparent/civ.webp',
    name: { zh: '小书生', en: 'Little Scholar', ja: '小書生', ko: '꼬마 선비' },
    role: { zh: '文脉守护者', en: 'Culture Guardian', ja: '文化の守護者', ko: '문맥 수호자' },
    greeting: '千年文脉，薪火相传！',
  },
  all: {
    img: './public/mascots/transparent/civ.webp',
    name: { zh: '小罗盘', en: 'Little Compass', ja: '小羅盤', ko: '꼬마 나침반' },
    role: { zh: '大湾区导游', en: 'Bay Area Guide', ja: '大湾区ガイド', ko: '베이 에어리어 가이드' },
    greeting: '欢迎探索大湾区！',
  },
};

/**
 * 获取主题吉祥物（找不到时回退到 all）
 * @param {string} themeKey
 * @returns {ThemeMascot}
 */
export function getMascot(themeKey) {
  return MASCOTS[themeKey] || MASCOTS.all;
}
