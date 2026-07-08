// Private memory anchors: local-first storage, optional Supabase sync, and UI/map wiring.
import { getLang, getText, pick } from './i18n.js?rev=audio-sfx-1';

const STORAGE_KEY = 'bayareaCompass.memories';
let _currentUserId = null;
function getStorageKey() {
  return _currentUserId ? `${STORAGE_KEY}:${_currentUserId}` : STORAGE_KEY;
}
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
    const raw = localStorage.getItem(getStorageKey());
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
  localStorage.setItem(getStorageKey(), JSON.stringify(memories));
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
  // 按坐标分组，同一位置的记忆依次往右偏移，避免与主锚点重叠
  const OFFSET_LNG = 0.0008; // 约80米经度偏移
  const coordMap = new Map();
  return {
    type: 'FeatureCollection',
    features: memories.map((memory) => {
      const key = `${memory.lat.toFixed(5)}_${memory.lng.toFixed(5)}`;
      const idx = coordMap.get(key) || 0;
      coordMap.set(key, idx + 1);
      const lngOffset = memory.lng + OFFSET_LNG * (idx + 1);
      return {
        type: 'Feature',
        id: memory.id,
        geometry: { type: 'Point', coordinates: [lngOffset, memory.lat] },
        properties: { id: memory.id },
      };
    }),
  };
}

