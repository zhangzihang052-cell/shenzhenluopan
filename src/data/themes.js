// 主题图层配置 v3 —— 5+1 主题模式完整视觉 token（双语标签）
// 每个主题含：锚点色 / UI强调色 / 地图 CSS filter / 叠色 overlay / 短名称
// build: 2026-06-18
// overlay 使用 rgba() 字符串，由 index.html 中 #theme-overlay div + CSS transition 实现过渡。
// mapFilter 赋值给 #map 的 style.filter，CSS transition:filter 自动平滑插值。

/**
 * @typedef {'navigation'|'science'|'engineering'|'awakening'|'civilization'} ThemeKey
 */

export const THEMES = {
  navigation: {
    key: 'navigation',
    label: {
      zh: '和平贸易与大航海', en: 'Peace, Trade & The Age of Sail',
      ja: '平和貿易と大航海', ko: '평화 무역과 대항해',
      ru: 'Мир, торговля и эпоха парусов', es: 'Paz, comercio y la era de la vela',
    },
    shortName: {
      zh: '航海贸易', en: 'Maritime Trade',
      ja: '航海貿易', ko: '항해무역',
      ru: 'Морская торговля', es: 'Comercio marítimo',
    },
    // 锚点色：航海蓝
    color: '#2e6f9e',
    accentColor: '#2e6f9e',
    // 地图氛围：淡化暖调 → 蓝绿海图感（不透明度降至0.25，避免压盖锚点光晕）
    overlay: 'rgba(10, 28, 50, 0.25)',
    mapFilter: 'sepia(0.05) saturate(0.85) hue-rotate(168deg) brightness(0.88) contrast(1.06)',
  },

  science: {
    key: 'science',
    label: {
      zh: '科学星火与现代科技', en: 'Science, Sparks & Modern Tech',
      ja: '科学の火と現代技術', ko: '과학의 불씨와 현대기술',
      ru: 'Искры науки и современные технологии', es: 'Chispas de ciencia y tecnología moderna',
    },
    shortName: {
      zh: '现代科技', en: 'Modern Tech',
      ja: '現代技術', ko: '현대기술',
      ru: 'Современные технологии', es: 'Tecnología moderna',
    },
    // 锚点色：霓虹科技青 + Bloom 增强
    color: '#3fd0d8',
    accentColor: '#3fd0d8',
    // 地图氛围：暗黑赛博，深蓝去饱和（不透明度降至0.35，避免锚点被完全淹没）
    overlay: 'rgba(3, 12, 28, 0.35)',
    mapFilter: 'sepia(0) saturate(0.42) hue-rotate(182deg) brightness(0.73) contrast(1.22)',
  },

  engineering: {
    key: 'engineering',
    label: {
      zh: '近代化与超级工程', en: 'Modernization & Mega-Engineering',
      ja: '近代化と巨大工事', ko: '근대화와 초대형 공학',
      ru: 'Модернизация и мегаинженерия', es: 'Modernización y megaingeniería',
    },
    shortName: {
      zh: '近现代发展', en: 'Modern Development',
      ja: '近現代の発展', ko: '근현대 발전',
      ru: 'Современное развитие', es: 'Desarrollo moderno',
    },
    // 锚点色：工业琥珀橙
    color: '#d98a3d',
    accentColor: '#d98a3d',
    // 地图氛围：旧照片棕褐 sepia，复古铁路感
    overlay: 'rgba(55, 28, 6, 0.22)',
    mapFilter: 'sepia(0.60) saturate(0.70) hue-rotate(-12deg) brightness(0.94) contrast(1.02)',
  },

  awakening: {
    key: 'awakening',
    label: {
      zh: '湾区风味 · 美食文化', en: 'Bay Area Flavors & Food Culture',
      ja: '湾区の味わい・食文化', ko: '베이 에어리어 맛과 식문화',
      ru: 'Вкусы Большого залива и кулинарная культура', es: 'Sabores de la Gran Bahía y cultura gastronómica',
    },
    shortName: {
      zh: '美食文化', en: 'Culinary Heritage',
      ja: '食の文化', ko: '음식문화',
      ru: 'Гастрономия', es: 'Gastronomía',
    },
    // 锚点色：暖橙红，烟火气
    color: '#e8743b',
    accentColor: '#e8743b',
    // 地图氛围：温暖饱和，柔和食欲光
    overlay: 'rgba(65, 22, 3, 0.18)',
    mapFilter: 'sepia(0.08) saturate(1.18) hue-rotate(6deg) brightness(1.05) contrast(0.93)',
  },

  civilization: {
    key: 'civilization',
    label: {
      zh: '千年文脉 · 古代文化', en: 'A Millennium of Culture',
      ja: '千年の文脈と古代文化', ko: '천년 문맥과 고대문화',
      ru: 'Тысячелетие культуры и древняя цивилизация', es: 'Un milenio de cultura antigua',
    },
    shortName: {
      zh: '古代文化', en: 'Ancient Culture',
      ja: '古代文化', ko: '고대문화',
      ru: 'Древняя культура', es: 'Cultura antigua',
    },
    // 锚点色：帝制金，水墨暖调
    color: '#c9a24b',
    accentColor: '#c9a24b',
    // 地图氛围：浓郁水墨宣纸 sepia
    overlay: 'rgba(85, 48, 12, 0.20)',
    mapFilter: 'sepia(0.50) saturate(0.78) hue-rotate(-8deg) brightness(1.00) contrast(0.94)',
  },
};

