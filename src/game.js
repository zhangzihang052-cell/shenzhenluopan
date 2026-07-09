// 锚点剧情副本 · 游戏模块：localStorage 进度 + 剧情状态机 UI + 印章册 + 成就 + 地理围栏提示
// build: 2026-06-18
import { EPISODES } from './data/episodes.js?rev=audio-sfx-1';
import { getMascot } from './data/mascots.js?rev=mascot-set-1';
import { THEMES, THEME_ORDER, OVERVIEW_MODE } from './data/themes.js?rev=clean-8';
import { ANCHORS } from './data/anchors.js?rev=v2-mobile-audit-1';
import { getText, pick } from './i18n.js?rev=memory-ui-polish-1';
import { fetchCloudData, pushProgressOnly, mergeProgress, setCloudConfig, clearCloudConfig, isCloudReady } from './cloud-sync.js?rev=cloud-1';

const STORAGE_KEY = 'stc_progress';
let _currentUserId = null;
function getStorageKey() {
  return _currentUserId ? `${STORAGE_KEY}:${_currentUserId}` : STORAGE_KEY;
}
const RPG_LABELS = {
  task: { zh: '任务', en: 'Objective' },
  clues: { zh: '已获得线索', en: 'Clues found' },
  investigate: { zh: '调查', en: 'Inspect' },
  collected: { zh: '已收集', en: 'Collected' },
  completeInvestigation: { zh: '完成调查', en: 'Finish Survey' },
  continueInvestigation: { zh: '继续调查', en: 'Continue Survey' },
  continue: { zh: '继续推进', en: 'Continue' },
  myRecord: { zh: '我的记录', en: 'My Record' },
  playerRole: { zh: '我 · 文书小吏', en: 'Me · Prefecture Clerk' },
  caseNote: { zh: '案卷批注', en: 'Case Note' },
  recordIt: { zh: '记入案卷', en: 'Enter Record' },
  rewardHint: { zh: '获得知识卡 / 点亮印章', en: 'Knowledge card / stamp unlocked' },
};
const PROVIDED_PORTRAIT_NAMES = new Set([
  '郑和',
  '葛洪',
  '屠呦呦',
  '钱学森',
  '袁庚',
  '文天祥',
  '陈烟桥',
  '赵佗',
  '詹天佑',
  '马化腾',
  '汪滔',
  '邓小平',
  '张敬修',
  '赖恩爵',
]);

