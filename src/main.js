// 应用主入口 v3：联调地图与 UI（6语言 + 罗盘探索 + 主题路线 + 剧情副本 + 印章册）
import { createMap, haversineKm } from './map.js?rev=v2-instant-open-1';
import { ANCHORS } from './data/anchors.js?rev=external-preview-1';
import { THEMES, OVERVIEW_MODE, TRAVEL_MODES, DEFAULT_LOCATION } from './data/themes.js?rev=clean-8';
import { getText, pick } from './i18n.js?rev=audio-sfx-1';
import { getEpisode } from './data/episodes.js?rev=audio-sfx-1';
import { buildItinerary, itineraryCoords, planOSRMRoute } from './route.js?rev=external-preview-1';
import { createAuthController } from './auth.js?rev=memory-1';
import { createMemoryController } from './memory.js?rev=memory-1';
import {
  isTencentConfigured,
  planTencentRoute,
} from './tencent.js';
import {
  getCompletedIds,
  renderEpisodeLayer,
  openEpisode,
  closeEpisode,
  isEpisodeOpen,
  renderStampBook,
  openStampBook,
  closeStampBook,
  isStampBookOpen,
  refreshStampBadge,
  showAchievementCard,
  handleGeofence,
} from './game.js?rev=audio-sfx-1';
import {
  renderHeader,
  refreshHeader,
  renderToolCluster,
  refreshToolCluster,
  setGpsLoading,
  showToast,
  renderGeoModal,
  openGeoModal,
  renderInfoPanel,
  openInfoPanel,
  openForeignPanel,
  closeInfoPanel,
  isPanelOpen,
  getCurrentAnchor,
  updateVisibleCount,
  renderNearbyDrawer,
  openNearbyDrawer,
  closeNearbyDrawer,
  isNearbyOpen,
  getNearbyIds,
  setHaversine,
  setNearbyChangeHandler,
  refreshNearbyTexts,
  renderBreadcrumb,
  setBreadcrumb,
  pushBreadcrumb,
  clearBreadcrumb,
  getBreadcrumbTrail,
  renderCompassPanel,
  openCompassPanel,
  closeCompassPanel,
  isCompassOpen,
  isCompassShowingClues,
  getCompassClueIds,
  focusCompassClue,
  setCompassLocation,
  setCompassPlanning,
  showItinerary,
  clearItinerary,
  refreshCompassTexts,
  playClueScanTransition,
  openClueCompleteFeedback,
  renderRoutePlanner,
  openRoutePlanner,
  closeRoutePlanner,
  isRoutePlannerOpen,
  setRoutePlannerPlanning,
  showRoutePlannerItinerary,
  clearRoutePlannerItinerary,
  refreshRoutePlannerTexts,
  setRoutePlannerLocation,
  clearActiveMainBtn,
} from './ui.js?rev=v2-fix-explore-stamp-1';

/** WebGL 支持检测 */
function isWebGLSupported() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

/** 全屏降级提示 */
function showFullscreenError(bodyKey) {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');
  const el = document.createElement('div');
  el.className = 'webgl-fallback';
  el.innerHTML = `
    <div class="seal" style="width:72px;height:72px;font-size:24px;margin-bottom:24px">罗盘</div>
    <h1 class="font-brush" style="font-size:28px;color:#C9A84C;margin-bottom:16px">${getText('webgl.title')}</h1>
    <p style="max-width:440px;font-size:14px;line-height:1.8;color:#cbd5e1">${getText(bodyKey)}</p>`;
  document.body.appendChild(el);
}

function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) loading.classList.add('hidden');
}

const BGM_URL = './public/audio/yiran-zide-erhu-pipa.m4a?v=bgm-1';
const BGM_VOLUME = 0.16;
const BGM_MUTED_KEY = 'stc_bgm_muted';
const UI_PAGE_SFX_URL = './public/audio/ui-page-turn.wav?v=sfx-assets-1';
const UI_CLUE_SFX_URL = './public/audio/ui-clue-discovery.mp3?v=sfx-assets-1';
const UI_PAGE_SFX_VOLUME = 0.13;
const UI_CLUE_SFX_VOLUME = 0.18;

