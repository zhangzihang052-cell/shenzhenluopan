// 路线规划模块：离线直线估算。真实道路规划由 tencent.js 提供。
// 纯数据计算，无 DOM 依赖。供 main.js 调用后交由 map.js 绘制、ui.js 渲染卡片。
// build: 2026-06-18
import { TRAVEL_MODES } from './data/themes.js';

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
    straight: true,
  };
}

/** 行程经过的坐标序列（起点 + 各站点），用于离线连线绘制。 */
export function itineraryCoords(startCoord, itinerary) {
  return [startCoord, ...itinerary.stops.map((s) => s.anchor.coordinates)];
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
