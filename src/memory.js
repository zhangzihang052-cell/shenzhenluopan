// Private memory anchors: local-first storage, optional Supabase sync, and UI/map wiring.
import { getLang, getText, pick } from './i18n.js?rev=audio-sfx-1';

const STORAGE_KEY = 'bayareaCompass.memories';
const DEVICE_ID_KEY = 'bayareaCompass.deviceId';
const SOURCE_ID = 'memory-source';
const GLOW_LAYER = 'memory-glow';
const CORE_LAYER = 'memory-core';
const BUCKET = 'memory-photos';
const VOICE_BUCKET = 'memory-voices';
const TABLE = 'memory_anchors';
const MAX_NOTE_LENGTH = 200;
const MAX_IMAGE_WIDTH = 1280;
const JPEG_QUALITY = 0.75;
const TARGET_LOCAL_BYTES = 200 * 1024;
const MAX_DAILY_MEMORIES = 5;
const MAX_VOICE_SECONDS = 60;
const MAX_VIDEO_SECONDS = 15;

const PHONE_REGIONS = ['+86', '+852', '+853', '+886', '+1', '+81', '+82'];

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isDataUrl(url) {
  return typeof url === 'string' && url.startsWith('data:');
}

function estimateDataUrlBytes(dataUrl) {
  const comma = dataUrl.indexOf(',');
  const payload = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.ceil((payload.length * 3) / 4);
}

function randomId() {
  const rand = Math.random().toString(36).slice(2, 8);
  return `mem-${Date.now()}-${rand}`;
}

function ensureDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = crypto && crypto.randomUUID ? crypto.randomUUID() : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch (e) {
    return `guest-${Date.now()}`;
  }
}

function normalizeMemory(item) {
  if (!item || !Number.isFinite(Number(item.lat)) || !Number.isFinite(Number(item.lng))) return null;
  const createdAt = item.createdAt || item.created_at || new Date().toISOString();
  return {
    id: item.id || randomId(),
    lat: Number(item.lat),
    lng: Number(item.lng),
    mediaType: item.mediaType || item.media_type || 'photo',
    photoUrl: item.photoUrl || item.photo_url || '',
    voiceUrl: item.voiceUrl || item.voice_url || '',
    note: String(item.note || '').slice(0, MAX_NOTE_LENGTH),
    createdAt,
    dateKey: item.dateKey || item.date_key || createdAt.slice(0, 10),
    updatedAt: item.updatedAt || item.updated_at || createdAt,
    linkedAnchorId: item.linkedAnchorId || item.linked_anchor_id || null,
    authorId: item.authorId || item.author_id || null,
    authorName: item.authorName || item.author_name || '',
    migrated: !!item.migrated,
    pendingSync: !!item.pendingSync,
    storagePath: item.storagePath || null,
    voiceStoragePath: item.voiceStoragePath || item.voice_storage_path || null,
  };
}

function readLocalMemories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const valid = parsed.map(normalizeMemory).filter(Boolean);
    // 自动清理无效 blob: URL（刷新后断链）
    const cleaned = valid.map((m) => {
      let changed = false;
      const next = { ...m };
      if (typeof next.photoUrl === 'string' && next.photoUrl.startsWith('blob:')) {
        next.photoUrl = '';
        next.pendingSync = true;
        changed = true;
      }
      if (typeof next.voiceUrl === 'string' && next.voiceUrl.startsWith('blob:')) {
        next.voiceUrl = '';
        next.pendingSync = true;
        changed = true;
      }
      return changed ? next : m;
    });
    return cleaned;
  } catch (e) {
    return [];
  }
}

function writeLocalMemories(memories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
}