function getStoredBgmMuted() {
  try {
    return localStorage.getItem(BGM_MUTED_KEY) === '1';
  } catch (e) {
    return false;
  }
}

function setStoredBgmMuted(value) {
  try {
    localStorage.setItem(BGM_MUTED_KEY, value ? '1' : '0');
  } catch (e) {
    // Ignore storage failures; the in-session control still works.
  }
}

function initBackgroundMusic(root) {
  if (!root || document.getElementById('bgm-toggle')) return;
  const audio = document.createElement('audio');
  audio.id = 'bgm-audio';
  audio.src = BGM_URL;
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = BGM_VOLUME;
  audio.setAttribute('aria-hidden', 'true');

  const btn = document.createElement('button');
  btn.id = 'bgm-toggle';
  btn.className = 'bgm-toggle';
  btn.type = 'button';
  btn.innerHTML = `
    <span class="bgm-note" aria-hidden="true">♪</span>
    <span class="bgm-bars" aria-hidden="true"><i></i><i></i><i></i></span>`;

  let muted = getStoredBgmMuted();
  let unlocked = false;

  const update = () => {
    const playing = !muted && !audio.paused;
    btn.classList.toggle('is-muted', muted);
    btn.classList.toggle('is-playing', playing);
    btn.setAttribute('aria-pressed', String(playing));
    const label = getText(playing ? 'bgm.pause' : 'bgm.play');
    btn.title = label;
    btn.setAttribute('aria-label', label);
  };

  const tryPlay = () => {
    if (muted) {
      update();
      return;
    }
    unlocked = true;
    audio.volume = BGM_VOLUME;
    audio.play().then(update).catch(update);
  };

  const unlockOnce = (event) => {
    if (event && event.target && event.target.closest && event.target.closest('#bgm-toggle')) return;
    tryPlay();
    window.removeEventListener('pointerdown', unlockOnce);
    window.removeEventListener('keydown', unlockOnce);
  };

  btn.addEventListener('click', (event) => {
    event.stopPropagation();
    unlocked = true;
    if (muted || audio.paused) {
      muted = false;
      setStoredBgmMuted(false);
      tryPlay();
    } else {
      muted = true;
      setStoredBgmMuted(true);
      audio.pause();
    }
    update();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      audio.pause();
      update();
    } else if (unlocked && !muted) {
      tryPlay();
    }
  });
  audio.addEventListener('play', update);
  audio.addEventListener('pause', update);
  audio.addEventListener('volumechange', update);

  root.appendChild(btn);
  document.body.appendChild(audio);
  update();

  // 一进来就尝试播放 BGM；如果被浏览器自动播放策略拦截，则保留首次交互兜底
  if (!muted) {
    audio.play().then(() => {
      unlocked = true;
      update();
    }).catch(() => {
      // 浏览器要求用户交互后才能播放，注册兜底监听
      window.addEventListener('pointerdown', unlockOnce, { passive: true });
      window.addEventListener('keydown', unlockOnce);
    });
  } else {
    window.addEventListener('pointerdown', unlockOnce, { passive: true });
    window.addEventListener('keydown', unlockOnce);
  }
}

