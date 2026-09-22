// ==========================================
// 1. DISCOVER PAGE & GENERAL PAGE INIT LOGIC
// ==========================================
function init() {
  const appContent = document.getElementById('app-content');
  if (appContent) {
    appContent.classList.add('page-transitioning');
    requestAnimationFrame(() => {
      appContent.classList.remove('page-transitioning');
    });
  }
  
  // Replace static chip with interactive geolocation trigger
  (() => {
    const storageKey = 'goviDirectLocation';
    const staticChip = document.querySelector('header .inline-flex');
    if (!staticChip) return;

    let locationButton = document.getElementById('location-button');
    if (!locationButton) {
      locationButton = document.createElement('button');
      locationButton.type = 'button';
      locationButton.id = 'location-button';
      locationButton.className = `${staticChip.className} cursor-pointer transition-colors hover:bg-surface-container active:scale-95 disabled:cursor-wait disabled:opacity-70`;
      locationButton.setAttribute('aria-label', 'Use my current location');
      locationButton.innerHTML = '<span class="material-symbols-outlined text-[14px] text-primary-container">location_on</span><span id="location-label">Colombo</span>';
      staticChip.replaceWith(locationButton);
    }

    const locationLabel = document.getElementById('location-label');
    const showSavedLocation = () => {
      if (localStorage.getItem(storageKey) && locationLabel) {
        locationLabel.textContent = 'Current location';
      }
    };
    showSavedLocation();

    const saveLocation = position => {
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        updatedAt: Date.now()
      };
      localStorage.setItem(storageKey, JSON.stringify(location));
      if (locationLabel) locationLabel.textContent = 'Current location';
      locationButton.title = `Updated to ±${Math.round(location.accuracy)} m accuracy`;
      window.dispatchEvent(new CustomEvent('goviDirectLocationUpdated', { detail: location }));
    };

    const requestLocation = () => {
      if (!window.isSecureContext) {
        if (locationLabel) locationLabel.textContent = 'Use HTTPS for location';
        locationButton.title = 'Location access requires an HTTPS or localhost connection.';
        return;
      }

      if (!navigator.geolocation) {
        if (locationLabel) locationLabel.textContent = 'Location unsupported';
        return;
      }

      locationButton.disabled = true;
      if (locationLabel) locationLabel.textContent = 'Locating…';
      
      navigator.geolocation.getCurrentPosition(
        position => {
          saveLocation(position);
          locationButton.disabled = false;
        },
        error => {
          const messages = {
            [error.PERMISSION_DENIED]: 'Enable location',
            [error.POSITION_UNAVAILABLE]: 'Location signal unavailable',
            [error.TIMEOUT]: 'Location timed out'
          };
          if (locationLabel) locationLabel.textContent = messages[error.code] || 'Location unavailable';
          locationButton.disabled = false;
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
      );
    };

    locationButton.onclick = requestLocation;
  })();

  // Category filter pill toggle animation
  document.querySelectorAll('.category-pill').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.category-pill').forEach(btn => {
        btn.classList.remove('bg-primary-container', 'text-on-primary');
        btn.classList.add('bg-surface-container-low', 'text-on-surface-variant');
      });
      button.classList.remove('bg-surface-container-low', 'text-on-surface-variant');
      button.classList.add('bg-primary-container', 'text-on-primary');
    });
  });

  // Add to cart feedback animation
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) {
        icon.textContent = 'check';
        btn.classList.remove('bg-primary-container');
        btn.classList.add('bg-secondary-container', 'text-on-secondary-container');
        setTimeout(() => {
          icon.textContent = 'add';
          btn.classList.remove('bg-secondary-container', 'text-on-secondary-container');
          btn.classList.add('bg-primary-container', 'text-on-primary');
        }, 1200);
      }
    });
  });
}

// Run init on load & dynamic page transitions
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
document.addEventListener('pageLoaded', init);


// ==========================================
// 2. GLOBAL SPA ROUTER & ACTIVE TAB HIGHLIGHT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  function updateActiveTab(overrideUrl) {
    const navLinks = document.querySelectorAll('nav a');
    const currentPath = overrideUrl || window.location.pathname;
    
    // Extract folder context (e.g. 'discover', 'cart', 'orders', 'harvest', 'chat')
    const pathSegments = currentPath.split('/').filter(Boolean);
    const activeFolder = pathSegments.length > 0 ? pathSegments[pathSegments.length - 2]?.toLowerCase() : 'discover';

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Extract target folder name from href (e.g. '../Cart/index.html' -> 'cart')
      const hrefLower = href.toLowerCase();
      const childElements = link.querySelectorAll('span, a');

      // Determine match based on directory name
      const isMatch = (activeFolder && hrefLower.includes(activeFolder)) || 
                      (pathSegments.length === 0 && hrefLower.includes('discover'));

      if (isMatch) {
        // Active: apply green accent
        link.classList.remove('text-on-surface-variant', 'text-black', 'opacity-70');
        link.classList.add('text-primary');
        childElements.forEach(el => {
          el.classList.remove('text-on-surface-variant', 'text-black');
          el.classList.add('text-primary');
        });
        link.setAttribute('aria-current', 'page');
      } else {
        // Inactive: force muted dark tone
        link.classList.remove('text-primary');
        link.classList.add('text-on-surface-variant');
        childElements.forEach(el => {
          el.classList.remove('text-primary');
          el.classList.add('text-on-surface-variant');
        });
        link.removeAttribute('aria-current');
      }
    });
  }

  // Set initial highlight based on current path
  updateActiveTab(window.location.pathname);

  // Use event delegation on the document for smooth SPA fetching
  document.addEventListener('click', async (e) => {
    const link = e.target.closest('nav a[data-path], nav a');
    if (!link) return;

    const targetUrl = link.getAttribute('href');
    if (!targetUrl || targetUrl === '#' || targetUrl.startsWith('http')) {
      return;
    }

    e.preventDefault();
    const currentMain = document.querySelector('#app-content');

    try {
      if (currentMain) {
        currentMain.classList.add('page-transitioning');
        await new Promise(resolve => setTimeout(resolve, 250));
      }

      const response = await fetch(targetUrl);
      if (!response.ok) throw new Error('Network response was not ok');

      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const newMainContent = doc.querySelector('#app-content')?.innerHTML;

      if (newMainContent && currentMain) {
        currentMain.innerHTML = newMainContent;
        history.pushState(null, '', targetUrl);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update nav item colors cleanly
        updateActiveTab(targetUrl);

        currentMain.classList.add('page-transitioning');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            currentMain.classList.remove('page-transitioning');
          });
        });

        document.dispatchEvent(new CustomEvent('pageLoaded'));
      }

    } catch (err) {
      console.error('Navigation fetch failed, falling back:', err);
      window.location.href = targetUrl;
    }
  });

  window.addEventListener('popstate', () => {
    window.location.reload();
  });
});