// 锚点剧情副本 · 游戏模块：localStorage 进度 + 剧情状态机 UI + 印章册 + 成就 + 地理围栏提示
// build: 2026-06-18
import { EPISODES } from './data/episodes.js';
import { getMascot } from './data/mascots.js';
import { THEMES, THEME_ORDER, OVERVIEW_MODE } from './data/themes.js';
import { ANCHORS } from './data/anchors.js';
import { getText, pick } from './i18n.js';

const STORAGE_KEY = 'stc_progress';

/** HTML 转义 */
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const BADGE_SVGS = {
  'treasure-fleet': `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#e8f5ff"/><path d="M13 43c6-3 10 3 16 0s10 3 16 0 6-2 8-1v7H12z" fill="#2e6f9e" opacity=".82"/><path d="M20 38h25l-5 9H24z" fill="#8b4b2b"/><path d="M31 12v26" stroke="#5b3925" stroke-width="3" stroke-linecap="round"/><path d="M33 15c8 5 13 12 14 20H33z" fill="#fff4d6" stroke="#b5762a" stroke-width="2"/><path d="M29 18c-6 5-10 11-11 18h11z" fill="#f7d88b" stroke="#b5762a" stroke-width="2"/><path d="M48 13l1.5 3 3.5.5-2.6 2.3.7 3.4-3.1-1.7-3.1 1.7.7-3.4-2.6-2.3 3.5-.5z" fill="#c9a24b"/></svg>`,
  'mangrove-bird': `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#e7f6ef"/><path d="M16 43c7 3 10-2 16 0s9 3 17-1" fill="none" stroke="#2e6f9e" stroke-width="4" stroke-linecap="round"/><path d="M32 15v27M24 25h16" stroke="#2f6f50" stroke-width="4" stroke-linecap="round"/><path d="M32 39l-9 12M33 39l8 12M29 42l-4 8M36 42l5 8" stroke="#7b4b2a" stroke-width="3" stroke-linecap="round"/><path d="M42 19c5 0 8 4 7 8-5 0-8-2-11-5z" fill="#f7f1df" stroke="#2f6f50" stroke-width="2"/><path d="M47 21l5-2-3 4" fill="#d98a3d"/></svg>`,
  'silk-route': `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#fff7dc"/><path d="M18 18h28a4 4 0 014 4v26H18a4 4 0 01-4-4V22a4 4 0 014-4z" fill="#f4dfad" stroke="#b5762a" stroke-width="2"/><path d="M20 42c7-12 18 1 25-13" fill="none" stroke="#2e6f9e" stroke-width="3" stroke-dasharray="3 4" stroke-linecap="round"/><circle cx="21" cy="41" r="3" fill="#c44739"/><circle cx="45" cy="29" r="3" fill="#c44739"/><path d="M30 23h8l-2 6 4 10a7 7 0 01-12 0l4-10z" fill="#f8fbff" stroke="#2e6f9e" stroke-width="2"/><path d="M31 35h8" stroke="#2e6f9e" stroke-width="2"/></svg>`,
  'monsoon-sail': `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#e9f6ff"/><path d="M12 45c6-3 10 2 16 0s10 2 16 0 6-2 8 0" fill="none" stroke="#2e6f9e" stroke-width="4" stroke-linecap="round"/><path d="M28 16v27" stroke="#5b3925" stroke-width="3" stroke-linecap="round"/><path d="M30 18c9 7 14 14 16 24H30z" fill="#fff4d6" stroke="#b5762a" stroke-width="2"/><path d="M17 30c5-4 10-4 15 0M14 22c6-5 13-5 20-1" fill="none" stroke="#73a8c7" stroke-width="3" stroke-linecap="round"/><path d="M22 44h25l-5 7H26z" fill="#8b4b2b"/></svg>`,
  'storm-stele': `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#eef2f7"/><path d="M16 45c6-3 11 3 17 0s9 3 15 0" fill="none" stroke="#2e6f9e" stroke-width="4" stroke-linecap="round"/><path d="M25 18h16l3 28H22z" fill="#d8d0bd" stroke="#7a6a4a" stroke-width="2"/><path d="M29 25h8M28 31h10M30 37h6" stroke="#7a6a4a" stroke-width="2" stroke-linecap="round"/><path d="M47 12l-7 15h7l-6 13" fill="none" stroke="#c9a24b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 24l6 4-7 3" fill="none" stroke="#b23a2e" stroke-width="3" stroke-linecap="round"/></svg>`,
  'harbor-cranes': `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#e8f4ff"/><path d="M13 45h38v7H13z" fill="#2e6f9e" opacity=".85"/><path d="M19 25h6v20h-6zM31 19h6v26h-6zM43 29h5v16h-5z" fill="#7a6a4a"/><path d="M16 24h22M33 18h18M47 18v11" stroke="#b5762a" stroke-width="3" stroke-linecap="round"/><path d="M23 36h18l5 7H18z" fill="#fff4d6" stroke="#b5762a" stroke-width="2"/><path d="M22 39h20" stroke="#2e6f9e" stroke-width="2"/></svg>`,
  'canton-tea': `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#fff4dc"/><path d="M17 25h30l-3 23H20z" fill="#b5762a" stroke="#6b4f1f" stroke-width="2"/><path d="M20 25l5-8h18l4 8" fill="#e7c678" stroke="#6b4f1f" stroke-width="2"/><path d="M26 33h12v8H26z" fill="#f8f1dc"/><path d="M29 36h6" stroke="#2f6f50" stroke-width="2"/><path d="M42 16c4 4 3 8-1 11M47 14c5 6 5 12 0 17" fill="none" stroke="#2e6f9e" stroke-width="2" stroke-linecap="round"/><path d="M16 49c6-2 10 2 16 0s9 2 15 0" fill="none" stroke="#2e6f9e" stroke-width="3" stroke-linecap="round"/></svg>`,
};

