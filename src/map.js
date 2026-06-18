// 地图引擎模块 v2：深墨暖色底图 + 菱形发光呼吸锚点 + FlyTo + GPS/Haversine + deck.gl ArcLayer 全球连线
// build: 2026-06-18
import { ANCHORS } from './data/anchors.js';
import {
  THEMES,
  GLOBAL_VIEW,
  FOCUS_VIEW,
  BAY_AREA_BOUNDS,
  BASEMAP_COLORS,
  LINK_STYLES,
  DEFAULT_LOCATION,
} from './data/themes.js';

const SOURCE_ID = 'anchors';
const GLOW_LAYER = 'anchor-glow';
const PULSE_LAYER = 'anchor-pulse';
const CORE_LAYER = 'anchor-core';

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

/** 将锚点转换为 GeoJSON */
function anchorsToGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: ANCHORS.map((a) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: a.coordinates },
      properties: {
        id: a.id,
        name: a.name && a.name.zh ? a.name.zh : a.id,
        theme: a.theme,
        color: THEMES[a.theme] ? THEMES[a.theme].color : '#C9A84C',
        worldImpact: a.worldImpact ? 1 : 0,
      },
    })),
  };
}

/** 极简化底图：隐藏 POI / 道路文字、并染成深墨暖色调 */
function simplifyBasemap(map) {
  const style = map.getStyle();
  if (!style || !style.layers) return;
  for (const layer of style.layers) {
    const id = layer.id.toLowerCase();
    const isNoise =
      id.includes('poi') ||
      (id.includes('road') && id.includes('label')) ||
      id.includes('housenum') ||
      id.includes('transit') ||
      id.includes('waterway-label');
    if (isNoise) {
      try {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      } catch (e) {
        /* 忽略不可设置的图层 */
      }
    }
    // 背景 / 陆地 → 宣纸暖黄
    try {
      if (layer.type === 'background') {
        map.setPaintProperty(layer.id, 'background-color', BASEMAP_COLORS.background);
      }
      if (id.includes('land') && layer.type === 'fill') {
        map.setPaintProperty(layer.id, 'fill-color', BASEMAP_COLORS.background);
      }
      // 水域 → 石绿黛青（山水画水色）
      if (id.includes('water') && layer.type === 'fill') {
        map.setPaintProperty(layer.id, 'fill-color', BASEMAP_COLORS.water);
      }
      // 绿地 / 公园 / 林地 → 石绿（山水画山峦草木设色）
      if (
        layer.type === 'fill' &&
        (id.includes('park') ||
          id.includes('grass') ||
          id.includes('wood') ||
          id.includes('forest') ||
          id.includes('vegetation') ||
          id.includes('landcover') ||
          id.includes('landuse'))
      ) {
        map.setPaintProperty(layer.id, 'fill-color', BASEMAP_COLORS.green);
        map.setPaintProperty(layer.id, 'fill-opacity', 0.5);
      }
      // 道路 → 淡赭墨勾线（清明上河图的街巷线条感）
      if (id.includes('road') && layer.type === 'line' && BASEMAP_COLORS.road) {
        map.setPaintProperty(layer.id, 'line-color', BASEMAP_COLORS.road);
      }
      // 行政边界 → 淡赭墨勾线
      if ((id.includes('boundary') || id.includes('admin')) && layer.type === 'line') {
        map.setPaintProperty(layer.id, 'line-color', BASEMAP_COLORS.boundary);
        map.setPaintProperty(layer.id, 'line-width', BASEMAP_COLORS.boundaryWidth);
        map.setPaintProperty(layer.id, 'line-opacity', 0.55);
      }
    } catch (e) {
      /* 某些图层属性不可设置，忽略 */
    }
  }
}

