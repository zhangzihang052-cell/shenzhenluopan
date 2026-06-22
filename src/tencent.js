// Tencent Location Service adapter: POI calibration + real-road routing.
// MapLibre renders in WGS-84, while Tencent Location Service normally returns GCJ-02.

const API_ROOT = 'https://apis.map.qq.com/ws';
const CALIBRATION_CACHE_KEY = 'space-time-compass.tencent-poi.v1';
const TIMEOUT_MS = 12000;
const MAX_DRIVING_STOPS = 16;

function runtimeConfig() {
  const config = typeof window !== 'undefined' ? window.TENCENT_MAP_CONFIG || {} : {};
  return {
    key: String(config.key || '').trim(),
    coordinateSystem: config.coordinateSystem === 'wgs84' ? 'wgs84' : 'gcj02',
  };
}

export function isTencentConfigured() {
  return Boolean(runtimeConfig().key);
}

function outsideChina(lng, lat) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(x, y) {
  let ret = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3;
  ret += ((20 * Math.sin(y * Math.PI) + 40 * Math.sin((y / 3) * Math.PI)) * 2) / 3;
  ret += ((160 * Math.sin((y / 12) * Math.PI) + 320 * Math.sin((y * Math.PI) / 30)) * 2) / 3;
  return ret;
}

function transformLng(x, y) {
  let ret = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3;
  ret += ((20 * Math.sin(x * Math.PI) + 40 * Math.sin((x / 3) * Math.PI)) * 2) / 3;
  ret += ((150 * Math.sin((x / 12) * Math.PI) + 300 * Math.sin((x / 30) * Math.PI)) * 2) / 3;
  return ret;
}

function wgsToGcj([lng, lat]) {
  if (outsideChina(lng, lat)) return [lng, lat];
  const a = 6378245.0;
  const ee = 0.00669342162296594323;
  const dLat = transformLat(lng - 105, lat - 35);
  const dLng = transformLng(lng - 105, lat - 35);
  const radLat = (lat / 180) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  const adjustedLat = lat + (dLat * 180) / (((a * (1 - ee)) / (magic * sqrtMagic)) * Math.PI);
  const adjustedLng = lng + (dLng * 180) / ((a / sqrtMagic) * Math.cos(radLat) * Math.PI);
  return [adjustedLng, adjustedLat];
}

function gcjToWgs([lng, lat]) {
  if (outsideChina(lng, lat)) return [lng, lat];
  const [gcjLng, gcjLat] = wgsToGcj([lng, lat]);
  return [lng * 2 - gcjLng, lat * 2 - gcjLat];
}

function toTencentCoord(coord) {
  return runtimeConfig().coordinateSystem === 'gcj02' ? wgsToGcj(coord) : coord;
}

function fromTencentCoord(coord) {
  return runtimeConfig().coordinateSystem === 'gcj02' ? gcjToWgs(coord) : coord;
}

function asTencentLatLng(coord) {
  const [lng, lat] = toTencentCoord(coord);
  return `${lat.toFixed(6)},${lng.toFixed(6)}`;
}

async function fetchTencent(path, params) {
  const { key } = runtimeConfig();
  if (!key) throw new Error('missing-key');
  const query = new URLSearchParams({ ...params, key, output: 'json' });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${API_ROOT}${path}?${query.toString()}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`http-${response.status}`);
    const data = await response.json();
    if (data.status !== 0) throw new Error(data.message || `tencent-${data.status}`);
    return data;
  } catch (error) {
    // WebService supports JSONP. This keeps the static preview working when a browser
    // blocks direct fetch requests to the Tencent API because of CORS policy.
    return fetchTencentJsonp(path, params, key);
  } finally {
    clearTimeout(timeout);
  }
}

function fetchTencentJsonp(path, params, key) {
  if (typeof document === 'undefined') return Promise.reject(new Error('tencent-request-failed'));
  return new Promise((resolve, reject) => {
    const callback = `__tencentMapCallback${Date.now()}${Math.floor(Math.random() * 100000)}`;
    const query = new URLSearchParams({ ...params, key, output: 'json', callback });
    const script = document.createElement('script');
    const timer = setTimeout(() => finish(new Error('tencent-timeout')), TIMEOUT_MS);

    function cleanup() {
      clearTimeout(timer);
      script.remove();
      try {
        delete window[callback];
      } catch (error) {
        window[callback] = undefined;
      }
    }

    function finish(error, data) {
      cleanup();
      if (error) reject(error);
      else resolve(data);
    }

    window[callback] = (data) => {
      if (!data || data.status !== 0) {
        finish(new Error((data && data.message) || `tencent-${data && data.status}`));
        return;
      }
      finish(null, data);
    };
    script.async = true;
    script.src = `${API_ROOT}${path}?${query.toString()}`;
    script.onerror = () => finish(new Error('tencent-request-failed'));
    document.head.appendChild(script);
  });
}

