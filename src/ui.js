// UI 模块 v2：标题栏 / 语言下拉 / GPS / 图层 / 附近抽屉 / 面包屑 / 信息面板 / 降级弹窗
// build: 2026-06-18
import { THEMES, THEME_ORDER, OVERVIEW_MODE } from './data/themes.js?rev=clean-8';
import { ANCHORS } from './data/anchors.js?rev=classification-1';
import { getText, pick, getLang, setLang, LANGS, langMeta } from './i18n.js?rev=audio-sfx-1';
import { hasEpisode } from './data/episodes.js?rev=audio-sfx-1';
import { isCompleted } from './game.js?rev=audio-sfx-1';
import { nearbyClues } from './data/nearby-clues.js?rev=audio-sfx-1';
import {
  addWantToVisit,
  removeWantToVisit,
  isWantToVisit,
  getWantToVisitAnchors,
} from './want-to-visit.js?rev=route-planner-1';

/**
 * 水墨白描线条图标（细笔勾勒，配合墨迹按钮的白色书法风格）。
 * stroke 由 CSS 控制为宣纸白；viewBox 24，线宽 1.6。
 */
const INK_ICONS = {
  // 地球仪 / 语言
  globe:
    '<svg viewBox="0 0 24 24" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>',
  // 册子 / 印章册
  book:
    '<svg viewBox="0 0 24 24" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M8 4v13"/><path d="M11 9h4M11 12h4"/></svg>',
  // 指南针 / 规划路线
  compass:
    '<svg viewBox="0 0 24 24" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/></svg>',
};

/** HTML 转义 */
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ============ 标题栏 ============ */
export function renderHeader(root, total, visible) {
  const el = document.createElement('div');
  el.id = 'app-header';
  el.className =
    'pointer-events-none absolute inset-x-0 top-0 z-20 top-scrim px-6 pb-12 pt-5 md:px-10 header-enter';
  el.innerHTML = headerInner(total, visible);
  root.appendChild(el);
}

function headerInner(total, visible) {
  return `
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center gap-3">
          <span class="seal" style="width:38px;height:38px;font-size:15px">罗盘</span>
          <h1 class="font-brush text-2xl font-semibold tracking-wide text-compass-gold tracking-glow md:text-4xl">
            ${esc(getText('header.title'))}
          </h1>
        </div>
        <p class="mt-1 pl-[50px] text-[11px] font-light tracking-[0.18em] text-[#5a4d3c] md:text-xs">
          ${esc(getText('header.subtitle'))}
        </p>
      </div>
      <div class="hidden flex-col items-end text-right sm:flex">
        <span class="font-serif text-2xl md:text-3xl" style="color:var(--theme-accent,#b5762a)">
          <span id="visible-count">${visible}</span><span id="count-total" class="text-base text-[#8a7a62]">/${total}</span>
        </span>
        <span id="count-label" class="text-[10px] tracking-[0.2em] text-[#8a7a62]">${esc(getText('header.anchors'))}</span>
      </div>
    </div>`;
}

export function refreshHeader(total, visible) {
  const el = document.getElementById('app-header');
  if (el) el.innerHTML = headerInner(total, visible);
}

export function updateVisibleCount(n, themeLabel) {
  const el = document.getElementById('visible-count');
  if (el) el.textContent = String(n);
  // 主题模式：隐藏"/总数"，改为显示主题短名
  const totalEl = document.getElementById('count-total');
  if (totalEl) totalEl.style.display = themeLabel ? 'none' : '';
  const labelEl = document.getElementById('count-label');
  if (labelEl) labelEl.textContent = themeLabel || getText('header.anchors');
}

/* ============ 顶部工具组：语言下拉 + 印章册 + 路线规划 ============ */
/**
 * V2: renderToolCluster 渲染底部三主按钮（探索附近/留下记忆/路线规划）
 * + 右上角只保留语言选择器（地球仪图标+下拉菜单）。
 */
export function renderToolCluster(root, { onChangeLang, onLocate, geoSupported, onCompass, onStampBook, onRoutePlan, onMemory, onSettings }) {
  // ===== 右上角：仅语言选择器 =====
  const el = document.createElement('div');
  el.className = 'tool-cluster';

  const langWrap = document.createElement('div');
  langWrap.className = 'lang-selector';
  langWrap.innerHTML = `
    <button class="lang-trigger tool-btn" id="lang-trigger" title="${esc(getText('lang.switch'))}">
      <span class="lang-ico">${INK_ICONS.globe}</span>
      <span class="lang-label" id="lang-label">${esc(getText('lang.switch'))}</span>
    </button>
    <div class="lang-menu" id="lang-menu">
      ${LANGS.map(
        (l) => `
        <button class="lang-option ${l.code === getLang() ? 'active' : ''}" data-lang="${l.code}">
          <span class="flag">${l.flag}</span><span>${esc(l.label)}</span>
        </button>`
      ).join('')}
    </div>`;

  el.appendChild(langWrap);
  root.appendChild(el);

  // 交互：语言菜单开合
  const trigger = langWrap.querySelector('#lang-trigger');
  const menu = langWrap.querySelector('#lang-menu');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('open');
  });
  document.addEventListener('click', () => menu.classList.remove('open'));
  menu.addEventListener('click', (e) => {
    const opt = e.target.closest('.lang-option');
    if (!opt) return;
    const code = opt.dataset.lang;
    setLang(code);
    menu.querySelectorAll('.lang-option').forEach((o) =>
      o.classList.toggle('active', o.dataset.lang === code)
    );
    const label = langWrap.querySelector('#lang-label');
    if (label) label.textContent = getText('lang.switch');
    menu.classList.remove('open');
    if (onChangeLang) onChangeLang(code);
  });

  // ===== 底部三主按钮 =====
  const mainActions = document.createElement('div');
  mainActions.className = 'main-actions';
  mainActions.id = 'main-actions';

  // 探索附近
  const exploreBtn = document.createElement('button');
  exploreBtn.className = 'main-action-btn';
  exploreBtn.id = 'explore-btn';
  exploreBtn.title = getText('action.explore');
  exploreBtn.innerHTML = `<span class="explore-ico">探</span><span>${esc(getText('action.explore'))}</span>`;
  bindRipple(exploreBtn);
  exploreBtn.addEventListener('click', () => {
    setActiveMainBtn('explore-btn');
    if (onCompass) onCompass();
  });

  // 留下记忆
  const memoryBtn = document.createElement('button');
  memoryBtn.className = 'main-action-btn';
  memoryBtn.id = 'memory-btn';
  memoryBtn.title = getText('action.memory');
  memoryBtn.innerHTML = `<span class="explore-ico">忆</span><span>${esc(getText('action.memory'))}</span>`;
  bindRipple(memoryBtn);
  memoryBtn.addEventListener('click', () => {
    setActiveMainBtn('memory-btn');
    if (onMemory) onMemory();
  });

  // 路线规划
  const routeBtn = document.createElement('button');
  routeBtn.className = 'main-action-btn';
  routeBtn.id = 'route-btn';
  routeBtn.title = getText('action.route');
  routeBtn.innerHTML = `<span class="explore-ico">途</span><span>${esc(getText('action.route'))}</span>`;
  bindRipple(routeBtn);
  routeBtn.addEventListener('click', () => {
    setActiveMainBtn('route-btn');
    if (onRoutePlan) onRoutePlan();
  });

  mainActions.appendChild(exploreBtn);
  mainActions.appendChild(memoryBtn);
  mainActions.appendChild(routeBtn);
  root.appendChild(mainActions);
}

/** 涟漪效果绑定 */
function bindRipple(btn) {
  btn.addEventListener('pointerdown', (event) => {
    const rect = btn.getBoundingClientRect();
    btn.style.setProperty('--ripple-x', `${event.clientX - rect.left}px`);
    btn.style.setProperty('--ripple-y', `${event.clientY - rect.top}px`);
    btn.classList.remove('is-pressing', 'is-rippling');
    void btn.offsetWidth;
    btn.classList.add('is-pressing', 'is-rippling');
    window.setTimeout(() => btn.classList.remove('is-pressing', 'is-rippling'), 600);
  });
}

/** 设置当前激活的主按钮 */
function setActiveMainBtn(activeId) {
  document.querySelectorAll('.main-actions .main-action-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.id === activeId);
  });
}

/** 清除所有主按钮激活态 */
export function clearActiveMainBtn() {
  document.querySelectorAll('.main-actions .main-action-btn').forEach((btn) => {
    btn.classList.remove('active');
  });
}

/** 语言切换时刷新顶部工具组按钮文案（三主按钮 + 语言选择器）*/
export function refreshToolCluster() {
  // 三主按钮文案
  const exploreBtn = document.getElementById('explore-btn');
  if (exploreBtn) {
    exploreBtn.title = getText('action.explore');
    exploreBtn.innerHTML = `<span class="explore-ico">探</span><span>${esc(getText('action.explore'))}</span>`;
  }
  const memoryBtn = document.getElementById('memory-btn');
  if (memoryBtn) {
    memoryBtn.title = getText('action.memory');
    memoryBtn.innerHTML = `<span class="explore-ico">忆</span><span>${esc(getText('action.memory'))}</span>`;
  }
  const routeBtn = document.getElementById('route-btn');
  if (routeBtn) {
    routeBtn.title = getText('action.route');
    routeBtn.innerHTML = `<span class="explore-ico">途</span><span>${esc(getText('action.route'))}</span>`;
  }
  // 语言切换按钮文案
  const langTrigger = document.getElementById('lang-trigger');
  if (langTrigger) langTrigger.title = getText('lang.switch');
  const langLabel = document.getElementById('lang-label');
  if (langLabel) langLabel.textContent = getText('lang.switch');
}

export function setGpsLoading(loading) {
  const btn = document.getElementById('explore-btn');
  if (!btn) return;
  btn.classList.toggle('locating', !!loading);
}

/* ============ 轻量 Toast ============ */
let toastTimer = null;
export function showToast(msg) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3600);
}

/* ============ 定位降级弹窗 ============ */
export function renderGeoModal(root) {
  const el = document.createElement('div');
  el.id = 'geo-modal';
  el.innerHTML = `<div class="geo-card" id="geo-card"></div>`;
  root.appendChild(el);
}

export function openGeoModal({ onRetry, onDismiss }) {
  const modal = document.getElementById('geo-modal');
  const card = document.getElementById('geo-card');
  if (!modal || !card) return;
  card.innerHTML = `
    <div class="geo-icon">🧭</div>
    <div class="geo-title">${esc(getText('gps.denied_title'))}</div>
    <div class="geo-body">${esc(getText('gps.denied_body'))}</div>
    <div class="geo-actions">
      <button class="geo-btn geo-btn-ghost" id="geo-dismiss">${esc(getText('gps.denied_dismiss'))}</button>
      <button class="geo-btn geo-btn-primary" id="geo-retry">${esc(getText('gps.denied_retry'))}</button>
    </div>`;
  modal.classList.add('open');
  card.querySelector('#geo-dismiss').addEventListener('click', () => {
    closeGeoModal();
    if (onDismiss) onDismiss();
  });
  card.querySelector('#geo-retry').addEventListener('click', () => {
    closeGeoModal();
    if (onRetry) onRetry();
  });
}

export function closeGeoModal() {
  const modal = document.getElementById('geo-modal');
  if (modal) modal.classList.remove('open');
}

/* ============ 图层筛选控件（v3：单选主题模式）============ */
export function renderLayerControl(root, { counts, activeTheme, onSwitchTheme }) {
  const el = document.createElement('div');
  el.id = 'layer-control';
  el.className = 'layer-control';
  el.dataset.activeTheme = activeTheme;
  el.innerHTML = layerControlInner(counts, activeTheme);

  el.addEventListener('click', (e) => {
    if (e.target.closest('.layer-trigger')) {
      const expanded = !el.classList.contains('open');
      el.classList.toggle('open', expanded);
      e.target.closest('.layer-trigger').setAttribute('aria-expanded', String(expanded));
      return;
    }
    const btn = e.target.closest('.layer-item');
    if (!btn) return;
    const key = btn.dataset.theme;
    // 点击当前已激活的主题 → 切回全部总览
    const current = el.dataset.activeTheme;
    const nextKey = key === current ? 'all' : key;
    onSwitchTheme(nextKey);
    el.classList.remove('open');
    el.querySelector('.layer-trigger').setAttribute('aria-expanded', 'false');
  });

  root.appendChild(el);
}