/** 添加 3D 建筑挤出（数据缺失时静默降级） */
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

    // 为每个主题各烘焙一枚"主题色实心 + 深墨描边"菱形图标，
    // 确保浅色宣纸底图上清晰可辨，并保留主题色区分（icon-color 仅对 SDF 生效，故不可依赖）
    try {
      const INK = '#2B1C0E'; // 深墨描边色
      for (const key of Object.keys(THEMES)) {
        const imgId = `diamond-${key}`;
        if (map.hasImage(imgId)) continue;
        const themeImg = await loadImage(makeDiamondIcon(32, THEMES[key].color, INK));
        map.addImage(imgId, themeImg);
      }
      // 兜底通用图标（主题缺失时使用）
      if (!map.hasImage('diamond-core')) {
        const fallback = await loadImage(makeDiamondIcon(32, '#C9A84C', INK));
        map.addImage('diamond-core', fallback);
      }
    } catch (e) {
      /* 图标载入失败，降级用圆点 */
    }

    map.addSource(SOURCE_ID, { type: 'geojson', data: anchorsToGeoJSON() });

    // 1) 外层柔光（呼吸光晕）
    map.addLayer({
      id: GLOW_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-color': ['get', 'color'],
        'circle-blur': 1,
        'circle-opacity': 0.45,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 12, 14, 30],
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
        'circle-stroke-width': 1.6,
        'circle-stroke-opacity': 0.5,
        'circle-radius': 6,
      },
    });

    // 3) 核心：菱形符号（图标可用）+ 兜底圆点
    if (map.hasImage('diamond-core')) {
      map.addLayer({
        id: CORE_LAYER,
        type: 'symbol',
        source: SOURCE_ID,
        layout: {
          // 按主题引用各自烘焙的主题色图标（白晕+实心+深墨描边）；
          // icon-color 对非 SDF 图标无效，故主题色直接烘焙进图标本身
          'icon-image': ['concat', 'diamond-', ['get', 'theme']],
          'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.55, 14, 1.05],
          'icon-allow-overlap': true,
          'icon-rotate': 0,
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
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 4, 14, 8],
        },
      });
    }

    // hover 光标
    [CORE_LAYER, GLOW_LAYER].forEach((layer) => {
      map.on('mouseenter', layer, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layer, () => {
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

    // 呼吸动画（光晕 scale 0.8→1.2，opacity 随主题模式自适应）
    // 总览模式：0.40 → 0.90；主题模式：0.68 → 1.00（最低亮度更高，穿透 overlay 叠色）
    const animate = () => {
      pulseT += 0.02;
      const t = (Math.sin(pulseT) + 1) / 2; // 0..1
      if (map.getLayer(PULSE_LAYER)) {
        map.setPaintProperty(PULSE_LAYER, 'circle-radius', 8 + t * 16);
        map.setPaintProperty(PULSE_LAYER, 'circle-stroke-opacity', 0.55 * (1 - t));
        // 主题模式：提升最低亮度，让锚点在 overlay 叠色下依然清晰可见
        const minOp = themeBoostActive ? 0.68 : 0.40;
        const rng   = themeBoostActive ? 0.32 : 0.50;
        map.setPaintProperty(GLOW_LAYER, 'circle-opacity', minOp + t * rng);
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

  return {
    map,

    /** 按主题筛选显隐锚点 */
    setVisibleThemes(visibleSet) {
      const visible = Array.from(visibleSet);
      const filter =
        visible.length === 0
          ? ['==', ['get', 'theme'], '__none__']
          : ['in', ['get', 'theme'], ['literal', visible]];
      [GLOW_LAYER, PULSE_LAYER, CORE_LAYER].forEach((layer) => {
        if (map.getLayer(layer)) map.setFilter(layer, filter);
      });
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
      map.flyTo({
        center: GLOBAL_VIEW.center,
        zoom: GLOBAL_VIEW.zoom,
        pitch: GLOBAL_VIEW.pitch,
        bearing: GLOBAL_VIEW.bearing,
        duration: 2000,
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
      [GLOW_LAYER, PULSE_LAYER, CORE_LAYER].forEach((layer) => {
        if (map.getLayer(layer)) map.setFilter(layer, filter);
      });

      // 主题模式：放大光晕半径 + 降低模糊度，让锚点在 overlay 叠色下清晰突出
      const boosting = themeKey !== 'all';
      ctx.setThemeBoost(boosting);

      if (map.getLayer(GLOW_LAYER)) {
        map.setPaintProperty(GLOW_LAYER, 'circle-radius',
          boosting
            ? ['interpolate', ['linear'], ['zoom'], 8, 22, 14, 52]
            : ['interpolate', ['linear'], ['zoom'], 8, 12, 14, 30]);
        map.setPaintProperty(GLOW_LAYER, 'circle-blur', boosting ? 0.6 : 1);
      }

      if (map.getLayer(CORE_LAYER)) {
        const coreType = map.getLayer(CORE_LAYER).type;
        if (coreType === 'symbol') {
          // 菱形图标放大 ~25%，视觉上更醒目
          map.setLayoutProperty(CORE_LAYER, 'icon-size',
            boosting
              ? ['interpolate', ['linear'], ['zoom'], 8, 0.75, 14, 1.38]
              : ['interpolate', ['linear'], ['zoom'], 8, 0.55, 14, 1.05]);
        } else {
          // 圆点兜底也同步放大
          map.setPaintProperty(CORE_LAYER, 'circle-radius',
            boosting
              ? ['interpolate', ['linear'], ['zoom'], 8, 6, 14, 12]
              : ['interpolate', ['linear'], ['zoom'], 8, 4, 14, 8]);
          map.setPaintProperty(CORE_LAYER, 'circle-stroke-width', boosting ? 2.5 : 2);
        }
      }
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

          map.flyTo({
            center: [lng, lat],
            zoom: inBay ? 12.5 : 9.1,
            pitch: inBay ? 45 : 0,
            bearing: 0,
            duration: 2600,
            curve: 1.5,
            essential: true,
          });

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
        map.flyTo({
          center: [lng, lat],
          zoom: 12.2, pitch: 40, bearing: 0,
          duration: 2400, curve: 1.5, essential: true,
          padding: { left: 380, top: 0, bottom: 0, right: 0 },
        });
        if (onResult) onResult({ lng, lat, simulated, inBay });
      };
      const fallback = () =>
        settle(DEFAULT_LOCATION.center[0], DEFAULT_LOCATION.center[1], true);
      if (!('geolocation' in navigator)) return fallback();
      navigator.geolocation.getCurrentPosition(
        (pos) => settle(pos.coords.longitude, pos.coords.latitude, false),
        () => fallback(),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    },

    /** 当前用户坐标 [lng,lat]（未定位时为 null）*/
    getUserPosition() {
      return ctx.getUserPos();
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
     * 标记已通关锚点：在坐标右上方加一枚朱砂"✓"印章 marker。
     * @param {CulturalAnchor[]} anchors 全部锚点
     * @param {Set<string>|string[]} completedIds 已通关锚点 id
     */
    markCompleted(anchors, completedIds) {
      ctx.getStampMarkers().forEach((m) => m.remove());
      const ids = completedIds instanceof Set ? completedIds : new Set(completedIds || []);
      const markers = [];
      anchors.forEach((a) => {
        if (!ids.has(a.id)) return;
        const el = document.createElement('div');
        el.className = 'stamp-marker';
        el.textContent = '✓';
        el.title = (a.name && (a.name.zh || a.name.en)) || a.id;
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [13, -12] })
          .setLngLat(a.coordinates)
          .addTo(map);
        markers.push(marker);
      });
      ctx.setStampMarkers(markers);
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
