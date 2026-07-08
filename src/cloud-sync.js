// 云端进度同步模块 —— 湾区罗盘
// 负责将用户进度（副本通关、成就、想去标记）同步到 Supabase
// 登录时从云端拉取并合并本地，通关时异步写回云端

const TABLE = 'user_progress';

let _supabase = null;
let _userId = null;

/** 设置云端配置（登录时调用） */
export function setCloudConfig(supabaseClient, userId) {
  _supabase = supabaseClient;
  _userId = userId;
}

/** 清除云端配置（登出时调用） */
export function clearCloudConfig() {
  _supabase = null;
  _userId = null;
}

/** 当前是否已连接云端 */
export function isCloudReady() {
  return !!(_supabase && _userId);
}

/**
 * 从云端拉取用户数据
 * @returns {{progress:{completed,achievements}, want_to_visit:string[]}|null}
 */
export async function fetchCloudData() {
  if (!isCloudReady()) return null;
  try {
    const { data, error } = await _supabase
      .from(TABLE)
      .select('progress, want_to_visit')
      .eq('user_id', _userId)
      .maybeSingle();
    if (error) {
      console.warn('[cloud-sync] 拉取失败:', error.message);
      return null;
    }
    if (!data) return null;
    return {
      progress: data.progress || { completed: {}, achievements: [] },
      wantToVisit: data.want_to_visit || [],
    };
  } catch (e) {
    console.warn('[cloud-sync] 拉取异常:', e);
    return null;
  }
}

/**
 * 将数据写回云端（upsert）
 * @param {object} progress {completed, achievements}
 * @param {string[]} wantToVisit
 */
export async function pushCloudData(progress, wantToVisit) {
  if (!isCloudReady()) return;
  try {
    const { error } = await _supabase.from(TABLE).upsert({
      user_id: _userId,
      progress,
      want_to_visit: wantToVisit || [],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (error) console.warn('[cloud-sync] 推送失败:', error.message);
  } catch (e) {
    console.warn('[cloud-sync] 推送异常:', e);
  }
}

/**
 * 合并本地与云端进度（取并集）
 * @param {object} local 本地进度
 * @param {object} cloud 云端进度
 * @returns {object} 合并后的进度
 */
export function mergeProgress(local, cloud) {
  if (!cloud) return local;
  const localCompleted = (local && local.completed) || {};
  const cloudCompleted = (cloud && cloud.completed) || {};
  const merged = { completed: {}, achievements: [] };

  // 合并通关记录：云端优先（保留 onsite 标记），本地补充
  for (const [id, rec] of Object.entries(cloudCompleted)) {
    merged.completed[id] = rec;
  }
  for (const [id, rec] of Object.entries(localCompleted)) {
    if (!merged.completed[id]) {
      merged.completed[id] = rec;
    } else {
      // 如果两端都有，保留 onsite=true 的
      merged.completed[id].onsite = merged.completed[id].onsite || rec.onsite;
    }
  }

  // 合并成就（去重取并集）
  const localAch = (local && local.achievements) || [];
  const cloudAch = (cloud && cloud.achievements) || [];
  merged.achievements = [...new Set([...cloudAch, ...localAch])];

  return merged;
}

/**
 * 合并想去标记（取并集）
 */
export function mergeWantToVisit(local, cloud) {
  if (!cloud) return local;
  return [...new Set([...(cloud || []), ...(local || [])])];
}