function layerControlInner(counts, activeTheme) {
  // 全部总览按钮（第一项）
  const overviewActive = activeTheme === 'all';
  const overviewDotColor = OVERVIEW_MODE.color;
  const overviewBtn = `
    <button class="layer-item ${overviewActive ? 'active' : ''}" data-theme="all">
      <span class="layer-dot" style="background:${overviewDotColor};box-shadow:${
        overviewActive ? `0 0 10px 1px ${overviewDotColor}` : 'none'
      }"></span>
      <span class="flex-1">
        <span class="block text-xs text-[#2b2118] font-medium">${esc(pick(OVERVIEW_MODE.label))}</span>
      </span>
      <span class="text-[10px] tabular-nums text-[#8a7a62]">${ANCHORS.length}</span>
    </button>`;

  const items = THEME_ORDER.map((key) => {
    const meta = THEMES[key];
    const active = activeTheme === key;
    return `
      <button class="layer-item ${active ? 'active' : ''}" data-theme="${key}">
        <span class="layer-dot" style="background:${meta.color};box-shadow:${
          active ? `0 0 10px 1px ${meta.color}` : 'none'
        }"></span>
        <span class="flex-1">
          <span class="block text-xs text-[#2b2118]">${esc(pick(meta.label))}</span>
        </span>
        <span class="text-[10px] tabular-nums text-[#8a7a62]">${counts[key] || 0}</span>
      </button>`;
  }).join('');

  return `
    <button class="layer-trigger" aria-expanded="false">
      <span class="layer-trigger-icon">📖</span>
      <span>${esc(getText('layers.heading'))}</span>
      <span class="layer-trigger-arrow">⌄</span>
    </button>
    <div class="layer-menu">
      <div class="flex flex-col gap-1">
        ${overviewBtn}
        <div class="layer-divider"></div>
        ${items}
      </div>
    </div>`;
}

export function refreshLayerControl(counts, activeTheme) {
  const el = document.getElementById('layer-control');
  if (el) {
    el.dataset.activeTheme = activeTheme;
    el.innerHTML = layerControlInner(counts, activeTheme);
  }
}

/* ============ 信息面板（毛玻璃 + 打字机 + 连线 + 打卡）============ */
// 打字机定时器与"渲染令牌"——令牌机制等价于 React 的 key={anchor.id}：
// 每次切换锚点都递增令牌，使上一轮所有在途异步回调（setTimeout/setInterval）立即失效，
// 彻底杜绝快速切换时的定时器竞态卡死。
let typewriterInterval = null; // setInterval ID（逐字渲染）
let typewriterTimeout = null; // setTimeout ID（延迟启动）
let typewriterToken = 0; // 渲染版本令牌
let currentAnchor = null;

/** 彻底停止当前打字机：清除 timeout + interval，并递增令牌使在途回调失效 */
function stopTypewriter() {
  typewriterToken += 1;
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
    typewriterTimeout = null;
  }
  if (typewriterInterval) {
    clearInterval(typewriterInterval);
    typewriterInterval = null;
  }
}

export function renderInfoPanel(root) {
  const el = document.createElement('aside');
  el.id = 'info-panel';
  el.innerHTML = `<div class="glass-card" id="glass-card"></div>`;
  root.appendChild(el);
  return el;
}

function anchorLocationText(anchor) {
  if (anchor.location && anchor.location.address) return pick(anchor.location.address);
  if (anchor.location && anchor.location.visitPoint) return pick(anchor.location.visitPoint);
  return pick(anchor.hero || anchor.title);
}

function wantToggleLabel(anchorId, longLabel = false) {
  const added = isWantToVisit(anchorId);
  if (longLabel) return getText(added ? 'want.added_long' : 'want.add_long');
  return getText(added ? 'want.added' : 'want.add');
}

function renderWantMiniButton(anchor, id, className = '') {
  const added = isWantToVisit(anchor.id);
  return `
    <button class="want-toggle ${added ? 'active' : ''} ${className}" id="${id}" data-anchor-id="${esc(anchor.id)}" aria-pressed="${added}">
      <span class="want-icon" aria-hidden="true">${added ? '✓' : '＋'}</span>
      <span>${esc(wantToggleLabel(anchor.id))}</span>
    </button>`;
}

function bindWantToggle(button, anchor, { longLabel = false, onChange } = {}) {
  if (!button || !anchor) return;
  const sync = () => {
    const added = isWantToVisit(anchor.id);
    button.classList.toggle('active', added);
    button.setAttribute('aria-pressed', String(added));
    button.innerHTML = `<span class="want-icon" aria-hidden="true">${added ? '✓' : '＋'}</span><span>${esc(wantToggleLabel(anchor.id, longLabel))}</span>`;
  };
  sync();
  button.addEventListener('click', () => {
    if (isWantToVisit(anchor.id)) removeWantToVisit(anchor.id);
    else addWantToVisit(anchor.id);
    sync();
    if (onChange) onChange(isWantToVisit(anchor.id));
  });
}

/**
 * 打开锚点信息面板
 * @param {Object} anchor
 * @param {Object} handlers { onClose, onLinkClick }
 */
export function openInfoPanel(anchor, handlers = {}) {
  const { onClose, onLinkClick, onEnterEpisode } = handlers;
  currentAnchor = anchor;
  const panel = document.getElementById('info-panel');
  const card = document.getElementById('glass-card');
  if (!panel || !card) return;
  const theme = THEMES[anchor.theme];
  const subjectLabelKey =
    anchor.contentType === 'theme'
      ? 'panel.theme'
      : anchor.contentType === 'landmark'
        ? 'panel.landmark'
        : 'panel.figure';

  // 切换锚点前彻底停止上一轮打字机（等价 React 卸载 + 清除所有定时器）
  stopTypewriter();

  // 全球连线区块
  const linksHtml =
    anchor.globalLinks && anchor.globalLinks.length
      ? `
    <div class="mt-6 fade-in-up" style="animation-delay:.6s">
      <span class="mb-2 block text-[10px] tracking-[0.2em] text-[#8a7a62]">${esc(getText('panel.links'))}</span>
      ${anchor.globalLinks
        .map((lk, i) => {
          const c = (lk.linkType === 'world' && '#C9A84C') || (lk.linkType === 'regional' && '#E8A030') || '#5ECFB1';
          return `
          <button class="link-row" data-link-idx="${i}">
            <span class="link-dot" style="background:${c};box-shadow:0 0 6px ${c}"></span>
            <span class="flex-1">
              <span class="link-target">${esc(pick(lk.targetName))}</span>
              <span class="link-event">${esc(pick(lk.eventName))}</span>
            </span>
            <span class="link-year">${esc(String(lk.year))}</span>
          </button>`;
        })
        .join('')}
    </div>`
      : '';

  // 到访决策信息与想去清单合并，避免详情面板出现重复的“真实地点”区块。
  const visitLabel = anchor.openHours
    ? getText('panel.hours')
    : anchor.visitTips
      ? getText('panel.visit')
      : getText('panel.visit');
  const visitPrimary = anchor.openHours || anchor.visitTips || anchorLocationText(anchor);
  const visitSecondary = anchor.openHours && anchor.visitTips
    ? `<p class="panel-want-sub">${esc(getText('panel.visit'))}：${esc(anchor.visitTips)}</p>`
    : '';

  // 人物 / 地点配图（优先 heroImage，其次 placeImage）；加载失败自动降级隐藏整块
  const imgSrc = anchor.heroImage || anchor.placeImage || '';
  const imageHtml = imgSrc
    ? `<figure class="panel-image impact-image fade-in-up" style="animation-delay:.36s">
        <img src="${esc(imgSrc)}" alt="${esc(anchor.imageCaption || pick(anchor.hero))}" loading="lazy"
          onerror="this.closest('.panel-image').style.display='none'" />
        ${anchor.imageCaption ? `<figcaption class="panel-image-cap">${esc(anchor.imageCaption)}</figcaption>` : ''}
        ${anchor.imageLicense ? `<span class="panel-image-license">${esc(anchor.imageLicense)}</span>` : ''}
      </figure>`
    : '';

  const episodeHtml = hasEpisode(anchor.id)
    ? `<div class="panel-quest-card fade-in-up" style="--ep-accent:${theme.color};animation-delay:.58s">
        <button class="episode-enter-btn ${isCompleted(anchor.id) ? 'completed' : ''}" id="episode-enter">
          <span class="ee-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false"><path d="M6 5h12v14H6z"/><path d="M4 5h16M4 19h16M9 9h6M9 13h4"/></svg>
          </span>
          <span class="ee-copy">${esc(getText(isCompleted(anchor.id) ? 'episode.replay_cta' : 'episode.cta'))}</span>
          <span class="ee-arrow" aria-hidden="true">→</span>
        </button>
      </div>`
    : '';

  const wantHtml = `
    <section class="panel-want-card fade-in-up" style="animation-delay:.64s">
      <div>
        <span>${esc(visitLabel)}</span>
        <b>${esc(visitPrimary)}</b>
        ${visitSecondary}
      </div>
      ${renderWantMiniButton(anchor, 'anchor-want-toggle')}
    </section>`;

  card.style.boxShadow = `0 24px 80px -20px ${theme.color}40, inset 0 1px 0 0 rgba(255,255,255,0.06)`;
  card.innerHTML = `
    <div class="glass-top-band" style="background:linear-gradient(90deg,transparent,${theme.color},transparent)"></div>
    <button class="close-btn" id="panel-close" aria-label="${esc(getText('panel.close'))}">✕</button>

    <section class="impact-brief fade-in-up" style="--impact-accent:${theme.color};animation-delay:.1s">
      <div class="impact-kicker">
        <span class="impact-dot"></span>
        <span>${esc(pick(theme.shortName || theme.label))}</span>
        ${anchor.era ? `<span class="impact-era">${esc(anchor.era)}</span>` : ''}
      </div>
      <h2 class="impact-place font-brush">${esc(pick(anchor.name))}</h2>
      <p class="impact-title font-brush">${esc(pick(anchor.title))}</p>
      ${imageHtml}
      <p class="impact-story panel-description">
        <span id="typed-text"></span><span class="typewriter-caret" id="typed-caret"></span>
      </p>
      <div class="impact-facts">
        <span>
          <b>${esc(getText(subjectLabelKey))}</b>
          ${esc(pick(anchor.hero))}
        </span>
      </div>
    </section>

    ${episodeHtml}
    ${wantHtml}
    ${linksHtml}`;

  const closeBtn = document.getElementById('panel-close');
  if (closeBtn) closeBtn.addEventListener('click', onClose);

  // 副本入口按钮
  const epBtn = document.getElementById('episode-enter');
  if (epBtn && onEnterEpisode) {
    epBtn.addEventListener('click', () => onEnterEpisode(anchor));
  }

  bindWantToggle(document.getElementById('anchor-want-toggle'), anchor, {
    onChange: () => showToast(getText(isWantToVisit(anchor.id) ? 'want.toast_added' : 'want.toast_removed')),
  });

  // 连线条目点击
  card.querySelectorAll('.link-row').forEach((row) => {
    row.addEventListener('click', () => {
      const idx = parseInt(row.dataset.linkIdx, 10);
      if (anchor.globalLinks && anchor.globalLinks[idx] && onLinkClick) {
        onLinkClick(anchor.globalLinks[idx]);
      }
    });
  });

  panel.classList.add('open');
  document.body.classList.add('info-panel-open');
  runTypewriter(pick(anchor.desc) || getText('panel.decoding'));
}

