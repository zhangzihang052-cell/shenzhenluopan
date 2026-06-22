// UI 模块 v2：标题栏 / 语言下拉 / GPS / 图层 / 附近抽屉 / 面包屑 / 信息面板 / 降级弹窗
// build: 2026-06-18
import { THEMES, THEME_ORDER, OVERVIEW_MODE, TRAVEL_MODES } from './data/themes.js';
import { ANCHORS } from './data/anchors.js';
import { getText, pick, getLang, setLang, LANGS, langMeta } from './i18n.js';
import { hasEpisode } from './data/episodes.js';
import { isCompleted } from './game.js';
import { getMascot } from './data/mascots.js';

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

/* ============ 顶部工具组：语言下拉 + GPS 定位 ============ */
export function renderToolCluster(root, { onChangeLang, onLocate, geoSupported, onCompass, onStampBook }) {
  const el = document.createElement('div');
  el.className = 'tool-cluster';

  // 语言选择器
  const langWrap = document.createElement('div');
  langWrap.className = 'lang-selector';
  langWrap.innerHTML = `
    <button class="lang-trigger tool-btn" id="lang-trigger" title="${esc(getText('lang.switch'))}">
      <span class="lang-ico">🌐</span>
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

  // 罗盘探索按钮（◎）——新玩法主入口
  const compassBtn = document.createElement('button');
  compassBtn.className = 'tool-btn tool-btn-accent';
  compassBtn.id = 'compass-btn';
  compassBtn.title = getText('compass.title');
  compassBtn.innerHTML = `<span class="tool-ico">◎</span><span>${esc(getText('compass.btn'))}</span>`;

  // 印章册按钮（印）
  const stampBtn = document.createElement('button');
  stampBtn.className = 'tool-btn';
  stampBtn.id = 'stampbook-btn';
  stampBtn.title = getText('stamp.title');
  stampBtn.innerHTML = `<span class="tool-ico">📜</span><span>${esc(getText('stamp.btn'))}</span><span class="tool-badge" id="stamp-count"></span>`;

  el.appendChild(langWrap);
  el.appendChild(compassBtn);
  el.appendChild(stampBtn);
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
    // 同步更新触发按钮上的语言切换文案（随语言同步翻译）
    const label = langWrap.querySelector('#lang-label');
    if (label) label.textContent = getText('lang.switch');
    menu.classList.remove('open');
    if (onChangeLang) onChangeLang(code);
  });

  compassBtn.addEventListener('click', () => {
    if (onCompass) onCompass();
  });
  stampBtn.addEventListener('click', () => {
    if (onStampBook) onStampBook();
  });
}

/** 语言切换时刷新顶部工具组按钮文案（罗盘 / 印章册 / 语言切换），保留印章进度角标 */
export function refreshToolCluster() {
  // 罗盘探索按钮
  const compassBtn = document.getElementById('compass-btn');
  if (compassBtn) {
    compassBtn.title = getText('compass.title');
    compassBtn.innerHTML = `<span class="tool-ico">◎</span><span>${esc(getText('compass.btn'))}</span>`;
  }
  // 印章册按钮（重渲染文案时保留进度角标内容）
  const stampBtn = document.getElementById('stampbook-btn');
  if (stampBtn) {
    stampBtn.title = getText('stamp.title');
    const badgeEl = document.getElementById('stamp-count');
    const badgeText = badgeEl ? badgeEl.textContent : '';
    stampBtn.innerHTML = `<span class="tool-ico">📜</span><span>${esc(getText('stamp.btn'))}</span><span class="tool-badge" id="stamp-count">${esc(badgeText)}</span>`;
  }
  // 语言切换按钮文案
  const langTrigger = document.getElementById('lang-trigger');
  if (langTrigger) langTrigger.title = getText('lang.switch');
  const langLabel = document.getElementById('lang-label');
  if (langLabel) langLabel.textContent = getText('lang.switch');
}

export function setGpsLoading(loading) {
  const btn = document.getElementById('compass-btn');
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
  el.className = 'layer-control panel-enter-left';
  el.dataset.activeTheme = activeTheme;
  el.innerHTML = layerControlInner(counts, activeTheme);

  el.addEventListener('click', (e) => {
    const btn = e.target.closest('.layer-item');
    if (!btn) return;
    const key = btn.dataset.theme;
    // 点击当前已激活的主题 → 切回全部总览
    const current = el.dataset.activeTheme;
    const nextKey = key === current ? 'all' : key;
    onSwitchTheme(nextKey);
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
    <h2 class="mb-3 text-[10px] font-semibold tracking-[0.2em] text-[#6b5d48]">
      ${esc(getText('layers.heading'))}
    </h2>
    <div class="flex flex-col gap-1">
      ${overviewBtn}
      <div class="layer-divider"></div>
      ${items}
    </div>
    <p class="mt-3 border-t border-[#9a7b32]/20 pt-2 text-[10px] leading-relaxed text-[#8a7a62]">
      ${esc(getText('layers.hint'))}
    </p>`;
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

  // 打卡 / 参观信息
  const metaParts = [];
  if (anchor.openHours)
    metaParts.push(`<div class="panel-meta"><b>${esc(getText('panel.hours'))}：</b>${esc(anchor.openHours)}</div>`);
  if (anchor.visitTips)
    metaParts.push(`<div class="panel-meta"><b>${esc(getText('panel.visit'))}：</b>${esc(anchor.visitTips)}</div>`);
  let tagsHtml = '';
  if (anchor.checkinTag) {
    const tags = anchor.checkinTag.split(/\s+/).filter(Boolean);
    tagsHtml = `<div class="panel-tags">${tags
      .map((t) => `<span class="panel-tag">${esc(t)}</span>`)
      .join('')}</div>`;
  }
  const metaHtml =
    metaParts.length || tagsHtml
      ? `<div class="mt-6 rounded-2xl border border-[#9a7b32]/20 bg-[#fffcf4]/40 px-4 py-3 fade-in-up" style="animation-delay:.7s">
          ${metaParts.join('')}${tagsHtml}
        </div>`
      : '';

  // 人物 / 地点配图（优先 heroImage，其次 placeImage）；加载失败自动降级隐藏整块
  const imgSrc = anchor.heroImage || anchor.placeImage || '';
  const imageHtml = imgSrc
    ? `<figure class="panel-image fade-in-up" style="animation-delay:.47s">
        <img src="${esc(imgSrc)}" alt="${esc(anchor.imageCaption || pick(anchor.hero))}" loading="lazy"
          onerror="this.closest('.panel-image').style.display='none'" />
        ${anchor.imageCaption ? `<figcaption class="panel-image-cap">${esc(anchor.imageCaption)}</figcaption>` : ''}
        ${anchor.imageLicense ? `<span class="panel-image-license">${esc(anchor.imageLicense)}</span>` : ''}
      </figure>`
    : '';

  card.style.boxShadow = `0 24px 80px -20px ${theme.color}40, inset 0 1px 0 0 rgba(255,255,255,0.06)`;
  card.innerHTML = `
    <div class="glass-top-band" style="background:linear-gradient(90deg,transparent,${theme.color},transparent)"></div>
    <button class="close-btn" id="panel-close" aria-label="${esc(getText('panel.close'))}">✕</button>

    <div class="mb-5 flex items-center gap-2 fade-in-up" style="animation-delay:.1s">
      <span class="h-2 w-2 rounded-full" style="background:${theme.color};box-shadow:0 0 8px ${theme.color}"></span>
      <span class="text-[11px] font-semibold tracking-[0.18em]" style="color:${theme.color}">
        ${esc(pick(theme.label))}
      </span>
      ${anchor.era ? `<span class="ml-auto text-[10px] tracking-widest text-[#8a7a62]">${esc(anchor.era)}</span>` : ''}
    </div>

    <h2 class="panel-place-title font-brush fade-in-up" style="animation-delay:.2s">
      ${esc(pick(anchor.name))}
    </h2>

    <p class="panel-story-title font-brush fade-in-up" style="animation-delay:.32s">${esc(pick(anchor.title))}</p>

    <div class="mt-6 rounded-2xl border border-[#9a7b32]/20 bg-[#fffcf4]/45 px-4 py-3 fade-in-up" style="animation-delay:.42s">
      <span class="block text-[10px] tracking-[0.2em] text-[#8a7a62]">${esc(getText('panel.figure'))}</span>
      <span class="mt-1 block font-brush text-xl text-compass-amber">${esc(pick(anchor.hero))}</span>
    </div>

    ${imageHtml}

    <div class="mt-6 fade-in-up" style="animation-delay:.52s">
      <span class="mb-2 block text-[10px] tracking-[0.2em] text-[#8a7a62]">${esc(getText('panel.ripple'))}</span>
      <p class="font-serif text-[17px] leading-relaxed text-[#2b2118]"><span id="typed-text"></span><span class="typewriter-caret" id="typed-caret"></span></p>
    </div>

    ${linksHtml}
    ${metaHtml}

    ${
      anchor.worldImpact
        ? `<div class="mt-6 flex items-center gap-2 fade-in-up" id="impact-badge" style="animation-delay:.8s">
            <span class="text-base">🌏</span>
            <span class="text-[11px] tracking-[0.16em] text-compass-gold">${esc(getText('panel.impact'))}</span>
          </div>`
        : ''
    }

    <div class="panel-quest-card fade-in-up" style="--ep-accent:${theme.color};animation-delay:.85s">
      ${
        hasEpisode(anchor.id)
          ? `<div class="quest-main">
              <div class="quest-label">
                <span class="quest-dot"></span>
                <span>${esc(getText('episode.quest_title'))}</span>
              </div>
              <button class="episode-enter-btn ${isCompleted(anchor.id) ? 'completed' : ''}"
                  id="episode-enter">
                <span class="ee-ico">${isCompleted(anchor.id) ? '✓' : '▶'}</span>
                <span class="ee-copy">
                  <span class="ee-text">${esc(getText(isCompleted(anchor.id) ? 'episode.replay' : 'episode.enter'))}</span>
                  <span class="ee-hint">${esc(getText(isCompleted(anchor.id) ? 'episode.quest_replay_hint' : 'episode.quest_hint'))}</span>
                </span>
                ${isCompleted(anchor.id) ? `<span class="ee-done">${esc(getText('episode.completed'))}</span>` : ''}
              </button>
            </div>`
          : ''
      }
      <div class="panel-mascot-slot"></div>
    </div>`;

  // 注入主题吉祥物（作为剧情副本入口旁的 NPC 提示）
  (() => {
    const mascot = getMascot(anchor.theme);
    const mGreeting = esc(mascot.greeting);
    const mImg = esc(mascot.img);
    const mName = esc(pick(mascot.name));
    const mRole = esc(pick(mascot.role));
    const pmEl = document.createElement('div');
    pmEl.className = 'panel-mascot fade-in-up';
    pmEl.style.animationDelay = '1s';
    pmEl.innerHTML =
      `<div class="pm-bubble">${mGreeting}</div>` +
      `<img class="pm-img" src="${mImg}" alt="${mName}" onerror="this.closest('.panel-mascot').style.display='none'" />` +
      `<div class="pm-name">${mName}<span class="pm-role">${mRole}</span></div>`;
    const mascotSlot = card.querySelector('.panel-mascot-slot');
    if (mascotSlot) mascotSlot.appendChild(pmEl);
  })();

  const closeBtn = document.getElementById('panel-close');
  if (closeBtn) closeBtn.addEventListener('click', onClose);

  // 副本入口按钮
  const epBtn = document.getElementById('episode-enter');
  if (epBtn && onEnterEpisode) {
    epBtn.addEventListener('click', () => onEnterEpisode(anchor));
  }

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
      <p class="font-serif text-[17px] leading-relaxed text-[#2b2118]"><span id="typed-text"></span><span class="typewriter-caret" id="typed-caret"></span></p>
    </div>

    <div class="panel-stamp" style="background:linear-gradient(145deg,#cf3f39,#a82d28)"><span>四海<br/>同辉</span></div>`;

  const closeBtn = document.getElementById('panel-close');
  if (closeBtn) closeBtn.addEventListener('click', onClose);
  panel.classList.add('open');
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

/* ============ 页脚签名 ============ */
export function renderFooter(root) {
  const el = document.createElement('footer');
  el.className = 'footer-sign';
  el.innerHTML = `<p>由 <a href="https://with.woa.com/" target="_blank" rel="noreferrer">With</a> 通过自然语言生成</p>`;
  root.appendChild(el);
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

let compassState = {
  tab: 'nearby',
  userPos: null,
  simulated: false,
  routeTheme: 'all',
  routeMode: 'walk',
  itinerary: null,
  itineraryTheme: null,
  routeSelectedIds: new Set(),
  handlers: {},
  nearbyN: 8,
};

export function renderCompassPanel(root, handlers = {}) {
  compassState.handlers = handlers;
  const el = document.createElement('aside');
  el.id = 'compass-panel';
  el.innerHTML = `
    <div class="compass-card">
      <div class="compass-head">
        <span class="compass-title font-brush">◎ ${esc(getText('compass.title'))}</span>
        <button class="close-btn" id="compass-close" style="position:static;width:30px;height:30px">✕</button>
      </div>
      <div class="compass-loc" id="compass-loc"></div>
      <div class="compass-tabs">
        <button class="compass-tab active" data-tab="nearby">${esc(getText('compass.nearby_tab'))}</button>
        <button class="compass-tab" data-tab="route">${esc(getText('compass.route_tab'))}</button>
      </div>
      <div class="compass-content" id="compass-content"></div>
    </div>`;
  root.appendChild(el);
  el.querySelector('#compass-close').addEventListener('click', closeCompassPanel);
  el.querySelectorAll('.compass-tab').forEach((t) => {
    t.addEventListener('click', () => {
      const prevTab = compassState.tab;
      compassState.tab = t.dataset.tab;
      if (prevTab === 'route' && compassState.tab !== 'route' && compassState.handlers.onLeaveRoute) {
        compassState.handlers.onLeaveRoute();
      }
      el.querySelectorAll('.compass-tab').forEach((x) => x.classList.toggle('active', x === t));
      renderCompassContent();
    });
  });
}

export function openCompassPanel() {
  const el = document.getElementById('compass-panel');
  if (el) el.classList.add('open');
  renderCompassContent();
}
export function closeCompassPanel() {
  const el = document.getElementById('compass-panel');
  if (el) el.classList.remove('open');
  if (compassState.handlers.onClose) compassState.handlers.onClose();
}
export function isCompassOpen() {
  const el = document.getElementById('compass-panel');
  return el && el.classList.contains('open');
}

/** 设置罗盘定位状态（实时 / 模拟）并刷新内容 */
export function setCompassLocation({ lng, lat, simulated }) {
  compassState.userPos = [lng, lat];
  compassState.simulated = !!simulated;
  const loc = document.getElementById('compass-loc');
  if (loc) {
    loc.innerHTML = `
      <span class="cl-dot ${simulated ? 'sim' : 'live'}"></span>
      <span class="cl-text">${esc(getText(simulated ? 'compass.simulated' : 'compass.real'))}</span>
      <span class="cl-coord">${lat.toFixed(4)}, ${lng.toFixed(4)}</span>`;
  }
  renderCompassContent();
}

function renderCompassContent() {
  const box = document.getElementById('compass-content');
  if (!box) return;
  if (compassState.tab === 'nearby') renderNearbyTab(box);
  else renderRouteTab(box);
}

function renderNearbyTab(box) {
  if (!compassState.userPos || !_haversine) {
    box.innerHTML = `<div class="compass-hint">${esc(getText('compass.locating'))}</div>`;
    return;
  }
  const [ulng, ulat] = compassState.userPos;
  const items = ANCHORS.map((a) => ({
    anchor: a,
    dist: _haversine(ulng, ulat, a.coordinates[0], a.coordinates[1]),
  }))
    .sort((x, y) => x.dist - y.dist)
    .slice(0, compassState.nearbyN);

  box.innerHTML = `
    <div class="compass-near-title">${esc(getText('compass.nearby_title'))}</div>
    <div class="compass-near-list">
      ${items
        .map(({ anchor, dist }, i) => {
          const theme = THEMES[anchor.theme] || OVERVIEW_MODE;
          return `
          <button class="compass-near-item" data-id="${anchor.id}">
            <span class="cn-rank">${i + 1}</span>
            <span class="cn-body">
              <span class="cn-top">
                <span class="cn-dot" style="background:${theme.color};box-shadow:0 0 6px ${theme.color}"></span>
                <span class="cn-name">${esc(pick(anchor.name))}</span>
                <span class="cn-dist">${fmtDist(dist)}</span>
              </span>
              <span class="cn-hero">${esc(pick(anchor.hero))}</span>
              <span class="cn-title">${esc(pick(anchor.title))}</span>
            </span>
          </button>`;
        })
        .join('')}
    </div>`;
  box.querySelectorAll('.compass-near-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const a = ANCHORS.find((x) => x.id === btn.dataset.id);
      if (a && compassState.handlers.onAnchorClick) compassState.handlers.onAnchorClick(a);
    });
  });
}

function renderRouteTab(box) {
  const availableAnchors = ANCHORS.filter(
    (anchor) => compassState.routeTheme === 'all' || anchor.theme === compassState.routeTheme
  );
  const selectedAnchors = ANCHORS.filter((anchor) => compassState.routeSelectedIds.has(anchor.id));
  const themeChips = [OVERVIEW_MODE.key, ...THEME_ORDER]
    .map((k) => {
      const meta = k === 'all' ? OVERVIEW_MODE : THEMES[k];
      const active = compassState.routeTheme === k;
      return `<button class="rt-chip ${active ? 'active' : ''}" data-theme="${k}">
        <span class="rt-chip-dot" style="background:${meta.color}"></span>${esc(pick(meta.shortName))}</button>`;
    })
    .join('');
  const modeBtns = Object.values(TRAVEL_MODES)
    .map((m) => {
      const active = compassState.routeMode === m.key;
      return `<button class="rt-mode ${active ? 'active' : ''}" data-mode="${m.key}">${m.icon} ${esc(pick(m.label))}</button>`;
    })
    .join('');
  const anchorOptions = availableAnchors
    .map((anchor) => {
      const active = compassState.routeSelectedIds.has(anchor.id);
      const theme = THEMES[anchor.theme] || OVERVIEW_MODE;
      return `<button class="route-anchor-option ${active ? 'active' : ''}" data-id="${anchor.id}" role="checkbox" aria-checked="${active}">
        <span class="rao-check" aria-hidden="true">${active ? '✓' : ''}</span>
        <span class="rao-dot" style="background:${theme.color}"></span>
        <span class="rao-name">${esc(pick(anchor.name))}</span>
      </button>`;
    })
    .join('');

  box.innerHTML = `
    <div class="route-form">
      <div class="rt-label">${esc(getText('compass.theme_label'))}</div>
      <div class="rt-chips">${themeChips}</div>
      <div class="rt-label">${esc(getText('compass.mode_label'))}</div>
      <div class="rt-modes">${modeBtns}</div>
      <div class="rt-anchor-head">
        <span class="rt-label">${esc(getText('route.anchor_label'))}</span>
        <span class="rt-selected-count">${esc(getText('route.selected', { count: selectedAnchors.length }))}</span>
      </div>
      <div class="rt-selection-actions">
        <button class="rt-select-action" id="route-select-theme">${esc(getText('route.select_all'))}</button>
        <button class="rt-select-action" id="route-clear-selection">${esc(getText('route.clear_selected'))}</button>
      </div>
      <div class="route-anchor-list">${anchorOptions}</div>
      <button class="rt-plan-btn" id="compass-plan-btn">
        <span class="cp-label">${esc(getText('compass.plan_btn'))}</span>
      </button>
      <button class="rt-calibrate-btn" id="route-calibrate-btn" ${selectedAnchors.length ? '' : 'disabled'}>
        ${esc(getText('route.calibrate'))}
      </button>
    </div>
    <div class="route-card-wrap" id="compass-itinerary"></div>`;

  box.querySelectorAll('.rt-chip').forEach((c) => {
    c.addEventListener('click', () => {
      compassState.routeTheme = c.dataset.theme;
      renderRouteTab(box);
    });
  });
  box.querySelectorAll('.rt-mode').forEach((m) => {
    m.addEventListener('click', () => {
      compassState.routeMode = m.dataset.mode;
      box.querySelectorAll('.rt-mode').forEach((x) => x.classList.toggle('active', x === m));
    });
  });
  box.querySelectorAll('.route-anchor-option').forEach((option) => {
    option.addEventListener('click', () => {
      const id = option.dataset.id;
      if (compassState.routeSelectedIds.has(id)) compassState.routeSelectedIds.delete(id);
      else compassState.routeSelectedIds.add(id);
      renderRouteTab(box);
    });
  });
  box.querySelector('#route-select-theme').addEventListener('click', () => {
    availableAnchors.forEach((anchor) => compassState.routeSelectedIds.add(anchor.id));
    renderRouteTab(box);
  });
  box.querySelector('#route-clear-selection').addEventListener('click', () => {
    compassState.routeSelectedIds.clear();
    renderRouteTab(box);
  });
  box.querySelector('#compass-plan-btn').addEventListener('click', () => {
    if (compassState.handlers.onPlanRoute) {
      compassState.handlers.onPlanRoute(compassState.routeTheme, compassState.routeMode, selectedAnchors.map((anchor) => anchor.id));
    }
  });
  box.querySelector('#route-calibrate-btn').addEventListener('click', async (event) => {
    if (!selectedAnchors.length || !compassState.handlers.onCalibrateAnchors) return;
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await compassState.handlers.onCalibrateAnchors(selectedAnchors.map((anchor) => anchor.id));
    } finally {
      if (button.isConnected) button.disabled = false;
    }
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
  const btn = document.getElementById('compass-plan-btn');
  if (!btn) return;
  btn.classList.toggle('loading', !!loading);
  btn.disabled = !!loading;
  const label = btn.querySelector('.cp-label');
  if (label) label.textContent = getText(loading ? 'compass.planning' : 'compass.plan_btn');
}

/** 展示行程卡片（main.js 计算好 itinerary 后调用）*/
export function showItinerary(itinerary, themeKey) {
  compassState.itinerary = itinerary;
  compassState.itineraryTheme = themeKey;
  compassState.tab = 'route';
  const panel = document.getElementById('compass-panel');
  if (panel) {
    panel.querySelectorAll('.compass-tab').forEach((x) =>
      x.classList.toggle('active', x.dataset.tab === 'route')
    );
  }
  renderCompassContent();
}

/** 清除行程卡片 */
export function clearItinerary() {
  compassState.itinerary = null;
  compassState.itineraryTheme = null;
  if (compassState.tab === 'route') renderCompassContent();
}

function renderItineraryInto(box, itinerary, themeKey) {
  if (!box || !itinerary) return;
  const meta = themeKey === 'all' || !themeKey ? OVERVIEW_MODE : THEMES[themeKey];
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
          getText(itinerary.straight ? 'route.straight' : itinerary.source === 'tencent' ? 'route.tencent' : 'route.real_road')
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
      <button class="route-clear" id="route-clear">${esc(getText('route.clear'))}</button>
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
}

/** 语言切换时刷新罗盘面板文案 */
export function refreshCompassTexts() {
  const panel = document.getElementById('compass-panel');
  if (!panel) return;
  const title = panel.querySelector('.compass-title');
  if (title) title.innerHTML = `◎ ${esc(getText('compass.title'))}`;
  panel.querySelectorAll('.compass-tab').forEach((t) => {
    t.textContent = getText(t.dataset.tab === 'nearby' ? 'compass.nearby_tab' : 'compass.route_tab');
  });
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
