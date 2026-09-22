function init() {
  // Triggers the fade-in animation on page load/transition
  const appContent = document.getElementById('app-content');
  if (appContent) {
    appContent.classList.add('page-transitioning');
    requestAnimationFrame(() => {
      appContent.classList.remove('page-transitioning');
    });
  }
  
  const filterPills = document.querySelectorAll('.filter-pill');
  const chatItems = document.querySelectorAll('.conversation-item');
  const searchInput = document.getElementById('chat-search-input');
  const emptyState = document.getElementById('empty-state');
  const voiceBtn = document.getElementById('voice-query-btn');

  // Toggle empty state helper function
  function toggleEmptyState(show) {
    if (!emptyState) return;
    if (show) {
      emptyState.classList.remove('hidden');
      emptyState.classList.add('flex');
    } else {
      emptyState.classList.remove('flex');
      emptyState.classList.add('hidden');
    }
  }

  // Filter pill functionality
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('bg-primary-container', 'text-on-primary');
        p.classList.add('bg-surface-container-lowest', 'text-on-surface-variant');
      });
      pill.classList.remove('bg-surface-container-lowest', 'text-on-surface-variant');
      pill.classList.add('bg-primary-container', 'text-on-primary');

      const filterVal = pill.getAttribute('data-category');
      let visibleCount = 0;

      chatItems.forEach(item => {
        const itemCategory = item.getAttribute('data-filter');
        if (filterVal === 'all' || itemCategory === filterVal) {
          item.style.display = 'block';
          visibleCount++;
        } else {
          item.style.display = 'none';
        }
      });

      toggleEmptyState(visibleCount === 0);
    });
  });

  // Quick Search input filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      let matchCount = 0;

      chatItems.forEach(item => {
        const text = item.innerText.toLowerCase();
        if (text.includes(query)) {
          item.style.display = 'block';
          matchCount++;
        } else {
          item.style.display = 'none';
        }
      });

      toggleEmptyState(matchCount === 0);
    });
  }

  // Voice search micro-interaction
  let isRecording = false;
  if (voiceBtn && searchInput) {
    voiceBtn.addEventListener('click', () => {
      isRecording = !isRecording;
      if (isRecording) {
        voiceBtn.classList.add('bg-error', 'text-on-error', 'animate-pulse');
        searchInput.placeholder = "Listening in Sinhala/Tamil/English...";
        setTimeout(() => {
          if (isRecording) {
            voiceBtn.classList.remove('bg-error', 'text-on-error', 'animate-pulse');
            searchInput.placeholder = "Search farmers, co-ops, crops...";
            searchInput.value = "Nuwara Eliya";
            searchInput.dispatchEvent(new Event('input'));
            isRecording = false;
          }
        }, 2400);
      } else {
        voiceBtn.classList.remove('bg-error', 'text-on-error', 'animate-pulse');
        searchInput.placeholder = "Search farmers, co-ops, crops...";
      }
    });
  }
}

// Run on initial fresh page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Run when navigating between tabs dynamically via your router
document.addEventListener('pageLoaded', init);