/** 国外节点的简化信息面板（无 hero / theme）*/
export function openForeignPanel(link, handlers = {}) {
  const { onClose } = handlers;
  currentAnchor = { foreign: true, link };
  const panel = document.getElementById('info-panel');
  const card = document.getElementById('glass-card');
  if (!panel || !card) return;
  const c = (link.linkType === 'world' && '#C9A84C') || (link.linkType === 'regional' && '#E8A030') || '#5ECFB1';

  // 切换前彻底停止上一轮打字机
  stopTypewriter();

  card.style.boxShadow = `0 24px 80px -20px ${c}40, inset 0 1px 0 0 rgba(255,255,255,0.06)`;
  card.innerHTML = `
    <div class="glass-top-band" style="background:linear-gradient(90deg,transparent,${c},transparent)"></div>
    <button class="close-btn" id="panel-close" aria-label="${esc(getText('panel.close'))}">✕</button>

    <div class="mb-5 flex items-center gap-2 fade-in-up" style="animation-delay:.1s">
      <span class="h-2 w-2 rounded-full" style="background:${c};box-shadow:0 0 8px ${c}"></span>
      <span class="text-[11px] font-semibold tracking-[0.18em]" style="color:${c}">${esc(getText('foreign.event'))}</span>
      <span class="ml-auto text-[10px] tracking-widest text-[#8a7a62]">${esc(String(link.year))}</span>
    </div>

    <h2 class="font-brush text-[28px] font-semibold leading-tight text-[#2b2118] md:text-[32px] fade-in-up" style="animation-delay:.2s">
      ${esc(pick(link.targetName))}
    </h2>

    <p class="mt-2 text-sm text-[#5a4d3c] fade-in-up" style="animation-delay:.32s">${esc(pick(link.eventName))}</p>

    <div class="mt-6 fade-in-up" style="animation-delay:.45s">
      <p class="panel-description font-serif text-[17px] text-[#2b2118]"><span id="typed-text"></span><span class="typewriter-caret" id="typed-caret"></span></p>
    </div>

    <div class="panel-stamp" style="background:linear-gradient(145deg,#cf3f39,#a82d28)"><span>四海<br/>同辉</span></div>`;

  const closeBtn = document.getElementById('panel-close');
  if (closeBtn) closeBtn.addEventListener('click', onClose);
  panel.classList.add('open');
  document.body.classList.add('info-panel-open');
  runTypewriter(pick(link.desc) || pick(link.eventName) || getText('panel.decoding'));
}

/**
 * 打字机特效（对所有语言生效）。
 * 通过"渲染令牌"快照防止竞态：启动时捕获当前令牌，每个异步回调都校验令牌是否仍然有效，
 * 一旦用户切换了锚点（stopTypewriter 已递增令牌），过期回调立即终止，绝不污染新面板。
 * @param {string} text 数据层文案（已由调用方做空值兜底）
 */
function runTypewriter(text) {
  const typedEl = document.getElementById('typed-text');
  const caretEl = document.getElementById('typed-caret');
  if (!typedEl) return;

  const full = text == null ? '' : String(text);
  // 捕获本轮令牌快照（等价 React 闭包捕获 key）
  const myToken = typewriterToken;

  // 文案为空：直接显示占位并隐藏光标，不启动计时器
  if (!full) {
    typedEl.textContent = getText('panel.decoding');
    if (caretEl) caretEl.style.display = 'none';
    return;
  }

  let i = 0;
  typedEl.textContent = '';
  if (caretEl) caretEl.style.display = '';

  typewriterTimeout = setTimeout(() => {
    // 延迟期间若已切换锚点，本轮作废
    if (myToken !== typewriterToken) return;
    typewriterTimeout = null;

    typewriterInterval = setInterval(() => {
      // 每帧都校验：令牌过期 / DOM 已被替换 → 立即停止本轮
      if (myToken !== typewriterToken || !document.body.contains(typedEl)) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
        return;
      }
      i += 1;
      typedEl.textContent = full.slice(0, i);
      if (i >= full.length) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
        if (caretEl) caretEl.style.display = 'none';
      }
    }, 32);
  }, 500);
}

export function closeInfoPanel() {
  currentAnchor = null;
  const panel = document.getElementById('info-panel');
  if (panel) panel.classList.remove('open');
  document.body.classList.remove('info-panel-open');
  stopTypewriter();
}

export function isPanelOpen() {
  return !!currentAnchor;
}
export function getCurrentAnchor() {
  return currentAnchor;
}

/* ============ 附近历史地（左侧抽屉）============ */
let nearbyState = { radius: 5, userPos: null, onItemClick: null };

export function renderNearbyDrawer(root, { onItemClick }) {
  nearbyState.onItemClick = onItemClick;
  const el = document.createElement('aside');
  el.id = 'nearby-drawer';
  el.innerHTML = `
    <div class="nearby-card">
      <div class="nearby-head">
        <span class="nearby-title" id="nearby-title">${esc(getText('nearby.title'))}</span>
        <button class="close-btn" id="nearby-close" style="position:static;width:30px;height:30px">✕</button>
      </div>
      <div class="seg-control" id="seg-control"></div>
      <div class="nearby-list" id="nearby-list"></div>
    </div>`;
  root.appendChild(el);

  el.querySelector('#nearby-close').addEventListener('click', closeNearbyDrawer);
  renderSegControl();
}

function renderSegControl() {
  const seg = document.getElementById('seg-control');
  if (!seg) return;
  const opts = [
    { v: 5, label: '5km' },
    { v: 10, label: '10km' },
    { v: 20, label: '20km' },
    { v: 9999, label: getText('nearby.all') },
  ];
  seg.innerHTML = opts
    .map(
      (o) =>
        `<button class="seg-btn ${o.v === nearbyState.radius ? 'active' : ''}" data-radius="${o.v}">${esc(o.label)}</button>`
    )
    .join('');
  seg.querySelectorAll('.seg-btn').forEach((b) => {
    b.addEventListener('click', () => {
      nearbyState.radius = parseInt(b.dataset.radius, 10);
      renderSegControl();
      refreshNearbyList();
    });
  });
}

/** 计算并填充附近列表（需 haversineKm 注入）*/
let _haversine = null;
export function setHaversine(fn) {
  _haversine = fn;
}

export function openNearbyDrawer(userPos) {
  nearbyState.userPos = userPos;
  const drawer = document.getElementById('nearby-drawer');
  if (drawer) drawer.classList.add('open');
  refreshNearbyList();
}

export function closeNearbyDrawer() {
  const drawer = document.getElementById('nearby-drawer');
  if (drawer) drawer.classList.remove('open');
}

export function isNearbyOpen() {
  const drawer = document.getElementById('nearby-drawer');
  return drawer && drawer.classList.contains('open');
}

/** 返回当前半径内的锚点 id 集合（供地图高亮）*/
export function getNearbyIds() {
  if (!nearbyState.userPos || !_haversine) return new Set();
  const [ulng, ulat] = nearbyState.userPos;
  const ids = new Set();
  ANCHORS.forEach((a) => {
    const d = _haversine(ulng, ulat, a.coordinates[0], a.coordinates[1]);
    if (d <= nearbyState.radius) ids.add(a.id);
  });
  return ids;
}

function refreshNearbyList() {
  const list = document.getElementById('nearby-list');
  if (!list || !nearbyState.userPos || !_haversine) return;
  const [ulng, ulat] = nearbyState.userPos;

  const items = ANCHORS.map((a) => ({
    anchor: a,
    dist: _haversine(ulng, ulat, a.coordinates[0], a.coordinates[1]),
  }))
    .filter((x) => x.dist <= nearbyState.radius)
    .sort((a, b) => a.dist - b.dist);

  // 通知外部更新地图高亮
  if (nearbyState.onNearbyChange) nearbyState.onNearbyChange(getNearbyIds());

  if (items.length === 0) {
    list.innerHTML = `<div class="nearby-empty">${esc(getText('nearby.empty'))}</div>`;
    return;
  }

  list.innerHTML = items
    .map(({ anchor, dist }) => {
      const theme = THEMES[anchor.theme];
      const walkMin = Math.round((dist / 5) * 60); // 5km/h
      const walkHtml =
        dist < 3
          ? `<span class="nearby-walk"> · ${esc(getText('nearby.walk', { min: walkMin }))}</span>`
          : '';
      return `
      <button class="nearby-item" data-id="${anchor.id}">
        <span class="nearby-badge" style="background:${theme.color};box-shadow:0 0 6px ${theme.color}"></span>
        <span class="flex-1">
          <span class="nearby-name">${esc(pick(anchor.name))}</span>
          <span class="nearby-dist">${dist.toFixed(1)} ${esc(getText('nearby.km'))}${walkHtml}</span>
        </span>
      </button>`;
    })
    .join('');

  list.querySelectorAll('.nearby-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const anchor = ANCHORS.find((a) => a.id === btn.dataset.id);
      if (anchor && nearbyState.onItemClick) nearbyState.onItemClick(anchor);
    });
  });
}

export function setNearbyChangeHandler(fn) {
  nearbyState.onNearbyChange = fn;
}

export function refreshNearbyTexts() {
  const title = document.getElementById('nearby-title');
  if (title) title.textContent = getText('nearby.title');
  renderSegControl();
  if (isNearbyOpen()) refreshNearbyList();
}

/* ============ 探索路径面包屑 ============ */
let breadcrumbTrail = [];

export function renderBreadcrumb(root, { onCrumbClick, onBack }) {
  const el = document.createElement('div');
  el.id = 'breadcrumb';
  root.appendChild(el);
  el._onCrumbClick = onCrumbClick;
  el._onBack = onBack;
}

/** 设置面包屑路径；trail 为 [{label, type, ref}] */
export function setBreadcrumb(trail) {
  breadcrumbTrail = trail || [];
  renderBreadcrumbInner();
}

export function pushBreadcrumb(node) {
  breadcrumbTrail.push(node);
  renderBreadcrumbInner();
}

export function clearBreadcrumb() {
  breadcrumbTrail = [];
  renderBreadcrumbInner();
}

function renderBreadcrumbInner() {
  const el = document.getElementById('breadcrumb');
  if (!el) return;
  if (breadcrumbTrail.length === 0) {
    el.classList.remove('show');
    el.innerHTML = '';
    return;
  }
  const crumbs = breadcrumbTrail
    .map((node, i) => {
      const isLast = i === breadcrumbTrail.length - 1;
      const sep = i > 0 ? `<span class="crumb-sep">→</span>` : '';
      return `${sep}<button class="crumb ${isLast ? 'current' : ''}" data-idx="${i}">${esc(node.label)}</button>`;
    })
    .join('');
  el.innerHTML = `${crumbs}<button class="crumb-back" id="crumb-back">${esc(getText('breadcrumb.back'))}</button>`;
  el.classList.add('show');

  el.querySelectorAll('.crumb').forEach((c) => {
    c.addEventListener('click', () => {
      const idx = parseInt(c.dataset.idx, 10);
      if (el._onCrumbClick) el._onCrumbClick(idx, breadcrumbTrail[idx]);
    });
  });
  const backBtn = el.querySelector('#crumb-back');
  if (backBtn) backBtn.addEventListener('click', () => el._onBack && el._onBack());
}

export function getBreadcrumbTrail() {
  return breadcrumbTrail;
}

/* ============ 计算各主题计数 ============ */
export function computeCounts() {
  const counts = {};
  THEME_ORDER.forEach((k) => (counts[k] = 0));
  ANCHORS.forEach((a) => {
    counts[a.theme] = (counts[a.theme] || 0) + 1;
  });
  return counts;
}

/* ============================================================= */
/* ===== 罗盘探索面板（左侧抽屉：附近探索 + 主题路线）=========== */
/* ============================================================= */

