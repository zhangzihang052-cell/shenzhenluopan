// 邮箱认证模块 —— 湾区罗盘
// 使用 Supabase Auth 原生邮箱认证，无需 Edge Function 或短信服务

const SUPABASE_ESM_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

function getConfig() {
  return window.SUPABASE_CONFIG || null;
}

function hasConfig() {
  const cfg = getConfig();
  return !!(cfg && cfg.url && cfg.anonKey);
}

export function createAuthController({ onChange } = {}) {
  const listeners = new Set();
  const state = {
    client: null,
    configured: hasConfig(),
    error: null,
    initPromise: null,
    ready: false,
    user: null,
  };

  const emit = (event) => {
    const snapshot = {
      client: state.client,
      configured: state.configured,
      error: state.error,
      ready: state.ready,
      user: state.user,
      session: state.user ? { user: state.user } : null,
    };
    if (onChange) onChange(snapshot, event);
    listeners.forEach((fn) => fn(snapshot, event));
  };

  const api = {
    get client() { return state.client; },
    get configured() { return state.configured; },
    get ready() { return state.ready; },
    get user() { return state.user; },
    get session() { return state.user ? { user: state.user } : null; },
    get email() { return state.user ? state.user.email || '' : ''; },
    isLoggedIn() { return !!state.user; },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    async init() {
      if (state.ready) return state;
      if (state.initPromise) return state.initPromise;
      state.initPromise = (async () => {
        state.configured = hasConfig();
        if (!state.configured) {
          state.ready = true;
          emit('GUEST_MODE');
          return state;
        }

        try {
          const { createClient } = await import(SUPABASE_ESM_URL);
          const cfg = getConfig();
          state.client = createClient(cfg.url, cfg.anonKey, {
            auth: {
              autoRefreshToken: true,
              detectSessionInUrl: true,
              persistSession: true,
            },
          });

          // 恢复已有会话
          const { data: { session } } = await state.client.auth.getSession();
          if (session?.user) {
            state.user = {
              id: session.user.id,
              email: session.user.email,
            };
          }

          // 监听认证状态变化
          state.client.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
              state.user = { id: session.user.id, email: session.user.email };
              emit('SIGNED_IN');
            } else {
              state.user = null;
              emit('SIGNED_OUT');
            }
          });
        } catch (e) {
          state.error = e;
          console.warn('Supabase client 创建失败:', e);
        }

        state.ready = true;
        emit('READY');
        return state;
      })().finally(() => {
        state.initPromise = null;
      });
      return state.initPromise;
    },

    async signUp(email, password) {
      if (!state.client) throw new Error('认证未初始化');
      const { data, error } = await state.client.auth.signUp({ email, password });
      if (error) throw error;

      // 某些配置下需要邮箱确认才能登录
      if (data.user && !data.session) {
        return { needsConfirm: true, email };
      }

      if (data.session?.user) {
        state.user = { id: data.session.user.id, email: data.session.user.email };
        emit('SIGNED_IN');
      }
      return { needsConfirm: false, email };
    },

    async signIn(email, password) {
      if (!state.client) throw new Error('认证未初始化');
      const { data, error } = await state.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // onAuthStateChange 通常已触发 SIGNED_IN，这里仅在未触发时补充
      if (data.session?.user && !state.user) {
        state.user = { id: data.session.user.id, email: data.session.user.email };
        emit('SIGNED_IN');
      }
      return state.user;
    },

    async signOut() {
      if (state.client) await state.client.auth.signOut();
      // 仅在 state.user 尚未被 onAuthStateChange 清除时才手动 emit
      // 避免 SIGNED_OUT 被触发两次
      if (state.user) {
        state.user = null;
        emit('SIGNED_OUT');
      }
    },

    destroy() { listeners.clear(); },
  };

  return api;
}
