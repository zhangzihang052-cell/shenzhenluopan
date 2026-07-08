// 账户页面模块 —— 湾区罗盘
// 提供邮箱注册+登录，以及访客模式
import { getText } from './i18n.js?rev=welcome-6';

export function createWelcomeController({ auth, onLogin, onGuest }) {
  const state = {
    overlay: null,
    step: 'home', // 'home' | 'auth'
    mode: 'signin', // 'signin' | 'signup'
    email: '',
    password: '',
    message: '',
    loading: false,
  };

  function render() {
    if (!state.overlay) return;
    const content = state.overlay.querySelector('.account-content');
    if (!content) return;

    if (state.step === 'home') renderHome(content);
    else renderAuth(content);
  }

  // ---- 首页：登录 or 访客 ----
  function renderHome(content) {
    content.innerHTML = `
      <div class="account-card">
        <button class="account-close" type="button" data-close>✕</button>
        <div class="account-seal">罗盘</div>
        <h1 class="account-title">${esc(getText('auth.welcome_title'))}</h1>
        <p class="account-sub">${esc(getText('auth.welcome_sub'))}</p>
        <div class="account-benefits" aria-label="${esc(getText('auth.title'))}">
          <span>${esc(getText('auth.login_benefit_1'))}</span>
          <span>${esc(getText('auth.login_benefit_2'))}</span>
          <span>${esc(getText('auth.login_benefit_3'))}</span>
        </div>
        <div class="account-actions">
          <button class="account-btn-primary" type="button" id="go-login">
            ${esc(getText('auth.welcome_login'))}
          </button>
          <button class="account-btn-guest" type="button" id="go-guest">
            ${esc(getText('auth.welcome_guest'))}
          </button>
        </div>
        <p class="account-guest-hint">${esc(getText('auth.welcome_guest_hint'))}</p>
      </div>
    `;
    content.querySelector('#go-login').addEventListener('click', () => {
      state.step = 'auth';
      state.mode = 'signin';
      state.message = '';
      render();
    });
    content.querySelector('#go-guest').addEventListener('click', () => {
      dismiss();
      if (onGuest) onGuest();
    });
    content.querySelector('[data-close]').addEventListener('click', () => dismiss());
  }

  // ---- 登录/注册：邮箱 + 密码 ----
  function renderAuth(content) {
    const isSignUp = state.mode === 'signup';

    content.innerHTML = `
      <div class="account-card">
        <button class="account-close" type="button" data-close>✕</button>
        <button class="account-back" type="button" id="account-back">←</button>
        <div class="account-seal">罗盘</div>
        <h1 class="account-title">${esc(isSignUp ? getText('auth.signup_title') : getText('auth.title'))}</h1>
        <p class="account-sub">${esc(getText('auth.account_hint'))}</p>

        <form class="account-form" id="account-form">
          <label class="account-field">
            <span>${esc(getText('auth.email_label'))}</span>
            <input id="account-email" type="email" inputmode="email" autocomplete="email"
              value="${esc(state.email)}"
              placeholder="${esc(getText('auth.email_label'))}"
              ${state.loading ? 'disabled' : ''} />
          </label>

          <label class="account-field">
            <span>${esc(getText('auth.password_label'))}</span>
            <input id="account-password" type="password" autocomplete="${isSignUp ? 'new-password' : 'current-password'}"
              value="${esc(state.password)}"
              placeholder="${esc(getText('auth.password_label'))}"
              ${state.loading ? 'disabled' : ''} />
          </label>

          ${state.message ? `<p class="account-message account-error">${esc(state.message)}</p>` : ''}

          <button class="account-submit" type="submit" ${state.loading ? 'disabled' : ''}>
            ${state.loading ? '…' : esc(isSignUp ? getText('auth.signup') : getText('auth.signin'))}
          </button>
        </form>

        <p class="account-switch-mode">
          ${esc(isSignUp ? getText('auth.has_account') : getText('auth.no_account'))}
          <button type="button" class="account-link" id="account-switch">
            ${esc(isSignUp ? getText('auth.signin') : getText('auth.signup'))}
          </button>
        </p>
      </div>
    `;

    // 返回首页
    content.querySelector('#account-back').addEventListener('click', () => {
      state.step = 'home';
      state.message = '';
      state.loading = false;
      render();
    });
    // 关闭弹窗
    content.querySelector('[data-close]').addEventListener('click', () => dismiss());

    // 切换登录/注册
    content.querySelector('#account-switch').addEventListener('click', () => {
      state.mode = isSignUp ? 'signin' : 'signup';
      state.message = '';
      render();
    });

    // 输入时实时保存，防止 re-render 丢失已输入内容
    const emailInput = content.querySelector('#account-email');
    const passwordInput = content.querySelector('#account-password');
    emailInput.addEventListener('input', () => { state.email = emailInput.value; });
    passwordInput.addEventListener('input', () => { state.password = passwordInput.value; });

    // 表单提交
    const form = content.querySelector('#account-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = content.querySelector('#account-email').value.trim();
      const password = content.querySelector('#account-password').value;

      if (!email) { state.message = getText('auth.email_required'); render(); return; }
      if (!password || password.length < 6) { state.message = getText('auth.password_short'); render(); return; }

      state.email = email;
      state.password = password;
      state.message = '';
      state.loading = true;
      render();

      try {
        if (!auth.ready) await auth.init();

        if (isSignUp) {
          const result = await auth.signUp(email, password);
          if (result.needsConfirm) {
            state.message = getText('auth.confirm_email');
            state.loading = false;
            render();
            return;
          }
        } else {
          await auth.signIn(email, password);
        }

        state.loading = false;
        dismiss();
        if (onLogin) onLogin();
      } catch (err) {
        state.loading = false;
        state.message = err.message || getText('auth.auth_error');
        render();
      }
    });
  }

  // ---- 已登录：账户管理面板 ----
  function renderAccount(content) {
    const email = auth.email || '';
    content.innerHTML = `
      <div class="account-card">
        <button class="account-close" type="button" data-close>✕</button>
        <div class="account-seal">罗盘</div>
        <h1 class="account-title">${esc(getText('auth.account'))}</h1>
        <p class="account-sub" style="word-break:break-all">${esc(email)}</p>
        <div class="account-benefits">
          <span>${esc(getText('auth.login_benefit_1'))}</span>
          <span>${esc(getText('auth.login_benefit_2'))}</span>
          <span>${esc(getText('auth.login_benefit_3'))}</span>
        </div>
        <div class="account-actions" style="margin-top:24px">
          <button class="account-btn-guest" type="button" id="account-logout">
            ${esc(getText('auth.btn_logout'))}
          </button>
          <button class="account-btn-primary" type="button" id="account-close">
            ${esc(getText('auth.close'))}
          </button>
        </div>
      </div>
    `;
    content.querySelector('[data-close]').addEventListener('click', () => dismiss());
    content.querySelector('#account-logout').addEventListener('click', async () => {
      try {
        await auth.signOut();
        // memory.js 的 SIGNED_OUT 监听器已负责清除用户专属 localStorage key
        // 这里只需关闭弹窗并刷新页面
        dismiss();
        window.location.reload();
      } catch (err) {
        state.message = getText('auth.auth_error');
        renderAccount(content);
      }
    });
    content.querySelector('#account-close').addEventListener('click', () => {
      dismiss();
    });
  }

  function dismiss() {
    if (!state.overlay) return;
    state.overlay.classList.add('account-hidden');
    setTimeout(() => { state.overlay?.remove(); state.overlay = null; }, 300);
  }

  function show() {
    if (state.overlay) return;
    const overlay = document.createElement('div');
    overlay.className = 'account-overlay';
    overlay.innerHTML = `<div class="account-content"></div>`;
    document.body.appendChild(overlay);
    state.overlay = overlay;
    state.message = '';
    state.loading = false;
    const content = overlay.querySelector('.account-content');
    // 点击遮罩区域关闭弹窗（仅在首页和已登录面板生效，注册/登录页面不关闭以防误触）
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && state.step !== 'auth') dismiss();
    });
    if (auth.isLoggedIn()) {
      renderAccount(content);
    } else {
      state.step = 'home';
      render();
    }
  }

  return { show, dismiss };
}

function esc(v) {
  return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
