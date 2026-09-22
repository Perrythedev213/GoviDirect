let loadingStatusInterval = null;

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

  // Clear existing interval to avoid duplicate loops
  if (loadingStatusInterval) {
    clearInterval(loadingStatusInterval);
  }

  loadingStatusInterval = setInterval(() => {
    const currentStatusElement = document.getElementById('loading-status-text');
    if (!currentStatusElement) {
      clearInterval(loadingStatusInterval);
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
  }, 2000);

  // Minimum 2-second delay before redirecting to the Discover page
  setTimeout(() => {
    window.location.href = '../Discover/index.html';
  }, 2000);
}

// Run on initial fresh page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Run when navigating between tabs dynamically
document.addEventListener('pageLoaded', init);