function fmtDist(km) {
  if (km == null || isNaN(km)) return '';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} ${getText('nearby.km')}`;
}
function fmtDuration(min) {
  const t = Math.max(1, Math.round(min || 0));
  const h = Math.floor(t / 60);
  const m = t % 60;
  if (h > 0) return `${h} ${getText('route.hour')} ${m} ${getText('route.min')}`;
  return `${m} ${getText('route.min')}`;
}

/* ============================================================= */
/* ===== 路线规划中心（右上角入口：我的想去 + 自由选择）========= */
/* ============================================================= */

const ROUTE_PLANNER_RECOMMENDATIONS = [
  {
    id: 'wutong-cloud',
    title: { zh: '梧桐登云步道', en: 'Wutong Cloud-Ascent Trail' },
    meta: { zh: '罗湖 · 登高看城海', en: 'Luohu · city-and-sea summit' },
    route: { zh: '梧桐山风景名胜区主入口 → 登云道 → 小梧桐 → 好汉坡 → 大梧桐 → 秀桐道', en: 'Wutong Mountain main entrance → Dengyun Trail → Xiao Wutong → Hero Slope → Da Wutong → Xiutong Road' },
    reason: { zh: '深圳最经典的登高线之一，山顶能把盐田港、城市天际线与山脊层次一起收入视野。', en: 'A classic Shenzhen climb where port, skyline and ridge views gather in one route.' },
    navKeyword: '梧桐山风景名胜区主入口 登云道',
  },
  {
    id: 'qiniang-geology',
    title: { zh: '七娘山主峰科考线', en: 'Qiniang Mountain Research Trail' },
    meta: { zh: '大鹏 · 火山地质与山海', en: 'Dapeng · volcanic geology and sea views' },
    route: { zh: '大鹏半岛国家地质公园 → 一号至四号观景平台 → 七娘山主峰观景平台', en: 'Dapeng Peninsula Geopark → viewing platforms 1-4 → Qiniang summit platform' },
    reason: { zh: '适合把深圳东部的海岸、地质和山脊风景合成一条强记忆路线。', en: 'A memorable eastern-Shenzhen route joining coast, geology and ridgelines.' },
    navKeyword: '大鹏半岛国家地质公园 七娘山主峰科考线',
  },
  {
    id: 'kunpeng-city-ridge',
    title: { zh: '鲲鹏径城市山脊段', en: 'Kunpeng Trail Urban Ridge Section' },
    meta: { zh: '福田/梅林 · 山海连城体验', en: 'Futian/Meilin · mountain-city connector' },
    route: { zh: '笔架山公园 → 银湖山 → 鲲鹏径节点 → 梅林山', en: 'Bijiashan Park → Yinhu Mountain → Kunpeng Trail node → Meilin Mountain' },
    reason: { zh: '用半日体验深圳远足径的“城市山脊”，不离城区也能有穿林越岭的节奏。', en: 'A half-day taste of Shenzhen’s urban ridgeline without leaving the city core.' },
    navKeyword: '笔架山公园 银湖山 梅林山 鲲鹏径',
  },
  {
    id: 'maluan-waterfall',
    title: { zh: '马峦山山水环线', en: 'Maluan Mountain Landscape Loop' },
    meta: { zh: '坪山/盐田 · 溪谷郊野', en: 'Pingshan/Yantian · valley countryside' },
    route: { zh: '梅沙湾公园 → 马峦山郊野公园 → 瀑布溪谷 → 山海观景段', en: 'Meisha Bay Park → Maluan Mountain Country Park → waterfall valley → sea-view section' },
    reason: { zh: '比城市公园更野趣，又比长距离穿越更容易控制节奏，适合做周末轻徒步。', en: 'Wilder than a city park but easier to pace than a full long-distance crossing.' },
    navKeyword: '马峦山郊野公园 梅沙湾公园',
  },
  {
    id: 'nanshan-shekou',
    title: { zh: '大南山蛇口海景线', en: 'Dananshan-Shekou Sea-View Trail' },
    meta: { zh: '南山 · 轻量登山', en: 'Nanshan · light hill walk' },
    route: { zh: '大南山登山口 → 山顶观景台 → 蛇口/海上世界周边', en: 'Dananshan trailhead → summit lookout → Shekou / Sea World area' },
    reason: { zh: '强度友好、交通方便，能把深圳湾、蛇口港与南山科技城区放在同一视线里。', en: 'Accessible and friendly, with views toward Shenzhen Bay, Shekou and Nanshan’s tech district.' },
    navKeyword: '深圳大南山登山口 蛇口',
  },
];

let routePlannerState = {
  activeTab: 'free',
  userPos: null,
  selectedIds: new Set(),
  selectionOrder: [],
  itinerary: null,
  itineraryTheme: null,
  planning: false,
  handlers: {},
};

function activeRouteSelectionIds() {
  return routePlannerState.selectionOrder.slice();
}

function setRoutePlannerSelected(anchorId, selected) {
  if (!anchorId) return;
  if (selected) {
    routePlannerState.selectedIds.add(anchorId);
    if (!routePlannerState.selectionOrder.includes(anchorId)) {
      routePlannerState.selectionOrder.push(anchorId);
    }
    return;
  }
  routePlannerState.selectedIds.delete(anchorId);
  routePlannerState.selectionOrder = routePlannerState.selectionOrder.filter((id) => id !== anchorId);
}

function clearActiveRouteSelection() {
  routePlannerState.selectedIds.clear();
  routePlannerState.selectionOrder = [];
}

function hasValidCoord(anchor) {
  return !!(
    anchor &&
    Array.isArray(anchor.coordinates) &&
    Number.isFinite(anchor.coordinates[0]) &&
    Number.isFinite(anchor.coordinates[1])
  );
}

function buildTencentMarkerUrl(anchor) {
  if (!hasValidCoord(anchor)) return '';
  const [lng, lat] = anchor.coordinates;
  const params = new URLSearchParams({
    marker: `coord:${lat.toFixed(6)},${lng.toFixed(6)};title:${pick(anchor.name)}`,
    referer: 'shikongluopan',
  });
  return `https://apis.map.qq.com/uri/v1/marker?${params.toString()}`;
}

function buildTencentSearchUrl(keyword) {
  if (!keyword) return '';
  const params = new URLSearchParams({
    keyword,
    region: '深圳',
    referer: 'shikongluopan',
  });
  return `https://apis.map.qq.com/uri/v1/search?${params.toString()}`;
}

function buildRoutePlannerTencentUrl(itinerary) {
  const stops = itinerary && itinerary.stops ? itinerary.stops.map((stop) => stop.anchor).filter(hasValidCoord) : [];
  if (!stops.length) return '';
  if (stops.length === 1 && !itinerary.startCoord) return buildTencentMarkerUrl(stops[0]);
  const firstStop = stops[0];
  const lastStop = stops[stops.length - 1];
  const fromCoord = Array.isArray(itinerary.startCoord) ? itinerary.startCoord : firstStop.coordinates;
  const fromName = Array.isArray(itinerary.startCoord) ? getText('route.start_short') : pick(firstStop.name);
  const [fromLng, fromLat] = fromCoord;
  const [toLng, toLat] = lastStop.coordinates;
  const params = new URLSearchParams({
    type: itinerary.modeKey === 'drive' ? 'drive' : 'walk',
    from: fromName,
    fromcoord: `${fromLat.toFixed(6)},${fromLng.toFixed(6)}`,
    to: pick(lastStop.name),
    tocoord: `${toLat.toFixed(6)},${toLng.toFixed(6)}`,
    referer: 'shikongluopan',
  });
  if (itinerary.modeKey === 'drive') params.set('policy', '0');
  return `https://apis.map.qq.com/uri/v1/routeplan?${params.toString()}`;
}

function openMapUrl(url) {
  if (!url) {
    showToast(getText('route_planner.nav_unavailable'));
    return;
  }
  window.open(url, '_blank', 'noopener');
}

function routeAnchorInfo(anchor) {
  const theme = THEMES[anchor.theme] || OVERVIEW_MODE;
  const location = anchorLocationText(anchor);
  return {
    theme,
    location,
    title: pick(anchor.title),
    name: pick(anchor.name),
  };
}

function sortedFreeRouteAnchors() {
  const wantIds = new Set(getWantToVisitAnchors().map((anchor) => anchor.id));
  const canMeasure = routePlannerState.userPos && _haversine;
  const [lng, lat] = canMeasure ? routePlannerState.userPos : [null, null];
  return ANCHORS.map((anchor, index) => {
    const dist = canMeasure ? _haversine(lng, lat, anchor.coordinates[0], anchor.coordinates[1]) : Number.POSITIVE_INFINITY;
    return {
      anchor,
      dist,
      index,
      wanted: wantIds.has(anchor.id),
    };
  })
    .sort((a, b) => {
      if (a.wanted !== b.wanted) return a.wanted ? -1 : 1;
      if (Number.isFinite(a.dist) && Number.isFinite(b.dist) && a.dist !== b.dist) return a.dist - b.dist;
      return a.index - b.index;
    })
    .map((item) => ({
      ...item.anchor,
      _routePlannerDist: Number.isFinite(item.dist) ? item.dist : undefined,
      _routePlannerWanted: item.wanted,
    }));
}

function routeAnchorRow(anchor, { source = 'free' } = {}) {
  const info = routeAnchorInfo(anchor);
  const selected = routePlannerState.selectedIds.has(anchor.id);
  const detail =
    source === 'free' && Number.isFinite(anchor._routePlannerDist)
      ? `${anchor._routePlannerWanted ? `${getText('route_planner.want_badge')} · ` : ''}${fmtDist(anchor._routePlannerDist)} · ${info.location || info.title}`
      : info.location || info.title;
  return `
    <article class="route-anchor-row ${selected ? 'selected' : ''}" style="--row-accent:${info.theme.color}" data-anchor-id="${esc(anchor.id)}">
      <button class="route-anchor-info" data-route-action="view-anchor" data-anchor-id="${esc(anchor.id)}">
        <span class="route-anchor-copy">
          <span class="route-anchor-top">
            <span class="route-dot"></span>
            <b>${esc(info.name)}</b>
          </span>
          <span>${esc(detail)}</span>
        </span>
      </button>
      <button class="route-anchor-select" data-route-action="toggle-select" data-anchor-id="${esc(anchor.id)}" role="checkbox" aria-checked="${selected}" aria-label="${esc(info.name)}">
        ${selected ? '✓' : ''}
      </button>
    </article>`;
}

function routePlannerTabsHtml() {
  const tabs = [
    ['free', getText('route_planner.free_tab')],
    ['recommend', getText('route_planner.recommend_tab')],
  ];
  return `
    <div class="route-planner-tabs" role="tablist">
      ${tabs
        .map(
          ([key, label]) =>
            `<button class="route-planner-tab ${routePlannerState.activeTab === key ? 'active' : ''}" data-route-tab="${key}" role="tab" aria-selected="${routePlannerState.activeTab === key}">${esc(label)}</button>`
        )
        .join('')}
    </div>`;
}

function routePlannerActionBarHtml() {
  const selectedCount = activeRouteSelectionIds().length;
  return `
    <div class="route-plan-bar">
      <span>${esc(getText('route_planner.selected', { count: selectedCount }))}</span>
      <div class="route-plan-actions">
        <button class="rt-select-action" data-route-action="clear-selection" ${selectedCount ? '' : 'disabled'}>${esc(getText('route.clear_selected'))}</button>
        <button class="rt-plan-btn route-generate-btn" data-route-action="plan-route" ${selectedCount && !routePlannerState.planning ? '' : 'disabled'}>
          <span class="cp-label">${esc(getText(routePlannerState.planning ? 'compass.planning' : 'route_planner.plan'))}</span>
        </button>
      </div>
    </div>`;
}

function renderRecommendationTab() {
  return `
    <section class="route-recommend-panel">
      <div class="route-recommend-intro">
        <b>${esc(getText('route_planner.recommend_title'))}</b>
        <p>${esc(getText('route_planner.recommend_body'))}</p>
      </div>
      <div class="route-recommend-list">
        ${ROUTE_PLANNER_RECOMMENDATIONS.map((route) => `
          <article class="route-recommend-card">
            <div class="route-recommend-copy">
              <span>${esc(pick(route.meta))}</span>
              <b>${esc(pick(route.title))}</b>
              <p>${esc(pick(route.reason))}</p>
              <em>${esc(getText('route_planner.recommend_nav'))}：${esc(pick(route.route))}</em>
            </div>
            <button class="route-recommend-nav" data-route-action="nav-recommendation" data-recommendation-id="${esc(route.id)}">${esc(getText('route_planner.recommend_open'))}</button>
          </article>
        `).join('')}
      </div>
    </section>`;
}

function renderFreeTab() {
  return `
    ${routePlannerActionBarHtml()}
    <div class="route-anchor-list-full">
      ${sortedFreeRouteAnchors().map((anchor) => routeAnchorRow(anchor, { source: 'free' })).join('')}
    </div>`;
}