function renderBadgeArt(reward, className = '') {
  const svg = reward && reward.badgeIcon ? BADGE_SVGS[reward.badgeIcon] : '';
  if (svg) return `<span class="badge-art ${className}" aria-hidden="true">${svg}</span>`;
  return `<span class="badge-emoji ${className}">${esc(reward && reward.badge)}</span>`;
}

/* ============================================================= */
/* ===== 进度持久化模块（localStorage）========================= */
/* ============================================================= */

/** 读取进度（容错：损坏 / 缺失 → 返回初始结构）*/
export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: {}, achievements: [] };
    const p = JSON.parse(raw);
    return {
      completed: p && typeof p.completed === 'object' ? p.completed : {},
      achievements: Array.isArray(p && p.achievements) ? p.achievements : [],
    };
  } catch (e) {
    return { completed: {}, achievements: [] };
  }
}

/** 写入进度 */
function saveProgress(p) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch (e) {
    /* 隐私模式 / 配额满 → 静默降级（本次会话内仍可玩）*/
  }
}

/** 某锚点是否已通关 */
export function isCompleted(anchorId) {
  return !!loadProgress().completed[anchorId];
}

/** 已通关锚点 id 集合 */
export function getCompletedIds() {
  return new Set(Object.keys(loadProgress().completed));
}

/** 已解锁的图层成就（theme key 数组）*/
export function getAchievements() {
  return loadProgress().achievements.slice();
}

/**
 * 标记某锚点通关。
 * @param {string} anchorId
 * @param {{onsite?:boolean}} opts onsite=true 表示实地（地理围栏内）通关
 * @returns {{newlyCompleted:boolean, achievementUnlocked:(string|null)}}
 */
export function markComplete(anchorId, opts = {}) {
  const p = loadProgress();
  const prev = p.completed[anchorId];
  const already = !!prev;
  p.completed[anchorId] = {
    onsite: (prev && prev.onsite) || !!opts.onsite,
    at: Date.now(),
  };
  // 检测该锚点所属图层是否已集齐全部印章 → 解锁成就
  const anchor = ANCHORS.find((a) => a.id === anchorId);
  let achievementUnlocked = null;
  if (anchor) {
    const t = anchor.theme;
    const themeEpisodeIds = Object.keys(EPISODES).filter((id) => {
      const a = ANCHORS.find((x) => x.id === id);
      return a && a.theme === t;
    });
    const allDone = themeEpisodeIds.length > 0 && themeEpisodeIds.every((id) => p.completed[id]);
    if (allDone && !p.achievements.includes(t)) {
      p.achievements.push(t);
      achievementUnlocked = t;
    }
  }
  saveProgress(p);
  return { newlyCompleted: !already, achievementUnlocked };
}

