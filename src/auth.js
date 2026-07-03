// Supabase account wrapper for no-build ESM usage.
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
    ready: false,
    session: null,
    subscription: null,
  };

  const emit = (event) => {
    const snapshot = {
      client: state.client,
      configured: state.configured,
      error: state.error,
      ready: state.ready,
      session: state.session,
    };
    if (onChange) onChange(snapshot, event);
    listeners.forEach((fn) => fn(snapshot, event));
  };

  const ensureClient = async () => {
    if (!state.ready) await api.init();
    if (!state.client) throw new Error('supabase-unavailable');
    return state.client;
  };

  const api = {
    get client() {
      return state.client;
    },
    get configured() {
      return state.configured;
    },
    get ready() {
      return state.ready;
    },
    get session() {
      return state.session;
    },
    get user() {
      return state.session && state.session.user ? state.session.user : null;
    },
    get phone() {
      const user = api.user;
      return (user && (user.phone || (user.user_metadata && user.user_metadata.phone))) || '';
    },
    isLoggedIn() {
      return !!api.user;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    async init() {
      if (state.ready) return state;
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
            detectSessionInUrl: false,
            persistSession: true,
          },
        });

        const { data, error } = await state.client.auth.getSession();
        if (error) throw error;
        state.session = data && data.session ? data.session : null;

        const { data: subData } = state.client.auth.onAuthStateChange((event, session) => {
          state.session = session || null;
          emit(event || 'AUTH_CHANGED');
        });
        state.subscription = subData && subData.subscription ? subData.subscription : null;
        state.ready = true;
        emit('READY');
      } catch (error) {
        state.client = null;
        state.configured = false;
        state.error = error;
        state.ready = true;
        emit('AUTH_UNAVAILABLE');
      }
      return state;
    },
    async sendOtp(phone) {
      const client = await ensureClient();
      const { error } = await client.auth.signInWithOtp({ phone });
      if (error) throw error;
    },
    async verifyOtp(phone, token) {
      const client = await ensureClient();
      const { data, error } = await client.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });
      if (error) throw error;
      state.session = data && data.session ? data.session : state.session;
      emit('SIGNED_IN');
      return state.session;
    },
    async signOut() {
      if (!state.client) return;
      const { error } = await state.client.auth.signOut();
      if (error) throw error;
      state.session = null;
      emit('SIGNED_OUT');
    },
    destroy() {
      if (state.subscription && state.subscription.unsubscribe) {
        state.subscription.unsubscribe();
      }
      listeners.clear();
    },
  };

  return api;
}