function routePlannerResultHtml() {
  const itinerary = routePlannerState.itinerary;
  if (!itinerary || !itinerary.stops || !itinerary.stops.length) return '';
  const stops = itinerary.stops
    .map((stop, index) => {
      const info = routeAnchorInfo(stop.anchor);
      const meta = stop.legKm > 0 ? `${fmtDist(stop.legKm)} · ${fmtDuration(stop.cumMin)}` : info.location;
      return `
        <button class="route-result-stop" data-route-action="view-anchor" data-anchor-id="${esc(stop.anchor.id)}">
          <span class="route-result-index">${esc(getText('route_planner.stop', { index: index + 1 }))}</span>
          <div>
            <b>${esc(info.name)}</b>
            <span>${esc(meta)}</span>
          </div>
          <span class="route-result-go" aria-hidden="true">→</span>
        </button>`;
    })
    .join('');
  return `
    <section class="route-result-card">
      <div class="route-result-head">
        <h3>${esc(getText('route_planner.route_title'))}</h3>
        <span>${esc(fmtDist(itinerary.totalKm))} · ${esc(fmtDuration(itinerary.totalMin))}</span>
      </div>
      <div class="route-result-list">${stops}</div>
      <div class="route-result-footer">
        <button class="route-nav" data-route-action="nav-itinerary">${esc(getText('route.open_tencent'))}</button>
        <button class="route-clear" data-route-action="continue-select">${esc(getText('route_planner.continue_select'))}</button>
        <button class="route-clear" data-route-action="clear-route">${esc(getText('route_planner.clear_route'))}</button>
      </div>
    </section>`;
}

export function renderRoutePlanner(root, handlers = {}) {
  routePlannerState.handlers = handlers;
  const el = document.createElement('aside');
  el.id = 'route-planner-panel';
  el.innerHTML = `
    <div class="route-planner-card">
      <div class="route-planner-head">
        <div>
          <span class="route-planner-title">${esc(getText('route_planner.title'))}</span>
          <p>${esc(getText('route_planner.subtitle'))}</p>
        </div>
        <button class="close-btn" id="route-planner-close" style="position:static;width:30px;height:30px">✕</button>
      </div>
      <div class="route-planner-content" id="route-planner-content"></div>
    </div>`;
  root.appendChild(el);
  el.querySelector('#route-planner-close').addEventListener('click', closeRoutePlanner);
}

export function openRoutePlanner(tab = 'free') {
  const el = document.getElementById('route-planner-panel');
  if (tab) routePlannerState.activeTab = tab === 'want' ? 'recommend' : tab;
  if (el) el.classList.add('open');
  renderRoutePlannerContent();
}

export function setRoutePlannerLocation(pos) {
  routePlannerState.userPos =
    Array.isArray(pos) && Number.isFinite(pos[0]) && Number.isFinite(pos[1])
      ? pos
      : null;
  if (isRoutePlannerOpen() && routePlannerState.activeTab === 'free') renderRoutePlannerContent();
}

export function closeRoutePlanner() {
  const el = document.getElementById('route-planner-panel');
  if (el) el.classList.remove('open');
}

export function isRoutePlannerOpen() {
  const el = document.getElementById('route-planner-panel');
  return !!(el && el.classList.contains('open'));
}

export function setRoutePlannerPlanning(loading) {
  routePlannerState.planning = !!loading;
  const buttons = document.querySelectorAll('#route-planner-panel .route-generate-btn');
  buttons.forEach((btn) => {
    btn.classList.toggle('loading', !!loading);
    btn.disabled = !!loading || activeRouteSelectionIds().length === 0;
  });
  const label = document.querySelector('#route-planner-panel .route-generate-btn .cp-label');
  if (label) label.textContent = getText(loading ? 'compass.planning' : 'route_planner.plan');
}

export function showRoutePlannerItinerary(itinerary, themeKey) {
  routePlannerState.itinerary = itinerary;
  routePlannerState.itineraryTheme = themeKey;
  openRoutePlanner(routePlannerState.activeTab || 'want');
}

export function clearRoutePlannerItinerary({ clearSelection = false } = {}) {
  routePlannerState.itinerary = null;
  routePlannerState.itineraryTheme = null;
  if (clearSelection) {
    routePlannerState.selectedIds.clear();
    routePlannerState.selectionOrder = [];
  }
  if (isRoutePlannerOpen()) renderRoutePlannerContent();
}

export function refreshRoutePlannerTexts() {
  const panel = document.getElementById('route-planner-panel');
  if (!panel) return;
  const head = panel.querySelector('.route-planner-head > div');
  if (head) {
    head.innerHTML = `
      <span class="route-planner-title">${esc(getText('route_planner.title'))}</span>
      <p>${esc(getText('route_planner.subtitle'))}</p>`;
  }
  if (isRoutePlannerOpen()) renderRoutePlannerContent();
}

function renderRoutePlannerContent() {
  const box = document.getElementById('route-planner-content');
  if (!box) return;
  const content =
    routePlannerState.activeTab === 'recommend'
      ? renderRecommendationTab()
      : renderFreeTab();
  box.innerHTML = `
    ${routePlannerResultHtml()}
    ${routePlannerTabsHtml()}
    ${content}`;

  box.querySelectorAll('[data-route-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      routePlannerState.activeTab = btn.dataset.routeTab || 'recommend';
      renderRoutePlannerContent();
    });
  });

  box.querySelectorAll('[data-route-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.routeAction;
      const anchorId = btn.dataset.anchorId;
      const anchor = ANCHORS.find((item) => item.id === anchorId);
      if (action === 'toggle-select') {
        setRoutePlannerSelected(anchorId, !routePlannerState.selectedIds.has(anchorId));
        renderRoutePlannerContent();
      } else if (action === 'clear-selection') {
        clearActiveRouteSelection();
        renderRoutePlannerContent();
      } else if (action === 'plan-route') {
        const ids = activeRouteSelectionIds();
        if (!ids.length) {
          showToast(getText('route_planner.no_selection'));
          return;
        }
        if (routePlannerState.handlers.onPlanRoute) {
          routePlannerState.handlers.onPlanRoute(
            'all',
            'walk',
            ids,
            { source: 'routePlanner' }
          );
        }
      } else if (action === 'view-anchor' && anchor && routePlannerState.handlers.onAnchorClick) {
        routePlannerState.handlers.onAnchorClick(anchor);
      } else if (action === 'nav-itinerary') {
        openMapUrl(buildRoutePlannerTencentUrl(routePlannerState.itinerary));
      } else if (action === 'nav-recommendation') {
        const route = ROUTE_PLANNER_RECOMMENDATIONS.find((item) => item.id === btn.dataset.recommendationId);
        openMapUrl(buildTencentSearchUrl(route && route.navKeyword));
      } else if (action === 'continue-select') {
        clearRoutePlannerItinerary();
      } else if (action === 'clear-route') {
        if (routePlannerState.handlers.onClearRoute) routePlannerState.handlers.onClearRoute();
        else clearRoutePlannerItinerary();
      } else if (action === 'go-nearby') {
        closeRoutePlanner();
        if (routePlannerState.handlers.onOpenNearby) routePlannerState.handlers.onOpenNearby();
      }
    });
  });
}

let compassState = {
  userPos: null,
  simulated: false,
  view: 'clues',
  clueItems: [],
  activeClueAnchorId: null,
  activeRouteTab: 'diy',
  routeMode: 'walk',
  itinerary: null,
  itineraryTheme: null,
  routeSelectedIds: new Set(),
  handlers: {},
};

const RECOMMENDED_ROUTES = [
  {
    id: 'sz-speed',
    icon: '🏙️',
    theme: 'reform',
    title: { zh: '深圳改革速度半日线', en: 'Shenzhen Reform Speed Half-Day Route' },
    desc: { zh: '从国贸到莲花山，再看资本市场与硬件街区。', en: 'From Guomao to Lianhua Mountain, capital markets and hardware streets.' },
    ids: ['N-EG01', 'M11', 'N-EG02', 'N-SC01'],
  },
  {
    id: 'tech-bay',
    icon: '🧪',
    theme: 'science',
    title: { zh: '南山科技创新线', en: 'Nanshan Tech Innovation Route' },
    desc: { zh: '腾讯、大疆、蛇口与前海，串起深圳创新走廊。', en: 'Tencent, DJI, Shekou and Qianhai connect Shenzhen’s innovation corridor.' },
    ids: ['N-SC02', 'N-SC03', 'M06', 'M08'],
  },
  {
    id: 'sea-silk',
    icon: '🧭',
    theme: 'navigation',
    title: { zh: '海上丝路记忆线', en: 'Maritime Silk Road Memory Route' },
    desc: { zh: '从赤湾祈风到深圳湾，再把视线推向古代海路。', en: 'From Chiwan prayers to Shenzhen Bay and ancient maritime routes.' },
    ids: ['M01', 'M07', 'M12', 'N-NA01'],
  },
];

const configuredCluesByAnchor = new Map(nearbyClues.map((clue) => [clue.anchorId, clue]));
const CLUE_COVER_FALLBACK = 'public/assets/clues/fallback-cover.webp';
const CLUE_COVER_VERSION = 'generated-20260701-dji-1';
const COMPASS_CLUE_LIMIT = 8;

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function pickClueText(field) {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  const lang = getLang();
  if (field[lang]) return field[lang];
  if (lang === 'zh') return field.zh || field.en || '';
  return field.en || field.zh || '';
}

function pickList(field) {
  const value = pickClueText(field);
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).split(/\s*\/\s*/).filter(Boolean);
}

function textIncludesAny(text, keywords) {
  const value = String(text || '').toLowerCase();
  return keywords.some((keyword) => value.includes(String(keyword).toLowerCase()));
}

function anchorText(anchor) {
  return [
    anchor.id,
    anchor.theme,
    anchor.contentType,
    anchor.name && anchor.name.zh,
    anchor.name && anchor.name.en,
    anchor.title && anchor.title.zh,
    anchor.title && anchor.title.en,
    anchor.hero && anchor.hero.zh,
    anchor.hero && anchor.hero.en,
    anchor.desc && anchor.desc.zh,
    anchor.desc && anchor.desc.en,
    anchor.checkinTag,
  ]
    .filter(Boolean)
    .join(' ');
}

function anchorNames(anchor) {
  return {
    zh: (anchor.name && (anchor.name.zh || anchor.name.en)) || anchor.id,
    en: (anchor.name && (anchor.name.en || anchor.name.zh)) || anchor.id,
  };
}

function pickFallbackTemplate(anchor) {
  const source = anchorText(anchor);
  if (textIncludesAny(source, ['红树林', '湿地', '生态', '候鸟', 'esg', 'mangrove', 'wetland', 'ecology'])) {
    return 'ecology';
  }
  if (textIncludesAny(source, ['证券', '资本', '金融', '交易所', '制度', '市场化', 'stock', 'capital', 'finance', 'exchange', 'institution', 'market reform'])) {
    return 'finance';
  }
  if (anchor.globalLinks && anchor.globalLinks.length) {
    return 'global';
  }
  if (textIncludesAny(source, ['科技', '电子', '硬件', '制造', '创新', '芯片', '工厂', '科学', 'tech', 'electronics', 'hardware', 'manufacturing', 'innovation', 'supply chain'])) {
    return 'tech';
  }
  if (textIncludesAny(source, ['铁路', '旧址', '档案', '工程', 'bridge', 'railway', 'archive', 'engineering'])) {
    return 'archive';
  }
  if (anchor.theme === 'reform') return 'reform';
  if (anchor.contentType === 'person' || textIncludesAny(source, ['人物', '见证', 'founder', 'pioneer', 'builder'])) {
    return 'character';
  }
  if (textIncludesAny(source, ['古城', '古港', '港口', '地名', '天后', '庙', 'temple', 'harbor', 'port', 'ancient', 'old'])) {
    return 'place';
  }
  if (anchor.theme === 'navigation' || anchor.theme === 'civilization') return 'place';
  return 'city';
}