/**
 * 各图层收集进度（仅统计拥有 episode 的锚点）。
 * @returns {Record<string,{done:number,total:number}>}
 */
export function getThemeProgress() {
  const completed = getCompletedIds();
  const res = {};
  THEME_ORDER.forEach((t) => (res[t] = { done: 0, total: 0 }));
  Object.keys(EPISODES).forEach((id) => {
    const anchor = ANCHORS.find((a) => a.id === id);
    if (!anchor) return;
    const t = anchor.theme;
    if (!res[t]) res[t] = { done: 0, total: 0 };
    res[t].total += 1;
    if (completed.has(id)) res[t].done += 1;
  });
  return res;
}

/** 总收集进度 {done,total} */
export function getTotalProgress() {
  const completed = getCompletedIds();
  const ids = Object.keys(EPISODES);
  return {
    done: ids.filter((id) => completed.has(id)).length,
    total: ids.length,
  };
}

/* ============================================================= */
/* ===== 剧情副本状态机 UI ====================================== */
/* ============================================================= */

let episodeState = null;
let epTypewriterToken = 0;

/** 创建剧情层容器（仅一次）*/
export function renderEpisodeLayer(root) {
  const el = document.createElement('div');
  el.id = 'episode-layer';
  el.innerHTML = `
    <div class="episode-scroll" id="episode-scroll">
      <button class="episode-close" id="episode-close" aria-label="close">✕</button>
      <div class="episode-progress" id="episode-progress"></div>
      <div class="episode-body" id="episode-body"></div>
    </div>`;
  root.appendChild(el);
  el.querySelector('#episode-close').addEventListener('click', () => closeEpisode());
}

/** 是否正在展示剧情 */
export function isEpisodeOpen() {
  const el = document.getElementById('episode-layer');
  return el && el.classList.contains('open');
}

/**
 * 进入剧情副本（状态机：intro → scenes → reward）。
 * @param {CulturalAnchor} anchor
 * @param {Episode} episode
 * @param {{onComplete?:(anchor,opts)=>void, onOpenStampBook?:(anchor,opts)=>void, onClose?:()=>void, onsite?:boolean}} handlers
 */
export function openEpisode(anchor, episode, handlers = {}) {
  episodeState = {
    anchor,
    episode,
    handlers,
    phase: 'intro',
    sceneIndex: 0,
    answered: false,
    onsite: !!handlers.onsite,
  };
  const layer = document.getElementById('episode-layer');
  if (layer) layer.classList.add('open');
  renderEpisodePhase();
}

/** 关闭剧情层 */
export function closeEpisode() {
  epTypewriterToken += 1;
  const layer = document.getElementById('episode-layer');
  if (layer) layer.classList.remove('open');
  const h = episodeState && episodeState.handlers;
  episodeState = null;
  if (h && h.onClose) h.onClose();
}

/** 简易打字机（带令牌防竞态）*/
function epTypewriter(el, text, onDone) {
  epTypewriterToken += 1;
  const token = epTypewriterToken;
  const full = String(text || '');
  let i = 0;
  el.textContent = '';
  const tick = () => {
    if (token !== epTypewriterToken || !document.body.contains(el)) return;
    i += 1;
    el.textContent = full.slice(0, i);
    if (i < full.length) setTimeout(tick, 26);
    else if (onDone) onDone();
  };
  setTimeout(tick, 280);
}

/** 顶部场景进度点 */
function renderEpisodeProgressDots() {
  const wrap = document.getElementById('episode-progress');
  if (!wrap || !episodeState) return;
  const { episode, phase, sceneIndex } = episodeState;
  const total = episode.scenes.length;
  let activeIdx = -1; // intro
  if (phase === 'scene') activeIdx = sceneIndex;
  if (phase === 'reward') activeIdx = total;
  const dots = [];
  dots.push(`<span class="ep-dot ${phase === 'intro' ? 'active' : 'done'}">序</span>`);
  for (let i = 0; i < total; i++) {
    const cls = activeIdx === i ? 'active' : activeIdx > i ? 'done' : '';
    dots.push(`<span class="ep-dot ${cls}">${i + 1}</span>`);
  }
  dots.push(`<span class="ep-dot ${phase === 'reward' ? 'active' : ''}">★</span>`);
  wrap.innerHTML = dots.join('<span class="ep-dot-sep"></span>');
}

