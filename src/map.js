// 地图引擎模块 v2：深墨暖色底图 + 菱形发光呼吸锚点 + FlyTo + GPS/Haversine + deck.gl ArcLayer 全球连线
// build: 2026-06-18
import { ANCHORS } from './data/anchors.js?rev=classification-1';
import {
  THEMES,
  THEME_ORDER,
  GLOBAL_VIEW,
  FOCUS_VIEW,
  BAY_AREA_BOUNDS,
  BASEMAP_COLORS,
  LINK_STYLES,
  DEFAULT_LOCATION,
} from './data/themes.js?rev=clean-8';

const SOURCE_ID = 'anchors';
const HOVER_SOURCE_ID = 'anchor-hover';
const GLOW_LAYER = 'anchor-glow';
const PULSE_LAYER = 'anchor-pulse';
const CORE_LAYER = 'anchor-core';
const HOVER_CORE_LAYER = 'anchor-hover-core';
const LABEL_TIER_1_LAYER = 'anchor-label-tier-1';
const LABEL_TIER_2_LAYER = 'anchor-label-tier-2';
const LABEL_TIER_3_LAYER = 'anchor-label-tier-3';
const ANCHOR_RENDER_LAYERS = [GLOW_LAYER, PULSE_LAYER, CORE_LAYER];
const LABEL_LAYER_DEFS = [];

// 当前总览层级只露出这些“叙事骨架”锚点；继续放大后再逐层补全。
const PRIMARY_LABEL_IDS = new Set([
  'M01',      // 赤湾天后宫
  'M02',      // 罗浮山
  'M11',      // 莲花山
  'N-CV02',   // 南越王宫
  'N-CV04',   // 开平碉楼
  'N-EG03',   // 港珠澳大桥
  'N-SC02',   // 腾讯滨海
  'N-SC03',   // 大疆天空之城
  'N-NA04',   // 黄埔古港
]);

const LABEL_ALIASES = {
  M02: '罗浮山',
  M07: '深圳河红树林',
  M08: '前海',
  M09: '文天祥故里',
  M11: '莲花山',
  M12: '大梅沙',
  'N-CV02': '南越王宫',
  'N-CV03': '鹤湖新居',
  'N-CV04': '开平碉楼',
  'N-CV08': '大三巴牌坊',
  'N-CV10': '南社古村',
  'N-EG03': '港珠澳大桥',
  'N-EG04': '东深供水',
  'N-EG07': '横琴合作区',
  'N-EG09': '西九龙站',
  'N-SC01': '华强北',
  'N-SC02': '腾讯滨海',
  'N-SC03': '大疆天空之城',
  'N-SC04': '光明科学城',
  'N-SC06': '中大南校园',
  'N-SC08': '散裂中子源',
  'N-SC10': '澳大横琴校区',
  'N-AW02': '深井烧鹅',
  'N-AW03': '顺德粤菜',
  'N-AW04': '元朗盆菜',
  'N-AW05': '永庆坊',
  'N-AW07': '石岐老街',
  'N-AW09': '大澳渔村',
  'N-NA01': '屯门季风港',
  'N-NA02': '伶仃洋',
  'N-NA03': '维多利亚港',
  'N-NA04': '黄埔古港',
  'N-NA05': '南沙天后宫',
  'N-NA08': '平海古城',
};

// 路线图层（一键主题路线）：底衬线 + 流动主线
const ROUTE_SOURCE = 'theme-route';
const ROUTE_CASING = 'route-casing';
const ROUTE_LINE = 'route-line';
const ROUTE_FLOW = 'route-flow';

// 古风底图：CARTO Voyager 暖色矢量瓦片（配合宣纸色彩覆盖，呈现中国古典地图风格）
const BASEMAP_STYLE =
  'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

/** 菱形 SVG 图标：白色"纸雕"外晕 + 主题色实心 + 深墨描边。
 *  浅色宣纸底图(#EDE0C4)上，白晕负责把锚点"托离"纸面，
 *  深墨描边勾勒轮廓，即使金黄系主题色也能清晰分辨。*/
function makeDiamondIcon(size, fill, stroke) {
  const c = size / 2;
  return (
    'data:image/svg+xml;charset=utf-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
        `<path d="M${c} 1 L${size - 1} ${c} L${c} ${size - 1} L1 ${c} Z" fill="#FFFFFF"/>` +
        `<path d="M${c} 5 L${size - 5} ${c} L${c} ${size - 5} L5 ${c} Z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>` +
        `</svg>`
    )
  );
}

/** 将 SVG dataURL 载入为 ImageBitmap/HTMLImageElement */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function anchorLabelTier(anchor) {
  if (PRIMARY_LABEL_IDS.has(anchor.id)) return 1;
  if (anchor.worldImpact) return 2;
  return 3;
}

function anchorLabelName(anchor) {
  if (LABEL_ALIASES[anchor.id]) return LABEL_ALIASES[anchor.id];
  return anchor.name && anchor.name.zh ? anchor.name.zh : anchor.id;
}

function labelFilter(tier, baseFilter) {
  const tierFilter = ['==', ['get', 'labelTier'], tier];
  return baseFilter ? ['all', tierFilter, baseFilter] : tierFilter;
}

function applyAnchorAndLabelFilters(map, baseFilter) {
  ANCHOR_RENDER_LAYERS.forEach((layer) => {
    if (map.getLayer(layer)) map.setFilter(layer, baseFilter);
  });
  LABEL_LAYER_DEFS.forEach(({ id, tier }) => {
    if (map.getLayer(id)) map.setFilter(id, labelFilter(tier, baseFilter));
  });
}

