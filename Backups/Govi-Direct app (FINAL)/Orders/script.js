// Keep switchTab on the global scope so inline onclick attributes work
window.switchTab = function(type) {
  const activeTab = document.getElementById('tab-active');
  const completedTab = document.getElementById('tab-completed');
  const activeView = document.getElementById('active-view');
  const completedView = document.getElementById('completed-view');

  if (!activeView || !completedView) return;

  if (type === 'active') {
    if (activeTab) {
      activeTab.className = 'flex-1 py-2 rounded-lg font-label-md text-label-md text-center transition-all bg-surface-container-lowest text-primary-container shadow-sm font-semibold';
    }
    if (completedTab) {
      completedTab.className = 'flex-1 py-2 rounded-lg font-label-md text-label-md text-center transition-all text-on-surface-variant';
    }
    activeView.classList.remove('hidden');
    completedView.classList.remove('hidden');
    activeView.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    if (completedTab) {
      completedTab.className = 'flex-1 py-2 rounded-lg font-label-md text-label-md text-center transition-all bg-surface-container-lowest text-primary-container shadow-sm font-semibold';
    }
    if (activeTab) {
      activeTab.className = 'flex-1 py-2 rounded-lg font-label-md text-label-md text-center transition-all text-on-surface-variant';
    }
    completedView.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

function init() {

  const appContent = document.getElementById('app-content');
  if (appContent) {
    appContent.classList.add('page-transitioning');
    requestAnimationFrame(() => {
      appContent.classList.remove('page-transitioning');
    });
  }

  
  const activeTab = document.getElementById('tab-active');
  const completedTab = document.getElementById('tab-completed');

  if (activeTab) {
    activeTab.onclick = () => window.switchTab('active');
  }
  if (completedTab) {
    completedTab.onclick = () => window.switchTab('completed');
  }
}

// Run on initial fresh page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Run when navigating between tabs dynamically
document.addEventListener('pageLoaded', init);