/** 渲染当前阶段 */
function renderEpisodePhase() {
  if (!episodeState) return;
  const body = document.getElementById('episode-body');
  const scroll = document.getElementById('episode-scroll');
  if (!body) return;
  const { anchor, episode, phase } = episodeState;
  const theme = THEMES[anchor.theme] || OVERVIEW_MODE;
  if (scroll) scroll.style.setProperty('--ep-accent', theme.color);
  renderEpisodeProgressDots();

  if (phase === 'intro') {
    // 渲染角色头像区（如果 episode 含 characters 数组）
    const chars = episode.characters || [];
    const charHtml = chars.length ? `
      <div class="ep-characters">
        ${chars.map(c => `
          <div class="ep-char">
            <div class="ep-char-avatar" style="border-color:${theme.color}">
              <img src="${esc(c.portrait)}" alt="${esc(pick(c.name))}" onerror="this.parentElement.classList.add('no-img');this.remove()"/>
              <span class="ep-char-fallback">${esc((pick(c.name) || '').slice(0, 1))}</span>
            </div>
            <span class="ep-char-name">${esc(pick(c.name))}</span>
            <span class="ep-char-role">${esc(pick(c.role))}</span>
          </div>`).join('')}
      </div>` : '';
    // 主题吉祥物：无角色配图时显示
    const mascot = getMascot(anchor.theme);
    const mascotHtml = !chars.length ? (
      '<div class="ep-mascot-intro">' +
      '<img class="ep-mascot-img" src="' + esc(mascot.img) + '" alt="' + esc(pick(mascot.name)) + '" onerror="this.closest(\'.ep-mascot-intro\').style.display=\'none\'" />' +
      '<div class="ep-mascot-meta">' +
      '<span class="ep-mascot-name font-brush">' + esc(pick(mascot.name)) + '</span>' +
      '<span class="ep-mascot-role">' + esc(pick(mascot.role)) + '</span>' +
      '</div>' +
      '<div class="ep-mascot-speech">' + esc(mascot.greeting) + '</div>' +
      '</div>'
    ) : '';
    body.innerHTML = `
      <div class="ep-tag" style="color:${theme.color}">
        <span class="ep-tag-dot" style="background:${theme.color};box-shadow:0 0 8px ${theme.color}"></span>
        ${esc(pick(theme.label))} · ${esc(pick(anchor.name))}
      </div>
      <h2 class="ep-title font-brush">${esc(pick(anchor.title))}</h2>
      ${charHtml || mascotHtml}
      <p class="ep-intro" id="ep-intro-text"></p>
      <div class="ep-actions">
        <button class="ep-btn ep-btn-primary" id="ep-continue">${esc(getText('episode.continue'))} →</button>
      </div>`;
    const introEl = body.querySelector('#ep-intro-text');
    epTypewriter(introEl, pick(episode.intro));
    body.querySelector('#ep-continue').addEventListener('click', () => {
      episodeState.phase = 'scene';
      episodeState.sceneIndex = 0;
      episodeState.answered = false;
      renderEpisodePhase();
    });
    return;
  }

  if (phase === 'scene') {
    const idx = episodeState.sceneIndex;
    const scene = episode.scenes[idx];
    const theme2 = THEMES[anchor.theme] || OVERVIEW_MODE;
    // 场景说话者头像（scene.speaker 可选）
    const chars = episode.characters || [];
    const speaker = scene.speaker != null ? chars[scene.speaker] : (chars.length ? chars[0] : null);
    const speakerHtml = speaker ? `
      <div class="ep-speaker">
        <div class="ep-speaker-avatar" style="border-color:${theme2.color}">
          <img src="${esc(speaker.portrait)}" alt="${esc(pick(speaker.name))}" onerror="this.parentElement.classList.add('no-img');this.remove()"/>
          <span class="ep-char-fallback">${esc((pick(speaker.name) || '').slice(0, 1))}</span>
        </div>
        <span class="ep-speaker-name">${esc(pick(speaker.name))}</span>
      </div>` : '';
    body.innerHTML = `
      <div class="ep-scene-no">${esc(getText('episode.scene'))} ${idx + 1} / ${episode.scenes.length}</div>
      ${speakerHtml}
      <h3 class="ep-question font-brush">${esc(pick(scene.q))}</h3>
      <div class="ep-options" id="ep-options">
        ${scene.options
          .map(
            (o, i) => `
          <button class="ep-option" data-opt="${i}">
            <span class="ep-option-idx">${String.fromCharCode(65 + i)}</span>
            <span class="ep-option-text">${esc(pick(o.text))}</span>
          </button>`
          )
          .join('')}
      </div>
      <div class="ep-feedback" id="ep-feedback"></div>`;
    const optWrap = body.querySelector('#ep-options');
    optWrap.querySelectorAll('.ep-option').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (episodeState.answered) return;
        episodeState.answered = true;
        const oi = parseInt(btn.dataset.opt, 10);
        const opt = scene.options[oi];
        // 标记对错
        optWrap.querySelectorAll('.ep-option').forEach((b, bi) => {
          b.classList.add('locked');
          if (scene.options[bi].correct) b.classList.add('is-correct');
          if (bi === oi && !opt.correct) b.classList.add('is-wrong');
        });
        // 反馈
        const fb = body.querySelector('#ep-feedback');
        const isLast = idx >= episode.scenes.length - 1;
        fb.innerHTML = `
          <div class="ep-fb-head ${opt.correct ? 'ok' : 'no'}">
            ${opt.correct ? '✓ ' + esc(getText('episode.correct')) : '✕ ' + esc(getText('episode.wrong'))}
          </div>
          <p class="ep-fb-body">${esc(pick(opt.feedback))}</p>
          <div class="ep-actions">
            <button class="ep-btn ep-btn-primary" id="ep-next">
              ${isLast ? esc(getText('episode.finish')) + ' ★' : esc(getText('episode.next')) + ' →'}
            </button>
          </div>`;
        fb.classList.add('show');
        fb.querySelector('#ep-next').addEventListener('click', () => {
          if (isLast) {
            episodeState.phase = 'reward';
            renderEpisodePhase();
          } else {
            episodeState.sceneIndex += 1;
            episodeState.answered = false;
            renderEpisodePhase();
          }
        });
        fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    });
    return;
  }

  if (phase === 'reward') {
    const r = episode.reward;
    // 通关落库
    const { achievementUnlocked } = markComplete(anchor.id, { onsite: episodeState.onsite });
    const theme3 = THEMES[anchor.theme] || OVERVIEW_MODE;
    body.innerHTML = `
      <div class="ep-reward">
        <div class="ep-reward-label">${esc(getText('episode.reward_title'))}</div>
        <div class="ep-badge" style="--ep-accent:${theme3.color}">
          ${renderBadgeArt(r, 'ep-badge-art')}
        </div>
        <div class="ep-badge-name font-brush">${esc(pick(r.badgeName))}</div>
        ${
          episodeState.onsite
            ? `<div class="ep-onsite-tag">📍 ${esc(getText('geofence.onsite'))}</div>`
            : ''
        }
        <div class="ep-insight">
          <span class="ep-insight-label">${esc(getText('episode.insight'))}</span>
          <p>${esc(pick(r.insight))}</p>
        </div>
        <div class="ep-actions">
          <button class="ep-btn ep-btn-ghost" id="ep-replay">${esc(getText('episode.replay'))}</button>
          <button class="ep-btn ep-btn-secondary" id="ep-stamps">${esc(getText('episode.view_stamps'))}</button>
          <button class="ep-btn ep-btn-primary" id="ep-finish">${esc(getText('episode.close'))}</button>
        </div>
      </div>`;
    body.querySelector('#ep-replay').addEventListener('click', () => {
      episodeState.phase = 'intro';
      episodeState.sceneIndex = 0;
      episodeState.answered = false;
      renderEpisodePhase();
    });
    body.querySelector('#ep-finish').addEventListener('click', () => {
      const h = episodeState.handlers;
      const a = episodeState.anchor;
      const onsite = episodeState.onsite;
      closeEpisode();
      if (h && h.onComplete) h.onComplete(a, { onsite, achievementUnlocked });
    });
    body.querySelector('#ep-stamps').addEventListener('click', () => {
      const h = episodeState.handlers;
      const a = episodeState.anchor;
      const onsite = episodeState.onsite;
      closeEpisode();
      if (h && h.onComplete) h.onComplete(a, { onsite, achievementUnlocked });
      if (h && h.onOpenStampBook) h.onOpenStampBook(a, { onsite, achievementUnlocked });
    });
    // 通关即时回调（点亮地图印章），成就在关闭时再弹
    const h = episodeState.handlers;
    if (h && h.onReward) h.onReward(anchor, { onsite: episodeState.onsite, achievementUnlocked });
    return;
  }
}