function addAnchorLabelLayers(map) {
  LABEL_LAYER_DEFS.forEach(({ id, tier, minzoom, sizeStops }) => {
    if (map.getLayer(id)) return;
    map.addLayer({
      id,
      type: 'symbol',
      source: SOURCE_ID,
      minzoom,
      filter: labelFilter(tier),
      layout: {
        'text-field': ['get', 'label'],
        'text-size': ['interpolate', ['linear'], ['zoom'], ...sizeStops],
        'text-anchor': 'bottom',
        'text-offset': [0, -1.15],
        'text-max-width': 8,
        'text-letter-spacing': 0.02,
        'text-padding': 4,
        'text-allow-overlap': false,
        'text-ignore-placement': false,
        'text-optional': true,
        'symbol-sort-key': ['-', 4, ['get', 'labelTier']],
      },
      paint: {
        'text-color': [
          'case',
          ['==', ['get', 'labelTier'], 1],
          '#3b2918',
          '#5a4326',
        ],
        'text-halo-color': 'rgba(255, 250, 235, 0.94)',
        'text-halo-width': ['interpolate', ['linear'], ['zoom'], 8.5, 1.8, 13, 2.4],
        'text-halo-blur': 0.45,
        'text-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          minzoom,
          0,
          minzoom + 0.22,
          tier === 1 ? 0.96 : 0.86,
        ],
      },
    });
  });
}

/** 将锚点转换为 GeoJSON */
function anchorsToGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: ANCHORS.map((a) => ({
      type: 'Feature',
      id: a.id,
      geometry: { type: 'Point', coordinates: a.coordinates },
      properties: {
        id: a.id,
        name: a.name && a.name.zh ? a.name.zh : a.id,
        label: anchorLabelName(a),
        labelTier: anchorLabelTier(a),
        theme: a.theme,
        color: THEMES[a.theme] ? THEMES[a.theme].color : '#9a7b32',
        worldImpact: a.worldImpact ? 1 : 0,
      },
    })),
  };
}

/** 矢量水墨底图：保留矢量图层由引擎渲染（放大始终清晰），逐类样式化为水墨风 */
function simplifyBasemap(map) {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  const C = BASEMAP_COLORS;
  const has = (id, ...keys) => keys.some((k) => id.includes(k));

  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    const type = layer.type;
    try {
      // ① 噪声图层隐藏：POI / 门牌 / 公交 / 水系名 / 机场 / 建筑顶
      if (
        has(id, 'poi', 'housenum', 'transit', 'aeroway', 'waterway_label', 'watername', 'building-top') ||
        (has(id, 'road') && has(id, 'label'))
      ) {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
        continue;
      }

      // ② 背景 / 陆地 → 宣纸暖米
      if (type === 'background') {
        map.setPaintProperty(layer.id, 'background-color', C.background);
        continue;
      }
      if (type === 'fill' && has(id, 'landcover', 'landuse', 'background')) {
        map.setPaintProperty(layer.id, 'fill-color', C.background);
        map.setPaintProperty(layer.id, 'fill-opacity', 1);
        continue;
      }

      // ③ 绿地 / 公园 / 林地 → 山色淡绿（山水画草木设色）
      if (type === 'fill' && has(id, 'park', 'grass', 'wood', 'forest', 'vegetation', 'nature')) {
        map.setPaintProperty(layer.id, 'fill-color', C.green);
        map.setPaintProperty(layer.id, 'fill-opacity', 0.45);
        continue;
      }

      // ④ 水域填充 → 淡青黛（山水画水色）
      if (type === 'fill' && has(id, 'water')) {
        map.setPaintProperty(layer.id, 'fill-color', C.water);
        map.setPaintProperty(layer.id, 'fill-opacity', 1);
        continue;
      }

      // ⑤ 海岸线 / 水系线 → 浓墨勾勒（矢量线，放大始终锐利，随缩放渐粗）
      if (type === 'line' && has(id, 'water')) {
        map.setPaintProperty(layer.id, 'line-color', C.waterLine || C.water);
        map.setPaintProperty(layer.id, 'line-opacity', 0.7);
        map.setPaintProperty(layer.id, 'line-width', [
          'interpolate', ['linear'], ['zoom'], 8, 0.8, 12, 1.6, 15, 2.6, 18, 4,
        ]);
        continue;
      }

      // ⑥ 道路：case(描边) 用淡宣纸色让路"浮"出，fill(路面) 用赭墨勾线
      if (type === 'line' && has(id, 'road', 'bridge', 'tunnel', 'transportation')) {
        if (has(id, 'case')) {
          map.setPaintProperty(layer.id, 'line-color', '#EFE6CF');
          map.setPaintProperty(layer.id, 'line-opacity', 0.55);
        } else {
          map.setPaintProperty(layer.id, 'line-color', C.road);
          map.setPaintProperty(layer.id, 'line-opacity', 0.72);
        }
        continue;
      }

      // ⑦ 铁路 → 淡墨虚线感
      if (type === 'line' && has(id, 'rail')) {
        map.setPaintProperty(layer.id, 'line-color', C.boundary);
        map.setPaintProperty(layer.id, 'line-opacity', 0.5);
        continue;
      }

      // ⑧ 行政边界 → 淡赭墨勾线
      if (type === 'line' && has(id, 'boundary', 'admin')) {
        map.setPaintProperty(layer.id, 'line-color', C.boundary);
        map.setPaintProperty(layer.id, 'line-width', C.boundaryWidth);
        map.setPaintProperty(layer.id, 'line-opacity', 0.5);
        continue;
      }

      // ⑨ 建筑轮廓 → 淡赭墨半透明填充（近景层次，不喧宾夺主）
      if (type === 'fill' && has(id, 'building')) {
        map.setPaintProperty(layer.id, 'fill-color', '#D8C79E');
        map.setPaintProperty(layer.id, 'fill-opacity', 0.5);
        map.setPaintProperty(layer.id, 'fill-outline-color', 'rgba(90,77,60,0.4)');
        continue;
      }

      // ⑩ 地名题字 → 墨色字 + 宣纸描边（任何底色上都清晰可读）
      if (type === 'symbol' && has(id, 'place', 'label')) {
        map.setLayoutProperty(layer.id, 'visibility', 'visible');
        map.setPaintProperty(layer.id, 'text-color', '#3A2E20');
        map.setPaintProperty(layer.id, 'text-halo-color', 'rgba(240, 232, 210, 0.95)');
        map.setPaintProperty(layer.id, 'text-halo-width', 1.6);
        map.setPaintProperty(layer.id, 'text-halo-blur', 0.3);
        continue;
      }
    } catch (e) {
      /* 某些图层属性不可设置，忽略 */
    }
  }
}