function decodePolyline(polyline) {
  if (!Array.isArray(polyline) || polyline.length < 4) return [];
  const decoded = polyline.slice();
  for (let i = 2; i < decoded.length; i += 1) decoded[i] = decoded[i - 2] + decoded[i] / 1000000;
  const coords = [];
  for (let i = 0; i + 1 < decoded.length; i += 2) {
    const lat = Number(decoded[i]);
    const lng = Number(decoded[i + 1]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) coords.push(fromTencentCoord([lng, lat]));
  }
  return coords;
}

function itineraryFromRoute(route, anchors, orderedAnchors) {
  const waypointByInputIndex = new Map(
    (route.waypoints || [])
      .filter((point) => Number.isInteger(point.input_order_idx))
      .map((point) => [point.input_order_idx, point])
  );
  let previousDistance = 0;
  let previousDuration = 0;
  const stops = orderedAnchors.map((anchor, index) => {
    const sourceIndex = anchors.findIndex((item) => item.id === anchor.id);
    const point = waypointByInputIndex.get(sourceIndex);
    const cumulativeDistance = Number(point && point.distance);
    const cumulativeDuration = Number(point && point.duration);
    const hasWaypointMetrics = Number.isFinite(cumulativeDistance) && Number.isFinite(cumulativeDuration);
    const cumKm = hasWaypointMetrics ? cumulativeDistance / 1000 : (Number(route.distance) / 1000) * ((index + 1) / orderedAnchors.length);
    const cumMin = hasWaypointMetrics ? cumulativeDuration : Number(route.duration) * ((index + 1) / orderedAnchors.length);
    const stop = {
      index: index + 1,
      anchor,
      legKm: Math.max(0, cumKm - previousDistance),
      cumKm,
      cumMin,
    };
    previousDistance = cumKm;
    previousDuration = cumMin;
    return stop;
  });
  return {
    modeKey: 'drive',
    stops,
    totalKm: Number(route.distance || 0) / 1000,
    totalMin: Number(route.duration || 0),
    straight: false,
    source: 'tencent',
  };
}

function greedyOrder(startCoord, anchors) {
  const remaining = anchors.slice();
  const ordered = [];
  let current = startCoord;
  const distance = (a, b) => {
    const rad = (value) => (value * Math.PI) / 180;
    const dLat = rad(b[1] - a[1]);
    const dLng = rad(b[0] - a[0]);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  };
  while (remaining.length) {
    let bestIndex = 0;
    let bestDistance = Infinity;
    remaining.forEach((anchor, index) => {
      const nextDistance = distance(current, anchor.coordinates);
      if (nextDistance < bestDistance) {
        bestDistance = nextDistance;
        bestIndex = index;
      }
    });
    const next = remaining.splice(bestIndex, 1)[0];
    ordered.push(next);
    current = next.coordinates;
  }
  return ordered;
}

async function planSegmentedRoute(start, anchors, modeKey) {
  const orderedAnchors = greedyOrder(start, anchors);
  const parts = [];
  const legs = [];
  let previous = start;
  let totalDistance = 0;
  let totalDuration = 0;
  for (const anchor of orderedAnchors) {
    const response = await fetchTencent(`/direction/v1/${modeKey}/`, {
      from: asTencentLatLng(previous),
      to: asTencentLatLng(anchor.coordinates),
    });
    const route = response.result && response.result.routes && response.result.routes[0];
    if (!route) throw new Error('empty-route');
    const geometry = decodePolyline(route.polyline);
    parts.push(geometry);
    const distance = Number(route.distance || 0);
    const duration = Number(route.duration || 0);
    legs.push({ distance, duration });
    totalDistance += distance;
    totalDuration += duration;
    previous = anchor.coordinates;
  }
  let runningKm = 0;
  let runningMin = 0;
  const stops = orderedAnchors.map((anchor, index) => {
    const leg = legs[index] || { distance: 0, duration: 0 };
    const legKm = leg.distance / 1000;
    const cumKm = runningKm + legKm;
    const cumMin = runningMin + leg.duration;
    const stop = { index: index + 1, anchor, legKm, cumKm, cumMin };
    runningKm = cumKm;
    runningMin = cumMin;
    return stop;
  });
  return {
    itinerary: { modeKey, stops, totalKm: totalDistance / 1000, totalMin: totalDuration, straight: false, source: 'tencent' },
    geometry: parts.flatMap((part, index) => (index ? part.slice(1) : part)),
  };
}