function generatedClueByTemplate(anchor, templateKey) {
  const name = anchorNames(anchor);
  const generatedBackground =
    anchor && /generated/i.test(String(anchor.imageLicense || ''))
      ? anchor.placeImage || anchor.heroImage || ''
      : '';
  const common = {
    id: `clue_generated_${anchor.id}`,
    anchorId: anchor.id,
    distancePrefix: { zh: '', en: '' },
    backgroundImage: generatedBackground,
    accentColor: '#3f7d6e',
    manual: false,
    weak: false,
  };
  const templates = {
    reform: {
      type: 'character',
      typeLabel: { zh: '人物线索', en: 'Character Clue' },
      title: { zh: `${name.zh}为什么会留下改革记忆？`, en: `Why does ${name.en} hold a memory of reform?` },
      visualStyleTag: 'reform_witness',
      accentColor: '#b06b36',
      hook: {
        zh: '这里留下了一段关于深圳如何走向开放前沿的记忆。',
        en: 'A memory of how Shenzhen moved toward the front line of opening is waiting for your questions.',
      },
      question: {
        zh: '为什么深圳会成为中国改革开放的重要窗口？',
        en: 'Why did Shenzhen become an important window of reform and opening?',
      },
      reward: { zh: ['改革记忆知识卡'], en: ['Reform Memory Card'] },
      cta: { zh: '追寻记忆', en: 'Trace the Memory' },
      priority: 68,
    },
    finance: {
      type: 'archive',
      typeLabel: { zh: '档案线索', en: 'Archive Clue' },
      title: { zh: '这份制度实验档案为什么缺了一页？', en: 'Why is a page missing from this institutional experiment archive?' },
      visualStyleTag: 'sealed_archive',
      accentColor: '#2f8f80',
      hook: {
        zh: '一份关于制度创新的档案缺少了关键一页。',
        en: 'An archive about institutional innovation is missing a key page, pointing to a real anchor nearby.',
      },
      question: {
        zh: '这个地点如何见证中国市场化改革的一次重要实验？',
        en: 'How did this place witness an important experiment in China’s market-oriented reform?',
      },
      reward: { zh: ['制度实验知识卡'], en: ['Institutional Experiment Card'] },
      cta: { zh: '展开档案', en: 'Open Archive' },
      priority: 70,
    },
    tech: {
      type: 'object',
      typeLabel: { zh: '器物线索', en: 'Object Clue' },
      title: { zh: '一件普通器物为什么能连向全球网络？', en: 'Why can an ordinary object lead into a global network?' },
      visualStyleTag: 'component_network',
      accentColor: '#287f8f',
      hook: {
        zh: '一件看似普通的器物，连接着制造、创业、供应链与全球市场。',
        en: 'A seemingly ordinary object connects manufacturing, entrepreneurship, supply chains and global markets.',
      },
      question: {
        zh: '深圳为什么能形成面向世界的科技创新生态？',
        en: 'Why could Shenzhen form a technology innovation ecosystem facing the world?',
      },
      reward: { zh: ['科技创新知识卡'], en: ['Tech Innovation Card'] },
      cta: { zh: '追踪器物', en: 'Trace the Object' },
      priority: 66,
    },
    ecology: {
      type: 'city-question',
      typeLabel: { zh: '城市问题', en: 'City Question' },
      title: { zh: '高速发展的城市为什么还要保留自然记忆？', en: 'Why does a fast-growing city keep a memory of nature?' },
      visualStyleTag: 'green_question',
      accentColor: '#3f7d6e',
      hook: {
        zh: '在高速发展的城市中，有一片自然记忆被保留下来，它提出了一个关于发展的选择题。',
        en: 'Inside a fast-growing city, a piece of natural memory remains and poses a choice about development.',
      },
      question: {
        zh: '现代城市如何在发展与生态之间寻找平衡？',
        en: 'How can a modern city balance development and ecology?',
      },
      reward: { zh: ['生态城市知识卡'], en: ['Eco-City Card'] },
      cta: { zh: '调查问题', en: 'Investigate the Question' },
      priority: 64,
    },
    place: {
      type: 'place-name',
      typeLabel: { zh: '地名线索', en: 'Place Name Clue' },
      title: { zh: '这个地名背后藏着怎样的城市来路？', en: 'What earlier path is hidden inside this place name?' },
      visualStyleTag: 'old_map',
      accentColor: '#9a7b32',
      hook: {
        zh: '一个地名保留了城市更早的来路，线索藏在地图与记忆之间。',
        en: 'A place name preserves an earlier path into the city, with clues hidden between maps and memory.',
      },
      question: {
        zh: '这个地方如何帮助你理解深圳更早的历史？',
        en: 'How can this place help you understand Shenzhen’s earlier history?',
      },
      reward: { zh: ['城市来路知识卡'], en: ['City Origins Card'] },
      cta: { zh: '打开地图', en: 'Open the Map' },
      priority: 62,
    },
    character: {
      type: 'character',
      typeLabel: { zh: '人物线索', en: 'Character Clue' },
      title: { zh: `${name.zh}为什么留下了一段未完讲述？`, en: `Why did ${name.en} leave an unfinished story?` },
      visualStyleTag: 'witness_memory',
      accentColor: '#b06b36',
      hook: {
        zh: '一位见证者留下了一段未讲完的记忆。',
        en: 'A witness left behind an unfinished memory, waiting for your next question.',
      },
      question: {
        zh: '这个人物如何影响了这座城市的精神？',
        en: 'How did this figure shape the spirit of the city?',
      },
      reward: { zh: ['见证者知识卡'], en: ['Witness Card'] },
      cta: { zh: '追问见证者', en: 'Question the Witness' },
      priority: 60,
    },
    archive: {
      type: 'archive',
      typeLabel: { zh: '档案线索', en: 'Archive Clue' },
      title: { zh: '这段城市记忆为什么留下了空白？', en: 'Why did this urban memory leave a blank page?' },
      visualStyleTag: 'missing_record',
      accentColor: '#2f8f80',
      hook: {
        zh: '一段关键记录留下了空白，线索正把你带向这座城市的一个真实现场。',
        en: 'A key record has left a blank, leading you toward a real site in the city.',
      },
      question: {
        zh: '这段记录如何改变人们理解深圳的方式？',
        en: 'How does this record change the way people understand Shenzhen?',
      },
      reward: { zh: ['历史档案知识卡'], en: ['Historical Archive Card'] },
      cta: { zh: '展开档案', en: 'Open Archive' },
      priority: 58,
    },
    global: {
      type: 'global-link',
      typeLabel: { zh: '世界连接', en: 'Global Link' },
      title: { zh: '这个地点如何把深圳连接到世界？', en: 'How does this place connect Shenzhen to the world?' },
      visualStyleTag: 'global_echo',
      accentColor: '#3c8c9d',
      hook: {
        zh: '这个地点把本地选择连接到更大的世界网络。',
        en: 'This place connects a local choice to a wider world network, waiting for you to inspect its echoes.',
      },
      question: {
        zh: '这个地点如何连接中国与世界？',
        en: 'How does this place connect China with the world?',
      },
      reward: { zh: ['世界连接知识卡'], en: ['Global Link Card'] },
      cta: { zh: '查看回响', en: 'View the Echo' },
      priority: 67,
    },
    city: {
      type: 'city-question',
      typeLabel: { zh: '城市问题', en: 'City Question' },
      title: { zh: `${name.zh}留下了什么城市问题？`, en: `What urban question does ${name.en} leave behind?` },
      visualStyleTag: 'urban_question',
      accentColor: '#3f7d6e',
      hook: {
        zh: '这处真实地点留下了一个关于城市选择的问题。',
        en: 'This real place leaves a question about urban choices, waiting for you to keep investigating.',
      },
      question: {
        zh: '这个地点揭示了深圳发展的哪一次关键选择？',
        en: 'What key choice in Shenzhen’s development does this place reveal?',
      },
      reward: { zh: ['城市问题知识卡'], en: ['Urban Question Card'] },
      cta: { zh: '调查问题', en: 'Investigate the Question' },
      priority: 55,
    },
  };
  return { ...common, ...templates[templateKey] };
}

function makeFallbackClue(anchor) {
  if (anchor && (anchor.name || anchor.title || anchor.desc)) {
    return generatedClueByTemplate(anchor, pickFallbackTemplate(anchor));
  }
  return {
    ...generatedClueByTemplate(anchor || { id: 'unknown', name: { zh: '未知锚点', en: 'Unknown Anchor' } }, 'city'),
    weak: true,
    priority: 12,
  };
}

function getClueForAnchor(anchor) {
  const manual = configuredCluesByAnchor.get(anchor.id);
  return manual ? { ...manual, manual: true, weak: false } : makeFallbackClue(anchor);
}

function formatClueDistance(km, clue) {
  if (km == null || !Number.isFinite(km)) return pickClueText(clue.distancePrefix);
  const zh = getLang() === 'zh';
  if (km < 1) {
    const meters = Math.max(1, Math.round(km * 1000));
    return zh ? `${meters}m 处` : `${meters}m away`;
  }
  return zh ? `${km.toFixed(1)}km 处` : `${km.toFixed(1)}km away`;
}

function compareNearbyClueItems(a, b) {
  const aDist = Number.isFinite(a.dist) ? a.dist : Number.POSITIVE_INFINITY;
  const bDist = Number.isFinite(b.dist) ? b.dist : Number.POSITIVE_INFINITY;
  const distDelta = aDist - bDist;
  if (Math.abs(distDelta) > 0.3) return distDelta;

  const tieBias = (item) => {
    const manualBias = item.clue && item.clue.manual ? 0.035 : 0;
    const episodeBias = hasEpisode(item.anchor.id) ? 0.02 : 0;
    const priorityBias = (clampScore(item.clue.priority == null ? 50 : item.clue.priority) / 100) * 0.015;
    return manualBias + episodeBias + priorityBias;
  };
  const adjustedDelta = (aDist - tieBias(a)) - (bDist - tieBias(b));
  if (Math.abs(adjustedDelta) > 0.001) return adjustedDelta;

  return distDelta;
}

function computeCompassClues() {
  if (!compassState.userPos || !_haversine) return [];
  const [ulng, ulat] = compassState.userPos;
  const items = ANCHORS.map((anchor) => {
    const clue = getClueForAnchor(anchor);
    const dist = _haversine(ulng, ulat, anchor.coordinates[0], anchor.coordinates[1]);
    return {
      anchor,
      clue,
      dist,
    };
  }).sort(compareNearbyClueItems);
  const strong = items.filter((item) => !item.clue.weak);
  if (strong.length >= COMPASS_CLUE_LIMIT) return strong.slice(0, COMPASS_CLUE_LIMIT);
  return strong.concat(items.filter((item) => item.clue.weak)).slice(0, COMPASS_CLUE_LIMIT);
}

function getCompassAreaLabel() {
  if (!compassState.userPos) return getText('clues.area_current');
  const [lng, lat] = compassState.userPos;
  const nearCivicCenter = lng >= 114.035 && lng <= 114.07 && lat >= 22.532 && lat <= 22.56;
  return nearCivicCenter ? getText('clues.area_civic') : getText('clues.area_current');
}

export function renderCompassPanel(root, handlers = {}) {
  compassState.handlers = handlers;
  const el = document.createElement('aside');
  el.id = 'compass-panel';
  el.innerHTML = `
    <div class="compass-card">
      <div class="compass-head">
        <div class="compass-title">
          <span class="compass-title-main">${esc(getText('clues.title'))}</span>
          <span class="compass-title-sub">${esc(getText('clues.title_secondary'))}</span>
        </div>
        <button class="close-btn" id="compass-close" style="position:static;width:30px;height:30px">✕</button>
      </div>
      <div class="compass-content" id="compass-content"></div>
    </div>`;
  root.appendChild(el);
  el.querySelector('#compass-close').addEventListener('click', closeCompassPanel);
}

export function openCompassPanel() {
  const el = document.getElementById('compass-panel');
  compassState.view = 'clues';
  document.body.classList.add('compass-panel-open');
  if (el) el.classList.add('open');
  renderCompassContent();
}
export function closeCompassPanel() {
  const el = document.getElementById('compass-panel');
  if (el) el.classList.remove('open');
  document.body.classList.remove('compass-panel-open');
  if (compassState.handlers.onClose) compassState.handlers.onClose();
}
export function isCompassOpen() {
  const el = document.getElementById('compass-panel');
  return el && el.classList.contains('open');
}

export function isCompassShowingClues() {
  return compassState.view === 'clues';
}

export function getCompassClueIds() {
  return new Set(compassState.clueItems.map((item) => item.anchor.id));
}