function add3DBuildings(map) {
  try {
    const style = map.getStyle();
    const vectorEntry = Object.entries(style.sources || {}).find(
      ([, s]) => s.type === 'vector'
    );
    if (!vectorEntry) return;
    const sourceId = vectorEntry[0];
    const labelLayer = (style.layers || []).find((l) => l.type === 'symbol');
    const beforeId = labelLayer ? labelLayer.id : undefined;

    map.addLayer(
      {
        id: '3d-buildings',
        source: sourceId,
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', 'render_height'], 12],
            0, '#D4BA8A',
            60, '#B89660',
            180, '#9A7A3A',
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            13, 0,
            14.5, ['coalesce', ['get', 'render_height'], 12],
          ],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.82,
        },
      },
      beforeId
    );
  } catch (e) {
    /* 建筑数据不可用，降级为 2.5D 倾斜视角 */
  }
}

/** Haversine 球面距离（公里） */
export function haversineKm(lng1, lat1, lng2, lat2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 创建并初始化地图
 * @param {Object} opts
 * @param {(anchor:Object)=>void} opts.onSelect    点击本地锚点回调
 * @param {(link:Object)=>void} opts.onSelectForeign 点击国外节点回调
 * @param {()=>void} opts.onReady                  地图就绪回调
 * @returns {Object} 地图控制器
 */
export function createMap({ onSelect, onSelectForeign, onReady }) {
  const map = new maplibregl.Map({
    container: 'map',
    style: BASEMAP_STYLE,
    center: GLOBAL_VIEW.center,
    zoom: GLOBAL_VIEW.zoom,
    pitch: GLOBAL_VIEW.pitch,
    bearing: GLOBAL_VIEW.bearing,
    attributionControl: false,
    antialias: true,
    maxPitch: 75,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');

  let pulseT = 0;
  let rafId = 0;
  let selectedId = null;
  let hoveredAnchorId = null;
  let coreUsesSymbol = false;
  let clueFocusIds = [];
  let clueFocusActiveId = null;
  let userMarker = null;
  let foreignMarkers = [];
  let deckOverlay = null;
  /** 主题模式下增强锚点可见性（光晕更大、常亮更强）*/
  let themeBoostActive = false;
  /** 路线流动动画 rafId */
  let routeFlowRaf = 0;
  /** 已通关锚点的印章标记 marker 列表 */
  let stampMarkers = [];
  /** 当前用户坐标 [lng,lat]（GPS 或模拟），供地理围栏与路线起点使用 */
  let userPos = null;

  // ---- deck.gl 叠加层初始化（与 MapLibre 联动）----
  function initDeck() {
    try {
      if (typeof deck === 'undefined' || !deck.MapboxOverlay) return;
      deckOverlay = new deck.MapboxOverlay({
        interleaved: false,
        layers: [],
      });
      map.addControl(deckOverlay);
    } catch (e) {
      /* deck.gl 不可用时，连线功能静默降级 */
      deckOverlay = null;
    }
  }

  map.on('load', async () => {
    simplifyBasemap(map);
    add3DBuildings(map);
    initDeck();

    // 文化锚点按主题着色：为每个主题烘焙一枚菱形图标，深墨描边确保浅色宣纸底图上清晰可辨。
    // 记忆/好友锚点由各自模块烘焙，不在此处理。
    try {
      const INK = '#2B1C0E'; // 深墨描边色
      for (const key of THEME_ORDER) {
        const imgId = `diamond-${key}`;
        if (map.hasImage(imgId)) continue;
        const themeImg = await loadImage(makeDiamondIcon(32, THEMES[key].color, INK));
        map.addImage(imgId, themeImg);
      }
      // 兜底通用图标（theme 缺失时使用，金色）
      if (!map.hasImage('diamond-core')) {
        const fallback = await loadImage(makeDiamondIcon(32, '#9a7b32', INK));
        map.addImage('diamond-core', fallback);
      }
    } catch (e) {
      /* 图标载入失败，降级用圆点 */
    }

    map.addSource(SOURCE_ID, { type: 'geojson', data: anchorsToGeoJSON() });
    map.addSource(HOVER_SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    const hoveredFeature = ['boolean', ['feature-state', 'hover'], false];

    // 1) 轻量柔光：只辅助识别，不与主探索入口争夺焦点。
    map.addLayer({
      id: GLOW_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-color': ['get', 'color'],
        'circle-blur': 1,
        'circle-opacity': ['case', hoveredFeature, 1, 0.2],
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, ['case', hoveredFeature, 18, 8], 14, ['case', hoveredFeature, 36, 18]],
      },
    });

    // 2) 呼吸脉冲环（半径由动画驱动）——深墨色描边，浅色宣纸底图上每个锚点都清晰可辨
    map.addLayer({
      id: PULSE_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-color': 'rgba(0,0,0,0)',
        'circle-stroke-color': '#2B1C0E',
        'circle-stroke-width': 1,
        'circle-stroke-opacity': ['case', hoveredFeature, 1, 0.36],
        'circle-radius': ['case', hoveredFeature, 16, 6],
      },
    });

    // 3) 核心：菱形符号（图标可用）+ 兜底圆点
    if (map.hasImage('diamond-core')) {
      coreUsesSymbol = true;
      map.addLayer({
        id: CORE_LAYER,
        type: 'symbol',
        source: SOURCE_ID,
        layout: {
          // 按主题引用各自烘焙的菱形图标；
          // icon-color 对非 SDF 图标无效，故颜色直接烘焙进图标本身
          'icon-image': ['concat', 'diamond-', ['get', 'theme']],
          'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.55, 14, 1.05],
          'icon-allow-overlap': true,
          'icon-rotate': 0,
        },
        paint: {
          'icon-opacity': ['case', hoveredFeature, 1, 0.86],
        },
      });
    } else {
      map.addLayer({
        id: CORE_LAYER,
        type: 'circle',
        source: SOURCE_ID,
        paint: {
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#2B1C0E',
          'circle-stroke-width': 2,
          'circle-opacity': ['case', hoveredFeature, 1, 0.86],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, ['case', hoveredFeature, 5, 4], 14, ['case', hoveredFeature, 10, 8]],
        },
      });
    }

    // Symbol 布局不支持 feature-state 尺寸；用单独的悬停图层只放大当前菱形。
    if (coreUsesSymbol) {
      map.addLayer({
        id: HOVER_CORE_LAYER,
        type: 'symbol',
        source: HOVER_SOURCE_ID,
        layout: {
          'icon-image': ['concat', 'diamond-', ['get', 'theme']],
          'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.72, 14, 1.37],
          'icon-allow-overlap': true,
        },
        paint: { 'icon-opacity': 1 },
      });
    }
    addAnchorLabelLayers(map);

    function setHoveredAnchor(nextId) {
      if (hoveredAnchorId === nextId) return;
      if (hoveredAnchorId != null) map.setFeatureState({ source: SOURCE_ID, id: hoveredAnchorId }, { hover: false });
      hoveredAnchorId = nextId;
      if (hoveredAnchorId != null) map.setFeatureState({ source: SOURCE_ID, id: hoveredAnchorId }, { hover: true });
      if (coreUsesSymbol) {
        const anchor = ANCHORS.find((item) => item.id === hoveredAnchorId);
        const source = map.getSource(HOVER_SOURCE_ID);
        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features: anchor
              ? [{
                  type: 'Feature',
                  geometry: { type: 'Point', coordinates: anchor.coordinates },
                  properties: { theme: anchor.theme },
                }]
              : [],
          });
        }
      }
    }

    // Hover 用同一份 feature-state 同时放大菱形、柔光与脉冲环。
    [CORE_LAYER, GLOW_LAYER].forEach((layer) => {
      map.on('mousemove', layer, (e) => {
        const feature = e.features && e.features[0];
        if (feature) setHoveredAnchor(feature.id || feature.properties.id);
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layer, () => {
        setHoveredAnchor(null);
        map.getCanvas().style.cursor = '';
      });
    });

    // 点击锚点
    const handleClick = (e) => {
      const f = e.features && e.features[0];
      if (!f) return;
      const anchor = ANCHORS.find((a) => a.id === f.properties.id);
      if (anchor && onSelect) onSelect(anchor);
    };
    map.on('click', CORE_LAYER, handleClick);
    map.on('click', GLOW_LAYER, handleClick);

    // 柔和的向外波纹：核心和底光保持稳定，避免整颗锚点明暗闪烁。
    const animate = () => {
      pulseT += 0.028;
      const t = (pulseT % (Math.PI * 2)) / (Math.PI * 2); // 0..1，单向外扩
      if (map.getLayer(PULSE_LAYER) && map.getLayer(GLOW_LAYER) && map.getLayer(CORE_LAYER)) {
        // 克制的向外波纹：保持可感知，但不抢占锚点本身的视觉焦点。
        const rippleRadius = 6 + t * 11;
        // 起点和终点均淡出，半径重置发生在不可见状态，避免视觉上像快速回缩。
        const rippleOpacity = 0.36 * Math.sin(Math.PI * t);
        if (clueFocusIds.length) {
          const clueIds = ['in', ['get', 'id'], ['literal', clueFocusIds]];
          const activeClue = clueFocusActiveId || '__none__';
          map.setPaintProperty(PULSE_LAYER, 'circle-radius', [
            'case',
            ['==', ['get', 'id'], activeClue], rippleRadius + 4,
            clueIds, rippleRadius,
            0,
          ]);
          map.setPaintProperty(PULSE_LAYER, 'circle-stroke-opacity', [
            'case',
            hoveredFeature, 0.82,
            ['==', ['get', 'id'], activeClue], Math.min(0.5, rippleOpacity + 0.12),
            clueIds, rippleOpacity * 0.72,
            0,
          ]);
          map.setPaintProperty(GLOW_LAYER, 'circle-opacity', [
            'case',
            hoveredFeature, 1,
            ['==', ['get', 'id'], activeClue], 0.92,
            clueIds, 0.64,
            0.06,
          ]);
          map.setPaintProperty(CORE_LAYER, coreUsesSymbol ? 'icon-opacity' : 'circle-opacity', [
            'case',
            hoveredFeature, 1,
            ['==', ['get', 'id'], activeClue], 1,
            clueIds, 0.96,
            0.34,
          ]);
        } else {
          map.setPaintProperty(PULSE_LAYER, 'circle-radius', rippleRadius);
          map.setPaintProperty(PULSE_LAYER, 'circle-stroke-opacity', ['case', hoveredFeature, 1, rippleOpacity]);
          map.setPaintProperty(GLOW_LAYER, 'circle-opacity', ['case', hoveredFeature, 1, 0.2]);
          map.setPaintProperty(CORE_LAYER, coreUsesSymbol ? 'icon-opacity' : 'circle-opacity', ['case', hoveredFeature, 1, 0.86]);
        }
      }
      rafId = requestAnimationFrame(animate);
    };
    animate();

    if (onReady) onReady();
  });

  // 控制器 API 在下半部分定义
  return buildController({
    map,
    getSelectedId: () => selectedId,
    setSelectedId: (v) => (selectedId = v),
    setClueFocus: (ids, activeId) => {
      clueFocusIds = Array.isArray(ids) ? ids : [];
      clueFocusActiveId = activeId || null;
    },
    getThemeBoost: () => themeBoostActive,
    setThemeBoost: (v) => (themeBoostActive = v),
    getRouteFlowRaf: () => routeFlowRaf,
    setRouteFlowRaf: (v) => (routeFlowRaf = v),
    getStampMarkers: () => stampMarkers,
    setStampMarkers: (v) => (stampMarkers = v),
    getUserPos: () => userPos,
    setUserPos: (v) => (userPos = v),
    getUserMarker: () => userMarker,
    setUserMarker: (v) => (userMarker = v),
    getForeignMarkers: () => foreignMarkers,
    setForeignMarkers: (v) => (foreignMarkers = v),
    getDeckOverlay: () => deckOverlay,
    getRafId: () => rafId,
    onSelectForeign,
    layers: { GLOW_LAYER, PULSE_LAYER, CORE_LAYER },
  });
}