/** HTML 转义 */
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resolveAssetSrc(src) {
  const raw = String(src || '').trim();
  if (!raw) return '';
  if (!/^(https?:|data:)/i.test(raw)) {
    let normalized = raw.replace(/^\.?\//, '');
    if (normalized.startsWith('assets/')) normalized = `public/${normalized}`;
    normalized = normalized.replace(/^(public\/anchors\/generated\/[^?#]+)\.webp([?#].*)?$/i, '$1.jpg$2');
    try {
      return new URL(normalized, document.baseURI).href;
    } catch (e) {
      return normalized;
    }
  }
  try {
    return new URL(raw, document.baseURI).href;
  } catch (e) {
    return raw;
  }
}

function cssUrl(src) {
  const resolved = resolveAssetSrc(src).replace(/"/g, '%22');
  return `url("${resolved}")`;
}

function rpgSceneStyle(rpg, theme) {
  return `--rpg-bg-image:${esc(cssUrl(rpg && rpg.background))};--ep-accent:${esc(theme.color)}`;
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

function needsProvidedPortrait(character) {
  const name = pick(character && character.name);
  return PROVIDED_PORTRAIT_NAMES.has(name);
}

function renderCharacterAvatar(character, theme, themeKey, className = 'ep-char-avatar') {
  const name = pick(character && character.name);
  const portrait = String((character && character.portrait) || '').trim();
  const pending = !portrait && needsProvidedPortrait(character);
  const mascot = !portrait && !pending ? getMascot(themeKey) : null;
  const imgSrc = resolveAssetSrc(portrait || (mascot && mascot.img) || '');
  const stateClass = portrait ? 'has-portrait' : pending ? 'portrait-pending no-img' : 'theme-avatar';
  const label = pending ? getText('episode.portrait_pending') : (name || '').slice(0, 1);
  return `
    <div class="${className} ${stateClass}" style="border-color:${theme.color}" data-label="${esc(label)}">
      ${
        imgSrc
          ? `<img src="${esc(imgSrc)}" alt="${esc(name)}" onerror="this.parentElement.classList.add('no-img');this.remove()"/>`
          : ''
      }
      <span class="ep-char-fallback">${esc(label)}</span>
    </div>`;
}

/* ============================================================= */
/* ===== 进度持久化模块（localStorage + 云端同步）=============== */
/* ============================================================= */

let _cloudDebounceTimer = null;

/** 登录时调用：设置云端配置并拉取云端数据合并到本地 */
export async function initCloudSync(supabaseClient, userId) {
  setCloudConfig(supabaseClient, userId);
  // 切换到用户专属 key，并迁移游客数据
  if (_currentUserId !== userId) {
    _currentUserId = userId;
  }
  const cloud = await fetchCloudData();
  if (cloud && cloud.progress) {
    const local = loadProgress();
    const merged = mergeProgress(local, cloud.progress);
    saveProgress(merged);
  }
}

/** 登出时调用：清除云端配置 */
export function clearSync() {
  // 清除当前用户专属 key，防止下一个用户读到
  try { localStorage.removeItem(getStorageKey()); } catch (_) {}
  _currentUserId = null;
  clearCloudConfig();
}

/** 异步推送进度到云端（防抖 1.5 秒） */
function syncToCloud() {
  if (!isCloudReady()) return;
  clearTimeout(_cloudDebounceTimer);
  _cloudDebounceTimer = setTimeout(() => {
    pushProgressOnly(loadProgress());
  }, 1500);
}

/** 读取进度（容错：损坏 / 缺失 → 返回初始结构）*/
export function loadProgress() {
  try {
    const raw = localStorage.getItem(getStorageKey());
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
    localStorage.setItem(getStorageKey(), JSON.stringify(p));
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
  syncToCloud();
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
    rpgStepIndex: 0,
    rpgCollected: new Set(),
    rpgActiveClue: null,
    rpgAnswer: null,
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

function rpgLabel(key) {
  return pick(RPG_LABELS[key] || {});
}

function isRpgEpisode(episode) {
  return episode && episode.immersiveMode === 'rpg-dialogue' && episode.rpg;
}

function renderRpgChapterProgress(chapters, activeChapter) {
  return (chapters || [])
    .map((chapter, index) => {
      const cls = index === activeChapter ? 'active' : index < activeChapter ? 'done' : '';
      return `<span class="rpg-chapter ${cls}">${esc(pick(chapter))}</span>`;
    })
    .join('');
}

function getRpgBeat() {
  if (!episodeState || !episodeState.episode.rpg) return null;
  const beats = episodeState.episode.rpg.beats || [];
  return beats[episodeState.rpgStepIndex] || beats[beats.length - 1] || null;
}

function getRpgActiveChapter() {
  const rpg = episodeState && episodeState.episode.rpg;
  if (!rpg) return 0;
  if (episodeState.phase === 'reward') return Math.max(0, (rpg.chapters || []).length - 1);
  const beat = getRpgBeat();
  return Math.max(0, Math.min((rpg.chapters || []).length - 1, Number(beat && beat.chapter) || 0));
}

function getRpgSpeakerType(beat) {
  if (!beat) return 'npc';
  if (beat.speakerType) return beat.speakerType;
  const name = pick(beat.speakerName || {});
  if (name.includes('文书') || name.includes('Clerk')) return 'player';
  if (beat.type === 'narration') return 'narration';
  if (beat.type === 'system') return 'system';
  return 'npc';
}

function resolveRpgSpeaker(beat) {
  const chars = (episodeState && episodeState.episode.characters) || [];
  const type = getRpgSpeakerType(beat);
  if (type === 'player') {
    return {
      name: (beat && beat.speakerName) || RPG_LABELS.myRecord,
      role: (beat && beat.speakerRole) || RPG_LABELS.playerRole,
      portrait: '',
    };
  }
  if (type === 'narration') {
    return {
      name: { zh: '场景提示', en: 'Scene Note' },
      role: { zh: '旁白', en: 'Narration' },
      portrait: '',
    };
  }
  if (typeof (beat && beat.speaker) === 'number' && chars[beat.speaker]) return chars[beat.speaker];
  return {
    name: (beat && beat.speakerName) || (chars[0] && chars[0].name) || { zh: '东官郡守', en: 'Prefect of Dongguan' },
    role: (beat && beat.speakerRole) || (chars[0] && chars[0].role) || { zh: '东晋行政长官', en: 'Eastern Jin Administrator' },
    portrait: (beat && beat.portrait) || (chars[0] && chars[0].portrait) || '',
  };
}

function renderRpgSpeakerTab(speaker, speakerType) {
  if (speakerType === 'player') {
    return `
      <div class="rpg-speaker-tab rpg-speaker-tab-player">
        <span class="rpg-record-mark" aria-hidden="true">卷</span>
        <span class="rpg-speaker-copy">
          <strong>${esc(rpgLabel('myRecord'))}</strong>
          <span>${esc(pick(speaker.role) || rpgLabel('playerRole'))}</span>
        </span>
      </div>`;
  }
  if (speakerType === 'narration') {
    return `
      <div class="rpg-speaker-tab rpg-speaker-tab-narration">
        <span class="rpg-speaker-copy">
          <strong>${esc(pick(speaker.name))}</strong>
          <span>${esc(pick(speaker.role))}</span>
        </span>
      </div>`;
  }
  const portrait = resolveAssetSrc((speaker && speaker.portrait) || '');
  const name = pick(speaker && speaker.name);
  const fallback = (name || '郡').slice(0, 1);
  return `
    <div class="rpg-speaker-tab rpg-speaker-tab-npc">
      <span class="rpg-speaker-avatar-mini ${portrait ? 'has-img' : 'no-img'}" data-label="${esc(fallback)}">
        ${portrait ? `<img src="${esc(portrait)}" alt="${esc(name)}" onerror="this.parentElement.classList.remove('has-img');this.parentElement.classList.add('no-img');this.remove()" />` : ''}
      </span>
      <span class="rpg-speaker-copy">
        <strong>${esc(name)}</strong>
        <span>${esc(pick(speaker.role))}</span>
      </span>
    </div>`;
}

function getRpgClueFeedback(clue) {
  return pick((clue && clue.npcFeedback) || {
    zh: '很好。把这条线索记下，再继续踏勘。',
    en: 'Good. Record this clue, then continue the survey.',
  });
}

function ensureRpgSentence(text, lang = getRpgDialogueLang()) {
  const value = String(text || '').trim();
  if (!value) return '';
  return /[。！？.!?…]$/.test(value) ? value : `${value}${lang === 'zh' ? '。' : '.'}`;
}

function getRpgDialogueLang() {
  return pick({ zh: 'zh', en: 'en' }) === 'zh' ? 'zh' : 'en';
}

function cleanRpgNpcFeedback(text, lang) {
  const value = String(text || '').trim();
  if (!value) return '';
  if (lang === 'zh') {
    return value
      .replace(/^(很好|不错|准确|对|正是|记下|听得准)[。！!，,、\s]*/u, '')
      .trim();
  }
  return value
    .replace(/^(Good|Yes|Correct|Exactly|Record this|Record that|Good ear)[.!，,\s]*/iu, '')
    .trim();
}

function joinRpgSentences(first, second, lang) {
  if (!second) return first;
  return lang === 'zh' ? `${first}${second}` : `${first} ${second}`;
}

function buildRpgNpcClueDialogue(clue, rpg) {
  const lang = getRpgDialogueLang();
  const title = pick(clue.title || clue.label);
  const text = ensureRpgSentence(pick(clue.text), lang);
  const feedback = ensureRpgSentence(cleanRpgNpcFeedback(getRpgClueFeedback(clue), lang), lang);
  const scene = pick(rpg && (rpg.sceneName || rpg.chapterTitle));
  const customDialogue = lang === 'zh' ? pick(clue.dialogue) : '';
  if (customDialogue) return [ensureRpgSentence(customDialogue, lang)];

  if (lang === 'zh') {
    const lead = title
      ? `“${title}”这条线索很关键：${text}`
      : `这条线索很关键：${text}`;
    const reading = feedback || '它让我们看见，这处地点的价值往往藏在日常细节背后的连接方式里。';
    const scenePart = scene ? `「${scene}」` : '这一站';
    return [
      joinRpgSentences(lead, reading, lang),
      `你看到的不是一段孤立材料，而是通向${scenePart}核心判断的一块拼图。继续把它和其他线索并起来，才能看清这里为什么重要。`,
    ];
  }

  const lead = title
    ? `"${title}" matters: ${text}`
    : `This clue matters: ${text}`;
  const reading = feedback || 'It shows that a place often matters through the connections hidden behind ordinary details.';
  return [
    joinRpgSentences(lead, reading, lang),
    `This is not an isolated record. It is one piece of the judgment behind ${scene || 'this stop'}. Connect it with the remaining clues to understand why this place matters.`,
  ];
}

function renderRpgDialogueContent(activeClue, dialogueText, rpg, speaker) {
  if (activeClue) {
    const title = pick(activeClue.title || activeClue.label);
    const lang = getRpgDialogueLang();
    const dialogueLines = buildRpgNpcClueDialogue(activeClue, rpg);
    const speakerName = pick(speaker && speaker.name);
    const clueMark = lang === 'zh' ? `【线索：${title}】` : `[Clue: ${title}]`;
    const speakerMark = speakerName ? `${speakerName}${lang === 'zh' ? '：' : ': '}` : '';
    return `
      <div class="rpg-dialogue-copy rpg-clue-dialogue-copy" aria-live="polite">
        <p><span class="rpg-clue-line">${esc(clueMark)}</span>${esc(speakerMark)}${dialogueLines.map((line) => esc(line)).join('<br>')}</p>
      </div>`;
  }
  return `
    <div class="rpg-dialogue-copy">
      <p>${esc(dialogueText)}</p>
    </div>`;
}

function getRpgContinueLabel(beat, speakerType, isInvestigation, allCluesCollected) {
  if (beat && beat.continueLabel) return pick(beat.continueLabel);
  if (isInvestigation) return allCluesCollected ? rpgLabel('completeInvestigation') : rpgLabel('continueInvestigation');
  if (speakerType === 'player') return rpgLabel('recordIt');
  return rpgLabel('continue');
}

function renderRpgHotspots(rpg, collected, activeId) {
  return `
    <div class="rpg-hotspots" aria-label="${esc(rpgLabel('investigate'))}">
      ${(rpg.clues || [])
        .map((clue) => {
          const done = collected.has(clue.id);
          const active = activeId === clue.id;
          const x = Math.max(8, Math.min(92, Number(clue.x) || 50));
          const y = Math.max(18, Math.min(62, Number(clue.y) || 50));
          return `
            <button class="rpg-hotspot ${done ? 'collected' : ''} ${active ? 'active' : ''}" data-clue-id="${esc(clue.id)}" style="left:${x}%;top:${y}%">
              <span class="rpg-hotspot-dot"></span>
              <span class="rpg-hotspot-label">${esc(done ? rpgLabel('collected') : pick(clue.label))}</span>
            </button>`;
        })
        .join('')}
    </div>`;
}

function renderRpgOptions(beat, answer) {
  if (beat.type !== 'choice') return '';
  return `
    <div class="rpg-options">
      ${(beat.options || [])
        .map((option, index) => {
          const picked = answer && answer.index === index;
          const cls = answer
            ? option.correct
              ? 'is-correct'
              : picked
                ? 'is-wrong'
                : 'locked'
            : '';
          return `
            <button class="rpg-option ${cls}" data-opt="${index}" ${answer ? 'disabled' : ''}>
              <span>${String.fromCharCode(65 + index)}</span>
              <b>${esc(pick(option.text))}</b>
            </button>`;
        })
        .join('')}
    </div>`;
}

function advanceRpgBeat() {
  const beats = (episodeState && episodeState.episode.rpg && episodeState.episode.rpg.beats) || [];
  if (episodeState.rpgStepIndex >= beats.length - 1) {
    episodeState.phase = 'reward';
  } else {
    episodeState.rpgStepIndex += 1;
    episodeState.rpgAnswer = null;
    episodeState.rpgActiveClue = null;
  }
  renderEpisodePhase();
}

function renderRpgEpisodePhase() {
  const body = document.getElementById('episode-body');
  const progress = document.getElementById('episode-progress');
  if (!body || !episodeState) return;
  if (progress) progress.innerHTML = '';
  const { anchor, episode } = episodeState;
  const theme = THEMES[anchor.theme] || OVERVIEW_MODE;
  const rpg = episode.rpg;
  const collected = episodeState.rpgCollected || new Set();
  episodeState.rpgCollected = collected;
  const totalClues = (rpg.clues || []).length;
  const activeChapter = getRpgActiveChapter();

  if (episodeState.phase === 'reward') {
    const r = episode.reward;
    const { newlyCompleted, achievementUnlocked } = markComplete(anchor.id, { onsite: episodeState.onsite });
    body.innerHTML = `
      <section class="rpg-episode rpg-reward-scene" style="${rpgSceneStyle(rpg, theme)}">
        <div class="rpg-bg"></div>
        <div class="rpg-shade"></div>
        <div class="rpg-hud">
          <div class="rpg-kicker">${esc(pick(rpg.subtitle))}</div>
          <div class="rpg-progress">${renderRpgChapterProgress(rpg.chapters, activeChapter)}</div>
          <div class="rpg-task done">${esc(pick(rpg.objectiveDone))}</div>
        </div>
        <div class="rpg-reward-panel">
          <span class="rpg-reward-label">${esc(pick(rpg.completion && rpg.completion.title))}</span>
          <div class="ep-badge" style="--ep-accent:${theme.color}">${renderBadgeArt(r, 'ep-badge-art')}</div>
          <h2 class="font-brush">${esc(pick(r.badgeName))}</h2>
          <p>${esc(pick((rpg.completion && rpg.completion.insight) || r.insight))}</p>
          <em>${esc(rpgLabel('rewardHint'))}</em>
          <div class="rpg-reward-actions">
            <button class="rpg-ghost-btn" id="rpg-replay">${esc(getText('episode.replay'))}</button>
            <button class="rpg-ghost-btn" id="rpg-stamps">${esc(getText('episode.view_stamps'))}</button>
            <button class="rpg-next-btn" id="rpg-finish">${esc(getText('episode.close'))}</button>
          </div>
        </div>
      </section>`;
    body.querySelector('#rpg-replay').addEventListener('click', () => {
      episodeState.phase = 'intro';
      episodeState.rpgStepIndex = 0;
      episodeState.rpgCollected = new Set();
      episodeState.rpgActiveClue = null;
      episodeState.rpgAnswer = null;
      renderEpisodePhase();
    });
    body.querySelector('#rpg-finish').addEventListener('click', () => {
      const h = episodeState.handlers;
      const a = episodeState.anchor;
      const onsite = episodeState.onsite;
      closeEpisode();
      if (h && h.onComplete) h.onComplete(a, { onsite, newlyCompleted, achievementUnlocked });
    });
    body.querySelector('#rpg-stamps').addEventListener('click', () => {
      const h = episodeState.handlers;
      const a = episodeState.anchor;
      const onsite = episodeState.onsite;
      closeEpisode();
      if (h && h.onComplete) h.onComplete(a, { onsite, newlyCompleted, achievementUnlocked });
      if (h && h.onOpenStampBook) h.onOpenStampBook(a, { onsite, newlyCompleted, achievementUnlocked });
    });
    const h = episodeState.handlers;
    if (h && h.onReward) h.onReward(anchor, { onsite: episodeState.onsite, newlyCompleted, achievementUnlocked });
    return;
  }

  const beat = getRpgBeat();
  const activeClue = (rpg.clues || []).find((clue) => clue.id === episodeState.rpgActiveClue);
  const rawSpeakerType = getRpgSpeakerType(beat);
  const dialogueMode = activeClue
    ? 'npc'
    : rawSpeakerType === 'player'
      ? 'player'
      : rawSpeakerType === 'narration' || rawSpeakerType === 'system'
        ? 'narration'
        : 'npc';
  const speaker = resolveRpgSpeaker(beat);
  const mainNpc = (episode.characters && episode.characters[0]) || speaker;
  const mainNpcPortrait = resolveAssetSrc((mainNpc && mainNpc.portrait) || '');
  const answer = episodeState.rpgAnswer;
  const selectedOption = answer && beat.options && beat.options[answer.index];
  const dialogueText = activeClue
    ? getRpgClueFeedback(activeClue)
    : selectedOption
      ? pick(selectedOption.feedback)
      : pick(beat.question || beat.text);
  const isInvestigation = beat.type === 'investigate';
  const allCluesCollected = totalClues === 0 || collected.size >= totalClues;
  const continueDisabled = isInvestigation && !allCluesCollected;
  const continueLabel = getRpgContinueLabel(beat, rawSpeakerType, isInvestigation, allCluesCollected);
  const showNextButton = isInvestigation
    ? allCluesCollected
    : beat.type !== 'choice' || !!answer;

  body.innerHTML = `
    <section class="rpg-episode mode-${esc(dialogueMode)}" style="${rpgSceneStyle(rpg, theme)}">
      <div class="rpg-bg"></div>
      <div class="rpg-shade"></div>
      <div class="rpg-hud">
        <div class="rpg-kicker">${esc(pick(rpg.subtitle))}</div>
        <div class="rpg-progress">${renderRpgChapterProgress(rpg.chapters, activeChapter)}</div>
        <h2 class="rpg-scene-title font-brush">${esc(pick(rpg.sceneName))}</h2>
        <span class="rpg-act-title">${esc(pick(rpg.chapterTitle))}</span>
        <div class="rpg-task"><b>${esc(rpgLabel('task'))}</b>${esc(pick(rpg.objective))}</div>
        <div class="rpg-clue-meter">${esc(rpgLabel('clues'))}：<b>${collected.size}/${totalClues}</b></div>
      </div>
      ${isInvestigation ? renderRpgHotspots(rpg, collected, episodeState.rpgActiveClue) : ''}
      <div class="rpg-character-layer">
        <figure class="rpg-npc ${mainNpcPortrait ? '' : 'no-img'}">
          ${
            mainNpcPortrait
              ? `<img src="${esc(mainNpcPortrait)}" alt="${esc(pick(mainNpc.name))}" onerror="this.closest('.rpg-npc').classList.add('no-img')" />`
              : ''
          }
        </figure>
      </div>
      <div class="rpg-dialogue rpg-dialogue-${esc(dialogueMode)}" data-speaker-type="${esc(dialogueMode)}">
        ${renderRpgSpeakerTab(speaker, dialogueMode)}
        ${renderRpgDialogueContent(activeClue, dialogueText, rpg, speaker)}
        ${renderRpgOptions(beat, answer)}
        <div class="rpg-dialogue-actions">
          ${
            !showNextButton
              ? ''
              : `<button class="rpg-next-btn" id="rpg-next" ${continueDisabled ? 'disabled' : ''}>${esc(continueLabel)} →</button>`
          }
        </div>
      </div>
    </section>`;

  body.querySelectorAll('.rpg-hotspot').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.clueId;
      if (!id) return;
      collected.add(id);
      episodeState.rpgActiveClue = id;
      window.dispatchEvent(new CustomEvent('compass-ui-sound', { detail: { type: 'clue' } }));
      renderEpisodePhase();
    });
  });
  body.querySelectorAll('.rpg-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (episodeState.rpgAnswer) return;
      episodeState.rpgAnswer = { index: parseInt(btn.dataset.opt, 10) };
      renderEpisodePhase();
    });
  });
  const nextBtn = body.querySelector('#rpg-next');
  if (nextBtn) nextBtn.addEventListener('click', advanceRpgBeat);
}

/** 渲染当前阶段 */
function renderEpisodePhase() {
  if (!episodeState) return;
  const body = document.getElementById('episode-body');
  const scroll = document.getElementById('episode-scroll');
  if (!body) return;
  const { anchor, episode, phase } = episodeState;
  const theme = THEMES[anchor.theme] || OVERVIEW_MODE;
  if (scroll) {
    const rpgMode = isRpgEpisode(episode);
    scroll.style.setProperty('--ep-accent', theme.color);
    scroll.classList.toggle('is-rpg-dialogue', rpgMode);
  }
  if (isRpgEpisode(episode)) {
    renderRpgEpisodePhase();
    return;
  }
  renderEpisodeProgressDots();

  if (phase === 'intro') {
    // 渲染角色头像区（如果 episode 含 characters 数组）
    const chars = episode.characters || [];
    const charHtml = chars.length ? `
      <div class="ep-characters">
        ${chars.map(c => `
          <div class="ep-char">
            ${renderCharacterAvatar(c, theme, anchor.theme, 'ep-char-avatar')}
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
        ${renderCharacterAvatar(speaker, theme2, anchor.theme, 'ep-speaker-avatar')}
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
    const { newlyCompleted, achievementUnlocked } = markComplete(anchor.id, { onsite: episodeState.onsite });
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
      if (h && h.onComplete) h.onComplete(a, { onsite, newlyCompleted, achievementUnlocked });
    });
    body.querySelector('#ep-stamps').addEventListener('click', () => {
      const h = episodeState.handlers;
      const a = episodeState.anchor;
      const onsite = episodeState.onsite;
      closeEpisode();
      if (h && h.onComplete) h.onComplete(a, { onsite, newlyCompleted, achievementUnlocked });
      if (h && h.onOpenStampBook) h.onOpenStampBook(a, { onsite, newlyCompleted, achievementUnlocked });
    });
    // 通关即时回调（点亮地图印章），成就在关闭时再弹
    const h = episodeState.handlers;
    if (h && h.onReward) h.onReward(anchor, { onsite: episodeState.onsite, newlyCompleted, achievementUnlocked });
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
  el.innerHTML = `
    <button class="close-btn stamp-modal-close" id="stamp-close" aria-label="close">✕</button>
    <div class="stamp-card" id="stamp-card"></div>`;
  root.appendChild(el);
  el.querySelector('#stamp-close').addEventListener('click', closeStampBook);
  // 点击遮罩关闭
  el.addEventListener('click', (e) => {
    if (e.target === el) closeStampBook();
  });
}

/** 打开印章册（每次打开都按最新进度重渲染）
 * @param {{focusAnchorId?:string}|string} opts
 */
export function openStampBook(opts = {}) {
  const modal = document.getElementById('stamp-modal');
  const card = document.getElementById('stamp-card');
  if (!modal || !card) return;
  const focusAnchorId = typeof opts === 'string' ? opts : opts.focusAnchorId;
  const focusLabel = typeof opts === 'string' ? getText('stamp.current_stamp') : opts.focusLabel || getText('stamp.current_stamp');
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
          const focused = id === focusAnchorId;
          return `
          <button class="stamp-cell ${done ? 'earned' : 'locked'} ${focused ? 'just-earned' : ''}" data-anchor="${id}" title="${esc(pick(a.name))}">
            ${focused ? `<span class="stamp-new-label">${esc(focusLabel)}</span>` : ''}
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

  if (focusAnchorId) {
    const target = Array.from(card.querySelectorAll('.stamp-cell')).find((cell) => cell.dataset.anchor === focusAnchorId);
    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        target.focus({ preventScroll: true });
        window.setTimeout(() => target.classList.add('focus-settled'), 1200);
      });
    }
  }
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