export function focusCompassClue(anchorId) {
  if (!anchorId) return;
  compassState.view = 'clues';
  compassState.activeClueAnchorId = anchorId;
  if (!isCompassOpen()) {
    const el = document.getElementById('compass-panel');
    if (el) el.classList.add('open');
  }
  renderCompassContent();
  requestAnimationFrame(() => {
    const card = Array.from(document.querySelectorAll('#compass-panel .clue-card')).find(
      (item) => item.dataset.anchorId === anchorId
    );
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/** 设置罗盘定位状态（实时 / 模拟）并刷新内容 */
export function setCompassLocation({ lng, lat, simulated }) {
  compassState.userPos = [lng, lat];
  compassState.simulated = !!simulated;
  renderCompassContent();
}

function renderCompassContent() {
  const box = document.getElementById('compass-content');
  if (!box) return;
  if (!compassState.userPos || !_haversine) {
    box.innerHTML = `<div class="compass-hint">${esc(getText('compass.locating'))}</div>`;
    return;
  }
  const [ulng, ulat] = compassState.userPos;
  const items = ANCHORS.map((a) => ({
    anchor: a,
    dist: _haversine(ulng, ulat, a.coordinates[0], a.coordinates[1]),
  }))
    .sort((x, y) => x.dist - y.dist);
  compassState.clueItems = computeCompassClues();

  if (compassState.view !== 'free') {
    renderClueContent(box);
    return;
  }

  renderFreeExploreContent(box, items);
}

function sentenceEnd(text) {
  const value = String(text || '').trim().replace(/[。.!?？]+$/, '');
  if (!value) return '';
  return getLang() === 'zh' ? `${value}。` : `${value}.`;
}

function normalizeClueHook(text) {
  let value = String(text || '').trim();
  value = value
    .replace(/[，,]\s*等待你(?:修复|追问|继续追问|调查|查看它的回响|进一步了解)?[。.]?$/u, '')
    .replace(/[，,]\s*等待你沿着线索继续调查[。.]?$/u, '');
  return sentenceEnd(value);
}

function normalizeClueQuestion(text) {
  const value = String(text || '').trim().replace(/[？?]+$/, '');
  if (getLang() !== 'zh') return value;
  return value.replace(/^为什么(.{1,12}?)(会|被|能|是|成为)/u, '$1为什么$2');
}

function actionBridgeForClue(clue) {
  const zh = getLang() === 'zh';
  const bridges = {
    archive: zh ? '展开它，看看' : 'Open it to see ',
    character: zh ? '追寻这段记忆，理解' : 'Trace the memory to understand ',
    object: zh ? '追踪它，理解' : 'Trace it to understand ',
    'city-question': zh ? '调查这个问题，理解' : 'Investigate the question to understand ',
    'place-name': zh ? '打开这张地图，理解' : 'Open the map to understand ',
    'global-link': zh ? '查看它的回响，理解' : 'Follow its echoes to understand ',
  };
  return bridges[clue.type] || (zh ? '沿着线索，理解' : 'Follow the clue to understand ');
}

function mergedClueDescription(clue) {
  const explicit = pickClueText(clue.mergedDescription);
  if (explicit) return explicit;
  const hook = normalizeClueHook(pickClueText(clue.hook));
  const question = normalizeClueQuestion(pickClueText(clue.question));
  if (!question) return hook || pickClueText(clue.hook);
  const bridge = actionBridgeForClue(clue);
  if (getLang() === 'zh') return `${hook}${bridge}${question}。`;
  const lowerQuestion = question.charAt(0).toLowerCase() + question.slice(1);
  return `${hook} ${bridge}${lowerQuestion}.`;
}

function clueMissionTitle(clue) {
  const title = (pickClueText(clue.mission) || pickClueText(clue.title)).trim();
  if (!title) return getLang() === 'zh' ? '调查这处地点留下的关键线索' : 'Investigate the key clue left by this place';
  return title;
}

function clueVisualTag(clue) {
  return String(pickClueText(clue.visualStyleTag) || clue.type || 'quest').trim();
}

function cssAssetUrl(path) {
  const value = String(path || '').trim();
  if (!value) return '';
  if (/^(https?:|data:)/i.test(value)) return value;
  const normalized = value.replace(/^\.?\//, '');
  const publicPath = normalized.startsWith('assets/')
    ? `public/${normalized}`
    : normalized;
  try {
    return new URL(publicPath, document.baseURI).href;
  } catch (e) {
    return publicPath;
  }
}

function clueCoverImage(anchor, clue) {
  const cover = cssAssetUrl(pickClueText(clue.coverImage)) || cssAssetUrl(`/assets/clues/${anchor.id}-cover.webp`);
  if (!cover || cover.includes('?')) return cover;
  try {
    const url = new URL(cover, document.baseURI);
    if (!url.pathname.includes('/public/assets/clues/')) return cover;
    url.searchParams.set('v', CLUE_COVER_VERSION);
    return url.href;
  } catch (e) {
    if (!cover.includes('/public/assets/clues/')) return cover;
    return `${cover}?v=${CLUE_COVER_VERSION}`;
  }
}

function clueCardStyle(theme, clue, anchor) {
  const accent = pickClueText(clue.accentColor) || theme.color || '#3f7d6e';
  const coverImage = cssAssetUrl(clueCoverImage(anchor, clue));
  const backgroundImage = cssAssetUrl(pickClueText(clue.backgroundImage));
  const coverVar = coverImage ? `--clue-cover-image:url(&quot;${esc(coverImage)}&quot;);` : '';
  const fallbackImage = cssAssetUrl(CLUE_COVER_FALLBACK);
  const backgroundVar = backgroundImage ? `--clue-bg-image:url(&quot;${esc(backgroundImage)}&quot;);` : `--clue-bg-image:url(&quot;${esc(fallbackImage)}&quot;);`;
  return `--clue-accent:${theme.color};--clue-task-accent:${accent};${coverVar}${backgroundVar}`;
}

function renderClueContent(box) {
  const clueItems = compassState.clueItems;
  if (!clueItems.length) {
    box.innerHTML = `<div class="compass-hint">${esc(getText('clues.empty'))}</div>`;
    return;
  }

  const cards = clueItems
    .map(({ anchor, clue, dist }, index) => {
      const theme = THEMES[anchor.theme] || OVERVIEW_MODE;
      const completed = isCompleted(anchor.id);
      const active = compassState.activeClueAnchorId === anchor.id;
      const softBackground = clue.softBackground ? 'soft-background' : '';
      return `
        <article class="clue-card ${index === 0 ? 'recommended' : ''} ${active ? 'active' : ''} ${completed ? 'completed' : ''} ${softBackground}" data-anchor-id="${anchor.id}" data-visual="${esc(clueVisualTag(clue))}" style="${clueCardStyle(theme, clue, anchor)}">
          <div class="clue-card-body">
            <button class="clue-card-open" data-anchor-id="${anchor.id}">
              <span class="clue-card-top">
                <span class="clue-type clue-type-${esc(clue.type)}">${esc(pickClueText(clue.typeLabel))}</span>
                <span class="clue-distance">${esc(formatClueDistance(dist, clue))}</span>
              </span>
              <span class="clue-place-title">${esc(pick(anchor.name))}</span>
              <span class="clue-mission">${esc(clueMissionTitle(clue))}</span>
              <span class="clue-description">${esc(mergedClueDescription(clue))}</span>
            </button>
            <button class="clue-cta" data-anchor-id="${anchor.id}">
              <span>${esc(completed ? getText('clues.revisit_cta') : pickClueText(clue.cta))}</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </article>`;
    })
    .join('');

  box.innerHTML = `
    <section class="clue-brief">
      <p>${esc(getText('clues.subtitle', { count: clueItems.length }))}</p>
    </section>
    <div class="nearby-clue-list">${cards}</div>`;

  const startClue = (anchorId) => {
    const item = clueItems.find((candidate) => candidate.anchor.id === anchorId);
    if (!item) return;
    compassState.activeClueAnchorId = anchorId;
    if (compassState.handlers.onClueStart) {
      compassState.handlers.onClueStart(item.anchor, item.clue);
    }
  };

  box.querySelectorAll('.clue-card').forEach((card) => {
    const anchorId = card.dataset.anchorId;
    card.addEventListener('mouseenter', () => {
      if (compassState.handlers.onClueHover) compassState.handlers.onClueHover(anchorId);
    });
    card.addEventListener('mouseleave', () => {
      if (compassState.handlers.onClueHover) compassState.handlers.onClueHover(null);
    });
    card.addEventListener('focusin', () => {
      if (compassState.handlers.onClueHover) compassState.handlers.onClueHover(anchorId);
    });
    card.addEventListener('focusout', () => {
      if (compassState.handlers.onClueHover) compassState.handlers.onClueHover(null);
    });
  });

  box.querySelectorAll('.clue-card-open, .clue-cta').forEach((btn) => {
    btn.addEventListener('click', () => startClue(btn.dataset.anchorId));
  });
}

function renderFreeExploreContent(box, items) {
  const selectedAnchors = ANCHORS.filter((anchor) => compassState.routeSelectedIds.has(anchor.id));
  const selectedCount = selectedAnchors.length;
  const nearbyRouteItems = items.filter((item) => item.dist <= 20).slice(0, 24);
  const routeItems = nearbyRouteItems.length ? nearbyRouteItems : items.slice(0, 24);
  const tabBtns = [
    ['diy', getText('compass.diy_tab')],
    ['recommended', getText('compass.recommend_tab')],
  ]
    .map(
      ([key, label]) =>
        `<button class="compass-tab ${compassState.activeRouteTab === key ? 'active' : ''}" data-tab="${key}">${esc(label)}</button>`
    )
    .join('');
  const itineraryHtml = `<div class="route-card-wrap" id="compass-itinerary"></div>`;

  const routeBar = `
    <div class="free-explore-head">
      <button class="free-back" id="free-back">← ${esc(getText('clues.back_to_clues'))}</button>
      <span>${esc(getText('clues.free_title'))}</span>
    </div>
    <div class="compass-route-bar">
      <div class="compass-tabs">${tabBtns}</div>
    </div>`;

  const diyContent = `
    <section class="compass-diy-panel">
      <div class="compass-diy-meta">
        <span class="compass-near-title">${esc(getText('compass.diy_title'))}</span>
        <span class="rt-selected-count">${esc(getText('route.selected', { count: selectedCount }))}</span>
      </div>
      <div class="compass-route-hint">${esc(getText('compass.select_hint'))}</div>
      ${
        selectedCount
          ? `<div class="rt-diy-actions">
              <button class="rt-select-action" id="route-clear-selection">${esc(getText('route.clear_selected'))}</button>
              <button class="rt-plan-btn" id="compass-plan-btn">
                <span class="cp-label">${esc(getText('compass.plan_btn'))}</span>
              </button>
            </div>`
          : ''
      }
    </section>
    <div class="compass-near-list compass-anchor-list">
      ${routeItems
        .map(({ anchor, dist }) => {
          const theme = THEMES[anchor.theme] || OVERVIEW_MODE;
          const active = compassState.routeSelectedIds.has(anchor.id);
          return `
          <article class="compass-near-item ${active ? 'selected' : ''}">
            <button class="compass-anchor-info" data-id="${anchor.id}">
              <span class="cn-body">
                <span class="cn-top">
                  <span class="cn-dot" style="background:${theme.color};box-shadow:0 0 6px ${theme.color}"></span>
                  <span class="cn-name">${esc(pick(anchor.name))}</span>
                  <span class="cn-dist">${fmtDist(dist)}</span>
                </span>
                <span class="cn-title">${esc(pick(anchor.title))}</span>
              </span>
            </button>
            <button class="compass-anchor-select" data-id="${anchor.id}" role="checkbox" aria-checked="${active}" aria-label="${esc(pick(anchor.name))}">
              ${active ? '✓' : ''}
            </button>
          </article>`;
        })
        .join('')}
    </div>`;

  const recommendedContent = `
    <section class="compass-rec-panel">
      <div class="compass-near-title">${esc(getText('compass.recommend_title'))}</div>
      <div class="compass-route-hint">${esc(getText('compass.recommend_hint'))}</div>
      <div class="compass-rec-list">
        ${RECOMMENDED_ROUTES.map((route) => {
          const theme = THEMES[route.theme] || OVERVIEW_MODE;
          const anchors = route.ids.map((id) => ANCHORS.find((anchor) => anchor.id === id)).filter(Boolean);
          const stopNames = anchors.map((anchor) => pick(anchor.name)).join(' · ');
          return `
            <article class="rec-route-card" style="--rr-accent:${theme.color}">
              <div class="rr-head">
                <span class="rr-icon">${route.icon}</span>
                <span class="rr-title">${esc(pick(route.title))}</span>
                <span class="rr-count">${anchors.length} ${esc(getText('route.stops'))}</span>
              </div>
              <p class="rr-desc">${esc(pick(route.desc))}</p>
              <div class="rr-stops">${esc(stopNames)}</div>
              <button class="rec-plan-btn" data-route-id="${route.id}">
                <span>${esc(getText('compass.recommend_use'))}</span>
                <span aria-hidden="true">→</span>
              </button>
            </article>`;
        }).join('')}
      </div>
    </section>`;

  box.innerHTML = `
    ${routeBar}
    ${itineraryHtml}
    ${compassState.activeRouteTab === 'recommended' ? recommendedContent : diyContent}`;

  const backBtn = box.querySelector('#free-back');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      compassState.view = 'clues';
      if (compassState.handlers.onExploreModeChange) compassState.handlers.onExploreModeChange('clues');
      renderCompassContent();
    });
  }

  box.querySelectorAll('.compass-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      compassState.activeRouteTab = tab.dataset.tab || 'diy';
      renderCompassContent();
    });
  });
  box.querySelectorAll('.compass-anchor-info').forEach((btn) => {
    btn.addEventListener('click', () => {
      const a = ANCHORS.find((x) => x.id === btn.dataset.id);
      if (a && compassState.handlers.onAnchorClick) compassState.handlers.onAnchorClick(a);
    });
  });
  box.querySelectorAll('.compass-anchor-select').forEach((option) => {
    option.addEventListener('click', () => {
      const id = option.dataset.id;
      if (compassState.routeSelectedIds.has(id)) compassState.routeSelectedIds.delete(id);
      else compassState.routeSelectedIds.add(id);
      renderCompassContent();
    });
  });
  const clearSelection = box.querySelector('#route-clear-selection');
  if (clearSelection) clearSelection.addEventListener('click', () => {
    compassState.routeSelectedIds.clear();
    renderCompassContent();
  });
  const planBtn = box.querySelector('#compass-plan-btn');
  if (planBtn) planBtn.addEventListener('click', () => {
    if (compassState.handlers.onPlanRoute) {
      compassState.handlers.onPlanRoute('all', compassState.routeMode, selectedAnchors.map((anchor) => anchor.id));
    }
  });
  box.querySelectorAll('.rec-plan-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = RECOMMENDED_ROUTES.find((item) => item.id === btn.dataset.routeId);
      if (!route || !compassState.handlers.onPlanRoute) return;
      const ids = route.ids.filter((id) => ANCHORS.some((anchor) => anchor.id === id));
      compassState.handlers.onPlanRoute(route.theme || 'all', compassState.routeMode, ids, { presetId: route.id });
    });
  });
  if (compassState.itinerary) {
    renderItineraryInto(
      document.getElementById('compass-itinerary'),
      compassState.itinerary,
      compassState.itineraryTheme
    );
  }
}