/** 构建地图控制器 API */
function buildController(ctx) {
  const { map, layers, onSelectForeign } = ctx;
  const { GLOW_LAYER, PULSE_LAYER, CORE_LAYER } = layers;

  /** 当前锚点高亮表达式（菱形 symbol 用 icon-size，圆点用 circle-radius）*/
  function applyHighlight(selectedId) {
    if (!map.getLayer(CORE_LAYER)) return;
    const isSymbol = map.getLayer(CORE_LAYER).type === 'symbol';
    if (isSymbol) {
      map.setLayoutProperty(CORE_LAYER, 'icon-size', [
        'interpolate',
        ['linear'],
        ['zoom'],
        8,
        ['case', ['==', ['get', 'id'], selectedId], 1.6, 0.55],
        14,
        ['case', ['==', ['get', 'id'], selectedId], 1.6, 1.05],
      ]);
    } else {
      map.setPaintProperty(CORE_LAYER, 'circle-radius', [
        'interpolate',
        ['linear'],
        ['zoom'],
        8,
        ['case', ['==', ['get', 'id'], selectedId], 13, 4],
        14,
        ['case', ['==', ['get', 'id'], selectedId], 13, 8],
      ]);
    }
    map.setPaintProperty(GLOW_LAYER, 'circle-opacity', [
      'case',
      ['==', ['get', 'id'], selectedId],
      0.85,
      0.16,
    ]);
  }

  function resetHighlight() {
    if (!map.getLayer(CORE_LAYER)) return;
    const isSymbol = map.getLayer(CORE_LAYER).type === 'symbol';
    if (isSymbol) {
      map.setLayoutProperty(CORE_LAYER, 'icon-size', [
        'interpolate', ['linear'], ['zoom'], 8, 0.55, 14, 1.05,
      ]);
    } else {
      map.setPaintProperty(CORE_LAYER, 'circle-radius', [
        'interpolate', ['linear'], ['zoom'], 8, 4, 14, 8,
      ]);
    }
  }

  /** 放置/更新"我的位置"罗盘脉冲 marker（区别于 GPS 蓝点，带旋转罗盘指针）*/
  function placeUserMarker(lng, lat, simulated) {
    if (ctx.getUserMarker()) ctx.getUserMarker().remove();
    const el = document.createElement('div');
    el.className = 'compass-marker' + (simulated ? ' simulated' : '');
    el.innerHTML =
      '<div class="cm-pulse"></div><div class="cm-pulse cm-pulse2"></div>' +
      '<div class="cm-core"><span class="cm-needle"></span></div>';
    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map);
    ctx.setUserMarker(marker);
  }

  function isMobileAppView() {
    return window.matchMedia('(max-width: 820px)').matches;
  }

  function pulseUserMarker() {
    const marker = ctx.getUserMarker();
    const el = marker && marker.getElement ? marker.getElement() : null;
    if (!el) return;
    el.classList.remove('is-locating-focus');
    // 强制重启动画，让连续点击定位时也有明确反馈。
    void el.offsetWidth;
    el.classList.add('is-locating-focus');
    window.setTimeout(() => el.classList.remove('is-locating-focus'), 2600);
  }

  function flyToUserLocation(lng, lat, { inBay = true, duration = 2200 } = {}) {
    const mobileView = isMobileAppView();
    const zeroPadding = { top: 0, bottom: 0, left: 0, right: 0 };

    if (typeof map.stop === 'function') map.stop();
    if (typeof map.resize === 'function') map.resize();
    if (mobileView && typeof map.setPadding === 'function') map.setPadding(zeroPadding);

    const camera = {
      center: [lng, lat],
      zoom: mobileView ? (inBay ? 13.2 : 9.6) : (inBay ? 12.5 : 9.1),
      pitch: mobileView ? (inBay ? 26 : 0) : (inBay ? 45 : 0),
      bearing: 0,
      essential: true,
      retainPadding: false,
      offset: [0, 0],
      padding: mobileView ? zeroPadding : { left: 380, top: 0, bottom: 0, right: 0 },
    };

    if (mobileView && typeof map.easeTo === 'function') {
      map.easeTo({
        ...camera,
        duration: Math.min(duration, 1050),
        easing: (t) => 1 - Math.pow(1 - t, 4),
      });
    } else {
      map.flyTo({
        ...camera,
        duration,
        curve: 1.45,
      });
    }
    pulseUserMarker();
  }

  return {
    map,

    /** 按主题筛选显隐锚点 */
    setVisibleThemes(visibleSet) {
      const visible = Array.from(visibleSet);
      const filter =
        visible.length === 0
          ? ['==', ['get', 'theme'], '__none__']
          : ['in', ['get', 'theme'], ['literal', visible]];
      applyAnchorAndLabelFilters(map, filter);
    },

    /** 选中锚点：FlyTo + 高亮 */
    selectAnchor(anchor) {
      ctx.setSelectedId(anchor.id);
      map.flyTo({
        center: anchor.coordinates,
        zoom: FOCUS_VIEW.zoom,
        pitch: FOCUS_VIEW.pitch,
        bearing: FOCUS_VIEW.bearing,
        duration: 2600,
        curve: 1.6,
        essential: true,
        padding: { right: 440, top: 0, bottom: 0, left: 0 },
      });
      applyHighlight(anchor.id);
    },

    /** FlyTo 任意坐标（国外节点用）*/
    flyToCoord(coord, zoom = 5) {
      map.flyTo({
        center: coord,
        zoom,
        pitch: 0,
        bearing: 0,
        duration: 3000,
        curve: 1.5,
        essential: true,
      });
    },

    /** 复位相机与样式 */
    reset() {
      ctx.setSelectedId(null);
      ctx.setThemeBoost(false); // 清除主题增强，恢复总览默认视觉
      if (typeof map.stop === 'function') map.stop();
      if (typeof map.setPadding === 'function') map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
      map.flyTo({
        center: GLOBAL_VIEW.center,
        zoom: GLOBAL_VIEW.zoom,
        pitch: GLOBAL_VIEW.pitch,
        bearing: GLOBAL_VIEW.bearing,
        duration: 1500,
        curve: 1,
        essential: true,
      });
      resetHighlight();
      if (map.getLayer(GLOW_LAYER)) {
        map.setPaintProperty(GLOW_LAYER, 'circle-opacity', 0.45);
        // 恢复正常光晕半径与模糊度
        map.setPaintProperty(GLOW_LAYER, 'circle-radius',
          ['interpolate', ['linear'], ['zoom'], 8, 12, 14, 30]);
        map.setPaintProperty(GLOW_LAYER, 'circle-blur', 1);
      }
      // 恢复菱形图标正常尺寸
      if (map.getLayer(CORE_LAYER)) {
        const coreType = map.getLayer(CORE_LAYER).type;
        if (coreType === 'symbol') {
          map.setLayoutProperty(CORE_LAYER, 'icon-size',
            ['interpolate', ['linear'], ['zoom'], 8, 0.55, 14, 1.05]);
        } else {
          map.setPaintProperty(CORE_LAYER, 'circle-radius',
            ['interpolate', ['linear'], ['zoom'], 8, 4, 14, 8]);
          map.setPaintProperty(CORE_LAYER, 'circle-stroke-width', 2);
        }
      }
    },

    /** 按单一主题过滤锚点（themeKey='all' 时显示全部）*/
    setThemeFilter(themeKey) {
      const filter =
        themeKey === 'all'
          ? null
          : ['==', ['get', 'theme'], themeKey];
      applyAnchorAndLabelFilters(map, filter);

      // 叙事图层只负责筛选，不改变总览中锚点的尺寸、光晕或色彩表现。
      ctx.setThemeBoost(false);
    },

    /**
     * 飞行至某主题所有锚点的包围盒（主题切换后自动取景）
     * @param {CulturalAnchor[]} themeAnchors
     */
    flyToThemeBounds(themeAnchors) {
      if (!themeAnchors || themeAnchors.length === 0) return;
      if (themeAnchors.length === 1) {
        map.flyTo({
          center: themeAnchors[0].coordinates,
          zoom: 11.5,
          pitch: 28,
          bearing: 0,
          duration: 1800,
          curve: 1.4,
          essential: true,
        });
        return;
      }
      const lngs = themeAnchors.map((a) => a.coordinates[0]);
      const lats = themeAnchors.map((a) => a.coordinates[1]);
      const bounds = [
        [Math.min(...lngs) - 0.06, Math.min(...lats) - 0.06],
        [Math.max(...lngs) + 0.06, Math.max(...lats) + 0.06],
      ];
      map.fitBounds(bounds, {
        padding: { top: 80, bottom: 80, left: 80, right: 440 },
        maxZoom: 12.5,
        duration: 1800,
        curve: 1.4,
        essential: true,
      });
    },

    /** 仅复位锚点高亮与光晕，不改变相机（主题模式关闭面板时使用）*/
    clearSelection() {
      ctx.setSelectedId(null);
      resetHighlight();
      if (map.getLayer(GLOW_LAYER)) {
        // 主题模式保持增强亮度，总览模式恢复默认
        map.setPaintProperty(GLOW_LAYER, 'circle-opacity',
          ctx.getThemeBoost() ? 0.70 : 0.45);
      }
    },

    /** 经纬度 -> 屏幕像素 */
    project(lngLat) {
      return map.project(lngLat);
    },

    /**
     * 渲染全球影响力连线（deck.gl ArcLayer，动画射出）+ 国外节点标记
     * @param {[number,number]} origin 源锚点坐标
     * @param {GlobalLink[]} links
     */
    renderGlobalLinks(origin, links) {
      this.clearGlobalLinks();
      if (!links || links.length === 0) return;
      const overlay = ctx.getDeckOverlay();

      // 1) deck.gl ArcLayer 弧线（GPU 加速 + 动画射出）
      if (overlay && typeof deck !== 'undefined') {
        let t = 0;
        const buildLayer = () =>
          new deck.ArcLayer({
            id: 'global-arcs',
            data: links,
            getSourcePosition: () => origin,
            getTargetPosition: (d) => d.targetCoord,
            getSourceColor: (d) => {
              const s = LINK_STYLES[d.linkType] || LINK_STYLES.world;
              return [...s.rgb, Math.round(255 * s.opacity)];
            },
            getTargetColor: (d) => {
              const s = LINK_STYLES[d.linkType] || LINK_STYLES.world;
              return [...s.rgb, Math.round(255 * s.opacity)];
            },
            getWidth: (d) => (LINK_STYLES[d.linkType] || LINK_STYLES.world).width,
            getHeight: 0.5,
            greatCircle: true,
          });

        overlay.setProps({ layers: [buildLayer()] });

        // 动画射出：通过逐帧增加可见弧线比例模拟 0→1 渐变
        const animateArc = () => {
          t += 0.04;
          const visibleCount = Math.max(1, Math.ceil(links.length * Math.min(t, 1)));
          const partial = links.slice(0, visibleCount);
          overlay.setProps({
            layers: [
              new deck.ArcLayer({
                id: 'global-arcs',
                data: partial,
                getSourcePosition: () => origin,
                getTargetPosition: (d) => d.targetCoord,
                getSourceColor: (d) => {
                  const s = LINK_STYLES[d.linkType] || LINK_STYLES.world;
                  return [...s.rgb, Math.round(255 * s.opacity)];
                },
                getTargetColor: (d) => {
                  const s = LINK_STYLES[d.linkType] || LINK_STYLES.world;
                  return [...s.rgb, Math.round(255 * s.opacity * 0.9)];
                },
                getWidth: (d) => (LINK_STYLES[d.linkType] || LINK_STYLES.world).width,
                getHeight: 0.5,
                greatCircle: true,
              }),
            ],
          });
          if (t < 1) requestAnimationFrame(animateArc);
        };
        animateArc();
      }

      // 2) 国外目标节点：半透明金色小圆点
      const markers = [];
      links.forEach((link) => {
        const el = document.createElement('div');
        el.className = 'foreign-marker';
        el.title = (link.targetName && (link.targetName.zh || link.targetName.en)) || '';
        el.addEventListener('click', (ev) => {
          ev.stopPropagation();
          if (onSelectForeign) onSelectForeign(link);
        });
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(link.targetCoord)
          .addTo(map);
        markers.push(marker);
      });
      ctx.setForeignMarkers(markers);
    },

    /** 清除全球连线与国外节点 */
    clearGlobalLinks() {
      const overlay = ctx.getDeckOverlay();
      if (overlay) overlay.setProps({ layers: [] });
      ctx.getForeignMarkers().forEach((m) => m.remove());
      ctx.setForeignMarkers([]);
    },

    /**
     * GPS 定位：获取用户当前位置并标记 + 飞行
     * @param {Object} cb
     * @param {(info:{lng:number,lat:number,inBay:boolean})=>void} cb.onSuccess
     * @param {(reason:'denied'|'unavailable'|'error')=>void} cb.onError
     */
    locateUser({ onSuccess, onError } = {}) {
      if (!('geolocation' in navigator)) {
        if (onError) onError('unavailable');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lng = pos.coords.longitude;
          const lat = pos.coords.latitude;
          ctx.setUserPos([lng, lat]);

          if (ctx.getUserMarker()) ctx.getUserMarker().remove();
          const elMarker = document.createElement('div');
          elMarker.className = 'gps-marker';
          elMarker.innerHTML =
            '<div class="gps-ring"></div><div class="gps-core"></div>';
          const marker = new maplibregl.Marker({ element: elMarker })
            .setLngLat([lng, lat])
            .addTo(map);
          ctx.setUserMarker(marker);

          const inBay =
            lng >= BAY_AREA_BOUNDS.minLng &&
            lng <= BAY_AREA_BOUNDS.maxLng &&
            lat >= BAY_AREA_BOUNDS.minLat &&
            lat <= BAY_AREA_BOUNDS.maxLat;

          flyToUserLocation(lng, lat, { inBay, duration: 2600 });

          if (onSuccess) onSuccess({ lng, lat, inBay });
        },
        (err) => {
          if (onError) onError(err && err.code === 1 ? 'denied' : 'error');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    },

    /**
     * 罗盘定位：优先 GPS，失败/拒绝/不支持时回退 DEFAULT_LOCATION（模拟定位）。
     * 始终成功回调，保证离线 / 无授权也能完整体验。
     * @param {{onResult?:(info:{lng:number,lat:number,simulated:boolean,inBay:boolean})=>void}} cb
     */
    locateOrSimulate({ onResult } = {}) {
      const settle = (lng, lat, simulated) => {
        ctx.setUserPos([lng, lat]);
        placeUserMarker(lng, lat, simulated);
        const inBay =
          lng >= BAY_AREA_BOUNDS.minLng && lng <= BAY_AREA_BOUNDS.maxLng &&
          lat >= BAY_AREA_BOUNDS.minLat && lat <= BAY_AREA_BOUNDS.maxLat;
        flyToUserLocation(lng, lat, { inBay, duration: 1200 });
        if (onResult) onResult({ lng, lat, simulated, inBay });
      };
      const fallback = () =>
        settle(DEFAULT_LOCATION.center[0], DEFAULT_LOCATION.center[1], true);
      if (!('geolocation' in navigator)) return fallback();
      navigator.geolocation.getCurrentPosition(
        (pos) => settle(pos.coords.longitude, pos.coords.latitude, false),
        () => fallback(),
        { enableHighAccuracy: true, timeout: 3000, maximumAge: 0 }
      );
    },

    /** 当前用户坐标 [lng,lat]（未定位时为 null）*/
    getUserPosition() {
      return ctx.getUserPos();
    },

    /** 腾讯 POI 校准后刷新锚点数据源，保留当前地图交互状态。 */
    refreshAnchors() {
      const source = map.getSource(SOURCE_ID);
      if (source) source.setData(anchorsToGeoJSON());
    },

    /**
     * 绘制一键主题路线：深墨底衬 + 主题色主线 + 白色流动虚线动画。
     * @param {[number,number][]} coords 起点 + 各站点经纬度序列
     * @param {string} color 主题强调色
     */
    drawRoute(coords, color) {
      this.clearRoute();
      if (!coords || coords.length < 2) return;
      const geojson = {
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }],
      };
      if (map.getSource(ROUTE_SOURCE)) {
        map.getSource(ROUTE_SOURCE).setData(geojson);
      } else {
        map.addSource(ROUTE_SOURCE, { type: 'geojson', data: geojson });
      }
      const beforeId = map.getLayer(GLOW_LAYER) ? GLOW_LAYER : undefined;
      if (!map.getLayer(ROUTE_CASING)) {
        map.addLayer({
          id: ROUTE_CASING, type: 'line', source: ROUTE_SOURCE,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#2B1C0E', 'line-width': 7, 'line-opacity': 0.22, 'line-blur': 2 },
        }, beforeId);
      }
      if (!map.getLayer(ROUTE_LINE)) {
        map.addLayer({
          id: ROUTE_LINE, type: 'line', source: ROUTE_SOURCE,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': color, 'line-width': 3.4, 'line-opacity': 0.92 },
        }, beforeId);
      } else {
        map.setPaintProperty(ROUTE_LINE, 'line-color', color);
      }
      if (!map.getLayer(ROUTE_FLOW)) {
        map.addLayer({
          id: ROUTE_FLOW, type: 'line', source: ROUTE_SOURCE,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#FFF8E6', 'line-width': 3.4, 'line-opacity': 0.85, 'line-dasharray': [0, 4, 3] },
        }, beforeId);
      }
      // 流动动画：逐帧切换 dasharray，模拟虚线沿路径流动
      const dashSeq = [
        [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1], [2.5, 4, 0.5],
        [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2],
        [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
      ];
      let step = 0;
      let last = 0;
      const animateFlow = (ts) => {
        if (!map.getLayer(ROUTE_FLOW)) return;
        if (ts - last > 65) {
          step = (step + 1) % dashSeq.length;
          map.setPaintProperty(ROUTE_FLOW, 'line-dasharray', dashSeq[step]);
          last = ts;
        }
        ctx.setRouteFlowRaf(requestAnimationFrame(animateFlow));
      };
      ctx.setRouteFlowRaf(requestAnimationFrame(animateFlow));

      // 取景：飞至整条路线包围盒
      const lngs = coords.map((c) => c[0]);
      const lats = coords.map((c) => c[1]);
      map.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: { top: 90, bottom: 90, left: 400, right: 80 }, maxZoom: 13.5, duration: 1600, essential: true }
      );
    },

    /** 清除主题路线与流动动画 */
    clearRoute() {
      if (ctx.getRouteFlowRaf()) {
        cancelAnimationFrame(ctx.getRouteFlowRaf());
        ctx.setRouteFlowRaf(0);
      }
      [ROUTE_FLOW, ROUTE_LINE, ROUTE_CASING].forEach((id) => {
        if (map.getLayer(id)) map.removeLayer(id);
      });
      if (map.getSource(ROUTE_SOURCE)) map.removeSource(ROUTE_SOURCE);
    },

    /**
     * 标记已通关锚点（已停用：不再在主地图上添加"✓"印章，保持地图视觉层次简洁）。
     * 保留接口兼容性，仅清理已有 marker。
     * @param {CulturalAnchor[]} anchors 全部锚点
     * @param {Set<string>|string[]} completedIds 已通关锚点 id
     */
    markCompleted(anchors, completedIds) {
      ctx.getStampMarkers().forEach((m) => m.remove());
      ctx.setStampMarkers([]);
    },

    /**
     * 地理围栏检测：返回用户当前位置 radiusM 米内的锚点（按距离升序）。
     * @param {CulturalAnchor[]} anchors
     * @param {number} radiusM 半径（米），默认 80
     * @returns {{anchor:CulturalAnchor, distM:number}[]}
     */
    checkGeofence(anchors, radiusM = 80) {
      const pos = ctx.getUserPos();
      if (!pos) return [];
      const hits = [];
      anchors.forEach((a) => {
        const km = haversineKm(pos[0], pos[1], a.coordinates[0], a.coordinates[1]);
        if (km * 1000 <= radiusM) hits.push({ anchor: a, distM: km * 1000 });
      });
      return hits.sort((x, y) => x.distM - y.distM);
    },

    /** 聚焦当前"附近线索"对应的 3-6 个锚点，并用青绿脉冲强调线索状态。*/
    focusClueAnchors(idSet, activeId = null) {
      if (!map.getLayer(GLOW_LAYER)) return;
      const ids = Array.from(idSet || []).filter(Boolean);
      if (!ids.length) return;
      const clueIds = ['in', ['get', 'id'], ['literal', ids]];
      const active = activeId || '__none__';
      ctx.setClueFocus(ids, activeId);
      applyAnchorAndLabelFilters(map, null);
      resetHighlight();
      if (map.getLayer(PULSE_LAYER)) {
        map.setPaintProperty(PULSE_LAYER, 'circle-stroke-color', '#D8B866');
      }
      map.setPaintProperty(GLOW_LAYER, 'circle-opacity', [
        'case',
        ['==', ['get', 'id'], active],
        0.92,
        clueIds,
        0.64,
        0.06,
      ]);
      map.setPaintProperty(GLOW_LAYER, 'circle-radius', [
        'case',
        ['==', ['get', 'id'], active],
        46,
        clueIds,
        32,
        12,
      ]);
      map.setPaintProperty(GLOW_LAYER, 'circle-blur', [
        'case',
        ['==', ['get', 'id'], active],
        0.72,
        clueIds,
        1.02,
        1.22,
      ]);
      const coreType = map.getLayer(CORE_LAYER) && map.getLayer(CORE_LAYER).type;
      if (coreType === 'symbol') {
        map.setLayoutProperty(CORE_LAYER, 'icon-size', [
          'interpolate',
          ['linear'],
          ['zoom'],
          8,
          ['case', ['==', ['get', 'id'], active], 1.16, clueIds, 0.82, 0.46],
          14,
          ['case', ['==', ['get', 'id'], active], 1.48, clueIds, 1.16, 0.82],
        ]);
      } else if (coreType === 'circle') {
        map.setPaintProperty(CORE_LAYER, 'circle-radius', [
          'interpolate',
          ['linear'],
          ['zoom'],
          8,
          ['case', ['==', ['get', 'id'], active], 10, clueIds, 6, 3],
          14,
          ['case', ['==', ['get', 'id'], active], 15, clueIds, 10, 6],
        ]);
      }
    },

    clearClueFocus(themeKey = 'all') {
      ctx.setClueFocus([], null);
      this.setThemeFilter(themeKey);
      resetHighlight();
      if (map.getLayer(PULSE_LAYER)) {
        map.setPaintProperty(PULSE_LAYER, 'circle-stroke-color', '#2B1C0E');
      }
      if (map.getLayer(GLOW_LAYER)) {
        map.setPaintProperty(GLOW_LAYER, 'circle-opacity', 0.45);
        map.setPaintProperty(GLOW_LAYER, 'circle-radius',
          ['interpolate', ['linear'], ['zoom'], 8, 12, 14, 30]);
        map.setPaintProperty(GLOW_LAYER, 'circle-blur', 1);
      }
    },

    /** 高亮"附近"锚点（光晕增强 1.5 倍）*/
    highlightNearby(idSet) {
      if (!map.getLayer(GLOW_LAYER)) return;
      if (!idSet || idSet.size === 0) {
        map.setPaintProperty(GLOW_LAYER, 'circle-opacity', 0.45);
        return;
      }
      const ids = Array.from(idSet);
      map.setPaintProperty(GLOW_LAYER, 'circle-opacity', [
        'case',
        ['in', ['get', 'id'], ['literal', ids]],
        0.85,
        0.18,
      ]);
      map.setPaintProperty(GLOW_LAYER, 'circle-radius', [
        'case',
        ['in', ['get', 'id'], ['literal', ids]],
        34,
        20,
      ]);
    },

    /** 清除用户位置标记 */
    clearUserLocation() {
      if (ctx.getUserMarker()) {
        ctx.getUserMarker().remove();
        ctx.setUserMarker(null);
      }
    },

    destroy() {
      cancelAnimationFrame(ctx.getRafId());
      cancelAnimationFrame(ctx.getRouteFlowRaf());
      if (ctx.getUserMarker()) ctx.getUserMarker().remove();
      ctx.getForeignMarkers().forEach((m) => m.remove());
      ctx.getStampMarkers().forEach((m) => m.remove());
      map.remove();
    },
  };
}