/* ============================================================= */
/* ===== 印章册 UI ============================================= */
/* ============================================================= */

let stampHandlers = {};

/** 创建印章册容器（仅一次）*/
export function renderStampBook(root, handlers = {}) {
  stampHandlers = handlers;
  const el = document.createElement('div');
  el.id = 'stamp-modal';
  el.innerHTML = `<div class="stamp-card" id="stamp-card"></div>`;
  root.appendChild(el);
  // 点击遮罩关闭
  el.addEventListener('click', (e) => {
    if (e.target === el) closeStampBook();
  });
}

/** 打开印章册（每次打开都按最新进度重渲染）*/
export function openStampBook() {
  const modal = document.getElementById('stamp-modal');
  const card = document.getElementById('stamp-card');
  if (!modal || !card) return;
  const total = getTotalProgress();
  const themeProgress = getThemeProgress();
  const completed = getCompletedIds();
  const achievements = getAchievements();

  // 仅展示拥有 episode 的图层
  const themesWithEpisodes = THEME_ORDER.filter((t) => themeProgress[t] && themeProgress[t].total > 0);

  const sections = themesWithEpisodes
    .map((t) => {
      const meta = THEMES[t];
      const prog = themeProgress[t];
      const unlocked = achievements.includes(t);
      // 该图层的 episode 锚点
      const epIds = Object.keys(EPISODES).filter((id) => {
        const a = ANCHORS.find((x) => x.id === id);
        return a && a.theme === t;
      });
      const cells = epIds
        .map((id) => {
          const a = ANCHORS.find((x) => x.id === id);
          const ep = EPISODES[id];
          const done = completed.has(id);
          const rec = loadProgress().completed[id];
          const onsite = rec && rec.onsite;
          return `
          <button class="stamp-cell ${done ? 'earned' : 'locked'}" data-anchor="${id}" title="${esc(pick(a.name))}">
            <span class="stamp-cell-badge" style="--cell-accent:${meta.color}">
              ${done ? renderBadgeArt(ep.reward, 'stamp-badge-art') : '<span class="stamp-lock">🔒</span>'}
              ${onsite ? '<span class="stamp-onsite">📍</span>' : ''}
            </span>
            <span class="stamp-cell-name">${done ? esc(pick(ep.reward.badgeName)) : esc(getText('stamp.locked'))}</span>
            <span class="stamp-cell-place">${esc(pick(a.name))}</span>
          </button>`;
        })
        .join('');
      const sectionMascot = getMascot(t);
      return `
      <div class="stamp-section">
        <div class="stamp-section-head">
          <img class="stamp-section-mascot" src="${sectionMascot.img}" alt="${esc(pick(sectionMascot.name))}" onerror="this.remove()" />
          <span class="stamp-dot" style="background:${meta.color};box-shadow:0 0 8px ${meta.color}"></span>
          <span class="stamp-section-title">${esc(pick(meta.shortName))}</span>
          <span class="stamp-section-prog ${unlocked ? 'full' : ''}">${prog.done}/${prog.total}${unlocked ? ' 🏆' : ''}</span>
        </div>
        <div class="stamp-grid">${cells}</div>
      </div>`;
    })
    .join('');

  card.innerHTML = `
    <button class="close-btn" id="stamp-close" aria-label="close">✕</button>
    <div class="stamp-header">
      <div class="stamp-seal">印</div>
      <div>
        <h2 class="stamp-title font-brush">${esc(getText('stamp.title'))}</h2>
        <p class="stamp-sub">${esc(getText('stamp.subtitle'))}</p>
      </div>
    </div>
    <div class="stamp-total">
      <span class="stamp-total-label">${esc(getText('stamp.total'))}</span>
      <div class="stamp-total-bar"><div class="stamp-total-fill" style="width:${total.total ? (total.done / total.total) * 100 : 0}%"></div></div>
      <span class="stamp-total-num">${total.done}/${total.total}</span>
    </div>
    ${total.done === 0 ? `<div class="stamp-empty">${esc(getText('stamp.empty'))}</div>` : ''}
    <div class="stamp-sections">${sections}</div>`;

  modal.classList.add('open');
  card.querySelector('#stamp-close').addEventListener('click', closeStampBook);
  card.querySelectorAll('.stamp-cell').forEach((cell) => {
    cell.addEventListener('mouseenter', () => cell.classList.add('is-hovered'));
    cell.addEventListener('mouseleave', () => cell.classList.remove('is-hovered'));
    cell.addEventListener('focus', () => cell.classList.add('is-hovered'));
    cell.addEventListener('blur', () => cell.classList.remove('is-hovered'));
    // 点击任意印章格 → 飞至该锚点；未点亮格也可作为目录入口使用
    cell.addEventListener('click', () => {
      const a = ANCHORS.find((x) => x.id === cell.dataset.anchor);
      if (a && stampHandlers.onPickAnchor) {
        closeStampBook();
        stampHandlers.onPickAnchor(a);
      }
    });
  });
}