/**
 * 总览模式（不是真正的 theme key，作为图层面板第一项）
 * 激活时恢复默认宣纸暖黄总览，显示所有锚点。
 */
export const OVERVIEW_MODE = {
  key: 'all',
  label: {
    zh: '◎ 全部 · 总览', en: '◎ Overview · All',
    ja: '◎ 全体概観', ko: '◎ 전체 보기',
    ru: '◎ Обзор · Все', es: '◎ Visión general · Todo',
  },
  shortName: {
    zh: '大湾区全览', en: 'Bay Area',
    ja: '大湾区', ko: '대만구',
    ru: 'Большой залив', es: 'Gran Bahía',
  },
  color: '#9a7b32',
  accentColor: '#9a7b32',
  overlay: 'rgba(0,0,0,0)',
  // 恢复默认宣纸滤镜
  mapFilter: 'sepia(0.32) saturate(0.82) hue-rotate(-6deg) brightness(1.02) contrast(0.96)',
};

/** 主题展示顺序（图例/筛选控件的稳定排序） */
export const THEME_ORDER = [
  'navigation',
  'science',
  'engineering',
  'awakening',
  'civilization',
];

/** 全球连线级别配色规范（world/regional/echo） */
export const LINK_STYLES = {
  world:    { color: '#C9A84C', rgb: [201, 168,  76], width: 2.5, opacity: 0.85 },
  regional: { color: '#E8A030', rgb: [232, 160,  48], width: 1.5, opacity: 0.70 },
  echo:     { color: '#5ECFB1', rgb: [ 94, 207, 177], width: 1.0, opacity: 0.60 },
};

/** 底图配色（v4 山水画 · 清明上河图设色：石青石绿 + 淡赭墨勾线） */
export const BASEMAP_COLORS = {
  background:    '#E6D7B6',  // 宣纸暖黄（陆地 / 背景）
  water:         '#9CC2B6',  // 石绿黛青（水域）
  boundary:      '#6E5536',  // 淡赭墨（行政边界勾线）
  boundaryWidth: 1,
  green:         '#B8C79A',  // 石绿（山峦草木）
  road:          '#C9B68C',  // 淡赭墨（道路勾线）
};

/** 大湾区全局视角相机参数 */
export const GLOBAL_VIEW = {
  center:  [113.95, 22.58],
  zoom:    9.1,
  pitch:   0,
  bearing: 0,
};

/** 点击锚点后的电影感聚焦相机参数（约 45°+ 倾斜） */
export const FOCUS_VIEW = {
  zoom:    14.5,
  pitch:   55,
  bearing: -18,
};

/** 大湾区地理范围（用于判断 GPS 定位是否落在区域内） */
export const BAY_AREA_BOUNDS = {
  minLng: 112.5,
  maxLng: 114.9,
  minLat: 21.5,
  maxLat: 23.6,
};

/**
 * 罗盘探索 · 默认模拟定位
 * GPS 获取失败 / 用户拒绝授权时回退到此坐标（默认福田中心），
 * 并在 UI 标注「模拟定位（路演）」，确保离线 / 无授权也能完整体验。
 */
export const DEFAULT_LOCATION = {
  center: [114.05, 22.54],
  label: {
    zh: '福田中心', en: 'Futian Center',
    ja: '福田中心', ko: '푸톈 중심', ru: 'Центр Футянь', es: 'Centro de Futian',
  },
};

/**
 * 出行方式（离线估算兜底 + 腾讯地图道路规划）。
 * speedKmh 仅用于本地估算；真实道路距离和时长由腾讯位置服务返回。
 */
export const TRAVEL_MODES = {
  walk: {
    key: 'walk',
    icon: '🚶',
    speedKmh: 5,
    label: { zh: '步行', en: 'Walking', ja: '徒歩', ko: '도보', ru: 'Пешком', es: 'A pie' },
  },
  drive: {
    key: 'drive',
    icon: '🚗',
    speedKmh: 30,
    label: { zh: '驾车', en: 'Driving', ja: '運転', ko: '운전', ru: 'Авто', es: 'En coche' },
  },
};