function initInteractionSounds() {
  if (document.documentElement.dataset.uiSfxReady === '1') return;
  document.documentElement.dataset.uiSfxReady = '1';

  const makeSound = (id, src, volume) => {
    const audio = document.createElement('audio');
    audio.id = id;
    audio.src = src;
    audio.preload = 'auto';
    audio.volume = volume;
    audio.setAttribute('aria-hidden', 'true');
    document.body.appendChild(audio);
    return audio;
  };

  const pageTurn = makeSound('ui-page-turn-sfx', UI_PAGE_SFX_URL, UI_PAGE_SFX_VOLUME);
  const clueDiscovery = makeSound('ui-clue-discovery-sfx', UI_CLUE_SFX_URL, UI_CLUE_SFX_VOLUME);
  const lastPlayedAt = {
    page: 0,
    clue: 0,
  };

  const playSound = (audio, type, minGap = 75) => {
    const now = performance.now();
    if (now - lastPlayedAt[type] < minGap) return;
    lastPlayedAt[type] = now;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch (e) {
      /* Audio playback can be blocked before user gesture; ignore. */
    }
  };

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest('button, [role="button"], a[href], input[type="button"], input[type="submit"]');
      if (!interactive) return;
      if (interactive.disabled || interactive.getAttribute('aria-disabled') === 'true') return;
      if (interactive.closest('.rpg-hotspot')) return;
      playSound(pageTurn, 'page');
    },
    true
  );

  window.addEventListener('compass-ui-sound', (event) => {
    const type = event && event.detail && event.detail.type;
    if (type === 'clue') {
      playSound(clueDiscovery, 'clue', 120);
      return;
    }
    playSound(pageTurn, 'page');
  });
}

