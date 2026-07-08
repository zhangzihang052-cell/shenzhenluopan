import { ANCHORS } from './data/anchors.js?rev=external-preview-1';
import { fetchCloudData, mergeWantToVisit, setCloudConfig as setProgressCloudConfig, isCloudReady, pushWantToVisitOnly } from './cloud-sync.js?rev=cloud-1';

export const WANT_TO_VISIT_KEY = 'bayareaCompass.wantToVisit';
let _currentUserId = null;
function getStorageKey() {
  return _currentUserId ? `${WANT_TO_VISIT_KEY}:${_currentUserId}` : WANT_TO_VISIT_KEY;
}

let _supabase = null;
let _userId = null;
let _cloudDebounceTimer = null;

/** 登录时调用：拉取云端想去标记并合并到本地 */
export async function initWantToVisitSync(supabaseClient, userId) {
  _supabase = supabaseClient;
  _userId = userId;
  _currentUserId = userId;
  const cloud = await fetchCloudData();
  if (cloud && cloud.wantToVisit) {
    const local = readIds();
    const merged = mergeWantToVisit(local, cloud.wantToVisit);
    writeIds(merged);
  }
}

function readIds() {
  try {
    const raw = localStorage.getItem(getStorageKey());
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const known = new Set(ANCHORS.map((anchor) => anchor.id));
    return parsed.filter((id, index) => typeof id === 'string' && known.has(id) && parsed.indexOf(id) === index);
  } catch (e) {
    return [];
  }
}

function writeIds(ids) {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(ids));
  } catch (e) {
    /* localStorage may be unavailable in restricted browsers. */
  }
}

/** 异步推送想去标记到云端（防抖 1.5 秒） */
function syncToCloud() {
  if (!(_supabase && _userId)) return;
  clearTimeout(_cloudDebounceTimer);
  _cloudDebounceTimer = setTimeout(() => {
    pushWantToVisitCloud();
  }, 1500);
}

async function pushWantToVisitCloud() {
  if (!(_supabase && _userId)) return;
  try {
    await pushWantToVisitOnly(readIds());
  } catch (e) {
    console.warn('[want-to-visit] 云端推送异常:', e);
  }
}

export function getWantToVisitIds() {
  return readIds();
}

export function addWantToVisit(anchorId) {
  if (!anchorId) return getWantToVisitIds();
  const ids = readIds();
  if (!ids.includes(anchorId)) {
    ids.push(anchorId);
    writeIds(ids);
    syncToCloud();
  }
  return ids;
}

export function removeWantToVisit(anchorId) {
  const ids = readIds().filter((id) => id !== anchorId);
  writeIds(ids);
  syncToCloud();
  return ids;
}

export function isWantToVisit(anchorId) {
  return readIds().includes(anchorId);
}

export function getWantToVisitAnchors() {
  const anchorsById = new Map(ANCHORS.map((anchor) => [anchor.id, anchor]));
  return readIds().map((id) => anchorsById.get(id)).filter(Boolean);
}

/** 登出时调用：清除当前用户专属 key 并重置状态 */
export function clearWantToVisitSync() {
  try { localStorage.removeItem(getStorageKey()); } catch (_) {}
  _currentUserId = null;
  _supabase = null;
  _userId = null;
}