/** 路线规划 loading 态 */
export function setCompassPlanning(loading) {
  const buttons = document.querySelectorAll('#compass-panel .rt-plan-btn, #compass-panel .rec-plan-btn');
  buttons.forEach((btn) => {
    btn.classList.toggle('loading', !!loading);
    if (loading) btn.disabled = true;
    else if (btn.id === 'compass-plan-btn') btn.disabled = compassState.routeSelectedIds.size === 0;
    else btn.disabled = false;
  });
  const label = document.querySelector('#compass-plan-btn .cp-label');
  if (label) label.textContent = getText(loading ? 'compass.planning' : 'compass.plan_btn');
}

/** 展示行程卡片（main.js 计算好 itinerary 后调用）*/
export function showItinerary(itinerary, themeKey) {
  compassState.itinerary = itinerary;
  compassState.itineraryTheme = themeKey;
  renderCompassContent();
}

/** 清除行程卡片 */
export function clearItinerary() {
  compassState.itinerary = null;
  compassState.itineraryTheme = null;
  if (isCompassOpen()) renderCompassContent();
}

function renderItineraryInto(box, itinerary, themeKey) {
  if (!box || !itinerary) return;
  const meta = themeKey === 'all' || !themeKey ? OVERVIEW_MODE : (THEMES[themeKey] || OVERVIEW_MODE);
  if (!itinerary.stops.length) {
    box.innerHTML = `<div class="compass-hint">${esc(getText('route.empty'))}</div>`;
    return;
  }
  const stops = itinerary.stops
    .map(
      (s) => `
      <button class="route-stop" data-id="${s.anchor.id}">
        <span class="rs-index" style="background:${meta.color}">${s.index}</span>
        <span class="rs-body">
          <span class="rs-name">${esc(pick(s.anchor.name))}</span>
          <span class="rs-meta">+${fmtDist(s.legKm)} · ⏱ ${fmtDuration(s.cumMin)}</span>
        </span>
        <span class="rs-go">→</span>
      </button>`
    )
    .join('');
  box.innerHTML = `
    <div class="route-card" style="--rc-accent:${meta.color}">
      <div class="route-card-head">
        <span class="rc-title font-brush">${esc(getText('route.title'))}</span>
        <span class="rc-source ${itinerary.straight ? 'straight' : 'real'}">${esc(
          getText(
            itinerary.straight
              ? 'route.straight'
              : itinerary.source === 'tencent'
                ? 'route.tencent'
                : itinerary.source === 'osrm'
                  ? 'route.osrm'
                  : 'route.real_road'
          )
        )}</span>
      </div>
      <div class="route-stat">
        <div class="rc-stat-item">
          <span class="rc-stat-num">${itinerary.totalKm.toFixed(1)}<span class="rc-stat-unit">${esc(getText('nearby.km'))}</span></span>
          <span class="rc-stat-label">${esc(getText('route.total_dist'))}</span>
        </div>
        <div class="rc-stat-sep"></div>
        <div class="rc-stat-item">
          <span class="rc-stat-num">${fmtDuration(itinerary.totalMin)}</span>
          <span class="rc-stat-label">${esc(getText('route.total_time'))} · ${itinerary.stops.length} ${esc(getText('route.stops'))}</span>
        </div>
      </div>
      <div class="route-start">📍 ${esc(getText('route.start'))}</div>
      <div class="route-stops">${stops}</div>
      <p class="route-nav-hint">${esc(getText('route.nav_hint'))}</p>
      <div class="route-actions">
        <button class="route-nav" id="route-open-tencent">${esc(getText('route.open_tencent'))}</button>
        <button class="route-clear" id="route-clear">${esc(getText('route.clear'))}</button>
      </div>
    </div>`;
  box.querySelectorAll('.route-stop').forEach((btn) => {
    btn.addEventListener('click', () => {
      const a = ANCHORS.find((x) => x.id === btn.dataset.id);
      if (a && compassState.handlers.onAnchorClick) compassState.handlers.onAnchorClick(a);
    });
  });
  const clr = box.querySelector('#route-clear');
  if (clr)
    clr.addEventListener('click', () => {
      if (compassState.handlers.onClearRoute) compassState.handlers.onClearRoute();
    });
  const nav = box.querySelector('#route-open-tencent');
  if (nav)
    nav.addEventListener('click', () => {
      const url = buildTencentRouteUrl(itinerary);
      if (url) window.open(url, '_blank', 'noopener');
    });
}

function buildTencentRouteUrl(itinerary) {
  const lastStop = itinerary && itinerary.stops && itinerary.stops[itinerary.stops.length - 1];
  if (!compassState.userPos || !lastStop) return '';
  const [fromLng, fromLat] = compassState.userPos;
  const [toLng, toLat] = lastStop.anchor.coordinates;
  const params = new URLSearchParams({
    type: itinerary.modeKey === 'drive' ? 'drive' : 'walk',
    from: getText('route.start_short'),
    fromcoord: `${fromLat.toFixed(6)},${fromLng.toFixed(6)}`,
    to: pick(lastStop.anchor.name),
    tocoord: `${toLat.toFixed(6)},${toLng.toFixed(6)}`,
    referer: 'shikongluopan',
  });
  if (itinerary.modeKey === 'drive') params.set('policy', '0');
  return `https://apis.map.qq.com/uri/v1/routeplan?${params.toString()}`;
}

let clueScanTimer = null;

export function playClueScanTransition(message) {
  let layer = document.getElementById('clue-scan-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'clue-scan-layer';
    layer.className = 'clue-scan-layer';
    document.body.appendChild(layer);
  }
  layer.innerHTML = `
    <div class="clue-scan-reticle" aria-hidden="true">
      <span class="scan-ring scan-ring-1"></span>
      <span class="scan-ring scan-ring-2"></span>
      <span class="scan-ring scan-ring-3"></span>
      <span class="scan-sweep"></span>
      <span class="scan-point scan-point-a"></span>
      <span class="scan-point scan-point-b"></span>
      <span class="scan-point scan-point-c"></span>
    </div>
    <div class="clue-scan-text">${esc(message || getText('clues.scanning'))}</div>`;
  layer.classList.remove('settle');
  requestAnimationFrame(() => layer.classList.add('show'));
  if (clueScanTimer) clearTimeout(clueScanTimer);
  return new Promise((resolve) => {
    clueScanTimer = window.setTimeout(() => {
      layer.classList.add('settle');
      layer.classList.remove('show');
      clueScanTimer = window.setTimeout(() => {
        layer.classList.remove('settle');
        resolve();
      }, 260);
    }, 1050);
  });
}

export function openClueCompleteFeedback(anchor, clue, handlers = {}) {
  let modal = document.getElementById('clue-complete-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'clue-complete-modal';
    document.body.appendChild(modal);
  }
  const rewards = pickList(clue.reward);
  const wanted = isWantToVisit(anchor.id);
  modal.innerHTML = `
    <div class="clue-complete-card">
      <div class="clue-complete-seal">${esc(getText('clues.repaired_seal'))}</div>
      <div class="clue-complete-copy">
        <span class="clue-complete-kicker">${esc(getText('clues.repaired_kicker'))}</span>
        <h2>${esc(getText('clues.repaired_title'))}</h2>
        <p>${esc(getText('clues.repaired_body'))}</p>
      </div>
      <div class="clue-reveal-row">
        <span>${esc(getText('clues.real_anchor'))}</span>
        <b>${esc(pick(anchor.name))}</b>
      </div>
      <div class="clue-want-note">
        <b>${esc(getText('want.story_place', { name: pick(anchor.name) }))}</b>
        <p>${esc(getText('want.story_hint'))}</p>
      </div>
      <div class="clue-earned">
        <span>${esc(getText('clues.earned'))}</span>
        <div class="clue-rewards">
          ${rewards.map((reward) => `<span>${esc(reward)}</span>`).join('')}
        </div>
      </div>
      <div class="clue-complete-actions">
        <button class="clue-complete-secondary" id="clue-continue">${esc(getText('route_planner.continue_explore'))}</button>
        <button class="clue-complete-secondary" id="clue-plan-route">${esc(getText('route_planner.go_plan'))}</button>
        <button class="clue-complete-primary ${wanted ? 'active' : ''}" id="clue-want-toggle">${esc(wantToggleLabel(anchor.id, true))}</button>
      </div>
    </div>`;
  modal.classList.add('open');

  const close = () => modal.classList.remove('open');
  const continueBtn = modal.querySelector('#clue-continue');
  const planBtn = modal.querySelector('#clue-plan-route');
  const wantBtn = modal.querySelector('#clue-want-toggle');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      close();
      if (handlers.onContinue) handlers.onContinue(anchor, clue);
    });
  }
  if (planBtn) {
    planBtn.addEventListener('click', () => {
      if (!isWantToVisit(anchor.id)) addWantToVisit(anchor.id);
      close();
      if (handlers.onPlanRoute) handlers.onPlanRoute(anchor, clue);
    });
  }
  bindWantToggle(wantBtn, anchor, { longLabel: true });
}

/** 语言切换时刷新罗盘面板文案 */
export function refreshCompassTexts() {
  const panel = document.getElementById('compass-panel');
  if (!panel) return;
  const title = panel.querySelector('.compass-title');
  if (title) {
    title.innerHTML = `
      <span class="compass-title-main">${esc(getText('clues.title'))}</span>
      <span class="compass-title-sub">${esc(getText('clues.title_secondary'))}</span>`;
  }
  if (compassState.userPos) {
    setCompassLocation({
      lng: compassState.userPos[0],
      lat: compassState.userPos[1],
      simulated: compassState.simulated,
    });
  } else {
    renderCompassContent();
  }
}