function boot() {
  if (!isWebGLSupported()) {
    showFullscreenError('webgl.body');
    return;
  }
  if (typeof maplibregl === 'undefined') {
    showFullscreenError('maperr.body');
    return;
  }

  const uiRoot = document.getElementById('ui-root');
  const geoSupported = 'geolocation' in navigator;
  initBackgroundMusic(uiRoot);
  initInteractionSounds();

  const state = {
    selected: null,
    activeTheme: 'all',   // 替代原来的 visibleThemes Set，'all' = 全部总览
    userPos: null,
    routeRequestId: 0,
  };
  let memoryExperience = null;
  const authController = createAuthController();

  const visibleCount = () =>
    state.activeTheme === 'all'
      ? ANCHORS.length
      : ANCHORS.filter((a) => a.theme === state.activeTheme).length;

  const isMobileAppView = () =>
    window.matchMedia('(max-width: 820px)').matches;

  // 注入 Haversine 给 UI 的附近计算
  setHaversine(haversineKm);

  // ---- 渲染静态 UI ----
  renderHeader(uiRoot, ANCHORS.length, ANCHORS.length);
  renderToolCluster(uiRoot, {
    onChangeLang: handleChangeLang,
    onLocate: handleLocate,
    geoSupported,
    onCompass: handleCompass,
    onStampBook: handleStampBook,
    onRoutePlan: handleRoutePlanButton,
    onMemory: handleMemoryButton,
    onSettings: null,
  });
  // 初始化主题强调色 CSS 变量
  document.documentElement.style.setProperty('--theme-accent', OVERVIEW_MODE.accentColor);
  renderInfoPanel(uiRoot);
  renderGeoModal(uiRoot);
  renderNearbyDrawer(uiRoot, { onItemClick: handleNearbyItem });
  renderBreadcrumb(uiRoot, { onCrumbClick: handleCrumbClick, onBack: handleBackToGlobal });
  // 新玩法组件：罗盘探索面板 + 剧情副本层 + 印章册
  renderCompassPanel(uiRoot, {
    onAnchorClick: handleSelect,
    onClueStart: handleClueStart,
    onClueHover: handleClueHover,
    onExploreModeChange: handleCompassModeChange,
    onPlanRoute: handlePlanRoute,
    onClearRoute: handleClearRoute,
    onClose: handleCompassClose,
  });
  renderRoutePlanner(uiRoot, {
    onAnchorClick: handleRoutePlannerAnchorClick,
    onPlanRoute: handlePlanRoute,
    onClearRoute: handleClearRoute,
    onOpenNearby: handleCompass,
  });
  renderEpisodeLayer(uiRoot);
  renderStampBook(uiRoot, { onPickAnchor: handleSelect });
  refreshStampBadge();

  // 附近列表变化 → 地图高亮
  setNearbyChangeHandler((idSet) => controller.highlightNearby(idSet));

  // 外部浏览器里底图/瓦片偶尔会慢加载；UI 已经可用时不让加载遮罩一直挡住页面。
  const loadingFallbackDelay = isMobileAppView() ? 2400 : 4200;
  const loadingFallbackTimer = window.setTimeout(hideLoading, loadingFallbackDelay);

  // ---- 创建地图 ----
  const controller = createMap({
    onSelect: handleSelect,
    onSelectForeign: handleSelectForeign,
    onReady: () => {
      window.clearTimeout(loadingFallbackTimer);
      hideLoading();
      // 标记已通关锚点（点亮地图印章）
      controller.markCompleted(ANCHORS, getCompletedIds());
    },
  });
  memoryExperience = createMemoryController({
    root: uiRoot,
    map: controller.map,
    anchors: ANCHORS,
    auth: authController,
    showToast,
  });
  memoryExperience.init();

  // ===== 锚点选中 =====
  function handleSelect(anchor) {
    if (isCompassOpen() && isCompassShowingClues() && getCompassClueIds().has(anchor.id)) {
      focusCompassClue(anchor.id);
      controller.focusClueAnchors(getCompassClueIds(), anchor.id);
      return;
    }
    openAnchorDetail(anchor);
  }

  function openAnchorDetail(anchor) {
    state.selected = anchor;
    controller.selectAnchor(anchor);
    controller.clearGlobalLinks();
    openInfoPanel(anchor, {
      onClose: handleClose,
      onLinkClick: handleLinkClick,
      onEnterEpisode: handleEnterEpisode,
    });
    if (memoryExperience) memoryExperience.mountAnchorMemorySection(anchor);

    // 含全球连线 → 飞行结束后渲染 ArcLayer + 建立面包屑
    if (anchor.globalLinks && anchor.globalLinks.length) {
      setBreadcrumb([{ label: pick(anchor.name), type: 'anchor', ref: anchor }]);
      setTimeout(() => {
        controller.renderGlobalLinks(anchor.coordinates, anchor.globalLinks);
      }, 2700);
    } else {
      clearBreadcrumb();
    }
  }

  // ===== 国外节点选中 =====
  function handleSelectForeign(link) {
    controller.flyToCoord(link.targetCoord, 5);
    openForeignPanel(link, { onClose: handleClose });
    // 面包屑追加该国外节点
    pushBreadcrumb({ label: pick(link.targetName), type: 'foreign', ref: link });
  }

  // ===== 面板内连线条目点击（等同点击国外节点）=====
  function handleLinkClick(link) {
    handleSelectForeign(link);
  }

  // ===== 关闭面板 =====
  function handleClose() {
    state.selected = null;
    closeInfoPanel();
    controller.clearGlobalLinks();
    clearBreadcrumb();
    if (state.activeTheme === 'all') {
      // 总览模式：复位相机回全局视角
      controller.reset();
    } else {
      // 主题模式：仅复位高亮，保持主题相机范围
      controller.clearSelection();
    }
  }

  // ===== 面包屑点击回跳 =====
  function handleCrumbClick(idx, node) {
    if (!node) return;
    if (node.type === 'anchor') {
      // 回到源锚点
      const trail = getBreadcrumbTrail().slice(0, 1);
      setBreadcrumb(trail);
      handleSelect(node.ref);
    } else if (node.type === 'foreign') {
      handleSelectForeign(node.ref);
    }
  }

  // ===== 返回全局 =====
  function handleBackToGlobal() {
    handleClose();
  }

  function applyTheme(themeKey) {
    state.activeTheme = themeKey;

    // 若选中锚点不属于新主题，关闭面板
    if (state.selected && themeKey !== 'all' && state.selected.theme !== themeKey) {
      handleClose();
    }

    // 1. 叙事图层沿用总览底图色调，不因筛选主题而换色。
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.style.filter = OVERVIEW_MODE.mapFilter;

    // 2. 保持总览无叠色状态。
    const overlayEl = document.getElementById('theme-overlay');
    if (overlayEl) overlayEl.style.backgroundColor = OVERVIEW_MODE.overlay;

    // 3. 图层控件也维持总览强调色。
    document.documentElement.style.setProperty('--theme-accent', OVERVIEW_MODE.accentColor);

    // 4. 锚点显隐过滤（MapLibre filter，淡出非本主题锚点）
    controller.setThemeFilter(themeKey);

    // 5. 更新页头计数器
    updateHeaderDisplay();

    // 6. 所有叙事图层复用总览相机视角，不再按主题锚点自动缩放。
    controller.reset();
  }

  function setClueMapMood(active) {
    const mapEl = document.getElementById('map');
    const overlayEl = document.getElementById('theme-overlay');
    if (mapEl) {
      mapEl.style.filter = OVERVIEW_MODE.mapFilter;
    }
    if (overlayEl) {
      overlayEl.style.backgroundColor = OVERVIEW_MODE.overlay;
    }
  }

  /** 更新页头计数与主题标签（总览模式/主题模式均适用）*/
  function updateHeaderDisplay() {
    const themeAnchors =
      state.activeTheme === 'all'
        ? ANCHORS
        : ANCHORS.filter((a) => a.theme === state.activeTheme);
    const meta = state.activeTheme === 'all' ? null : THEMES[state.activeTheme];
    const label = meta ? pick(meta.shortName) : null;
    updateVisibleCount(themeAnchors.length, label);
  }

  // ===== 语言切换：重渲染全部文案 =====
  function handleChangeLang(code) {
    document.documentElement.lang =
      code === 'zh' ? 'zh-CN' : code === 'ja' ? 'ja' : code === 'ko' ? 'ko' : code === 'ru' ? 'ru' : code === 'es' ? 'es' : 'en';
    refreshHeader(ANCHORS.length, visibleCount());
    refreshToolCluster();
    updateHeaderDisplay();
    refreshNearbyTexts();
    refreshCompassTexts();
    refreshRoutePlannerTexts();
    if (memoryExperience) memoryExperience.refreshTexts();
    // 面包屑标签随语言刷新
    const trail = getBreadcrumbTrail();
    if (trail.length) {
      setBreadcrumb(
        trail.map((n) =>
          n.type === 'anchor'
            ? { ...n, label: pick(n.ref.name) }
            : { ...n, label: pick(n.ref.targetName) }
        )
      );
    }
    // 重渲染打开的面板
    if (isPanelOpen()) {
      const cur = getCurrentAnchor();
      if (cur && cur.foreign) openForeignPanel(cur.link, { onClose: handleClose });
      else if (cur)
        openInfoPanel(cur, {
          onClose: handleClose,
          onLinkClick: handleLinkClick,
          onEnterEpisode: handleEnterEpisode,
        });
      if (cur && !cur.foreign && memoryExperience) memoryExperience.mountAnchorMemorySection(cur);
    }
  }

  // ===== GPS 定位 =====
  function handleLocate() {
    const mobileView = isMobileAppView();
    setGpsLoading(true);
    controller.locateUser({
      onSuccess: ({ lng, lat, inBay }) => {
        setGpsLoading(false);
        state.userPos = [lng, lat];
        showToast(inBay ? getText('gps.you') : getText('gps.outside'));
        // 移动端先让地图镜头落到当前位置，再展开附近抽屉，避免遮挡用户定位感。
        window.setTimeout(() => openNearbyDrawer([lng, lat]), mobileView ? 850 : 0);
        controller.highlightNearby(getNearbyIds());
      },
      onError: (reason) => {
        setGpsLoading(false);
        if (reason === 'denied') {
          openGeoModal({ onRetry: handleLocate, onDismiss: () => {} });
        } else {
          showToast(getText('gps.unavailable'));
        }
      },
    });
  }

  // ===== 附近列表项点击 =====
  function handleNearbyItem(anchor) {
    handleSelect(anchor);
  }

  // ===== 右上角：路线规划 =====
  function handleRoutePlanButton() {
    if (isRoutePlannerOpen()) {
      closeRoutePlanner();
      clearActiveMainBtn();
      return;
    }
    if (isCompassOpen()) closeCompassPanel();
    setClueMapMood(false);
    controller.clearClueFocus(state.activeTheme);
    setRoutePlannerLocation(getRoutePlannerOrigin());
    openRoutePlanner('free');
  }

  function handleRoutePlannerAnchorClick(anchor) {
    handleSelect(anchor);
  }

  function getRoutePlannerOrigin() {
    const pos = controller.getUserPosition() || state.userPos;
    if (pos) return pos;
    if (controller.map && controller.map.getCenter) {
      const center = controller.map.getCenter();
      if (center && Number.isFinite(center.lng) && Number.isFinite(center.lat)) return [center.lng, center.lat];
    }
    return null;
  }

  // ===== 罗盘探索：定位（GPS 失败回退模拟）+ 打开面板 =====
  let compassLocating = false;
  function handleCompass() {
    if (isCompassOpen()) {
      closeCompassPanel(); // closeCompassPanel 内部会触发 onClose → handleCompassClose
      return;
    }
    if (isRoutePlannerOpen()) closeRoutePlanner();
    if (compassLocating) return;
    compassLocating = true;

    // 立即打开面板 + 设置线索氛围，不让用户干等 GPS
    setClueMapMood(true);
    controller.focusClueAnchors(getCompassClueIds());
    openCompassPanel();
    showToast(getText('clues.ready'));
    setGpsLoading(true);

    let settled = false;
    // GPS 超时兜底：3 秒无响应直接用模拟定位
    const guardTimer = setTimeout(() => {
      if (settled) return;
      settled = true;
      compassLocating = false;
      finishCompassLocate(DEFAULT_LOCATION.center[0], DEFAULT_LOCATION.center[1], true);
    }, 3000);

    function finishCompassLocate(lng, lat, simulated) {
      setGpsLoading(false);
      state.userPos = [lng, lat];
      setCompassLocation({ lng, lat, simulated });
      checkGeofenceNow();
      controller.focusClueAnchors(getCompassClueIds());
    }

    controller.locateOrSimulate({
      onResult: ({ lng, lat, simulated }) => {
        if (settled) return;
        settled = true;
        clearTimeout(guardTimer);
        compassLocating = false;
        finishCompassLocate(lng, lat, simulated);
      },
    });
  }

  function handleCompassClose() {
    setClueMapMood(false);
    controller.clearClueFocus(state.activeTheme);
    clearActiveMainBtn();
    // 拉回主视觉全局视角
    controller.reset();
  }

  // ===== 留下记忆 =====
  function handleMemoryButton() {
    // 先关闭其他面板
    if (isCompassOpen()) closeCompassPanel();
    if (isRoutePlannerOpen()) closeRoutePlanner();
    if (isPanelOpen()) handleClose();
    // 触发记忆创建流程（复用现有 memory.js 的 openListPanel）
    const memoryBtn = document.getElementById('memory-list-btn');
    if (memoryBtn) memoryBtn.click();
  }

  function handleCompassModeChange(view) {
    if (view === 'free') {
      setClueMapMood(false);
      controller.clearClueFocus(state.activeTheme);
      return;
    }
    setClueMapMood(true);
    controller.focusClueAnchors(getCompassClueIds());
  }

  function handleClueHover(anchorId) {
    controller.focusClueAnchors(getCompassClueIds(), anchorId);
  }

  function handleClueStart(anchor, clue) {
    focusCompassClue(anchor.id);
    controller.focusClueAnchors(getCompassClueIds(), anchor.id);
    playClueScanTransition(getText('clues.entering')).then(() => {
      closeCompassPanel();
      openAnchorDetail(anchor);
    });
  }

  /** 最近 N 个锚点 id 集合（供地图高亮）*/
  function nearestIdSet(pos, n) {
    return new Set(
      ANCHORS.map((a) => ({
        id: a.id,
        d: haversineKm(pos[0], pos[1], a.coordinates[0], a.coordinates[1]),
      }))
        .sort((x, y) => x.d - y.d)
        .slice(0, n)
        .map((x) => x.id)
    );
  }

  // ===== 路线规划（有定位按距离/道路排序；无定位按用户选择顺序）=====
  function getTencentErrorText(error) {
    const message = String((error && error.message) || '');
    if (message === 'missing-key') return getText('route.service_missing');
    if (message === 'too-many-stops') return getText('route.too_many');
    if (message.includes('121') || message.includes('每日调用量已达到上限')) {
      return getText('route.quota_exhausted');
    }
    return getText('route.failed');
  }

  function buildSelectionRoute(anchors, modeKey) {
    const mode = TRAVEL_MODES[modeKey] || TRAVEL_MODES.walk;
    let cumKm = 0;
    const stops = anchors.map((anchor, index) => {
      const prev = index > 0 ? anchors[index - 1] : null;
      const legKm = prev
        ? haversineKm(prev.coordinates[0], prev.coordinates[1], anchor.coordinates[0], anchor.coordinates[1])
        : 0;
      cumKm += legKm;
      return {
        index: index + 1,
        anchor,
        legKm,
        cumKm,
        cumMin: (cumKm / mode.speedKmh) * 60,
      };
    });
    return {
      itinerary: {
        modeKey: mode.key,
        stops,
        totalKm: cumKm,
        totalMin: (cumKm / mode.speedKmh) * 60,
        straight: true,
        source: 'selection',
        startCoord: null,
      },
      geometry: anchors.map((anchor) => anchor.coordinates),
    };
  }

  async function handlePlanRoute(themeKey, modeKey, selectedIds = [], options = {}) {
    const start = controller.getUserPosition() || state.userPos;
    const pool = selectedIds
      .map((id) => ANCHORS.find((anchor) => anchor.id === id))
      .filter(Boolean);
    if (!pool.length) {
      showToast(getText('route_planner.no_selection'));
      return;
    }
    const useRoutePlanner = options.source === 'routePlanner' || isRoutePlannerOpen();
    const routeRequestId = ++state.routeRequestId;
    if (useRoutePlanner) setRoutePlannerPlanning(true);
    else setCompassPlanning(true);
    const accent =
      themeKey === 'all' ? OVERVIEW_MODE.color : (THEMES[themeKey] || OVERVIEW_MODE).color;
    let planned = null;
    let tencentError = null;

    if (!start) {
      planned = buildSelectionRoute(pool, modeKey);
    } else if (isTencentConfigured()) {
      try {
        planned = await planTencentRoute({ start, anchors: pool, modeKey });
      } catch (error) {
        tencentError = error;
      }
    }
    if (!planned && start) {
      try {
        planned = await planOSRMRoute({ start, anchors: pool, modeKey });
        if (tencentError) showToast(getText('route.osrm_fallback'));
      } catch (osrmError) {
        const itinerary = buildItinerary(start, pool, modeKey);
        planned = {
          itinerary,
          geometry: itineraryCoords(start, itinerary),
        };
        showToast(getText('route.straight_fallback'));
      }
    }
    if (planned && planned.itinerary) planned.itinerary.startCoord = start || null;

    if (routeRequestId !== state.routeRequestId || (useRoutePlanner ? !isRoutePlannerOpen() : !isCompassOpen())) {
      if (useRoutePlanner) setRoutePlannerPlanning(false);
      else setCompassPlanning(false);
      return;
    }

    if (useRoutePlanner) {
      setRoutePlannerPlanning(false);
      showRoutePlannerItinerary(planned.itinerary, themeKey);
    } else {
      setCompassPlanning(false);
      showItinerary(planned.itinerary, themeKey);
    }
    if (planned.geometry && planned.geometry.length >= 2) {
      controller.drawRoute(planned.geometry, accent);
      state.routeDrawn = true;
    } else {
      controller.clearRoute();
      state.routeDrawn = false;
    }
  }

  function handleClearRoute() {
    state.routeRequestId += 1;
    controller.clearRoute();
    clearItinerary();
    clearRoutePlannerItinerary();
    state.routeDrawn = false;
  }

  // ===== 剧情副本 =====
  function handleEnterEpisode(anchor, opts = {}) {
    const episode = getEpisode(anchor.id);
    if (!episode) return;
    openEpisode(anchor, episode, {
      onsite: !!opts.onsite,
      onReward: () => {
        // 通关即时点亮地图印章 + 刷新角标
        controller.markCompleted(ANCHORS, getCompletedIds());
        refreshStampBadge();
        if (opts.clue) refreshCompassTexts();
      },
      onComplete: (a, res) => {
        if (opts.clue) {
          window.setTimeout(() => {
            openClueCompleteFeedback(a, opts.clue, {
              onViewAnchor: (target) => {
                closeCompassPanel();
                openAnchorDetail(target);
              },
              onContinue: (target) => {
                openCompassPanel();
                focusCompassClue(target.id);
                setClueMapMood(true);
                controller.focusClueAnchors(getCompassClueIds(), target.id);
              },
              onPlanRoute: () => {
                closeCompassPanel();
                setClueMapMood(false);
                controller.clearClueFocus(state.activeTheme);
                setRoutePlannerLocation(getRoutePlannerOrigin());
                openRoutePlanner('free');
              },
            });
          }, 260);
        }
        // 关闭剧情后：若解锁图层成就 → 弹贺卡
        if (res && res.achievementUnlocked) {
          setTimeout(() => showAchievementCard(res.achievementUnlocked), 420);
        }
      },
      onOpenStampBook: (a, res = {}) => {
        openStampBook({
          focusAnchorId: a && a.id,
          focusLabel: getText(res.newlyCompleted ? 'stamp.just_earned' : 'stamp.current_stamp'),
        });
      },
      onClose: () => {},
    });
  }

  // ===== 印章册 =====
  function handleStampBook() {
    if (isStampBookOpen()) closeStampBook();
    else openStampBook();
  }

  // ===== 地理围栏：进入锚点 80m 内且有副本 → 到店提示 =====
  function checkGeofenceNow() {
    const hits = controller.checkGeofence(ANCHORS, 80);
    if (!hits.length) return;
    handleGeofence(hits, (anchor) => {
      handleSelect(anchor);
      setTimeout(() => handleEnterEpisode(anchor, { onsite: true }), 900);
    });
  }

  // 点击地图空白处关闭
  controller.map.on('click', (e) => {
    const candidateLayers = ['anchor-core', 'anchor-glow', 'memory-core', 'memory-glow'].filter((id) =>
      controller.map.getLayer(id)
    );
    if (candidateLayers.length === 0) return;
    const features = controller.map.queryRenderedFeatures(e.point, {
      layers: candidateLayers,
    });
    if (features.length === 0 && state.selected) {
      handleClose();
    }
  });

  // ESC 关闭
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isEpisodeOpen()) closeEpisode();
      else if (isStampBookOpen()) closeStampBook();
      else if (memoryExperience && memoryExperience.isOpen()) memoryExperience.closePanel();
      else if (isRoutePlannerOpen()) closeRoutePlanner();
      else if (isCompassOpen()) closeCompassPanel(); // closeCompassPanel 内部触发 onClose → handleCompassClose
      else if (state.selected) handleClose();
      else if (isNearbyOpen()) closeNearbyDrawer();
      // 关闭面板时清除主按钮激活态
      if (!isCompassOpen() && !isRoutePlannerOpen() && !state.selected && !(memoryExperience && memoryExperience.isOpen())) {
        clearActiveMainBtn();
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
