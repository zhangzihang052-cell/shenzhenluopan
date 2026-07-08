// 好友系统模块 —— 湾区罗盘 Phase 3
// 功能：好友关系管理（添加/接受/列表）+ 好友当天记忆查询 + 地图渲染 + Feed 面板 + 通知
// 依赖：auth.js（Supabase client）、memory.js（数据模型）、i18n.js
// 搜索方式：邮箱

import { getLang, getText, pick } from './i18n.js?rev=friends-3';

const FRIEND_TABLE = 'friendships';
const PROFILE_TABLE = 'user_profiles';
const MEMORY_TABLE = 'memory_anchors';
const PHOTO_BUCKET = 'memory-photos';

// 好友锚点视觉常量（与 PRODUCT_V2.md 4.8 节一致）
const FRIEND_GLOW_LAYER = 'friend-memory-glow';
const FRIEND_CORE_LAYER = 'friend-memory-core';
const FRIEND_SOURCE_ID = 'friend-memory-source';
const FRIEND_GLOW_COLOR = '#d4a843';
const FRIEND_CORE_COLOR = '#e8c878';

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function todayKey() {
  // Asia/Shanghai 时区的当天日期 key
  const now = new Date();
  const shanghai = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60000);
  const y = shanghai.getFullYear();
  const m = String(shanghai.getMonth() + 1).padStart(2, '0');
  const d = String(shanghai.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 创建好友控制器
 * @param {Object} options
 * @param {HTMLElement} options.root - UI 根容器
 * @param {Object} options.map - MapLibre map 实例
 * @param {Object} options.auth - auth controller 实例
 * @param {Function} options.showToast - 全局 toast 函数
 * @param {Function} options.onFriendClick - 好友锚点点击回调（fly-to）
 */
export function createFriendsController({ root, map, auth, showToast, onFriendClick } = {}) {
  const state = {
    friends: [],          // 已接受好友列表 [{ id, displayName, phone }]
    pendingRequests: [],  // 收到的待处理请求 [{ id, requesterId, requesterName, createdAt }]
    sentRequests: [],     // 已发送待接受请求 [{ id, addresseeName }]
    friendMemories: [],   // 好友当天记忆 [{ id, lat, lng, photoUrl, note, authorName, createdAt }]
    panel: null,
    loading: false,
  };

  const toast = (key, vars) => {
    if (showToast) showToast(getText(key, vars));
  };

  const client = () => (auth && auth.client ? auth.client : null);
  const user = () => (auth && auth.user ? auth.user : null);
  const loggedIn = () => !!user();

  // ===== 数据加载 =====

  async function loadFriends() {
    if (!loggedIn() || !client()) return;
    try {
      // 查询双向好友关系
      const { data, error } = await client()
        .from(FRIEND_TABLE)
        .select('id, requester_id, addressee_id, status, created_at, accepted_at')
        .or(`requester_id.eq.${user().id},addressee_id.eq.${user().id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const friends = [];
      const pendingReceived = [];
      const sentPending = [];

      for (const row of data || []) {
        const isRequester = row.requester_id === user().id;
        const otherId = isRequester ? row.addressee_id : row.requester_id;

        // 查询对方昵称和邮箱
        const { data: profile } = await client()
          .from(PROFILE_TABLE)
          .select('display_name, email')
          .eq('user_id', otherId)
          .maybeSingle();

        const displayName = (profile && profile.display_name) || (profile && profile.email) || 'Anonymous';

        if (row.status === 'accepted') {
          friends.push({ id: otherId, displayName, friendshipId: row.id });
        } else if (row.status === 'pending') {
          if (isRequester) {
            sentPending.push({ id: row.id, addresseeId: otherId, addresseeName: displayName, createdAt: row.created_at });
          } else {
            pendingReceived.push({ id: row.id, requesterId: otherId, requesterName: displayName, createdAt: row.created_at });
          }
        }
      }

      state.friends = friends;
      state.pendingRequests = pendingReceived;
      state.sentRequests = sentPending;
      updateRequestBadge();
    } catch (error) {
      console.warn('Failed to load friends:', error);
    }
  }

  async function loadFriendMemories() {
    if (!loggedIn() || !client()) return;
    if (state.friends.length === 0) {
      state.friendMemories = [];
      updateMapSource();
      return;
    }

    try {
      const friendIds = state.friends.map((f) => f.id);
      const today = todayKey();

      // 查询好友当天记忆（RLS 策略保证只能看到 accepted 好友的当天记忆）
      const { data, error } = await client()
        .from(MEMORY_TABLE)
        .select('id, lat, lng, photo_url, note, author_name, created_at, media_type, voice_url')
        .in('author_id', friendIds)
        .eq('date_key', today)
        .order('created_at', { ascending: false });
      if (error) throw error;

      state.friendMemories = (data || []).map((row) => ({
        id: row.id,
        lat: Number(row.lat),
        lng: Number(row.lng),
        photoUrl: row.photo_url || '',
        note: row.note || '',
        authorName: row.author_name || 'Friend',
        createdAt: row.created_at,
        mediaType: row.media_type || 'photo',
        voiceUrl: row.voice_url || '',
      }));
      updateMapSource();
    } catch (error) {
      console.warn('Failed to load friend memories:', error);
      state.friendMemories = [];
      updateMapSource();
    }
  }

  // ===== 好友操作 =====

  async function searchByEmail(email) {
    if (!loggedIn() || !client()) return null;
    const { data, error } = await client()
      .from(PROFILE_TABLE)
      .select('user_id, display_name, email')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();
    if (error) {
      console.error('searchByEmail error:', error);
      throw error;
    }
    return data;
  }

  async function sendFriendRequest(addresseeId) {
    if (!loggedIn() || !client()) throw new Error('not-logged-in');
    if (addresseeId === user().id) throw new Error('cannot-add-self');

    const { data, error } = await client()
      .from(FRIEND_TABLE)
      .insert({
        requester_id: user().id,
        addressee_id: addresseeId,
        status: 'pending',
      })
      .select('id')
      .single();
    if (error) throw error;
    return data;
  }

  async function acceptFriendRequest(friendshipId) {
    if (!loggedIn() || !client()) throw new Error('not-logged-in');
    const { error } = await client()
      .from(FRIEND_TABLE)
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', friendshipId)
      .eq('addressee_id', user().id);
    if (error) throw error;
    await loadFriends();
    await loadFriendMemories();
  }

  async function rejectFriendRequest(friendshipId) {
    if (!loggedIn() || !client()) throw new Error('not-logged-in');
    const { error } = await client()
      .from(FRIEND_TABLE)
      .delete()
      .eq('id', friendshipId)
      .eq('addressee_id', user().id);
    if (error) throw error;
    await loadFriends();
  }

  async function removeFriend(friendshipId) {
    if (!loggedIn() || !client()) throw new Error('not-logged-in');
    const { error } = await client()
      .from(FRIEND_TABLE)
      .delete()
      .eq('id', friendshipId);
    if (error) throw error;
    await loadFriends();
    await loadFriendMemories();
  }

  // ===== 地图渲染 =====

  function toFeatureCollection(memories) {
    return {
      type: 'FeatureCollection',
      features: memories.map((m) => ({
        type: 'Feature',
        id: m.id,
        geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
        properties: { id: m.id },
      })),
    };
  }

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  function makeFriendDiamondIcon(size, coreColor, strokeColor) {
    const half = size / 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect x="${half * 0.5}" y="${half * 0.5}" width="${half}" height="${half}" transform="rotate(45 ${half} ${half})"
        fill="${coreColor}" fill-opacity="0.6" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="3,2"/>
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    return URL.createObjectURL(blob);
  }

  async function addFriendLayers() {
    if (!map || map.getSource(FRIEND_SOURCE_ID)) return;

    map.addSource(FRIEND_SOURCE_ID, {
      type: 'geojson',
      data: toFeatureCollection(state.friendMemories),
    });

    // 烘焙淡金色虚线菱形图标
    let hasFriendIcon = false;
    try {
      if (!map.hasImage('diamond-friend-memory')) {
        const iconUrl = makeFriendDiamondIcon(32, FRIEND_CORE_COLOR, FRIEND_GLOW_COLOR);
        try {
          const img = await loadImage(iconUrl);
          if (!map.hasImage('diamond-friend-memory')) map.addImage('diamond-friend-memory', img);
        } finally {
          URL.revokeObjectURL(iconUrl);
        }
      }
      hasFriendIcon = map.hasImage('diamond-friend-memory');
    } catch (e) { /* 降级 */ }

    // 柔光层：淡金色模糊光晕（降低饱和度）
    map.addLayer({
      id: FRIEND_GLOW_LAYER,
      type: 'circle',
      source: FRIEND_SOURCE_ID,
      paint: {
        'circle-color': FRIEND_GLOW_COLOR,
        'circle-blur': 1.2,
        'circle-opacity': 0.25,
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 6, 14, 14],
      },
    });

    // 核心层：淡金色虚线菱形
    if (hasFriendIcon) {
      map.addLayer({
        id: FRIEND_CORE_LAYER,
        type: 'symbol',
        source: FRIEND_SOURCE_ID,
        layout: {
          'icon-image': 'diamond-friend-memory',
          'icon-size': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 14, 0.95],
          'icon-allow-overlap': true,
        },
        paint: {
          'icon-opacity': 0.75,
        },
      });
    } else {
      // 降级：淡金色虚线圈
      map.addLayer({
        id: FRIEND_CORE_LAYER,
        type: 'circle',
        source: FRIEND_SOURCE_ID,
        paint: {
          'circle-color': FRIEND_CORE_COLOR,
          'circle-stroke-color': FRIEND_GLOW_COLOR,
          'circle-stroke-width': 1.5,
          'circle-stroke-opacity': 0.5,
          'circle-opacity': 0.5,
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 3, 14, 7],
        },
      });
    }

    // 点击查看好友记忆详情（只读）
    const openFriendMemory = (event) => {
      const feature = event.features && event.features[0];
      if (!feature) return;
      const memory = state.friendMemories.find((m) => m.id === feature.properties.id);
      if (memory) openFriendDetailPanel(memory);
    };

    map.on('click', FRIEND_CORE_LAYER, openFriendMemory);
    map.on('click', FRIEND_GLOW_LAYER, openFriendMemory);
    map.on('mousemove', FRIEND_CORE_LAYER, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', FRIEND_CORE_LAYER, () => {
      map.getCanvas().style.cursor = '';
    });

    // 确保好友锚点在自己锚点之下
    map.once('idle', () => {
      if (map.getLayer(FRIEND_GLOW_LAYER)) map.moveLayer(FRIEND_GLOW_LAYER);
      if (map.getLayer(FRIEND_CORE_LAYER)) map.moveLayer(FRIEND_CORE_LAYER);
    });
  }

  function updateMapSource() {
    if (!map || !map.getSource(FRIEND_SOURCE_ID)) return;
    map.getSource(FRIEND_SOURCE_ID).setData(toFeatureCollection(state.friendMemories));
  }

  function installMap() {
    if (!map) return;
    const doAdd = async () => {
      await addFriendLayers();
      updateMapSource();
    };
    if (map.isStyleLoaded && map.isStyleLoaded()) doAdd();
    else map.once('load', doAdd);
  }

  // ===== UI 面板 =====

  function openFriendsPanel() {
    if (!root) return;
    closePanel();
    const panel = document.createElement('div');
    panel.id = 'friends-panel';
    panel.className = 'friends-panel';
    panel.innerHTML = renderPanelHTML();
    root.appendChild(panel);
    state.panel = panel;
    bindPanelEvents(panel);
  }

  function closePanel() {
    if (state.panel) {
      state.panel.remove();
      state.panel = null;
    }
  }

  function renderPanelHTML() {
    const friendsList = state.friends.length
      ? state.friends.map((f) => `
        <div class="friend-item">
          <span class="friend-name">${esc(f.displayName)}</span>
          <button class="friend-remove-btn" data-remove-friend="${esc(f.friendshipId)}">${esc(getText('friend.remove'))}</button>
        </div>
      `).join('')
      : `<div class="friend-empty">${esc(getText('friend.empty'))}</div>`;

    const pendingList = state.pendingRequests.length
      ? state.pendingRequests.map((r) => `
        <div class="friend-request-item">
          <span class="friend-name">${esc(r.requesterName)}</span>
          <button class="friend-accept-btn" data-accept="${esc(r.id)}">${esc(getText('friend.accept'))}</button>
          <button class="friend-reject-btn" data-reject="${esc(r.id)}">${esc(getText('friend.reject'))}</button>
        </div>
      `).join('')
      : '';

    const sentList = state.sentRequests.length
      ? state.sentRequests.map((r) => `
        <div class="friend-sent-item">
          <span class="friend-name">${esc(r.addresseeName)}</span>
          <span class="friend-status-pending">${esc(getText('friend.pending'))}</span>
        </div>
      `).join('')
      : '';

    return `
      <div class="memory-panel-inner">
        <button class="memory-close" type="button" data-friends-close aria-label="${esc(getText('panel.close'))}">×</button>
        <h2 class="memory-panel-title">${esc(getText('friend.title'))}</h2>

        ${pendingList ? `<div class="friend-section">
          <h3 class="friend-section-title">${esc(getText('friend.requests'))}</h3>
          ${pendingList}
        </div>` : ''}

        <div class="friend-section">
          <h3 class="friend-section-title">${esc(getText('friend.add_title'))}</h3>
          <div class="friend-add-form">
            <input type="email" id="friend-email-input" placeholder="${esc(getText('friend.email_placeholder'))}" class="friend-input" />
            <button type="button" id="friend-search-btn" class="friend-search-btn">${esc(getText('friend.search'))}</button>
          </div>
          <div id="friend-search-result"></div>
        </div>

        <div class="friend-section">
          <h3 class="friend-section-title">${esc(getText('friend.list'))} (${state.friends.length})</h3>
          ${friendsList}
        </div>

        ${sentList ? `<div class="friend-section">
          <h3 class="friend-section-title">${esc(getText('friend.sent'))}</h3>
          ${sentList}
        </div>` : ''}
      </div>
    `;
  }

  function bindPanelEvents(panel) {
    // 关闭
    const closeBtn = panel.querySelector('[data-friends-close]');
    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    // 搜索
    const searchBtn = panel.querySelector('#friend-search-btn');
    const emailInput = panel.querySelector('#friend-email-input');
    if (searchBtn && emailInput) {
      searchBtn.addEventListener('click', () => handleSearch(emailInput.value, panel));
      emailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSearch(emailInput.value, panel);
      });
    }

    // 接受/拒绝
    panel.querySelectorAll('[data-accept]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await acceptFriendRequest(btn.dataset.accept);
          toast('friend.accepted');
          openFriendsPanel(); // 刷新面板
        } catch (e) { toast('friend.error'); }
      });
    });
    panel.querySelectorAll('[data-reject]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await rejectFriendRequest(btn.dataset.reject);
          openFriendsPanel();
        } catch (e) { toast('friend.error'); }
      });
    });

    // 删除好友
    panel.querySelectorAll('[data-remove-friend]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await removeFriend(btn.dataset.removeFriend);
          toast('friend.removed');
          openFriendsPanel();
        } catch (e) { toast('friend.error'); }
      });
    });
  }

  async function handleSearch(email, panel) {
    const resultDiv = panel.querySelector('#friend-search-result');
    if (!resultDiv) return;
    const trimmed = String(email || '').trim().toLowerCase();
    if (!trimmed) {
      resultDiv.innerHTML = `<span class="friend-search-error">${esc(getText('friend.email_empty'))}</span>`;
      return;
    }
    // 简单邮箱格式校验
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      resultDiv.innerHTML = `<span class="friend-search-error">${esc(getText('friend.email_invalid'))}</span>`;
      return;
    }
    resultDiv.innerHTML = `<span class="friend-searching">${esc(getText('friend.searching'))}</span>`;
    try {
      const profile = await searchByEmail(trimmed);
      if (!profile) {
        resultDiv.innerHTML = `<span class="friend-search-error">${esc(getText('friend.not_found'))}</span>`;
        return;
      }
      if (profile.user_id === user().id) {
        resultDiv.innerHTML = `<span class="friend-search-error">${esc(getText('friend.is_self'))}</span>`;
        return;
      }
      resultDiv.innerHTML = `
        <div class="friend-search-result-item">
          <span>${esc(profile.display_name || profile.email || 'User')}</span>
          <button type="button" data-add-friend="${esc(profile.user_id)}" class="friend-add-btn">${esc(getText('friend.add'))}</button>
        </div>
      `;
      const addBtn = resultDiv.querySelector('[data-add-friend]');
      if (addBtn) {
        addBtn.addEventListener('click', async () => {
          try {
            addBtn.disabled = true;
            addBtn.textContent = getText('friend.sending');
            await sendFriendRequest(addBtn.dataset.addFriend);
            resultDiv.innerHTML = `<span class="friend-search-success">${esc(getText('friend.request_sent'))}</span>`;
            await loadFriends();
            setTimeout(() => openFriendsPanel(), 800);
          } catch (e) {
            addBtn.disabled = false;
            addBtn.textContent = getText('friend.add');
            const msg = (e && e.code === '23505') ? getText('friend.already_sent') : getText('friend.error');
            resultDiv.innerHTML = `<span class="friend-search-error">${esc(msg)}</span>`;
          }
        });
      }
    } catch (e) {
      console.error('好友搜索失败:', e);
      const errMsg = (e && e.message) ? e.message : getText('friend.error');
      resultDiv.innerHTML = `<span class="friend-search-error">${esc(errMsg)}</span>`;
    }
  }

  // ===== 好友记忆详情（只读） =====

  function openFriendDetailPanel(memory) {
    if (!root) return;
    // 关闭已有面板
    const existing = document.getElementById('friend-detail-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'friend-detail-panel';
    panel.className = 'memory-panel friend-detail-panel';
    panel.innerHTML = `
      <div class="memory-panel-inner">
        <button class="memory-close" type="button" data-friend-detail-close aria-label="${esc(getText('panel.close'))}">×</button>
        <h2 class="memory-panel-title">${esc(getText('friend.memory_title', { name: memory.authorName }))}</h2>
        <div class="memory-detail-content">
          ${memory.photoUrl ? `<img src="${esc(memory.photoUrl)}" class="memory-detail-photo" alt="" />` : ''}
          <p class="memory-detail-note">${esc(memory.note || getText('memory.note_placeholder'))}</p>
          <p class="memory-detail-time">${esc(formatTime(memory.createdAt))}</p>
        </div>
      </div>
    `;
    root.appendChild(panel);
    panel.querySelector('[data-friend-detail-close]').addEventListener('click', () => panel.remove());

    // fly-to
    if (onFriendClick) onFriendClick(memory.lng, memory.lat);
  }

  function formatTime(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString(getLang() === 'zh' ? 'zh-CN' : 'en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch (e) { return ''; }
  }

  // ===== 好友 Feed 面板（嵌入记忆创建界面） =====

  function renderFriendFeedHTML() {
    if (!loggedIn() || state.friendMemories.length === 0) return '';
    const cards = state.friendMemories.map((m) => `
      <div class="friend-feed-card" data-friend-memory="${esc(m.id)}">
        ${m.photoUrl ? `<img src="${esc(m.photoUrl)}" class="friend-feed-thumb" alt="" />` : '<div class="friend-feed-thumb-placeholder"></div>'}
        <div class="friend-feed-info">
          <span class="friend-feed-name">${esc(m.authorName)}</span>
          <span class="friend-feed-note">${esc((m.note || '').slice(0, 30))}</span>
        </div>
      </div>
    `).join('');
    return `
      <div class="friend-feed-section">
        <h3 class="friend-feed-title">${esc(getText('friend.feed_title'))}</h3>
        <div class="friend-feed-scroll">${cards}</div>
      </div>
    `;
  }

  function bindFeedEvents(container) {
    if (!container) return;
    container.querySelectorAll('[data-friend-memory]').forEach((card) => {
      card.addEventListener('click', () => {
        const memory = state.friendMemories.find((m) => m.id === card.dataset.friendMemory);
        if (memory) openFriendDetailPanel(memory);
      });
    });
  }

  // ===== 通知徽章 =====

  function updateRequestBadge() {
    const badge = document.getElementById('friends-request-count');
    if (!badge) return;
    const count = state.pendingRequests.length;
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  // ===== 实时通知订阅 =====

  let subscription = null;

  function subscribeNotifications() {
    if (!loggedIn() || !client()) return;
    // 取消旧订阅
    if (subscription) {
      try { subscription.unsubscribe(); } catch (e) {}
      subscription = null;
    }
    // 订阅 friendships 表变化（当别人向当前用户发送好友请求时触发）
    subscription = client()
      .channel('friend-requests')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: FRIEND_TABLE,
        filter: `addressee_id=eq.${user().id}`,
      }, (payload) => {
        // 收到新好友请求 → 刷新数据并显示通知
        refresh().then(() => {
          const requesterName = payload.new && payload.new.requester_id
            ? ''
            : '';
          toast('friend.new_request');
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: FRIEND_TABLE,
        filter: `requester_id=eq.${user().id}`,
      }, (payload) => {
        // 自己发出的请求被对方接受了
        if (payload.new && payload.new.status === 'accepted') {
          toast('friend.request_accepted');
          refresh();
        }
      })
      .subscribe();
  }

  function unsubscribeNotifications() {
    if (subscription) {
      try { subscription.unsubscribe(); } catch (e) {}
      subscription = null;
    }
  }

  // ===== 刷新 =====

  async function refresh() {
    if (!loggedIn()) {
      state.friends = [];
      state.friendMemories = [];
      updateMapSource();
      return;
    }
    state.loading = true;
    await loadFriends();
    await loadFriendMemories();
    state.loading = false;
  }

  function refreshTexts() {
    if (state.panel) openFriendsPanel();
  }

  // ===== 初始化 =====

  function init() {
    if (map) installMap();
    // 监听登录状态变化
    if (auth && auth.subscribe) {
      auth.subscribe((snapshot, event) => {
        if (event === 'SIGNED_IN') {
          refresh().then(() => subscribeNotifications());
        } else if (event === 'SIGNED_OUT') {
          unsubscribeNotifications();
          state.friends = [];
          state.pendingRequests = [];
          state.sentRequests = [];
          state.friendMemories = [];
          updateMapSource();
          updateRequestBadge();
        } else if (event === 'READY') {
          if (auth.isLoggedIn()) {
            refresh().then(() => subscribeNotifications());
          }
        }
      });
    }
  }

  return {
    init,
    refresh,
    refreshTexts,
    openFriendsPanel,
    closePanel,
    renderFriendFeedHTML,
    bindFeedEvents,
    subscribeNotifications,
    unsubscribeNotifications,
    get friends() { return state.friends; },
    get friendMemories() { return state.friendMemories; },
    get pendingRequests() { return state.pendingRequests; },
  };
}