/** 关闭印章册 */
export function closeStampBook() {
  const modal = document.getElementById('stamp-modal');
  if (modal) modal.classList.remove('open');
}

export function isStampBookOpen() {
  const modal = document.getElementById('stamp-modal');
  return modal && modal.classList.contains('open');
}

/** 刷新印章册顶部按钮的进度角标 */
export function refreshStampBadge() {
  const total = getTotalProgress();
  const badge = document.getElementById('stamp-count');
  if (badge) badge.textContent = `${total.done}/${total.total}`;
}

/* ============================================================= */
/* ===== 图层成就解锁贺卡 ====================================== */
/* ============================================================= */

/** 弹出图层成就贺卡（集齐某图层全部印章时）*/
export function showAchievementCard(themeKey) {
  const meta = THEMES[themeKey];
  if (!meta) return;
  let el = document.getElementById('achievement-card');
  if (!el) {
    el = document.createElement('div');
    el.id = 'achievement-card';
    document.body.appendChild(el);
  }
  el.style.setProperty('--ach-accent', meta.color);
  el.innerHTML = `
    <div class="ach-inner">
      <div class="ach-rays"></div>
      <div class="ach-trophy">🏆</div>
      <div class="ach-title font-brush">${esc(getText('stamp.achievement'))}</div>
      <div class="ach-theme" style="color:${meta.color}">${esc(pick(meta.shortName))}</div>
      <div class="ach-body">${esc(getText('stamp.achievement_body', { theme: pick(meta.shortName) }))}</div>
    </div>`;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4200);
}

