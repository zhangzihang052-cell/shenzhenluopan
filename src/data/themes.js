// 主题图层配置 v3 —— 6+1 主题模式完整视觉 token（双语标签）
// 每个主题含：锚点色 / UI强调色 / 地图 CSS filter / 叠色 overlay / 短名称
// build: 2026-06-18
// overlay 使用 rgba() 字符串，由 index.html 中 #theme-overlay div + CSS transition 实现过渡。
// mapFilter 赋值给 #map 的 style.filter，CSS transition:filter 自动平滑插值。

/**
 * @typedef {'navigation'|'science'|'engineering'|'reform'|'awakening'|'civilization'} ThemeKey
 */

export const THEMES = {
  navigation: {
    key: 'navigation',
    label: {
      zh: '海路贸易与海防门户', en: 'Sea Routes, Trade & Coastal Gates',
      ja: '海路貿易と海防の門', ko: '해로 무역과 해방 관문',
      ru: 'Морские пути, торговля и береговые ворота', es: 'Rutas marítimas, comercio y puertas costeras',
    },
    shortName: {
      zh: '海路海防', en: 'Sea Routes',
      ja: '海路海防', ko: '해로·해방',
      ru: 'Морские пути', es: 'Rutas marítimas',
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
      zh: '现代化与超级工程', en: 'Modernization & Mega-Engineering',
      ja: '近現代化と巨大工事', ko: '현대화와 초대형 공학',
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

  reform: {
    key: 'reform',
    label: {
      zh: '改革开放与制度创新', en: 'Reform, Opening & Institutional Innovation',
      ja: '改革開放と制度革新', ko: '개혁개방과 제도 혁신',
      ru: 'Реформы, открытость и институциональные инновации', es: 'Reforma, apertura e innovación institucional',
    },
    shortName: {
      zh: '改革开放', en: 'Reform & Opening',
      ja: '改革開放', ko: '개혁개방',
      ru: 'Реформы', es: 'Reforma',
    },
    // 锚点色：朱砂红，强调制度突破与时代转折。
    color: '#b23a2e',
    accentColor: '#b23a2e',
    overlay: 'rgba(64, 10, 8, 0.20)',
    mapFilter: 'sepia(0.28) saturate(0.95) hue-rotate(-18deg) brightness(0.98) contrast(1.02)',
  },

  awakening: {
    key: 'awakening',
    label: {
      zh: '风味民俗与城市生活', en: 'Flavors, Folkways & Urban Life',
      ja: '味わい・民俗・都市生活', ko: '맛·민속·도시 생활',
      ru: 'Вкусы, обычаи и городская жизнь', es: 'Sabores, costumbres y vida urbana',
    },
    shortName: {
      zh: '风味民俗', en: 'Folk Life',
      ja: '民俗生活', ko: '민속 생활',
      ru: 'Обычаи', es: 'Vida popular',
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
      zh: '千年文脉与岭南文明', en: 'Millennial Culture & Lingnan Civilization',
      ja: '千年の文脈と嶺南文明', ko: '천년 문맥과 영남 문명',
      ru: 'Тысячелетняя культура и цивилизация Линнаня', es: 'Cultura milenaria y civilización Lingnan',
    },
    shortName: {
      zh: '岭南文脉', en: 'Lingnan Culture',
      ja: '嶺南文脈', ko: '영남 문맥',
      ru: 'Линнаньская культура', es: 'Cultura Lingnan',
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
  // 矢量水墨 v7：色彩已在图层级精确控制，滤镜仅保留极轻微暖调，保证线条锐利。
  mapFilter: 'sepia(0.04) saturate(0.98) brightness(1.01) contrast(1.0)',
};

/** 主题展示顺序（图例/筛选控件的稳定排序） */
export const THEME_ORDER = [
  'navigation',
  'science',
  'engineering',
  'reform',
  'awakening',
  'civilization',
];

/** 全球连线级别配色规范（world/regional/echo） */
export const LINK_STYLES = {
  world:    { color: '#C9A84C', rgb: [201, 168,  76], width: 2.5, opacity: 0.85 },
  regional: { color: '#E8A030', rgb: [232, 160,  48], width: 1.5, opacity: 0.70 },
  echo:     { color: '#5ECFB1', rgb: [ 94, 207, 177], width: 1.0, opacity: 0.60 },
};

/** 底图配色（v7 矢量水墨：宣纸暖米陆地 + 清透青黛水域 + 浓墨海岸线，矢量渲染放大始终清晰） */
export const BASEMAP_COLORS = {
  background:    '#E4D8BC',  // 宣纸暖米（陆地 / 背景）
  water:         '#A7C0BA',  // 清透青黛水色（水域，与陆地明确区分）
  boundary:      '#7A6749',  // 淡墨赭线（行政边界）
  boundaryWidth: 1.2,
  green:         '#C4CBA2',  // 山色淡绿
  road:          '#A8906C',  // 淡赭墨（道路勾线）
  waterLine:     '#3C4F48',  // 浓墨海岸线（矢量线，随缩放渐粗，始终锐利）
};

/**
 * 水墨艺术叠加层（raster image 源，分级显示）
 * 铺在矢量水墨底图之上、锚点之下，随缩放淡出：
 * 总览态(zoom≤fadeStart)显示完整水墨画风；放大到街道级(zoom≥fadeEnd)完全淡出，
 * 露出下方清晰锐利的矢量地图。兼得"画风"与"放大清晰"。
 * coordinates 顺序：左上(TL) → 右上(TR) → 右下(BR) → 左下(BL)。
 */
export const INK_BASEMAP = {
  url: './public/textures/ink-basemap-hd-clean.png',
  west: 112.4,
  south: 21.4,
  east: 115.0,
  north: 23.8,
  fadeStart: 11,   // 此缩放级别及以下：水墨画完全不透明
  fadeEnd: 13.5,   // 此缩放级别及以上：水墨画完全淡出，露出清晰矢量
  get coordinates() {
    return [
      [this.west, this.north],
      [this.east, this.north],
      [this.east, this.south],
      [this.west, this.south],
    ];
  },
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
 * GPS 获取失败 / 用户拒绝授权时回退到此坐标（默认腾讯滨海大厦），
 * 并在 UI 标注「模拟定位（路演）」，确保离线 / 无授权也能完整体验。
 */
export const DEFAULT_LOCATION = {
  center: [113.9304075, 22.5258747],
  label: {
    zh: '腾讯滨海大厦', en: 'Tencent Binhai Building',
    ja: 'テンセント海岸ビル', ko: '텐센트 빈하이 빌딩', ru: 'Tencent Binhai Building', es: 'Edificio Tencent Binhai',
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