export function createMemoryController({ root, map, anchors = [], auth, showToast, onClose } = {}) {
  const state = {
    anchor: null,
    auth,
    authForm: { email: '', password: '', message: '' },
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
    const currentUser = user();
    if (!loggedIn() || !supabase || !currentUser) return [];
    const { data, error } = await supabase
      .from(TABLE)
      .select('id,lat,lng,media_type,photo_url,voice_url,note,date_key,author_id,author_name,linked_anchor_id,created_at,updated_at')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => normalizeMemory({
      id: row.id,
      lat: row.lat,
      lng: row.lng,
      mediaType: row.media_type,
      photoUrl: row.photo_url,
      voiceUrl: row.voice_url,
      note: row.note,
      dateKey: row.date_key,
      authorId: row.author_id,
      authorName: row.author_name,
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
    // 切换到当前用户的专属 localStorage key
    _currentUserId = currentUser.id;
    let migratedCount = 0;
    try {
      // ── 用户切换检测 ──
      // 如果之前同步过其他用户，或者本地存有其他已登录用户的记忆锚点，
      // 必须先清除，防止数据泄露到新账号
      const previousUserId = state.syncedUserId;
      if (previousUserId && previousUserId !== currentUser.id) {
        // 显式用户切换：清空所有本地记忆，仅从云端拉取当前用户的
        setMemories([]);
      } else {
        // 刷新后场景：syncedUserId 为 null 但 localStorage 可能有前用户数据
        const hasOtherUserMemories = state.memories.some((m) =>
          m.authorId && !m.authorId.startsWith('guest-') && m.authorId !== currentUser.id
        );
        if (hasOtherUserMemories) {
          // 清除其他用户的数据，仅保留游客记忆和当前用户的
          setMemories(state.memories.filter((m) =>
            !m.authorId || m.authorId.startsWith('guest-') || m.authorId === currentUser.id
          ));
        }
      }

      // 仅迁移属于当前用户或游客创建的记忆（绝不迁移其他用户的）
      const pending = state.memories.filter((memory) =>
        (!memory.migrated || memory.pendingSync || isDataUrl(memory.photoUrl)) &&
        (!memory.authorId || memory.authorId.startsWith('guest-') || memory.authorId === currentUser.id)
      );
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
      console.error('[memory] syncAfterLogin failed:', error);
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
    const email = state.auth && state.auth.email ? state.auth.email : '';
    const label = loggedIn() && email ? email : getText('auth.btn_login');
    btn.title = loggedIn() ? getText('auth.logged_in_as', { email }) : getText('auth.btn_login');
    btn.innerHTML = `<span class="tool-ico">${authIcon()}</span><span>${esc(label)}</span>`;
  }

  // ===== 记忆锚点图标：爱心形状 + 朱砂红，与传统菱形锚点完全区分 =====
  const MEMORY_INK = '#2B1C0E';     // 深墨描边
  const MEMORY_RED = '#C44A3C';     // 朱砂红填充（记忆专属色）
  const MEMORY_GLOW = '#D9695A';    // 朱砂光晕

  function makeMemoryDiamondIcon(size, fill, stroke) {
    const s = size;
    return (
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">` +
          `<path d="M${s/2} ${s-3} C${s*0.12} ${s*0.58} ${s*0.08} ${s*0.28} ${s*0.28} ${s*0.18} C${s*0.42} ${s*0.10} ${s/2} ${s*0.22} ${s/2} ${s*0.34} C${s/2} ${s*0.22} ${s*0.58} ${s*0.10} ${s*0.72} ${s*0.18} C${s*0.92} ${s*0.28} ${s*0.88} ${s*0.58} ${s/2} ${s-3} Z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>` +
          `</svg>`
      )
    );
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  async function addMapLayers() {
    if (!state.map || state.map.getSource(SOURCE_ID)) return;
    state.map.addSource(SOURCE_ID, { type: 'geojson', data: toFeatureCollection(state.memories) });

    // 烘焙金色菱形图标（与主锚点 diamond-{theme} 完全同构，仅颜色不同）
    try {
      if (!state.map.hasImage('diamond-memory')) {
        const img = await loadImage(makeMemoryDiamondIcon(32, MEMORY_RED, MEMORY_INK));
        state.map.addImage('diamond-memory', img);
      }
    } catch (e) {
      /* 图标载入失败，降级用圆点 */
    }

    // 1) 柔光层：金色模糊光晕（与主锚点 GLOW_LAYER 同构）
    state.map.addLayer({
      id: GLOW_LAYER,
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-color': MEMORY_GLOW,
        'circle-blur': 1,
        'circle-opacity': 0.35,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 8, 14, 18],
      },
    });

    // 2) 脉冲环：深墨描边（与主锚点 PULSE_LAYER 同构）
    state.map.addLayer({
      id: 'memory-pulse',
      type: 'circle',
      source: SOURCE_ID,
      paint: {
        'circle-color': 'rgba(0,0,0,0)',
        'circle-stroke-color': MEMORY_INK,
        'circle-stroke-width': 1,
        'circle-stroke-opacity': 0.36,
        'circle-radius': 6,
      },
    });

    // 3) 核心：金色菱形 symbol（与主锚点 CORE_LAYER 同构）
    if (state.map.hasImage('diamond-memory')) {
      state.map.addLayer({
        id: CORE_LAYER,
        type: 'symbol',
        source: SOURCE_ID,
        layout: {
          'icon-image': 'diamond-memory',
          'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.55, 14, 1.05],
          'icon-allow-overlap': true,
          'icon-rotate': 0,
        },
        paint: {
          'icon-opacity': 0.92,
        },
      });
    } else {
      // 降级：金色圆点 + 深墨描边
      state.map.addLayer({
        id: CORE_LAYER,
        type: 'circle',
        source: SOURCE_ID,
      paint: {
        'circle-color': MEMORY_RED,
        'circle-stroke-color': MEMORY_INK,
        'circle-stroke-width': 2,
        'circle-opacity': 0.92,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 4, 14, 8],
        },
      });
    }
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
      if (state.map.getLayer('memory-pulse')) state.map.moveLayer('memory-pulse');
      if (state.map.getLayer(CORE_LAYER)) state.map.moveLayer(CORE_LAYER);
    });
  }

  function installMap() {
    if (!state.map) return;
    const doAdd = async () => {
      await addMapLayers();
      updateMapSource();
    };
    if (state.map.isStyleLoaded && state.map.isStyleLoaded()) doAdd();
    else state.map.once('load', doAdd);
  }

  function updateMapSource() {
    if (!state.map || !state.map.getSource(SOURCE_ID)) return;
    state.map.getSource(SOURCE_ID).setData(toFeatureCollection(state.memories));
  }

  function pointHasFeature(point) {
    const layers = ['anchor-core', 'anchor-glow', 'memory-pulse', CORE_LAYER, GLOW_LAYER].filter((id) => state.map.getLayer(id));
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
      // create、pinned、recollections 模式下移除遮罩并禁用shell的pointer-events，让用户可以拖动地图
      if (type === 'create' || type === 'pinned' || type === 'recollections') {
        shell.classList.add('memory-no-scrim');
        shell.classList.add('memory-shell-transparent');
      }
    }
    renderPanel();
  }

  // 清理正在进行的录音（模块级状态）
  let activeMediaRecorder = null;
  let activeVoiceStream = null;
  let activeVoiceTimer = null;

  function cleanupRecording() {
    if (activeVoiceTimer) { clearInterval(activeVoiceTimer); activeVoiceTimer = null; }
    if (activeMediaRecorder && activeMediaRecorder.state === 'recording') {
      try { activeMediaRecorder.stop(); } catch (_) {}
    }
    activeMediaRecorder = null;
    if (activeVoiceStream) {
      activeVoiceStream.getTracks().forEach((t) => t.stop());
      activeVoiceStream = null;
    }
  }

  function closePanel() {
    const wasOpen = !!state.panel;
    cleanupRecording();
    state.panel = null;
    state.selectedFile = null;
    const shell = document.getElementById('memory-shell');
    if (shell) shell.className = '';
    if (wasOpen && onClose) onClose();
  }

  function openCreatePanel(data = {}) {
    // 游客模式下不允许创建记忆，提示登录
    if (!state.auth || !state.auth.isLoggedIn()) {
      toast('auth.login_required');
      return;
    }
    state.selectedFile = null;
    openPanel('create', data);
  }

  function openDetailPanel(id) {
    openPanel('detail', { id });
  }

  function openListPanel() {
    openPanel('list');
  }

  function openRecollectionsPanel() {
    openPanel('recollections');
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
        <span class="memory-panel-seal" aria-hidden="true">忆</span>
        <h2 class="memory-panel-title">${esc(title)}</h2>
      </div>
      ${body}`;
  }

  function renderPinnedPanel(panel, memory) {
    if (!memory) { closePanel(); return; }
    const isVideo = memory.mediaType === 'video';
    const mediaHtml = isVideo && memory.photoUrl
      ? `<video class="memory-pinned-thumb" src="${esc(memory.photoUrl)}" muted playsinline></video>`
      : memory.photoUrl
      ? `<img class="memory-pinned-thumb" src="${esc(memory.photoUrl)}" alt="" />`
      : '';
    panel.innerHTML = panelChrome(getText('memory.saved'), `
      <div class="memory-pinned-view">
        ${mediaHtml}
        ${memory.note ? `<p class="memory-pinned-note">${esc(memory.note)}</p>` : ''}
        ${memory.voiceUrl ? `<div class="memory-pinned-voice"><audio controls src="${esc(memory.voiceUrl)}"></audio></div>` : ''}
        <div class="memory-pinned-coord">
          <span class="memory-pinned-mark" aria-hidden="true"></span>
          <span>${esc(Number(memory.lat).toFixed(5))}, ${esc(Number(memory.lng).toFixed(5))}</span>
        </div>
        <p class="memory-pinned-hint">${esc(getText('memory.pinned_hint'))}</p>
        <div class="memory-pinned-actions">
          <button class="memory-pinned-another" type="button" id="memory-pinned-another">${esc(getText('memory.pinned_another'))}</button>
          <button class="memory-pinned-browse" type="button" id="memory-pinned-browse">${esc(getText('memory.pinned_browse'))}</button>
          <button class="memory-pinned-exit" type="button" data-memory-close>${esc(getText('memory.pinned_exit'))}</button>
        </div>
      </div>`);
    // 「继续留下」按钮 → 重新打开创建面板
    const anotherBtn = panel.querySelector('#memory-pinned-another');
    if (anotherBtn) {
      anotherBtn.addEventListener('click', () => {
        openCreatePanel({ lat: memory.lat, lng: memory.lng, linkedAnchorId: memory.linkedAnchorId || null });
      });
    }
    // 「继续浏览地图」按钮 → 关闭面板，回到地图浏览
    const browseBtn = panel.querySelector('#memory-pinned-browse');
    if (browseBtn) {
      browseBtn.addEventListener('click', () => {
        closePanel();
      });
    }
  }

  function renderPanel() {
    const panel = document.getElementById('memory-panel');
    if (!panel || !state.panel) return;
    const { type, data } = state.panel;
    if (type === 'create') renderCreatePanel(panel, data);
    if (type === 'detail') renderDetailPanel(panel, data.id);
    if (type === 'list') renderListPanel(panel);
    if (type === 'recollections') renderRecollectionsPanel(panel);
    if (type === 'auth') renderAuthPanel(panel);
    if (type === 'pinned') renderPinnedPanel(panel, data.memory);
    panel.querySelectorAll('[data-memory-close]').forEach((btn) => btn.addEventListener('click', closePanel));
  }

  function renderCreatePanel(panel, data) {
    const anchor = data.linkedAnchorId ? anchorById(data.linkedAnchorId) : null;

    panel.innerHTML = panelChrome(getText('memory.create_title'), `
      <div class="memory-create-list-entry">
        <button type="button" id="memory-show-list">${esc(getText('memory.btn'))} (${state.memories.length})</button>
      </div>
      <form class="memory-form" id="memory-create-form">
        <div class="memory-create-media-combined" id="memory-media-area">
          <div class="memory-create-media-empty" id="memory-media-empty">
            <span class="ink-cam-icon" aria-hidden="true"></span>
            <span>${esc(getText('memory.create_hint'))}</span>
          </div>
          <img class="memory-create-media-preview" id="memory-media-preview" alt="" hidden />
          <video class="memory-create-media-preview" id="memory-video-preview" hidden muted playsinline></video>
          <div class="memory-create-media-actions">
            <button class="memory-create-media-btn" type="button" data-media="photo">${esc(getText('memory.media_photo'))}</button>
            <button class="memory-create-media-btn" type="button" data-media="album">${esc(getText('memory.media_album'))}</button>
            ${loggedIn() ? `<button class="memory-create-media-btn" type="button" data-media="video">${esc(getText('memory.media_video'))}</button>` : ''}
          </div>
        </div>
        <input type="file" id="memory-photo-input" accept="image/*" capture="environment" hidden />
        <input type="file" id="memory-album-input" accept="image/*" hidden />
        <input type="file" id="memory-video-input" accept="video/*" capture="environment" hidden />

        <div class="memory-create-voice" id="memory-voice-area">
          <div class="memory-create-voice-bar">
            <button class="memory-create-voice-btn" type="button" id="memory-voice-record">${esc(getText('memory.voice_hint'))}</button>
            <span class="memory-create-voice-timer" id="memory-voice-timer">0s</span>
            <span class="memory-create-voice-max">${esc(getText('memory.voice_max'))}</span>
          </div>
          <audio id="memory-voice-playback" hidden></audio>
        </div>

        <label class="memory-field">
          <span>${esc(getText('memory.note_label'))}</span>
          <textarea id="memory-note-input" maxlength="${MAX_NOTE_LENGTH}" placeholder="${esc(getText('memory.note_placeholder'))}"></textarea>
        </label>
        <div class="memory-meta-line">
          <span>${esc(Number(data.lat).toFixed(5))}, ${esc(Number(data.lng).toFixed(5))}</span>
          ${anchor ? `<span>${esc(getText('memory.linked_anchor'))}: ${esc(pick(anchor.name))}</span>` : ''}
        </div>
        <button class="memory-create-publish" type="submit">${esc(getText('memory.publish'))}</button>
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

    // 语音录制（点击切换模式，比按住模式更可靠）
    const voiceBtn = panel.querySelector('#memory-voice-record');
    const voiceTimerEl = panel.querySelector('#memory-voice-timer');
    const voicePlayback = panel.querySelector('#memory-voice-playback');
    let voiceStream = null;  // 保留 stream 引用以便清理

    const startRecording = async () => {
      // 安全上下文检测
      if (!window.isSecureContext || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast('memory.voice_failed');
        return;
      }
      // MediaRecorder 兼容检测
      if (typeof MediaRecorder === 'undefined') {
        toast('memory.voice_failed');
        return;
      }
      try {
        voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        activeVoiceStream = voiceStream;
        // 选择兼容的 mimeType
        const mimeOptions = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
        const mimeType = mimeOptions.find((m) => MediaRecorder.isTypeSupported(m)) || '';
        mediaRecorder = new MediaRecorder(voiceStream, mimeType ? { mimeType } : undefined);
        activeMediaRecorder = mediaRecorder;
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
        mediaRecorder.onstop = () => {
          voiceBlob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
          voiceUrl = URL.createObjectURL(voiceBlob);
          voicePlayback.src = voiceUrl;
          voicePlayback.hidden = false;
          // 停止所有轨道释放麦克风
          if (voiceStream) {
            voiceStream.getTracks().forEach((t) => t.stop());
            voiceStream = null;
          }
          activeMediaRecorder = null;
          activeVoiceStream = null;
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
            playBtn.addEventListener('click', (ev) => {
              ev.preventDefault();
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
            delBtn.addEventListener('click', (ev) => {
              ev.preventDefault();
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
        mediaRecorder.onerror = () => {
          toast('memory.voice_failed');
          stopRecording();
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
        activeVoiceTimer = voiceTimer;
      } catch (error) {
        // 清理可能已获取的 stream
        if (voiceStream) {
          voiceStream.getTracks().forEach((t) => t.stop());
          voiceStream = null;
        }
        activeMediaRecorder = null;
        activeVoiceStream = null;
        voiceBtn.classList.remove('recording');
        voiceBtn.textContent = getText('memory.voice_hint');
        toast('memory.voice_failed');
      }
    };

    const stopRecording = () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        try { mediaRecorder.stop(); } catch (_) { /* already stopped */ }
      }
      if (voiceTimer) { clearInterval(voiceTimer); voiceTimer = 0; }
      activeVoiceTimer = null;
    };

    // 点击切换模式：第一次点击开始录音，第二次点击停止
    voiceBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
      } else if (!voiceBlob) {
        // 还没有录音 → 开始
        startRecording();
      }
      // 如果已有录音（voiceBlob 存在），忽略点击，用播放/删除按钮操作
    });

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

  // ===== 我的回忆面板 =====
  function renderRecollectionsPanel(panel) {
    const total = state.memories.length;
    const photoCount = state.memories.filter(m => m.photoUrl).length;
    const voiceCount = state.memories.filter(m => m.voiceUrl).length;

    const items = state.memories.map((memory) => {
      const anchor = memory.linkedAnchorId ? anchorById(memory.linkedAnchorId) : null;
      const anchorName = anchor ? pick(anchor.name) : '';
      const thumb = memory.photoUrl
        ? (memory.mediaType === 'video'
          ? `<div class="recollect-thumb-wrap"><img src="${esc(memory.photoUrl)}" alt="" onerror="this.style.display='none'" /><span class="recollect-video-badge">▶</span></div>`
          : `<img src="${esc(memory.photoUrl)}" alt="" onerror="this.style.display='none'" />`)
        : `<span class="memory-list-thumb-fallback">忆</span>`;
      const voiceTag = memory.voiceUrl
        ? `<span class="recollect-voice-tag">🎙 ${esc(getText('recollect.has_voice'))}</span>`
        : '';
      return `
        <div class="recollect-item" data-memory-id="${esc(memory.id)}">
          <div class="recollect-thumb">${thumb}</div>
          <div class="recollect-body">
            <p class="recollect-note">${esc(memory.note || getText('memory.note_placeholder'))}</p>
            <div class="recollect-meta">
              <span class="recollect-date">${esc(formatDate(memory.createdAt))}</span>
              ${anchorName ? `<span class="recollect-anchor">📍 ${esc(anchorName)}</span>` : ''}
              <span class="recollect-coord">${esc(Number(memory.lat).toFixed(4))}, ${esc(Number(memory.lng).toFixed(4))}</span>
              ${voiceTag}
            </div>
          </div>
          <button class="recollect-share-btn" type="button" data-share-id="${esc(memory.id)}">${esc(getText('recollect.share'))}</button>
        </div>`;
    }).join('');

    panel.innerHTML = panelChrome(getText('recollect.title'), `
      <div class="recollect-summary">
        <div class="recollect-stat">
          <span class="recollect-stat-num">${total}</span>
          <span class="recollect-stat-label">${esc(getText('recollect.total_memories'))}</span>
        </div>
        <div class="recollect-stat">
          <span class="recollect-stat-num">${photoCount}</span>
          <span class="recollect-stat-label">${esc(getText('recollect.photos'))}</span>
        </div>
        <div class="recollect-stat">
          <span class="recollect-stat-num">${voiceCount}</span>
          <span class="recollect-stat-label">${esc(getText('recollect.voices'))}</span>
        </div>
      </div>
      <div class="recollect-list">
        ${total ? items : `<div class="memory-empty">${esc(getText('memory.empty'))}</div>`}
      </div>
      ${total ? `
        <div class="recollect-actions">
          <button class="recollect-postcard-btn" type="button" id="recollect-postcard">${esc(getText('recollect.make_postcard'))}</button>
        </div>` : ''}
    `);

    // 点击条目 → 展开详情
    panel.querySelectorAll('.recollect-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.recollect-share-btn')) return;
        openDetailPanel(item.dataset.memoryId);
      });
    });

    // 分享按钮
    panel.querySelectorAll('.recollect-share-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openShareCard(btn.dataset.shareId);
      });
    });

    // 明信片按钮
    const postcardBtn = panel.querySelector('#recollect-postcard');
    if (postcardBtn) {
      postcardBtn.addEventListener('click', () => openPostcardPanel());
    }
  }

  // ===== 分享卡片 =====
  function openShareCard(memoryId) {
    const memory = state.memories.find(m => m.id === memoryId);
    if (!memory) return;
    const anchor = memory.linkedAnchorId ? anchorById(memory.linkedAnchorId) : null;
    const anchorName = anchor ? pick(anchor.name) : getText('recollect.free_explore');

    // AI 生成感悟文案（基于记忆内容 + 关联锚点）
    const aiQuote = generateAIQuote(memory, anchor);

    const overlay = document.createElement('div');
    overlay.className = 'recollect-share-overlay';
    overlay.innerHTML = `
      <div class="recollect-share-card" id="recollect-share-card">
        <button class="recollect-share-close" type="button" id="recollect-share-close">×</button>
        <div class="recollect-share-inner">
          ${memory.photoUrl ? `<div class="recollect-share-photo" style="background-image:url('${esc(memory.photoUrl)}')"></div>` : '<div class="recollect-share-photo recollect-share-photo-empty"><span>忆</span></div>'}
          <div class="recollect-share-content">
            <div class="recollect-share-stamp">${esc(getText('recollect.share_stamp'))}</div>
            <p class="recollect-share-note">${esc(memory.note || getText('memory.note_placeholder'))}</p>
            <div class="recollect-share-ai">
              <span class="recollect-share-ai-label">✦ ${esc(getText('recollect.ai_insight'))}</span>
              <p class="recollect-share-ai-text">${esc(aiQuote)}</p>
            </div>
            <div class="recollect-share-footer">
              <span class="recollect-share-loc">${esc(anchorName)}</span>
              <span class="recollect-share-coord">${esc(Number(memory.lat).toFixed(4))}°N, ${esc(Number(memory.lng).toFixed(4))}°E</span>
              <span class="recollect-share-date">${esc(formatDate(memory.createdAt))}</span>
            </div>
          </div>
        </div>
        <div class="recollect-share-actions">
          <button class="recollect-share-download" type="button" id="recollect-share-download">${esc(getText('recollect.download_image'))}</button>
          <button class="recollect-share-native" type="button" id="recollect-share-native">${esc(getText('recollect.share_now'))}</button>
        </div>
      </div>`;
    state.root.appendChild(overlay);

    overlay.querySelector('#recollect-share-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#recollect-share-download').addEventListener('click', () => {
      downloadShareCardAsImage(overlay.querySelector('#recollect-share-card'), `湾区罗盘-记忆-${formatDate(memory.createdAt)}.png`);
    });

    overlay.querySelector('#recollect-share-native').addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title: getText('recollect.title'), text: memory.note || getText('recollect.share_stamp'), url: window.location.href });
      } else {
        // 降级：复制文字
        const text = `${memory.note || ''}\n${anchorName}\n${getText('recollect.share_stamp')}`;
        navigator.clipboard?.writeText(text).then(() => toast('recollect.copied')).catch(() => {});
      }
    });
  }

  // AI 感悟生成（基于记忆内容 + 锚点信息，模板化生成诗意文案）
  function generateAIQuote(memory, anchor) {
    const quotes = {
      zh: [
        '每一处足迹，都是与这片土地的一次对话。',
        '记忆如墨，晕染在大湾区的山水之间。',
        '此刻定格，将成为未来回望时的一盏灯。',
        '行走的意义，不在终点，在每一次驻足。',
        '你在这里留下的不只是影像，是一段与城市的缘分。',
      ],
      en: [
        'Every footprint is a conversation with this land.',
        'Memory flows like ink across the Bay Area\'s landscape.',
        'This moment, frozen, becomes a lantern for future reflection.',
        'The meaning of travel lies not in arrival, but in every pause.',
        'What you leave here is not just an image, but a bond with the city.',
      ],
      ja: [
        '一つ一つの足跡は、この土地との対話です。',
        '記憶は墨のように、大湾区の山水に染み渡ります。',
        'この瞬間は、未来の振り返りのための灯となります。',
        '旅の意味は目的地ではなく、立ち止まる瞬間にあります。',
      ],
      ko: [
        '모든 발자국은 이 땅과의 대화입니다.',
        '기억은 잉크처럼 만만지구의 산수에 번져갑니다.',
        '이 순간은 미래의 돌아봄을 위한 등불이 됩니다.',
      ],
      ru: [
        'Каждый след — это разговор с этой землёй.',
        'Память течёт как чернила по пейзажу Большого залива.',
        'Этот миг станет фонарём для будущих воспоминаний.',
      ],
      es: [
        'Cada huella es una conversación con esta tierra.',
        'La memoria fluye como tinta por el paisaje del Gran Bahía.',
        'Este instante se convertirá en una linterna para el futuro.',
      ],
    };
    const lang = getLang();
    const pool = quotes[lang] || quotes.zh;
    // 用 memory.id 的 hash 确保同一条记忆总是生成相同文案
    const hash = memory.id.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0x7fffffff, 0);
    return pool[hash % pool.length];
  }

  // ===== 明信片生成 =====
  function openPostcardPanel() {
    const memories = state.memories;
    if (!memories.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'recollect-share-overlay';
    overlay.innerHTML = `
      <div class="recollect-postcard" id="recollect-postcard-card">
        <button class="recollect-share-close" type="button" id="recollect-postcard-close">×</button>
        <div class="postcard-inner">
          <div class="postcard-front">
            <div class="postcard-header">
              <span class="postcard-brand">${esc(getText('recollect.postcard_title'))}</span>
              <span class="postcard-stamp">郵</span>
            </div>
            <div class="postcard-collage" id="postcard-collage">
              ${memories.slice(0, 4).map(m => m.photoUrl
                ? `<div class="postcard-cell" style="background-image:url('${esc(m.photoUrl)}')"></div>`
                : `<div class="postcard-cell postcard-cell-empty"><span>忆</span></div>`
              ).join('')}
            </div>
            <div class="postcard-summary">
              <p class="postcard-summary-text">${esc(getText('recollect.postcard_summary', { n: memories.length }))}</p>
              <p class="postcard-ai-quote" id="postcard-ai-quote">✦ ${esc(generateJourneyQuote(memories))}</p>
            </div>
            <div class="postcard-footer">
              <span class="postcard-date">${esc(formatDate(new Date().toISOString()))}</span>
              <span class="postcard-brand-mini">湾区罗盘 · Bay Compass</span>
            </div>
          </div>
        </div>
        <div class="recollect-share-actions">
          <button class="recollect-share-download" type="button" id="recollect-postcard-download">${esc(getText('recollect.download_image'))}</button>
        </div>
      </div>`;
    state.root.appendChild(overlay);

    overlay.querySelector('#recollect-postcard-close').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#recollect-postcard-download').addEventListener('click', () => {
      downloadShareCardAsImage(overlay.querySelector('#recollect-postcard-card'), '湾区罗盘-明信片.png');
    });
  }

  // 旅程总结 AI 文案
  function generateJourneyQuote(memories) {
    const n = memories.length;
    const hasVoice = memories.some(m => m.voiceUrl);
    const hasAnchor = memories.some(m => m.linkedAnchorId);
    const templates = {
      zh: [
        `这${n}处印记，串联起你与大湾区的一段独属旅程。`,
        `从第一处驻足到此刻，你已在这片土地留下${n}个故事。`,
        `${n}个瞬间，${hasVoice ? '有声音的温度' : '有影像的重量'}，${hasAnchor ? '有锚点的指引' : '有自由的脚步'}——这是你的湾区记忆。`,
      ],
      en: [
        `These ${n} marks trace your unique journey across the Greater Bay Area.`,
        `From first pause to now, you've left ${n} stories on this land.`,
        `${n} moments, ${hasVoice ? 'warm with voice' : 'weighted with images'}, ${hasAnchor ? 'guided by anchors' : 'free in footsteps'} — your Bay Area memory.`,
      ],
    };
    const lang = getLang();
    const pool = templates[lang] || templates.zh;
    return pool[n % pool.length];
  }

  // 下载卡片为图片（使用 Canvas 截图）
  function downloadShareCardAsImage(cardEl, filename) {
    import('https://html2canvas.hertzen.com/dist/html2canvas.min.js').then(({ default: html2canvas }) => {
      html2canvas(cardEl, { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true }).then(canvas => {
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          toast('recollect.downloaded');
        });
      }).catch(() => {
        // 降级：提示截图
        toast('recollect.screenshot_hint');
      });
    }).catch(() => {
      toast('recollect.screenshot_hint');
    });
  }

  function renderAuthPanel(panel) {
    const logged = loggedIn();
    const email = state.auth && state.auth.email ? state.auth.email : '';
    const message = state.authForm.message ? `<p class="auth-message">${esc(state.authForm.message)}</p>` : '';
    const body = logged
      ? `
        <div class="auth-benefits">
          <p>${esc(getText('auth.logged_in_as', { email }))}</p>
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
            <span>${esc(getText('auth.email_label'))}</span>
            <input id="auth-email" type="email" inputmode="email" autocomplete="email" value="${esc(state.authForm.email || '')}" />
          </label>
          <label class="memory-field">
            <span>${esc(getText('auth.password_label'))}</span>
            <input id="auth-password" type="password" autocomplete="current-password" value="${esc(state.authForm.password || '')}" />
          </label>
          ${message}
          <button class="memory-primary" type="submit">${esc(getText('auth.signin'))}</button>
        </form>`;
    panel.innerHTML = panelChrome(getText('auth.title'), body);
    const logout = panel.querySelector('#auth-logout-btn');
    if (logout) {
      logout.addEventListener('click', async () => {
        try {
          await state.auth.signOut();
          state.syncedUserId = null;
          // 关键：在reload之前显式清除localStorage中的记忆锚点
          // 防止reload后readLocalMemories读到上一个用户的数据
          try { localStorage.removeItem(getStorageKey()); } catch (_) {}
          _currentUserId = null;
          state.memories = [];
          updateMapSource();
          updateAuthButton();
          closePanel();
          window.location.reload();
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
        state.authForm.email = panel.querySelector('#auth-email').value.trim();
        state.authForm.password = panel.querySelector('#auth-password').value;
        try {
          await state.auth.signIn(state.authForm.email, state.authForm.password);
          await syncAfterLogin();
          closePanel();
        } catch (error) {
          state.authForm.message = getText('auth.auth_error');
          renderPanel();
        }
      });
    }
  }

  async function createMemory({ lat, lng, linkedAnchorId, note, file, mediaType, voiceBlob }) {
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
      authorName: currentUser ? (currentUser.email || '') : '',
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
    // 不直接关闭面板，切换到"已钉下"成功视图，让用户看到地图上的锚点
    openPanel('pinned', { memory });
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
      const isLoggedIn = snapshot.session || snapshot.user;
      if (isLoggedIn && (event === 'SIGNED_IN' || event === 'READY')) syncAfterLogin();
      if (event === 'SIGNED_OUT') {
        state.syncedUserId = null;
        // 关键：登出时清除该用户的所有记忆锚点，防止下一个用户看到
        try { localStorage.removeItem(getStorageKey()); } catch (_) {}
        _currentUserId = null;
        setMemories([]);
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
    openRecollectionsPanel,
    getMemories() {
      return state.memories;
    },
    init() {
      ensureDeviceId();
      renderShell();
      installToolbar();
      installMap();
      initAuth();
    },
    isOpen() {
      return !!state.panel;
    },
    mountAnchorMemorySection,
    refreshTexts,
  };
}
