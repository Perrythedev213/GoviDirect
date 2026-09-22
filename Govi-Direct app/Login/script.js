const SESSION_KEY = 'goviDirectSession';

const DEMO_ACCOUNTS = [
  {
    username: 'buyer',
    password: 'buyer123',
    name: 'Demo Buyer',
    accountType: 'buyer',
    role: 'general'
  },
  {
    username: 'seller',
    password: 'seller123',
    name: 'Demo Seller',
    accountType: 'seller',
    role: 'general'
  },
  {
    username: 'admin',
    password: 'admin123',
    name: 'Demo Admin',
    accountType: 'admin',
    role: 'admin'
  }
];

function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem(SESSION_KEY)
    );
  } catch (error) {
    console.warn(
      'Could not read GoviDirect session:',
      error
    );

    return null;
  }
}

function saveSession(account) {
  const session = {
    username: account.username,
    name: account.name,
    accountType: account.accountType,
    role: account.role
  };

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(session)
  );

  return session;
}

function isLoggedIn() {
  return !!getCurrentUser();
}

function logout() {
  localStorage.removeItem(
    SESSION_KEY
  );

  window.location.replace(
    '../Login/index.html'
  );
}

function isAdmin() {
  const user =
    getCurrentUser();

  return !!(
    user &&
    user.role === 'admin'
  );
}

window.GoviDirectAuth = {
  getCurrentUser,
  saveSession,
  isLoggedIn,
  logout,
  isAdmin,
  DEMO_ACCOUNTS
};


function initializeModeSwitch() {
  const modeSwitch =
    document.getElementById(
      'mode-switch'
    );

  const loginButton =
    document.getElementById(
      'login-mode-button'
    );

  const signupButton =
    document.getElementById(
      'signup-mode-button'
    );

  const title =
    document.getElementById(
      'form-title'
    );

  const subtitle =
    document.getElementById(
      'form-subtitle'
    );

  if (
    !modeSwitch ||
    !loginButton ||
    !signupButton ||
    !title ||
    !subtitle
  ) {
    return;
  }

  function showLogin() {
    modeSwitch.classList.remove(
      'signup-active'
    );

    loginButton.classList.add(
      'active'
    );

    signupButton.classList.remove(
      'active'
    );

    title.textContent =
      'Welcome back';

    subtitle.textContent =
      'Log in to continue to GoviDirect.';
  }

  function showSignup() {
    modeSwitch.classList.add(
      'signup-active'
    );

    loginButton.classList.remove(
      'active'
    );

    signupButton.classList.add(
      'active'
    );

    title.textContent =
      'Join GoviDirect';

    subtitle.textContent =
      'Create an account to get started.';
  }

  loginButton.addEventListener(
    'click',
    showLogin
  );

  signupButton.addEventListener(
    'click',
    showSignup
  );
}


function initializeLogin() {
  if (isLoggedIn()) {
    window.location.replace(
      '../Discover/index.html'
    );

    return;
  }

  const form =
    document.getElementById(
      'login-form'
    );

  const usernameInput =
    document.getElementById(
      'username'
    );

  const passwordInput =
    document.getElementById(
      'password'
    );

  const errorMessage =
    document.getElementById(
      'login-error'
    );

  if (!form) {
    return;
  }

  form.addEventListener(
    'submit',
    event => {
      event.preventDefault();

      const username =
        usernameInput.value
          .trim()
          .toLowerCase();

      const password =
        passwordInput.value;

      const account =
        DEMO_ACCOUNTS.find(
          item =>
            item.username === username &&
            item.password === password
        );

      if (!account) {
        errorMessage.textContent =
          'Incorrect username or password.';

        passwordInput.value = '';

        passwordInput.focus();

        return;
      }

      errorMessage.textContent = '';

      saveSession(account);

      window.location.replace(
        '../Discover/index.html'
      );
    }
  );
}


function init() {
  initializeModeSwitch();
  initializeLogin();
}


if (
  document.readyState ===
  'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    init,
    {
      once: true
    }
  );
} else {
  init();
}