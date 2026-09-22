let loadingStatusInterval = null;
let loadingRedirectTimeout = null;

function init() {
  const appContent = document.getElementById('app-content');

  if (appContent) {
    appContent.classList.add('page-transitioning');

    requestAnimationFrame(() => {
      appContent.classList.remove('page-transitioning');
    });
  }

  const statusElement = document.getElementById('loading-status-text');

  if (!statusElement) return;

  const messages = [
    'Connecting to GoviDirect Servers',
    'Loading local farmer listings',
    'Preparing fresh harvest basket...'
  ];

  let index = 0;

  if (loadingStatusInterval) {
    clearInterval(loadingStatusInterval);
  }

  if (loadingRedirectTimeout) {
    clearTimeout(loadingRedirectTimeout);
  }

  loadingStatusInterval = setInterval(() => {
    const currentStatusElement =
      document.getElementById('loading-status-text');

    if (!currentStatusElement) {
      clearInterval(loadingStatusInterval);
      loadingStatusInterval = null;
      return;
    }

    currentStatusElement.classList.remove('status-fade-in');
    currentStatusElement.classList.add('status-fade-out');

    setTimeout(() => {
      index = (index + 1) % messages.length;

      currentStatusElement.textContent = messages[index];

      currentStatusElement.classList.remove('status-fade-out');
      currentStatusElement.classList.add('status-fade-in');
    }, 300);

  },2000);

  loadingRedirectTimeout = setTimeout(() => {
    window.location.href = '../Discover/index.html';
  }, 2000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

document.addEventListener('pageLoaded', init);