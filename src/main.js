// 应用主入口 v3：联调地图与 UI（6语言 + 罗盘探索 + 主题路线 + 剧情副本 + 印章册）
import { createMap, haversineKm } from './map.js';
import { ANCHORS } from './data/anchors.js';
import { THEME_ORDER, THEMES, OVERVIEW_MODE, TRAVEL_MODES } from './data/themes.js';
import { getText, pick } from './i18n.js';
import { getEpisode, hasEpisode } from './data/episodes.js';
import { planOSRMRoute } from './route.js';
import {
  applyCachedTencentCoordinates,
  calibrateTencentAnchors,
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
} from './game.js';
import {
  renderHeader,
  refreshHeader,
  renderToolCluster,
  refreshToolCluster,
  setGpsLoading,
  showToast,
  renderGeoModal,
  openGeoModal,
  renderLayerControl,
  refreshLayerControl,
  renderInfoPanel,
  openInfoPanel,
  openForeignPanel,
  closeInfoPanel,
  isPanelOpen,
  getCurrentAnchor,
  renderFooter,
  computeCounts,
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
  setCompassLocation,
  setCompassPlanning,
  showItinerary,
  clearItinerary,
  refreshCompassTexts,
} from './ui.js';

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

function boot() {
  if (!isWebGLSupported()) {
    showFullscreenError('webgl.body');
    return;
  }
  if (typeof maplibregl === 'undefined') {
    showFullscreenError('maperr.body');
    return;
  }

  applyCachedTencentCoordinates(ANCHORS);
  const uiRoot = document.getElementById('ui-root');
  const geoSupported = 'geolocation' in navigator;

  const state = {
    selected: null,
    activeTheme: 'all',   // 替代原来的 visibleThemes Set，'all' = 全部总览
    userPos: null,
    routeRequestId: 0,
  };

  const counts = computeCounts();
  const visibleCount = () =>
    state.activeTheme === 'all'
      ? ANCHORS.length
      : ANCHORS.filter((a) => a.theme === state.activeTheme).length;

  // ---- 轻量颜色 Tween（替代 GSAP：rAF + easeInOut，0 依赖）----
  function hexToRgb(hex) {
    const c = hex.replace('#', '');
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  }
  function lerpColor(fromHex, toHex, t) {
    const a = hexToRgb(fromHex), b = hexToRgb(toHex);
    return '#' + [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t).toString(16).padStart(2, '0')).join('');
  }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
  let accentTweenId = null;
  function tweenAccent(fromHex, toHex, duration) {
    if (accentTweenId) cancelAnimationFrame(accentTweenId);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      document.documentElement.style.setProperty('--theme-accent', lerpColor(fromHex, toHex, easeInOut(t)));
      if (t < 1) accentTweenId = requestAnimationFrame(step);
      else accentTweenId = null;
    };
    accentTweenId = requestAnimationFrame(step);
  }

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
  });
  renderLayerControl(uiRoot, {
    counts,
    activeTheme: state.activeTheme,
    onSwitchTheme: handleSwitchTheme,
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
    onPlanRoute: handlePlanRoute,
    onCalibrateAnchors: handleCalibrateAnchors,
    onClearRoute: handleClearRoute,
    onClose: handleClearRoute,
    onLeaveRoute: handleClearRoute,
  });
  renderEpisodeLayer(uiRoot);
  renderStampBook(uiRoot, { onPickAnchor: handleSelect });
  renderFooter(uiRoot);
  refreshStampBadge();

  // 附近列表变化 → 地图高亮
  setNearbyChangeHandler((idSet) => controller.highlightNearby(idSet));

  // ---- 创建地图 ----
  const controller = createMap({
    onSelect: handleSelect,
    onSelectForeign: handleSelectForeign,
    onReady: () => {
      const loading = document.getElementById('loading');
      if (loading) loading.classList.add('hidden');
      // 标记已通关锚点（点亮地图印章）
      controller.markCompleted(ANCHORS, getCompletedIds());
    },
  });

  // ===== 锚点选中 =====
  function handleSelect(anchor) {
    state.selected = anchor;
    controller.selectAnchor(anchor);
    controller.clearGlobalLinks();
    openInfoPanel(anchor, {
      onClose: handleClose,
      onLinkClick: handleLinkClick,
      onEnterEpisode: handleEnterEpisode,
    });

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

  // ===== 主题切换（单选模式）+ applyTheme =====
  function handleSwitchTheme(key) {
    applyTheme(key);
  }

  function applyTheme(themeKey) {
    const prev = state.activeTheme === 'all' ? OVERVIEW_MODE : THEMES[state.activeTheme];
    const next = themeKey === 'all' ? OVERVIEW_MODE : THEMES[themeKey];
    state.activeTheme = themeKey;

    // 若选中锚点不属于新主题，关闭面板
    if (state.selected && themeKey !== 'all' && state.selected.theme !== themeKey) {
      handleClose();
    }

    // 1. 地图底图色调：CSS filter transition（0.9s 由 CSS 处理）
    const mapEl = document.getElementById('map');
    if (mapEl) mapEl.style.filter = next.mapFilter;

    // 2. 主题 overlay 染色：CSS transition（0.9s 由 CSS 处理）
    const overlayEl = document.getElementById('theme-overlay');
    if (overlayEl) overlayEl.style.backgroundColor = next.overlay;

    // 3. UI 强调色：JS Tween（0.9s easeInOut，逐帧更新 CSS var）
    tweenAccent(prev.accentColor, next.accentColor, 900);

    // 4. 锚点显隐过滤（MapLibre filter，淡出非本主题锚点）
    controller.setThemeFilter(themeKey);

    // 5. 刷新图层面板
    refreshLayerControl(counts, themeKey);

    // 6. 更新页头计数器
    updateHeaderDisplay();

    // 7. 相机飞行：延迟 150ms 让过渡先行
    if (themeKey !== 'all') {
      const themeAnchors = ANCHORS.filter((a) => a.theme === themeKey);
      if (themeAnchors.length > 0) {
        setTimeout(() => controller.flyToThemeBounds(themeAnchors), 150);
      }
    } else {
      controller.reset();
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
    refreshLayerControl(counts, state.activeTheme);
    updateHeaderDisplay();
    refreshNearbyTexts();
    refreshCompassTexts();
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
    }
  }

  // ===== GPS 定位 =====
  function handleLocate() {
    setGpsLoading(true);
    controller.locateUser({
      onSuccess: ({ lng, lat, inBay }) => {
        setGpsLoading(false);
        state.userPos = [lng, lat];
        showToast(inBay ? getText('gps.you') : getText('gps.outside'));
        // 展开附近抽屉 + 高亮附近锚点
        openNearbyDrawer([lng, lat]);
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

  // ===== 罗盘探索：定位（GPS 失败回退模拟）+ 打开面板 =====
  function handleCompass() {
    if (isCompassOpen()) {
      closeCompassPanel();
      return;
    }
    openCompassPanel();
    setGpsLoading(true);
    controller.locateOrSimulate({
      onResult: ({ lng, lat, simulated }) => {
        setGpsLoading(false);
        state.userPos = [lng, lat];
        setCompassLocation({ lng, lat, simulated });
        controller.highlightNearby(nearestIdSet([lng, lat], 8));
        showToast(getText(simulated ? 'compass.simulated' : 'compass.real'));
        checkGeofenceNow();
      },
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

  // ===== 腾讯地图路线规划（用户勾选锚点 + 实际道路 + 驾车智能排序）=====
  function getTencentErrorText(error) {
    const message = String((error && error.message) || '');
    if (message === 'missing-key') return getText('route.service_missing');
    if (message === 'too-many-stops') return getText('route.too_many');
    if (message.includes('121') || message.includes('每日调用量已达到上限')) {
      return getText('route.quota_exhausted');
    }
    return getText('route.failed');
  }

  async function handlePlanRoute(themeKey, modeKey, selectedIds = []) {
    const start = controller.getUserPosition() || state.userPos;
    if (!start) {
      showToast(getText('compass.locating'));
      return;
    }
    const pool = ANCHORS.filter((anchor) => selectedIds.includes(anchor.id));
    if (!pool.length) {
      showToast(getText('route.no_selection'));
      return;
    }
    const routeRequestId = ++state.routeRequestId;
    setCompassPlanning(true);
    const accent =
      themeKey === 'all' ? OVERVIEW_MODE.color : (THEMES[themeKey] || OVERVIEW_MODE).color;
    let planned = null;
    let tencentError = null;
    if (isTencentConfigured()) {
      try {
        planned = await planTencentRoute({ start, anchors: pool, modeKey });
      } catch (error) {
        tencentError = error;
      }
    }
    if (!planned) {
      try {
        planned = await planOSRMRoute({ start, anchors: pool, modeKey });
        if (tencentError) showToast(getText('route.osrm_fallback'));
      } catch (osrmError) {
        setCompassPlanning(false);
        showToast(tencentError ? getTencentErrorText(tencentError) : getText('route.failed'));
        return;
      }
    }

    if (routeRequestId !== state.routeRequestId || !isCompassOpen()) {
      setCompassPlanning(false);
      return;
    }

    setCompassPlanning(false);
    showItinerary(planned.itinerary, themeKey);
    controller.drawRoute(planned.geometry, accent);
    state.routeDrawn = true;
  }

  async function handleCalibrateAnchors(selectedIds = []) {
    if (!selectedIds.length) {
      showToast(getText('route.no_selection'));
      return;
    }
    if (!isTencentConfigured()) {
      showToast(getText('route.service_missing'));
      return;
    }
    try {
      const selected = ANCHORS.filter((anchor) => selectedIds.includes(anchor.id));
      const calibrated = await calibrateTencentAnchors(selected);
      controller.refreshAnchors();
      controller.markCompleted(ANCHORS, getCompletedIds());
      showToast(
        calibrated
          ? getText('route.calibrated', { count: calibrated })
          : getText('route.calibration_no_match')
      );
    } catch (error) {
      showToast(getTencentErrorText(error));
    }
  }

  function handleClearRoute() {
    state.routeRequestId += 1;
    controller.clearRoute();
    clearItinerary();
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
      },
      onComplete: (a, res) => {
        // 关闭剧情后：若解锁图层成就 → 弹贺卡
        if (res && res.achievementUnlocked) {
          setTimeout(() => showAchievementCard(res.achievementUnlocked), 420);
        }
      },
      onOpenStampBook: () => {
        openStampBook();
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
    const candidateLayers = ['anchor-core', 'anchor-glow'].filter((id) =>
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
      else if (isCompassOpen()) closeCompassPanel();
      else if (state.selected) handleClose();
      else if (isNearbyOpen()) closeNearbyDrawer();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