/* ============================================================= */
/* ===== 地理围栏到店提示 ====================================== */
/* ============================================================= */

let lastGeofenceId = null;

/**
 * 处理地理围栏命中：进入某锚点 80m 内且该锚点有副本且未在提示中 → 弹出到店提示。
 * @param {{anchor:CulturalAnchor,distM:number}[]} hits map.checkGeofence 结果
 * @param {(anchor:CulturalAnchor)=>void} onEnterOnsite 点击"实地通关"回调
 */
export function handleGeofence(hits, onEnterOnsite) {
  const hit = hits.find((h) => EPISODES[h.anchor.id]);
  if (!hit) {
    lastGeofenceId = null;
    return;
  }
  if (hit.anchor.id === lastGeofenceId) return; // 同一锚点不重复弹
  lastGeofenceId = hit.anchor.id;

  let el = document.getElementById('geofence-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'geofence-toast';
    document.body.appendChild(el);
  }
  const a = hit.anchor;
  el.innerHTML = `
    <div class="gf-icon">📍</div>
    <div class="gf-text">
      <div class="gf-title">${esc(getText('geofence.arrived', { name: pick(a.name) }))}</div>
      <div class="gf-sub">${esc(getText('geofence.tip'))}</div>
    </div>
    <button class="gf-btn" id="gf-enter">${esc(getText('episode.enter'))}</button>`;
  el.classList.add('show');
  el.querySelector('#gf-enter').addEventListener('click', () => {
    el.classList.remove('show');
    if (onEnterOnsite) onEnterOnsite(a);
  });
  // 8 秒后自动收起（不强制打断）
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 8000);
}