function sortMemories(memories) {
  return [...memories].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function getDateKey() {
  // UTC+8 自然日
  const now = new Date();
  const utc8 = new Date(now.getTime() + 8 * 3600 * 1000);
  return utc8.toISOString().slice(0, 10);
}

function countTodayMemories(memories) {
  const today = getDateKey();
  return memories.filter((m) => m.dateKey === today).length;
}

function getRemainingQuota(memories) {
  return Math.max(0, MAX_DAILY_MEMORIES - countTodayMemories(memories));
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function compressPhoto(file) {
  if (!file) throw new Error('missing-photo');
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const ratio = Math.min(1, MAX_IMAGE_WIDTH / Math.max(img.naturalWidth || img.width, 1));
    let width = Math.max(1, Math.round((img.naturalWidth || img.width) * ratio));
    let height = Math.max(1, Math.round((img.naturalHeight || img.height) * ratio));
    let quality = JPEG_QUALITY;
    let dataUrl = '';

    for (let pass = 0; pass < 8; pass += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (estimateDataUrlBytes(dataUrl) <= TARGET_LOCAL_BYTES || width <= 640) break;
      if (quality > 0.48) quality -= 0.08;
      else {
        width = Math.round(width * 0.84);
        height = Math.round(height * 0.84);
      }
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function formatDate(iso) {
  try {
    return new Intl.DateTimeFormat(getLang(), {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch (e) {
    return String(iso || '').slice(0, 16);
  }
}

function normalizePhone(region, phone) {
  const trimmed = String(phone || '').replace(/[\s-]/g, '');
  if (trimmed.startsWith('+')) return trimmed;
  return `${region}${trimmed.replace(/^0+/, '')}`;
}

function publicUrlToStoragePath(url) {
  if (!url) return null;
  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index < 0) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}

function toFeatureCollection(memories) {
  return {
    type: 'FeatureCollection',
    features: memories.map((memory) => ({
      type: 'Feature',
      id: memory.id,
      geometry: { type: 'Point', coordinates: [memory.lng, memory.lat] },
      properties: { id: memory.id },
    })),
  };
}

export function createMemoryController({ root, map, anchors = [], auth, showToast, onClose } = {}) {
  const state = {
    anchor: null,
    auth,
    authForm: { region: '+86', phone: '', code: '', stage: 'phone', message: '' },
    map,
    memories: sortMemories(readLocalMemories()),
    panel: null,
    root,
    selectedFile: null,
    syncRetryTimer: 0,
    syncing: false,
    syncedUserId: null,
  };

  const toast = (key, vars) => {
    if (showToast) showToast(getText(key, vars));
  };

  const anchorById = (id) => anchors.find((anchor) => anchor.id === id);

  const setMemories = (next) => {
    state.memories = sortMemories(next.map(normalizeMemory).filter(Boolean));
    writeLocalMemories(state.memories);
    updateMapSource();
    if (state.panel) renderPanel();
    if (state.anchor) mountAnchorMemorySection(state.anchor);
  };

  const mergeMemories = (local, remote) => {
    const byId = new Map();
    local.forEach((memory) => byId.set(memory.id, memory));
    remote.forEach((memory) => byId.set(memory.id, { ...byId.get(memory.id), ...memory, migrated: true, pendingSync: false }));
    return sortMemories(Array.from(byId.values()));
  };

  const client = () => (state.auth && state.auth.client ? state.auth.client : null);
  const user = () => (state.auth && state.auth.user ? state.auth.user : null);
  const loggedIn = () => !!user();

  async function uploadPhoto(memoryId, dataUrl) {
    const currentUser = user();
    const supabase = client();
    if (!currentUser || !supabase) throw new Error('supabase-unavailable');
    const blob = await dataUrlToBlob(dataUrl);
    const path = `${currentUser.id}/${memoryId}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { publicUrl: data.publicUrl, storagePath: path };
  }

  async function upsertRemote(memory) {
    const currentUser = user();
    const supabase = client();
    if (!currentUser || !supabase) throw new Error('supabase-unavailable');
    const row = {
      id: memory.id,
      user_id: currentUser.id,
      lat: memory.lat,
      lng: memory.lng,
      media_type: memory.mediaType || 'photo',
      photo_url: memory.photoUrl,
      voice_url: memory.voiceUrl || null,
      note: memory.note || '',
      date_key: memory.dateKey,
      author_id: memory.authorId || currentUser.id,
      author_name: memory.authorName || '',
      linked_anchor_id: memory.linkedAnchorId || null,
      created_at: memory.createdAt,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from(TABLE).upsert(row, { onConflict: 'id' });
    if (error) throw error;
  }

  async function saveRemote(memory, sourceDataUrl, voiceBlob) {
    let next = { ...memory };
    if (sourceDataUrl && (isDataUrl(sourceDataUrl) || sourceDataUrl.startsWith('blob:'))) {
      const uploaded = await uploadPhoto(memory.id, sourceDataUrl, memory.mediaType);
      next = { ...next, photoUrl: uploaded.publicUrl, storagePath: uploaded.storagePath };
    }
    if (voiceBlob) {
      const voiceUploaded = await uploadVoice(memory.id, voiceBlob);
      next = { ...next, voiceUrl: voiceUploaded.publicUrl, voiceStoragePath: voiceUploaded.storagePath };
    }
    await upsertRemote(next);
    return { ...next, migrated: true, pendingSync: false };
  }

  async function uploadPhoto(memoryId, sourceUrl, mediaType) {
    const currentUser = user();
    const supabase = client();
    if (!currentUser || !supabase) throw new Error('supabase-unavailable');
    const blob = sourceUrl.startsWith('blob:') ? await (await fetch(sourceUrl)).blob() : await dataUrlToBlob(sourceUrl);
    const ext = mediaType === 'video' ? 'mp4' : 'jpg';
    const contentType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';
    const path = `${currentUser.id}/${memoryId}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType,
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { publicUrl: data.publicUrl, storagePath: path };
  }

  async function uploadVoice(memoryId, voiceBlob) {
    const currentUser = user();
    const supabase = client();
    if (!currentUser || !supabase) throw new Error('supabase-unavailable');
    const path = `${currentUser.id}/${memoryId}.webm`;
    const { error } = await supabase.storage.from(VOICE_BUCKET).upload(path, voiceBlob, {
      contentType: voiceBlob.type || 'audio/webm',
      upsert: true,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(VOICE_BUCKET).getPublicUrl(path);
    return { publicUrl: data.publicUrl, storagePath: path };
  }

  async function fetchRemoteMemories() {
    const supabase = client();
    if (!loggedIn() || !supabase) return [];
    const { data, error } = await supabase
      .from(TABLE)
      .select('id,lat,lng,photo_url,note,linked_anchor_id,created_at,updated_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => normalizeMemory({
      id: row.id,
      lat: row.lat,
      lng: row.lng,
      photoUrl: row.photo_url,
      note: row.note,
      linkedAnchorId: row.linked_anchor_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      migrated: true,
      storagePath: publicUrlToStoragePath(row.photo_url),
    })).filter(Boolean);
  }

  async function syncAfterLogin() {
    const currentUser = user();
    if (!currentUser || state.syncing) return;
    if (state.syncedUserId === currentUser.id) return;
    state.syncing = true;
    let migratedCount = 0;
    try {
      const pending = state.memories.filter((memory) => !memory.migrated || memory.pendingSync || isDataUrl(memory.photoUrl));
      if (pending.length) toast('memory.migrating');
      const migrated = [];
      for (const memory of state.memories) {
        if (!pending.some((item) => item.id === memory.id)) {
          migrated.push(memory);
          continue;
        }
        try {
          const remote = await saveRemote(memory, memory.photoUrl);
          migrated.push(remote);
          migratedCount += 1;
        } catch (error) {
          migrated.push({ ...memory, pendingSync: true });
        }
      }
      const remote = await fetchRemoteMemories();
      setMemories(mergeMemories(migrated, remote));
      state.syncedUserId = currentUser.id;
      if (migratedCount) toast('memory.migration_done', { n: migratedCount });
    } catch (error) {
      toast('memory.sync_pending');
      scheduleSyncRetry();
    } finally {
      state.syncing = false;
      updateAuthButton();
    }
  }

  function scheduleSyncRetry(delay = 30000) {
    if (!loggedIn() || state.syncRetryTimer) return;
    state.syncRetryTimer = window.setTimeout(() => {
      state.syncRetryTimer = 0;
      state.syncedUserId = null;
      syncAfterLogin();
    }, delay);
  }

  function renderShell() {
    if (document.getElementById('memory-shell')) return;
    const shell = document.createElement('div');
    shell.id = 'memory-shell';
    shell.innerHTML = `
      <button class="memory-scrim" type="button" aria-label="${esc(getText('panel.close'))}"></button>
      <aside class="memory-panel" id="memory-panel" aria-live="polite"></aside>`;
    state.root.appendChild(shell);
    shell.querySelector('.memory-scrim').addEventListener('click', closePanel);
  }

  function memoryIcon() {
    return '<span class="memory-tool-dot" aria-hidden="true"></span>';
  }

  function authIcon() {
    return '<svg viewBox="0 0 24 24" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/></svg>';
  }

  function installToolbar() {
    // V2: 底部已有三主按钮（探索/记忆/路线），右上角仅留语言选择器
    // 不再往 tool-cluster 插入记忆/登录按钮，避免工具栏漂移
  }

  function updateToolbarTexts() {
    const memoryBtn = document.getElementById('memory-list-btn');
    if (memoryBtn) {
      memoryBtn.title = getText('memory.btn');
      memoryBtn.innerHTML = `<span class="tool-ico memory-tool-ico">${memoryIcon()}</span><span>${esc(getText('memory.btn'))}</span>`;
    }
    updateAuthButton();
  }

  function updateAuthButton() {
    const btn = document.getElementById('auth-login-btn');
    if (btn && (!state.auth || !state.auth.configured)) {
      btn.remove();
      return;
    }
    if (!btn) return;
    const phone = state.auth && state.auth.phone ? state.auth.phone : '';
    const label = loggedIn() && phone ? phone.slice(-4).padStart(4, '*') : getText('auth.btn_login');
    btn.title = loggedIn() ? getText('auth.logged_in_as', { phone }) : getText('auth.btn_login');
    btn.innerHTML = `<span class="tool-ico">${authIcon()}</span><span>${esc(label)}</span>`;
  }

  function addMapLayers() {
    if (!state.map || state.map.getSource(SOURCE_ID)) return;
    state.map.addSource(SOURCE_ID, { type: 'geojson', data: toFeatureCollection(state.memories) });
    state.map.addLayer({
      id: GLOW_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 12, 14, 18],
        'circle-color': '#d4a843',
        'circle-opacity': 0.78,
        'circle-blur': 0.8,
      },
    });
    state.map.addLayer({
      id: CORE_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 4.5, 14, 6.5],
        'circle-color': '#f0c75e',
        'circle-stroke-color': '#5f481b',
        'circle-stroke-width': 1.2,
      },
    });
    const openMemory = (event) => {
      const feature = event.features && event.features[0];
      if (!feature) return;
      if (event.originalEvent && event.originalEvent.stopPropagation) event.originalEvent.stopPropagation();
      const memory = state.memories.find((item) => item.id === feature.properties.id);
      if (memory) openDetailPanel(memory.id);
    };
    state.map.on('click', CORE_LAYER, openMemory);
    state.map.on('click', GLOW_LAYER, openMemory);
    state.map.on('mousemove', CORE_LAYER, () => {
      state.map.getCanvas().style.cursor = 'pointer';
    });
    state.map.on('mouseleave', CORE_LAYER, () => {
      state.map.getCanvas().style.cursor = '';
    });
    state.map.on('contextmenu', handleContextMenu);
    installLongPress();
    state.map.once('idle', () => {
      if (state.map.getLayer(GLOW_LAYER)) state.map.moveLayer(GLOW_LAYER);
      if (state.map.getLayer(CORE_LAYER)) state.map.moveLayer(CORE_LAYER);
    });
  }

  function installMap() {
    if (!state.map) return;
    if (state.map.isStyleLoaded && state.map.isStyleLoaded()) addMapLayers();
    else state.map.once('load', addMapLayers);
  }

  function updateMapSource() {
    if (!state.map || !state.map.getSource(SOURCE_ID)) return;
    state.map.getSource(SOURCE_ID).setData(toFeatureCollection(state.memories));
  }

  function pointHasFeature(point) {
    const layers = ['anchor-core', 'anchor-glow', CORE_LAYER, GLOW_LAYER].filter((id) => state.map.getLayer(id));
    if (!layers.length) return false;
    return state.map.queryRenderedFeatures(point, { layers }).length > 0;
  }

  function handleContextMenu(event) {
    if (!event || !event.lngLat || pointHasFeature(event.point)) return;
    if (event.preventDefault) event.preventDefault();
    openCreatePanel({ lng: event.lngLat.lng, lat: event.lngLat.lat });
  }

  function installLongPress() {
    let timer = 0;
    let startPoint = null;
    let startLngLat = null;
    const cancel = () => {
      if (timer) window.clearTimeout(timer);
      timer = 0;
      startPoint = null;
      startLngLat = null;
    };
    state.map.on('touchstart', (event) => {
      const points = event.points || (event.point ? [event.point] : []);
      if (points.length !== 1) return;
      startPoint = points[0];
      startLngLat = event.lngLat;
      timer = window.setTimeout(() => {
        if (startPoint && startLngLat && !pointHasFeature(startPoint)) {
          openCreatePanel({ lng: startLngLat.lng, lat: startLngLat.lat });
        }
        cancel();
      }, 560);
    });
    state.map.on('touchmove', (event) => {
      if (!startPoint) return;
      const point = event.point || (event.points && event.points[0]);
      if (!point) return;
      if (Math.abs(point.x - startPoint.x) > 8 || Math.abs(point.y - startPoint.y) > 8) cancel();
    });
    state.map.on('touchend', cancel);
    state.map.on('touchcancel', cancel);
  }

  function openPanel(type, data = {}) {
    state.panel = { type, data };
    const shell = document.getElementById('memory-shell');
    if (shell) {
      shell.className = `memory-shell-open memory-mode-${type}`;
    }
    renderPanel();
  }

  function closePanel() {
    const wasOpen = !!state.panel;
    state.panel = null;
    state.selectedFile = null;
    const shell = document.getElementById('memory-shell');
    if (shell) shell.className = '';
    if (wasOpen && onClose) onClose();
  }

  function openCreatePanel(data = {}) {
    state.selectedFile = null;
    openPanel('create', data);
  }

  function openDetailPanel(id) {
    openPanel('detail', { id });
  }

  function openListPanel() {
    openPanel('list');
  }

  function openAuthPanel() {
    if (!state.auth || !state.auth.configured) return;
    state.authForm.message = '';
    openPanel('auth');
  }

  function panelChrome(title, body) {
    return `
      <button class="memory-close" type="button" data-memory-close aria-label="${esc(getText('panel.close'))}">×</button>
      <div class="memory-panel-head">
        <span class="memory-panel-dot" aria-hidden="true"></span>
        <h2>${esc(title)}</h2>
      </div>
      ${body}`;
  }

  function renderPanel() {
    const panel = document.getElementById('memory-panel');
    if (!panel || !state.panel) return;
    const { type, data } = state.panel;
    if (type === 'create') renderCreatePanel(panel, data);
    if (type === 'detail') renderDetailPanel(panel, data.id);
    if (type === 'list') renderListPanel(panel);
    if (type === 'auth') renderAuthPanel(panel);
    panel.querySelectorAll('[data-memory-close]').forEach((btn) => btn.addEventListener('click', closePanel));
  }

  function renderCreatePanel(panel, data) {
    const anchor = data.linkedAnchorId ? anchorById(data.linkedAnchorId) : null;
    const remaining = getRemainingQuota(state.memories);
    const quotaHtml = remaining > 0
      ? `<div class="memory-create-quota">${esc(getText('memory.remaining_today', { n: remaining }))}</div>`
      : `<div class="memory-create-quota">${esc(getText('memory.limit_reached'))}</div>`;
    const disabled = remaining <= 0 ? 'disabled' : '';

    panel.innerHTML = panelChrome(getText('memory.create_title'), `
      <div class="memory-create-list-entry">
        <button type="button" id="memory-show-list">${esc(getText('memory.btn'))} (${state.memories.length})</button>
      </div>
      ${quotaHtml}
      <form class="memory-form" id="memory-create-form">
        <div class="memory-create-media" id="memory-media-area">
          <div class="memory-create-media-empty" id="memory-media-empty">
            <span class="ink-cam-icon" aria-hidden="true">📷</span>
            <span>${esc(getText('memory.create_hint'))}</span>
          </div>
          <img class="memory-create-media-preview" id="memory-media-preview" alt="" hidden />
          <video class="memory-create-media-preview" id="memory-video-preview" hidden muted playsinline></video>
        </div>
        <div class="memory-create-media-actions">
          <button class="memory-create-media-btn" type="button" data-media="photo" ${disabled}>${esc(getText('memory.media_photo'))}</button>
          <button class="memory-create-media-btn" type="button" data-media="album" ${disabled}>${esc(getText('memory.media_album'))}</button>
          ${loggedIn() ? `<button class="memory-create-media-btn" type="button" data-media="video" ${disabled}>${esc(getText('memory.media_video'))}</button>` : ''}
        </div>
        <input type="file" id="memory-photo-input" accept="image/*" capture="environment" hidden />
        <input type="file" id="memory-album-input" accept="image/*" hidden />
        <input type="file" id="memory-video-input" accept="video/*" capture="environment" hidden />

        <div class="memory-create-voice" id="memory-voice-area">
          <div class="memory-create-voice-bar">
            <button class="memory-create-voice-btn" type="button" id="memory-voice-record" ${disabled}>${esc(getText('memory.voice_hint'))}</button>
            <span class="memory-create-voice-timer" id="memory-voice-timer">0s</span>
            <span class="memory-create-voice-max">${esc(getText('memory.voice_max'))}</span>
          </div>
          <audio id="memory-voice-playback" hidden></audio>
        </div>

        <label class="memory-field">
          <span>${esc(getText('memory.note_label'))}</span>
          <textarea id="memory-note-input" maxlength="${MAX_NOTE_LENGTH}" placeholder="${esc(getText('memory.note_placeholder'))}" ${disabled}></textarea>
        </label>
        <div class="memory-meta-line">
          <span>${esc(Number(data.lat).toFixed(5))}, ${esc(Number(data.lng).toFixed(5))}</span>
          ${anchor ? `<span>${esc(getText('memory.linked_anchor'))}: ${esc(pick(anchor.name))}</span>` : ''}
        </div>
        <button class="memory-create-publish" type="submit" ${disabled}>${esc(getText('memory.publish'))}</button>
      </form>`);

    // 临时状态
    let selectedMedia = null;   // { type: 'photo'|'video', file: File }
    let voiceBlob = null;       // Blob
    let voiceUrl = null;        // String (object URL or data URL)
    let mediaRecorder = null;
    let voiceTimer = 0;
    let voiceSeconds = 0;

    // 媒体选择
    const photoInput = panel.querySelector('#memory-photo-input');
    const albumInput = panel.querySelector('#memory-album-input');
    const videoInput = panel.querySelector('#memory-video-input');
    const mediaPreview = panel.querySelector('#memory-media-preview');
    const videoPreview = panel.querySelector('#memory-video-preview');
    const mediaEmpty = panel.querySelector('#memory-media-empty');

    const handleFile = (file, type) => {
      if (!file) return;
      if (type === 'video') {
        // 视频时长检查（通过 metadata）
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.onloadedmetadata = () => {
          if (v.duration > MAX_VIDEO_SECONDS + 1) {
            toast('memory.video_too_long');
            return;
          }
          selectedMedia = { type: 'video', file };
          videoPreview.src = URL.createObjectURL(file);
          videoPreview.hidden = false;
          mediaPreview.hidden = true;
          mediaEmpty.hidden = true;
        };
        v.src = URL.createObjectURL(file);
      } else {
        selectedMedia = { type: 'photo', file };
        mediaPreview.src = URL.createObjectURL(file);
        mediaPreview.hidden = false;
        videoPreview.hidden = true;
        mediaEmpty.hidden = true;
      }
    };

    photoInput.addEventListener('change', () => handleFile(photoInput.files[0], 'photo'));
    albumInput.addEventListener('change', () => handleFile(albumInput.files[0], 'photo'));
    videoInput.addEventListener('change', () => handleFile(videoInput.files[0], 'video'));

    panel.querySelectorAll('.memory-create-media-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const kind = btn.dataset.media;
        if (kind === 'photo') photoInput.click();
        else if (kind === 'album') albumInput.click();
        else if (kind === 'video') videoInput.click();
      });
    });

    // 我的记忆列表入口
    const listBtn = panel.querySelector('#memory-show-list');
    if (listBtn) listBtn.addEventListener('click', () => openListPanel());

    // 语音录制
    const voiceBtn = panel.querySelector('#memory-voice-record');
    const voiceTimerEl = panel.querySelector('#memory-voice-timer');
    const voicePlayback = panel.querySelector('#memory-voice-playback');

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mediaRecorder.onstop = () => {
          voiceBlob = new Blob(chunks, { type: 'audio/webm' });
          voiceUrl = URL.createObjectURL(voiceBlob);
          voicePlayback.src = voiceUrl;
          voicePlayback.hidden = false;
          stream.getTracks().forEach((t) => t.stop());
          voiceBtn.textContent = getText('memory.voice_playing');
          voiceBtn.classList.remove('recording');
          // 添加播放和删除按钮
          const voiceArea = panel.querySelector('#memory-voice-area');
          let playBtn = voiceArea.querySelector('.memory-create-voice-play');
          let delBtn = voiceArea.querySelector('.memory-create-voice-delete');
          if (!playBtn) {
            playBtn = document.createElement('button');
            playBtn.className = 'memory-create-voice-play';
            playBtn.type = 'button';
            playBtn.textContent = getText('memory.voice_playing');
            voiceArea.querySelector('.memory-create-voice-bar').appendChild(playBtn);
            playBtn.addEventListener('click', () => {
              voicePlayback.currentTime = 0;
              voicePlayback.play();
            });
          }
          if (!delBtn) {
            delBtn = document.createElement('button');
            delBtn.className = 'memory-create-voice-delete';
            delBtn.type = 'button';
            delBtn.textContent = getText('memory.voice_delete');
            voiceArea.querySelector('.memory-create-voice-bar').appendChild(delBtn);
            delBtn.addEventListener('click', () => {
              voiceBlob = null;
              voiceUrl = null;
              voicePlayback.src = '';
              voicePlayback.hidden = true;
              playBtn.remove();
              delBtn.remove();
              voiceBtn.textContent = getText('memory.voice_hint');
              voiceTimerEl.textContent = '0s';
            });
          }
        };
        mediaRecorder.start();
        voiceBtn.textContent = getText('memory.voice_release');
        voiceBtn.classList.add('recording');
        voiceSeconds = 0;
        voiceTimerEl.textContent = '0s';
        voiceTimer = setInterval(() => {
          voiceSeconds += 1;
          voiceTimerEl.textContent = `${voiceSeconds}s`;
          if (voiceSeconds >= MAX_VOICE_SECONDS) stopRecording();
        }, 1000);
      } catch (error) {
        toast('memory.voice_failed');
      }
    };

    const stopRecording = () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
      }
      if (voiceTimer) { clearInterval(voiceTimer); voiceTimer = 0; }
    };

    // 按住录音
    voiceBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      startRecording();
    });
    voiceBtn.addEventListener('pointerup', stopRecording);
    voiceBtn.addEventListener('pointerleave', stopRecording);
    voiceBtn.addEventListener('pointercancel', stopRecording);

    // 表单提交
    panel.querySelector('#memory-create-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!selectedMedia) {
        toast('memory.media_required');
        return;
      }
      const note = panel.querySelector('#memory-note-input').value;
      await createMemory({
        lat: Number(data.lat),
        lng: Number(data.lng),
        linkedAnchorId: data.linkedAnchorId || null,
        note,
        file: selectedMedia.file,
        mediaType: selectedMedia.type,
        voiceBlob,
      });
    });
  }

  function renderDetailPanel(panel, id) {
    const memory = state.memories.find((item) => item.id === id);
    if (!memory) {
      closePanel();
      return;
    }
    const anchor = memory.linkedAnchorId ? anchorById(memory.linkedAnchorId) : null;
    const isVideo = memory.mediaType === 'video';
    const mediaHtml = isVideo && memory.photoUrl
      ? `<video class="memory-detail-photo" src="${esc(memory.photoUrl)}" controls playsinline></video>`
      : memory.photoUrl
      ? `<img class="memory-detail-photo" src="${esc(memory.photoUrl)}" alt="" />`
      : '';
    const voiceHtml = memory.voiceUrl
      ? `<div class="memory-detail-voice"><audio controls src="${esc(memory.voiceUrl)}"></audio></div>`
      : '';
    panel.innerHTML = panelChrome(getText('memory.detail_title'), `
      <article class="memory-detail">
        ${mediaHtml}
        ${voiceHtml}
        <p class="memory-detail-note">${esc(memory.note || getText('memory.note_placeholder'))}</p>
        <div class="memory-detail-meta">
          <span>${esc(formatDate(memory.createdAt))}</span>
          ${anchor ? `<span>${esc(getText('memory.linked_anchor'))}: ${esc(pick(anchor.name))}</span>` : ''}
        </div>
        <button class="memory-danger" type="button" id="memory-delete-btn">${esc(getText('memory.delete'))}</button>
      </article>`);
    panel.querySelector('#memory-delete-btn').addEventListener('click', () => deleteMemory(memory.id));
  }

  function renderListPanel(panel) {
    const items = state.memories.map((memory) => {
      const anchor = memory.linkedAnchorId ? anchorById(memory.linkedAnchorId) : null;
      const thumb = memory.photoUrl
        ? `<img src="${esc(memory.photoUrl)}" alt="" onerror="this.style.display='none'" />`
        : `<span class="memory-list-thumb-fallback">忆</span>`;
      return `
        <button class="memory-list-item" type="button" data-memory-id="${esc(memory.id)}">
          ${thumb}
          <span class="memory-list-copy">
            <b>${esc(memory.note || getText('memory.note_placeholder'))}</b>
            <small>${esc(formatDate(memory.createdAt))}${anchor ? ` · ${esc(pick(anchor.name))}` : ''}</small>
          </span>
        </button>`;
    }).join('');
    panel.innerHTML = panelChrome(getText('memory.btn'), `
      <div class="memory-count">${esc(getText('memory.count', { n: state.memories.length }))}</div>
      <div class="memory-list">
        ${state.memories.length ? items : `<div class="memory-empty">${esc(getText('memory.empty'))}</div>`}
      </div>`);
    panel.querySelectorAll('.memory-list-item').forEach((btn) => {
      btn.addEventListener('click', () => openDetailPanel(btn.dataset.memoryId));
    });
  }

  function renderAuthPanel(panel) {
    const logged = loggedIn();
    const phone = state.auth && state.auth.phone ? state.auth.phone : '';
    const message = state.authForm.message ? `<p class="auth-message">${esc(state.authForm.message)}</p>` : '';
    const body = logged
      ? `
        <div class="auth-benefits">
          <p>${esc(getText('auth.logged_in_as', { phone }))}</p>
          <span>${esc(getText('auth.login_benefit_1'))}</span>
          <span>${esc(getText('auth.login_benefit_2'))}</span>
          <span>${esc(getText('auth.login_benefit_3'))}</span>
        </div>
        <button class="memory-danger" type="button" id="auth-logout-btn">${esc(getText('auth.btn_logout'))}</button>`
      : `
        <form class="auth-form" id="auth-form">
          <div class="auth-benefits">
            <span>${esc(getText('auth.login_benefit_1'))}</span>
            <span>${esc(getText('auth.login_benefit_2'))}</span>
            <span>${esc(getText('auth.login_benefit_3'))}</span>
          </div>
          <label class="memory-field">
            <span>${esc(getText('auth.phone_label'))}</span>
            <div class="auth-phone-row">
              <select id="auth-region">${PHONE_REGIONS.map((region) => `<option value="${region}" ${region === state.authForm.region ? 'selected' : ''}>${region}</option>`).join('')}</select>
              <input id="auth-phone" inputmode="tel" autocomplete="tel" value="${esc(state.authForm.phone)}" />
            </div>
          </label>
          ${state.authForm.stage === 'code' ? `
            <label class="memory-field">
              <span>${esc(getText('auth.code_label'))}</span>
              <input id="auth-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" value="${esc(state.authForm.code)}" />
            </label>` : ''}
          ${message}
          <button class="memory-primary" type="submit">${esc(getText(state.authForm.stage === 'code' ? 'auth.verify' : 'auth.send_code'))}</button>
        </form>`;
    panel.innerHTML = panelChrome(getText('auth.title'), body);
    const logout = panel.querySelector('#auth-logout-btn');
    if (logout) {
      logout.addEventListener('click', async () => {
        try {
          await state.auth.signOut();
          state.syncedUserId = null;
          updateAuthButton();
          closePanel();
        } catch (error) {
          toast('auth.code_error');
        }
      });
      return;
    }
    const form = panel.querySelector('#auth-form');
    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        state.authForm.region = panel.querySelector('#auth-region').value;
        state.authForm.phone = panel.querySelector('#auth-phone').value.trim();
        const phoneFull = normalizePhone(state.authForm.region, state.authForm.phone);
        try {
          if (state.authForm.stage !== 'code') {
            await state.auth.sendOtp(phoneFull);
            state.authForm.stage = 'code';
            state.authForm.message = getText('auth.code_sent');
            renderPanel();
            return;
          }
          state.authForm.code = panel.querySelector('#auth-code').value.trim();
          await state.auth.verifyOtp(phoneFull, state.authForm.code);
          await syncAfterLogin();
          closePanel();
        } catch (error) {
          state.authForm.message = getText('auth.code_error');
          renderPanel();
        }
      });
    }
  }

  async function createMemory({ lat, lng, linkedAnchorId, note, file, mediaType, voiceBlob }) {
    // 每日限额检查
    if (getRemainingQuota(state.memories) <= 0) {
      toast('memory.limit_reached');
      return;
    }

    // 媒体校验
    if (!file && !mediaType) {
      toast('memory.media_required');
      return;
    }

    const now = new Date().toISOString();
    const id = randomId();
    const dateKey = getDateKey();
    let photoUrl = '';
    let voiceUrl = '';

    // 处理图片
    if (mediaType === 'photo' && file) {
      try {
        photoUrl = await compressPhoto(file);
      } catch (error) {
        toast('memory.save_failed');
        return;
      }
    } else if (mediaType === 'video' && file) {
      // 视频在访客模式不支持本地存储（太大），登录模式上传 Supabase
      if (!loggedIn()) {
        toast('memory.video_not_supported');
        return;
      }
      // 视频暂存为 object URL，saveRemote 时上传；若上传失败则本地不保存（避免断链）
      photoUrl = URL.createObjectURL(file);
    }

    // 处理语音
    if (voiceBlob) {
      // 语音统一转 data URL 存储，确保刷新后可用；登录后 saveRemote 再上传替换
      voiceUrl = await blobToDataUrl(voiceBlob);
    }

    const currentUser = user();
    let memory = normalizeMemory({
      id,
      lat,
      lng,
      mediaType: mediaType || 'photo',
      photoUrl,
      voiceUrl,
      note: String(note || '').slice(0, MAX_NOTE_LENGTH),
      createdAt: now,
      dateKey,
      updatedAt: now,
      linkedAnchorId,
      authorId: currentUser ? currentUser.id : ensureDeviceId(),
      authorName: currentUser ? (currentUser.phone || '') : '',
    });
    if (loggedIn()) {
      try {
        memory = await saveRemote(memory, photoUrl, voiceBlob);
      } catch (error) {
        // 视频上传失败时不保存到本地（blob URL 刷新后失效）
        if (mediaType === 'video') {
          toast('memory.save_failed');
          return;
        }
        memory = { ...memory, pendingSync: true };
        toast('memory.sync_pending');
        scheduleSyncRetry();
      }
    }
    try {
      setMemories([memory, ...state.memories.filter((item) => item.id !== memory.id)]);
    } catch (error) {
      toast('memory.storage_full');
      return;
    }
    playPinRipple(memory.lng, memory.lat);
    closePanel();
    toast('memory.saved');
  }

  async function deleteMemory(id) {
    const memory = state.memories.find((item) => item.id === id);
    if (!memory) return;
    // 内联确认（避免 window.confirm 在 WebView 中被拦截）
    const btn = document.getElementById('memory-delete-btn');
    if (btn && !btn.dataset.confirming) {
      btn.dataset.confirming = '1';
      btn.textContent = getText('memory.delete_confirm');
      btn.classList.add('memory-danger-confirm');
      window.setTimeout(() => {
        if (btn.dataset.confirming) {
          delete btn.dataset.confirming;
          btn.textContent = getText('memory.delete');
          btn.classList.remove('memory-danger-confirm');
        }
      }, 3000);
      return;
    }
    // 二次点击确认 → 执行删除
    if (loggedIn() && client()) {
      try {
        const { error } = await client().from(TABLE).delete().eq('id', id);
        if (error) throw error;
        const storagePath = memory.storagePath || publicUrlToStoragePath(memory.photoUrl);
        if (storagePath) await client().storage.from(BUCKET).remove([storagePath]);
        if (memory.voiceStoragePath) await client().storage.from(VOICE_BUCKET).remove([memory.voiceStoragePath]);
      } catch (error) {
        // 远程删除失败，仍删除本地（标记 pendingDelete 供后续同步）
        console.warn('Remote delete failed, removing locally:', error);
      }
    }
    setMemories(state.memories.filter((item) => item.id !== id));
    closePanel();
  }

  function playPinRipple(lng, lat) {
    if (!state.map || !state.root || !state.map.project) return;
    const point = state.map.project([lng, lat]);
    const ripple = document.createElement('span');
    ripple.className = 'memory-pin-ripple';
    ripple.style.left = `${point.x}px`;
    ripple.style.top = `${point.y}px`;
    state.root.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 900);
  }

  function mountAnchorMemorySection(anchor) {
    state.anchor = anchor;
    const card = document.getElementById('glass-card');
    if (!card || !anchor || !anchor.coordinates) return;
    let section = document.getElementById('anchor-memory-section');
    if (!section) {
      section = document.createElement('section');
      section.id = 'anchor-memory-section';
      section.className = 'anchor-memory-section fade-in-up';
      card.appendChild(section);
    }
    const here = state.memories.filter((memory) => memory.linkedAnchorId === anchor.id);
    section.innerHTML = `
      <button class="anchor-memory-cta" type="button" id="anchor-memory-create">
        <span class="anchor-memory-mark" aria-hidden="true"></span>
        <span>${esc(getText('memory.add_at_anchor'))}</span>
        <span class="anchor-memory-arrow" aria-hidden="true">→</span>
      </button>
      ${here.length ? `
        <div class="anchor-memory-here">
          <h3>${esc(getText('memory.my_memories_here'))}</h3>
          ${here.map((memory) => `
            <button type="button" data-memory-id="${esc(memory.id)}">
              <img src="${esc(memory.photoUrl)}" alt="" />
              <span>${esc(memory.note || getText('memory.note_placeholder'))}</span>
            </button>`).join('')}
        </div>` : ''}`;
    section.querySelector('#anchor-memory-create').addEventListener('click', () => {
      openCreatePanel({
        lng: anchor.coordinates[0],
        lat: anchor.coordinates[1],
        linkedAnchorId: anchor.id,
      });
    });
    section.querySelectorAll('[data-memory-id]').forEach((btn) => {
      btn.addEventListener('click', () => openDetailPanel(btn.dataset.memoryId));
    });
  }

  function refreshTexts() {
    updateToolbarTexts();
    if (state.panel) renderPanel();
    if (state.anchor) mountAnchorMemorySection(state.anchor);
  }

  function initAuth() {
    if (!state.auth) return;
    state.auth.subscribe((snapshot, event) => {
      updateAuthButton();
      if (snapshot.session && (event === 'SIGNED_IN' || event === 'READY')) syncAfterLogin();
      if (event === 'SIGNED_OUT') {
        state.syncedUserId = null;
        if (state.panel && state.panel.type === 'auth') renderPanel();
      }
    });
    state.auth.init().then(() => {
      installToolbar();
      updateAuthButton();
      if (state.auth.isLoggedIn()) syncAfterLogin();
    });
  }

  return {
    closePanel,
    openCreatePanel,
    openListPanel,
    init() {
      ensureDeviceId();
      renderShell();
      installToolbar();
      installMap();
      initAuth();
      updateMapSource();
    },
    isOpen() {
      return !!state.panel;
    },
    mountAnchorMemorySection,
    refreshTexts,
  };
}
