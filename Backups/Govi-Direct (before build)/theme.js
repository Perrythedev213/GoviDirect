(() => {
  'use strict';

  const STORAGE_KEY = 'goviDirectTheme';
  const LIGHT_THEME = 'light';
  const DARK_THEME = 'dark';

  function getStoredTheme() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored === DARK_THEME || stored === LIGHT_THEME) {
        return stored;
      }
    } catch (error) {
      console.warn('Could not read GoviDirect theme:', error);
    }

    return LIGHT_THEME;
  }

  function applyTheme(theme) {
    const resolvedTheme =
      theme === DARK_THEME
        ? DARK_THEME
        : LIGHT_THEME;

    const root = document.documentElement;

    root.classList.toggle(
      'dark',
      resolvedTheme === DARK_THEME
    );

    root.dataset.theme = resolvedTheme;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        resolvedTheme
      );
    } catch (error) {
      console.warn('Could not save GoviDirect theme:', error);
    }

    updateThemeColor(resolvedTheme);

    window.dispatchEvent(
      new CustomEvent('goviThemeChanged', {
        detail: {
          theme: resolvedTheme
        }
      })
    );

    return resolvedTheme;
  }

  function updateThemeColor(theme) {
    const darkColor = '#0d1710';
    const lightColor = '#f9f9ff';

    let meta =
      document.querySelector(
        'meta[name="theme-color"]'
      );

    if (!meta) {
      meta = document.createElement('meta');

      meta.name = 'theme-color';

      document.head.appendChild(meta);
    }

    meta.content =
      theme === DARK_THEME
        ? darkColor
        : lightColor;
  }

  function getTheme() {
    const root = document.documentElement;

    if (
      root.dataset.theme === DARK_THEME ||
      root.classList.contains('dark')
    ) {
      return DARK_THEME;
    }

    return LIGHT_THEME;
  }

  function setTheme(theme) {
    return applyTheme(theme);
  }

  function toggleTheme() {
    const currentTheme = getTheme();

    return applyTheme(
      currentTheme === DARK_THEME
        ? LIGHT_THEME
        : DARK_THEME
    );
  }

  function initialize() {
    const storedTheme = getStoredTheme();

    applyTheme(storedTheme);
  }

  window.GoviDirectTheme = {
    get: getTheme,
    set: setTheme,
    toggle: toggleTheme,
    initialize,
    LIGHT: LIGHT_THEME,
    DARK: DARK_THEME
  };

  initialize();
})();