export async function planTencentRoute({ start, anchors, modeKey }) {
  if (!anchors || !anchors.length) throw new Error('empty-selection');
  if (modeKey !== 'drive') return planSegmentedRoute(start, anchors, 'walking');
  if (anchors.length > MAX_DRIVING_STOPS) throw new Error('too-many-stops');

  const params = {
    from: asTencentLatLng(start),
    to: asTencentLatLng(anchors[anchors.length - 1].coordinates),
  };
  if (anchors.length > 1) {
    params.waypoints = anchors.map((anchor) => asTencentLatLng(anchor.coordinates)).join(';');
    params.waypoint_order = '1';
    params.with_dest = '0';
  }
  let response;
  try {
    response = await fetchTencent('/direction/v1/driving/', params);
  } catch (error) {
    // Smart waypoint ordering is a paid Tencent capability. Keep true-road routing available
    // for keys without that entitlement by falling back to individually planned road segments.
    if (anchors.length > 1) return planSegmentedRoute(start, anchors, 'driving');
    throw error;
  }
  const route = response.result && response.result.routes && response.result.routes[0];
  if (!route) throw new Error('empty-route');
  const orderedAnchors = (route.waypoints || [])
    .filter((point) => Number.isInteger(point.input_order_idx))
    .map((point) => anchors[point.input_order_idx])
    .filter(Boolean);
  const finalOrder = orderedAnchors.length === anchors.length ? orderedAnchors : anchors;
  return {
    itinerary: itineraryFromRoute(route, anchors, finalOrder),
    geometry: decodePolyline(route.polyline),
  };
}

function normalizedName(value) {
  return String(value || '').replace(/[·・\\s()（）]/g, '').toLowerCase();
}

function distanceKm(a, b) {
  const radians = (value) => (value * Math.PI) / 180;
  const dLat = radians(b[1] - a[1]);
  const dLng = radians(b[0] - a[0]);
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a[1])) * Math.cos(radians(b[1])) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function cityHint([lng, lat]) {
  if (lat >= 23.08 && lng < 113.55) return '广州市';
  if (lat >= 22.78 && lng < 113.55) return '佛山市';
  if (lng < 113.1) return '江门市';
  if (lng < 113.72 && lat < 22.55) return '珠海市';
  if (lat > 23.12 && lng >= 113.55) return '惠州市';
  if (lat > 22.9 && lng >= 113.55 && lng < 114.0) return '东莞市';
  if (lat < 22.46 && lng > 113.9) return '香港特别行政区';
  if (lng > 114.12 && lat < 22.58) return '香港特别行政区';
  return '深圳市';
}

async function geocodeTencentAnchor(anchor) {
  const name = anchor.name && anchor.name.zh ? anchor.name.zh : anchor.id;
  const response = await fetchTencent('/geocoder/v1/', {
    address: `${cityHint(anchor.coordinates)}${name}`,
  });
  const location = response.result && response.result.location;
  if (!location || !Number.isFinite(Number(location.lng)) || !Number.isFinite(Number(location.lat))) return null;
  const coordinate = fromTencentCoord([Number(location.lng), Number(location.lat)]);
  // Avoid replacing a known Greater Bay Area anchor with a same-name result from another city.
  return distanceKm(anchor.coordinates, coordinate) <= 60 ? coordinate : null;
}

function readCalibrationCache() {
  try {
    return JSON.parse(localStorage.getItem(CALIBRATION_CACHE_KEY) || '{}');
  } catch (error) {
    return {};
  }
}

function writeCalibrationCache(cache) {
  localStorage.setItem(CALIBRATION_CACHE_KEY, JSON.stringify(cache));
}

export function applyCachedTencentCoordinates(anchors) {
  const cache = readCalibrationCache();
  let applied = 0;
  anchors.forEach((anchor) => {
    const cached = cache[anchor.id];
    if (!cached || !Array.isArray(cached.coordinates) || cached.coordinates.length !== 2) return;
    anchor.coordinates = cached.coordinates;
    applied += 1;
  });
  return applied;
}

export async function calibrateTencentAnchors(anchors) {
  const cache = readCalibrationCache();
  let calibrated = 0;
  for (const anchor of anchors) {
    try {
      const [lng, lat] = toTencentCoord(anchor.coordinates);
      const offset = 0.18;
      const response = await fetchTencent('/place/v1/search', {
        keyword: anchor.name && anchor.name.zh ? anchor.name.zh : anchor.id,
        boundary: `rectangle(${(lat - offset).toFixed(6)},${(lng - offset).toFixed(6)},${(lat + offset).toFixed(6)},${(lng + offset).toFixed(6)})`,
        page_size: '10',
        page_index: '1',
      });
      const targetName = normalizedName(anchor.name && anchor.name.zh);
      const match = (response.data || []).find((item) => {
        const candidate = normalizedName(item.title);
        return candidate === targetName || candidate.includes(targetName) || targetName.includes(candidate);
      });
      let coordinate = null;
      let title = '';
      if (match && match.location && Number.isFinite(Number(match.location.lng)) && Number.isFinite(Number(match.location.lat))) {
        coordinate = fromTencentCoord([Number(match.location.lng), Number(match.location.lat)]);
        title = match.title;
      } else {
        coordinate = await geocodeTencentAnchor(anchor);
        title = anchor.name && anchor.name.zh ? anchor.name.zh : anchor.id;
      }
      if (!coordinate) continue;
      anchor.coordinates = coordinate;
      cache[anchor.id] = { coordinates: coordinate, title, updatedAt: new Date().toISOString() };
      calibrated += 1;
    } catch (error) {
      // One ambiguous or unavailable POI must not discard the rest of the calibration batch.
    }
  }
  writeCalibrationCache(cache);
  return calibrated;
}
