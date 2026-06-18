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
    img: './public/mascots/transparent/nav.png',
    name: { zh: '小郑和', en: 'Little Navigator', ja: '小鄭和', ko: '꼬마 항해사' },
    role: { zh: '航海使者', en: 'Maritime Envoy', ja: '航海使者', ko: '항해 사절' },
    greeting: '扬帆起航，四海为家！',
  },
  science: {
    img: './public/mascots/transparent/sci.png',
    name: { zh: '小星火', en: 'Little Spark', ja: '小星火', ko: '꼬마 불씨' },
    role: { zh: '科学精灵', en: 'Science Spirit', ja: '科学の精', ko: '과학 요정' },
    greeting: '探索未知，点燃智慧！',
  },
  engineering: {
    img: './public/mascots/transparent/eng.png',
    name: { zh: '小匠人', en: 'Little Craftsman', ja: '小職人', ko: '꼬마 장인' },
    role: { zh: '工程守护者', en: 'Engineering Guardian', ja: '工学の守護者', ko: '공학 수호자' },
    greeting: '匠心筑梦，百年传承！',
  },
  awakening: {
    img: './public/mascots/transparent/food.png',
    name: { zh: '小厨仙', en: 'Little Chef Fairy', ja: '小料理仙', ko: '꼬마 요리선' },
    role: { zh: '美食使者', en: 'Culinary Envoy', ja: '料理使者', ko: '미식 사절' },
    greeting: '舌尖上的千年记忆！',
  },
  civilization: {
    img: './public/mascots/transparent/civ.png',
    name: { zh: '小书生', en: 'Little Scholar', ja: '小書生', ko: '꼬마 선비' },
    role: { zh: '文脉守护者', en: 'Culture Guardian', ja: '文化の守護者', ko: '문맥 수호자' },
    greeting: '千年文脉，薪火相传！',
  },
  all: {
    img: './public/mascots/transparent/civ.png',
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
