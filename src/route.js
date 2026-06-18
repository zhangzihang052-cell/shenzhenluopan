// 路线规划模块：最近邻贪心排序 + 行程时长估算 + OSRM 真实道路 + 直线降级
// 纯数据计算，无 DOM 依赖。供 main.js 调用后交由 map.js 绘制、ui.js 渲染卡片。
// build: 2026-06-18
import { TRAVEL_MODES, OSRM_BASE } from './data/themes.js';

/** Haversine 球面距离（公里）——route 模块内置，避免与 map.js 耦合 */
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
 * 最近邻贪心排序：从起点出发，每次选取距当前点最近的未访问锚点。
 * @param {[number,number]} startCoord 起点 [lng,lat]
 * @param {CulturalAnchor[]} anchors
 * @returns {{anchor:CulturalAnchor, legKm:number}[]} 有序站点（含到上一点的直线距离）
 */
export function greedyOrder(startCoord, anchors) {
  const remaining = anchors.slice();
  const ordered = [];
  let cur = startCoord;
  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    remaining.forEach((a, i) => {
      const d = haversineKm(cur[0], cur[1], a.coordinates[0], a.coordinates[1]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push({ anchor: next, legKm: bestDist });
    cur = next.coordinates;
  }
  return ordered;
}

/**
 * 构造完整行程（直线估算版，同步立即可用）。
 * @param {[number,number]} startCoord
 * @param {CulturalAnchor[]} anchors
 * @param {'walk'|'drive'} modeKey
 * @returns {Itinerary}
 */
export function buildItinerary(startCoord, anchors, modeKey) {
  const mode = TRAVEL_MODES[modeKey] || TRAVEL_MODES.walk;
  const ordered = greedyOrder(startCoord, anchors);
  let cumKm = 0;
  const stops = ordered.map((o, i) => {
    cumKm += o.legKm;
    return {
      index: i + 1,
      anchor: o.anchor,
      legKm: o.legKm,
      cumKm,
      cumMin: (cumKm / mode.speedKmh) * 60,
    };
  });
  return {
    modeKey: mode.key,
    stops,
    totalKm: cumKm,
    totalMin: (cumKm / mode.speedKmh) * 60,
    straight: true, // 直线估算标记；OSRM 增强成功后置 false
  };
}

/** 行程经过的坐标序列（起点 + 各站点），用于绘制连线与请求 OSRM */
export function itineraryCoords(startCoord, itinerary) {
  return [startCoord, ...itinerary.stops.map((s) => s.anchor.coordinates)];
}

/**
 * 请求 OSRM 公共 demo 获取真实道路路径。
 * 注意：公共 demo 仅稳定支持 driving；故统一用 driving 几何贴合道路，
 * 时长仍按所选出行方式估算。失败 / 超时 / 离线 → 返回 null（调用方降级直线）。
 * @param {[number,number][]} coords
 * @param {string} profile osrm profile（driving）
 * @returns {Promise<{geometry:[number,number][], distanceKm:number}|null>}
 */
export async function fetchOSRMRoute(coords, profile = 'driving') {
  if (!coords || coords.length < 2) return null;
  try {
    const path = coords.map((c) => `${c[0]},${c[1]}`).join(';');
    const url = `${OSRM_BASE}/${profile}/${path}?overview=full&geometries=geojson`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.routes || !data.routes.length) return null;
    const r = data.routes[0];
    if (!r.geometry || !r.geometry.coordinates) return null;
    return {
      geometry: r.geometry.coordinates,
      distanceKm: r.distance / 1000,
    };
  } catch (e) {
    return null; // 离线 / 跨域 / 超时 → 降级
  }
}

/**
 * 行程时长本地化格式化（分钟 → "X 小时 Y 分" 文本片段所需的数值）。
 * @param {number} min
 * @returns {{h:number, m:number}}
 */
export function splitDuration(min) {
  const total = Math.max(1, Math.round(min));
  return { h: Math.floor(total / 60), m: total % 60 };
}
