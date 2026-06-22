// 路线规划模块：离线估算 + OpenStreetMap OSRM 道路备援。
// 当商业地图服务不可用时，仍按真实道路耗时排序并绘制道路折线。
// build: 2026-06-18
import { TRAVEL_MODES } from './data/themes.js';

const OSRM_BASE = 'https://router.project-osrm.org';
const REQUEST_TIMEOUT_MS = 12000;

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

async function fetchOSRM(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${OSRM_BASE}${path}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`osrm-http-${response.status}`);
    const data = await response.json();
    if (data.code !== 'Ok') throw new Error(data.message || data.code || 'osrm-failed');
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function osrmPath(coords) {
  return coords.map(([lng, lat]) => `${lng.toFixed(6)},${lat.toFixed(6)}`).join(';');
}

function orderByRoadDuration(durations, anchorCount) {
  const remaining = Array.from({ length: anchorCount }, (_, index) => index + 1);
  const ordered = [];
  let current = 0;
  while (remaining.length) {
    let bestIndex = 0;
    let bestDuration = Infinity;
    remaining.forEach((candidate, index) => {
      const rawDuration = durations[current] && durations[current][candidate];
      const duration = rawDuration == null ? Infinity : Number(rawDuration);
      if (Number.isFinite(duration) && duration < bestDuration) {
        bestDuration = duration;
        bestIndex = index;
      }
    });
    const next = remaining.splice(bestIndex, 1)[0];
    ordered.push(next);
    current = next;
  }
  return ordered;
}

async function requestOSRMPlan(coords, profile) {
  const table = await fetchOSRM(`/table/v1/${profile}/${osrmPath(coords)}?annotations=duration`);
  const order = orderByRoadDuration(table.durations || [], coords.length - 1);
  const orderedCoords = [coords[0], ...order.map((index) => coords[index])];
  const routeData = await fetchOSRM(
    `/route/v1/${profile}/${osrmPath(orderedCoords)}?overview=full&geometries=geojson&steps=false`
  );
  const route = routeData.routes && routeData.routes[0];
  if (!route || !route.geometry || !Array.isArray(route.geometry.coordinates)) throw new Error('osrm-empty-route');
  return { order, route };
}

/**
 * OpenStreetMap 道路备援：先用实际道路耗时矩阵排序，再请求完整道路几何。
 * @param {{start:[number,number], anchors:CulturalAnchor[], modeKey:string}} options
 */
export async function planOSRMRoute({ start, anchors, modeKey }) {
  if (!anchors || !anchors.length) throw new Error('empty-selection');
  const coords = [start, ...anchors.map((anchor) => anchor.coordinates)];
  const profiles = modeKey === 'walk' ? ['foot', 'driving'] : ['driving'];
  let result;
  let lastError;
  for (const profile of profiles) {
    try {
      result = await requestOSRMPlan(coords, profile);
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!result) throw lastError || new Error('osrm-failed');

  const orderedAnchors = result.order.map((index) => anchors[index - 1]);
  let cumKm = 0;
  let cumMin = 0;
  const stops = orderedAnchors.map((anchor, index) => {
    const leg = result.route.legs && result.route.legs[index];
    const legKm = Number(leg && leg.distance ? leg.distance : 0) / 1000;
    const legMin = Number(leg && leg.duration ? leg.duration : 0) / 60;
    cumKm += legKm;
    cumMin += legMin;
    return { index: index + 1, anchor, legKm, cumKm, cumMin };
  });

  return {
    itinerary: {
      modeKey,
      stops,
      totalKm: Number(result.route.distance || 0) / 1000,
      totalMin: Number(result.route.duration || 0) / 60,
      straight: false,
      source: 'osrm',
    },
    geometry: result.route.geometry.coordinates,
  };
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
