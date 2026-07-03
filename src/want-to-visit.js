import { ANCHORS } from './data/anchors.js?rev=external-preview-1';

export const WANT_TO_VISIT_KEY = 'bayareaCompass.wantToVisit';

function readIds() {
  try {
    const raw = localStorage.getItem(WANT_TO_VISIT_KEY);
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
    localStorage.setItem(WANT_TO_VISIT_KEY, JSON.stringify(ids));
  } catch (e) {
    /* localStorage may be unavailable in restricted browsers. */
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
  }
  return ids;
}

export function removeWantToVisit(anchorId) {
  const ids = readIds().filter((id) => id !== anchorId);
  writeIds(ids);
  return ids;
}

export function isWantToVisit(anchorId) {
  return readIds().includes(anchorId);
}

export function getWantToVisitAnchors() {
  const anchorsById = new Map(ANCHORS.map((anchor) => [anchor.id, anchor]));
  return readIds().map((id) => anchorsById.get(id)).filter(Boolean);
}
