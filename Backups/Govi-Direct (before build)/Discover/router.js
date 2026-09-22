const GOVI_PRELOAD_CACHE = 'goviDirect-app-v1';
const GOVI_SESSION_KEY = 'goviDirectSession';
const GOVI_VERIFIED_LISTINGS_KEY =
  'goviDirectVerifiedListings';

window.__goviDirectLoadedScripts =
  window.__goviDirectLoadedScripts || new Set();

window.__goviDirectPageCache =
  window.__goviDirectPageCache || new Map();

window.__goviDirectRouterReady =
  window.__goviDirectRouterReady || false;


/* =========================================================
   AUTHENTICATION
========================================================= */

function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem(GOVI_SESSION_KEY)
    );
  } catch (error) {
    return null;
  }
}

function isLoggedIn() {
  return !!getCurrentUser();
}

function isAdmin() {
  const user = getCurrentUser();

  return !!(
    user &&
    (
      user.accountType === 'admin' ||
      user.role === 'admin' ||
      user.username === 'admin'
    )
  );
}

function logoutGoviDirect() {
  localStorage.removeItem(GOVI_SESSION_KEY);

  window.location.href =
    '../Login/index.html';
}

window.GoviDirectAuth = {
  getCurrentUser,
  isLoggedIn,
  isAdmin,
  logout: logoutGoviDirect
};

function requireAuthentication() {
  if (isLoggedIn()) {
    return true;
  }

  window.location.replace(
    '../Login/index.html'
  );

  return false;
}


/* =========================================================
   ACCOUNT / PROFILE
========================================================= */

function getAccountRating() {
  const user = getCurrentUser();

  if (!user) {
    return '4.8';
  }

  return user.rating || '4.8';
}

function getAccountTypeLabel() {
  const user = getCurrentUser();

  if (!user) {
    return 'Account';
  }

  if (
    user.accountType === 'admin' ||
    user.role === 'admin'
  ) {
    return 'Administrator';
  }

  if (user.accountType === 'seller') {
    return 'Farmer / Seller';
  }

  return 'Buyer';
}

function getAccountInitial() {
  const user = getCurrentUser();

  if (!user) {
    return '?';
  }

  const name =
    user.name ||
    user.username ||
    '';

  return (
    name
      .trim()
      .charAt(0)
      .toUpperCase() ||
    '?'
  );
}

function closeAccountProfile() {
  const modal =
    document.getElementById(
      'govi-account-profile-modal'
    );

  if (!modal) {
    return;
  }

  modal.classList.add('hidden');

  document.body.style.overflow = '';
}

function openAccountProfile() {
  const modal =
    document.getElementById(
      'govi-account-profile-modal'
    );

  if (!modal) {
    return;
  }

  modal.classList.remove('hidden');

  document.body.style.overflow =
    'hidden';
}

function createAccountProfileModal() {
  if (
    document.getElementById(
      'govi-account-profile-modal'
    )
  ) {
    return;
  }

  const user = getCurrentUser();

  if (!user) {
    return;
  }

  const name =
    user.name ||
    user.username ||
    'GoviDirect User';

  const username =
    user.username ||
    '';

  const accountType =
    getAccountTypeLabel();

  const initial =
    getAccountInitial();

  const rating =
    getAccountRating();

  const modal =
    document.createElement('div');

  modal.id =
    'govi-account-profile-modal';

  modal.className =
    'hidden fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm';

  modal.innerHTML = `
    <div
      id="govi-account-profile-backdrop"
      class="absolute inset-0"
    ></div>

    <div class="relative min-h-full flex items-start justify-end p-4 sm:p-6">
      <div
        id="govi-account-profile-card"
        class="w-full max-w-sm mt-14 rounded-2xl bg-surface shadow-xl border border-outline-variant overflow-hidden"
      >
        <div class="p-5">

          <div class="flex items-start justify-between gap-4">

            <div class="flex items-center gap-3">

              <div
                class="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0"
              >
                <span class="text-on-primary text-lg font-bold">
                  ${initial}
                </span>
              </div>

              <div class="min-w-0">

                <h2 class="font-bold text-on-surface truncate">
                  ${name}
                </h2>

                <p class="text-sm text-on-surface-variant truncate">
                  @${username}
                </p>

              </div>

            </div>

            <button
              type="button"
              id="close-account-profile"
              class="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface-container-low"
              aria-label="Close profile"
            >
              <span class="material-symbols-outlined">
                close
              </span>
            </button>

          </div>

          <div class="mt-5 rounded-xl bg-surface-container-low p-4">

            <p class="text-xs text-on-surface-variant">
              Account type
            </p>

            <p class="font-semibold text-on-surface mt-1">
              ${accountType}
            </p>

          </div>

          <div class="mt-3 rounded-xl bg-surface-container-low p-4">

            <div class="flex items-center justify-between">

              <div>

                <p class="text-xs text-on-surface-variant">
                  Rating
                </p>

                <p class="font-semibold text-on-surface mt-1">
                  ${rating}
                </p>

              </div>

              <span class="material-symbols-outlined text-primary">
                star
              </span>

            </div>

          </div>

          <button
            type="button"
            id="govi-theme-row"
            class="w-full mt-3 rounded-xl bg-surface-container-low p-4 flex items-center justify-between gap-4 text-left"
            aria-label="Toggle dark mode"
          >

            <div class="flex items-center gap-3 min-w-0">

              <div
                id="govi-theme-icon-container"
                class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0"
              >

                <span
                  id="govi-theme-icon"
                  class="material-symbols-outlined text-primary"
                >
                  dark_mode
                </span>

              </div>

              <div class="min-w-0">

                <p class="font-semibold text-on-surface">
                  Dark Mode
                </p>

                <p
                  id="govi-theme-description"
                  class="text-sm text-on-surface-variant mt-0.5"
                >
                  Switch between light and dark
                </p>

              </div>

            </div>

            <span
              id="govi-theme-toggle"
              class="relative w-12 h-7 rounded-full bg-surface-container-highest shrink-0 transition-colors duration-200"
            >

              <span
                id="govi-theme-toggle-knob"
                class="absolute top-1 left-1 w-5 h-5 rounded-full bg-surface-bright shadow-sm transition-transform duration-200"
              ></span>

            </span>

          </button>

          <button
            type="button"
            id="account-logout-button"
            class="w-full mt-5 rounded-xl bg-error text-white py-3 font-semibold"
          >
            Log out
          </button>

        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);


  /* =======================================================
     PROFILE CLOSE BUTTON
  ======================================================= */

  const closeButton =
    document.getElementById(
      'close-account-profile'
    );

  if (closeButton) {
    closeButton.addEventListener(
      'click',
      closeAccountProfile
    );
  }


  /* =======================================================
     PROFILE BACKDROP
  ======================================================= */

  const backdrop =
    document.getElementById(
      'govi-account-profile-backdrop'
    );

  if (backdrop) {
    backdrop.addEventListener(
      'click',
      closeAccountProfile
    );
  }


  /* =======================================================
     DARK MODE TOGGLE
  ======================================================= */

  const themeRow =
    document.getElementById(
      'govi-theme-row'
    );

  const themeToggle =
    document.getElementById(
      'govi-theme-toggle'
    );

  const themeToggleKnob =
    document.getElementById(
      'govi-theme-toggle-knob'
    );

  const themeIcon =
    document.getElementById(
      'govi-theme-icon'
    );

  const themeDescription =
    document.getElementById(
      'govi-theme-description'
    );

  function updateThemeToggle() {
    if (!window.GoviDirectTheme) {
      return;
    }

    const isDark =
      window.GoviDirectTheme.get() ===
      'dark';

    if (themeToggle) {
      themeToggle.classList.toggle(
        'bg-primary',
        isDark
      );

      themeToggle.classList.toggle(
        'bg-surface-container-highest',
        !isDark
      );
    }

    if (themeToggleKnob) {
      themeToggleKnob.classList.toggle(
        'translate-x-5',
        isDark
      );

      themeToggleKnob.classList.toggle(
        'translate-x-0',
        !isDark
      );
    }

    if (themeIcon) {
      themeIcon.textContent =
        isDark
          ? 'light_mode'
          : 'dark_mode';
    }

    if (themeDescription) {
      themeDescription.textContent =
        isDark
          ? 'Switch back to light mode'
          : 'Switch between light and dark';
    }
  }

  if (themeRow) {
    themeRow.addEventListener(
      'click',
      event => {
        event.preventDefault();
        event.stopPropagation();

        if (!window.GoviDirectTheme) {
          return;
        }

        window.GoviDirectTheme.toggle();

        updateThemeToggle();
      }
    );
  }

  window.addEventListener(
    'goviThemeChanged',
    updateThemeToggle
  );

  updateThemeToggle();


  /* =======================================================
     LOGOUT
  ======================================================= */

  const logoutButton =
    document.getElementById(
      'account-logout-button'
    );

  if (logoutButton) {
    logoutButton.addEventListener(
      'click',
      () => {
        closeAccountProfile();
        logoutGoviDirect();
      }
    );
  }
}

function setupAccountProfile() {
  const profileButton =
    document.getElementById(
      'profile-button'
    );

  if (!profileButton) {
    return;
  }

  profileButton.type =
    'button';

  profileButton.setAttribute(
    'aria-label',
    'Profile'
  );

  createAccountProfileModal();

  if (
    profileButton.dataset
      .accountProfileInitialized ===
    'true'
  ) {
    return;
  }

  profileButton.dataset
    .accountProfileInitialized =
    'true';

  profileButton.addEventListener(
    'click',
    event => {
      event.preventDefault();
      event.stopPropagation();

      openAccountProfile();
    }
  );
}


/* =========================================================
   LISTING OWNER HELPERS
========================================================= */

function getListingOwnerName(listing) {
  if (!listing) {
    return 'Direct Farm Seller';
  }

  const candidates = [
    listing.accountName,
    listing.username,
    listing.ownerName,
    listing.sellerName,
    listing.author,
    listing.ownerUsername,
    listing.sellerUsername,

    listing.owner &&
      (
        listing.owner.username ||
        listing.owner.accountName ||
        listing.owner.name
      ),

    listing.seller &&
      (
        listing.seller.username ||
        listing.seller.accountName ||
        listing.seller.name
      ),

    listing.user &&
      (
        listing.user.username ||
        listing.user.accountName ||
        listing.user.name
      ),

    listing.farmer
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === 'string' &&
      candidate.trim() &&
      candidate.trim().toLowerCase() !==
        'direct farm seller'
    ) {
      return candidate.trim();
    }
  }

  return 'Direct Farm Seller';
}

function getListingOwnerUsername(listing) {
  if (!listing) {
    return '';
  }

  const candidates = [
    listing.ownerUsername,
    listing.sellerUsername,
    listing.username,
    listing.accountName,

    listing.owner &&
      (
        listing.owner.username ||
        listing.owner.accountName
      ),

    listing.seller &&
      (
        listing.seller.username ||
        listing.seller.accountName
      ),

    listing.user &&
      (
        listing.user.username ||
        listing.user.accountName
      )
  ];

  for (const candidate of candidates) {
    if (
      typeof candidate === 'string' &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return '';
}

function getListingOwnerAccountType(listing) {
  if (!listing) {
    return 'seller';
  }

  return (
    listing.ownerAccountType ||
    listing.sellerAccountType ||
    listing.accountType ||
    listing.owner?.accountType ||
    listing.seller?.accountType ||
    listing.user?.accountType ||
    'seller'
  );
}

function getStoredListingById(listingId) {
  if (!listingId) {
    return null;
  }

  let listings = [];

  try {
    listings =
      JSON.parse(
        localStorage.getItem(
          'goviDirectListings'
        )
      ) || [];
  } catch (error) {
    return null;
  }

  if (!Array.isArray(listings)) {
    return null;
  }

  return (
    listings.find(
      listing =>
        listing &&
        String(listing.id) ===
          String(listingId)
    ) || null
  );
}


/* =========================================================
   VERIFICATION STORAGE
========================================================= */

function getVerifiedListings() {
  try {
    return JSON.parse(
      localStorage.getItem(
        GOVI_VERIFIED_LISTINGS_KEY
      )
    ) || {};
  } catch (error) {
    return {};
  }
}

function saveVerifiedListings(listings) {
  localStorage.setItem(
    GOVI_VERIFIED_LISTINGS_KEY,
    JSON.stringify(listings)
  );
}

function getListingVerificationKey(card) {
  if (!card) {
    return '';
  }

  const listingId =
    card.dataset.listingId;

  if (listingId) {
    return `listing:${listingId}`;
  }

  const name =
    card.dataset.name || '';

  const farmer =
    card.dataset.farmer || '';

  return `product:${name}|${farmer}`;
}

function isListingVerified(card) {
  if (!card) {
    return false;
  }

  const verificationMap =
    getVerifiedListings();

  const key =
    getListingVerificationKey(card);

  return verificationMap[key] === true;
}

function updateStoredFarmerListingVerification(
  listingId,
  verified
) {
  if (!listingId) {
    return;
  }

  let listings = [];

  try {
    listings =
      JSON.parse(
        localStorage.getItem(
          'goviDirectListings'
        )
      ) || [];
  } catch (error) {
    return;
  }

  let changed = false;

  listings = listings.map(listing => {
    if (
      listing &&
      String(listing.id) ===
        String(listingId)
    ) {
      changed = true;

      return {
        ...listing,
        verified,
        verificationStatus:
          verified
            ? 'verified'
            : 'not_verified',
        verifiedAt:
          verified
            ? (
                listing.verifiedAt ||
                new Date().toISOString()
              )
            : null
      };
    }

    return listing;
  });

  if (changed) {
    localStorage.setItem(
      'goviDirectListings',
      JSON.stringify(listings)
    );
  }
}

function setListingVerified(
  card,
  verified
) {
  if (!card) {
    return;
  }

  const verificationMap =
    getVerifiedListings();

  const key =
    getListingVerificationKey(card);

  if (!key) {
    return;
  }

  verificationMap[key] =
    verified === true;

  saveVerifiedListings(
    verificationMap
  );

  card.dataset.verified =
    String(verified === true);

  if (card.dataset.listingId) {
    updateStoredFarmerListingVerification(
      card.dataset.listingId,
      verified === true
    );
  }

  updateVerifiedBadgeForCard(card);
}

function syncStoredVerificationToListings() {
  let listings = [];

  try {
    listings =
      JSON.parse(
        localStorage.getItem(
          'goviDirectListings'
        )
      ) || [];
  } catch (error) {
    return;
  }

  let changed = false;

  const verificationMap =
    getVerifiedListings();

  listings.forEach(listing => {
    if (
      !listing ||
      !listing.id
    ) {
      return;
    }

    const key =
      `listing:${listing.id}`;

    const shouldBeVerified =
      verificationMap[key] === true;

    if (
      listing.verified !==
      shouldBeVerified
    ) {
      listing.verified =
        shouldBeVerified;

      listing.verificationStatus =
        shouldBeVerified
          ? 'verified'
          : 'not_verified';

      listing.verifiedAt =
        shouldBeVerified
          ? (
              listing.verifiedAt ||
              new Date().toISOString()
            )
          : null;

      changed = true;
    }
  });

  if (changed) {
    localStorage.setItem(
      'goviDirectListings',
      JSON.stringify(listings)
    );
  }
}


/* =========================================================
   VERIFICATION NOTIFICATIONS
========================================================= */

function notifyListingOwner(
  card,
  verified
) {
  if (!card || !card.dataset.listingId) {
    return;
  }

  const listing =
    getStoredListingById(
      card.dataset.listingId
    );

  if (!listing) {
    console.warn(
      'Could not find listing owner for verification notification.'
    );

    return;
  }

  const recipientUsername =
    getListingOwnerUsername(listing);

  if (!recipientUsername) {
    console.warn(
      'Could not determine listing owner account.'
    );

    return;
  }

  if (
    !window.GoviDirectNotifications ||
    typeof window.GoviDirectNotifications.add !==
      'function'
  ) {
    console.warn(
      'GoviDirectNotifications is not available.'
    );

    return;
  }

  const productName =
    listing.name ||
    card.dataset.name ||
    'your listing';

  window.GoviDirectNotifications.add({
    recipientUsername,

    recipientAccountType:
      getListingOwnerAccountType(listing),

    title:
      verified
        ? 'Listing verified'
        : 'Listing verification removed',

    message:
      verified
        ? `Your listing "${productName}" has been verified by GoviDirect.`
        : `Your listing "${productName}" is no longer verified. Please review the listing details and verification requirements.`,

    icon:
      verified
        ? 'verified'
        : 'warning',

    type:
      'listing_verification',

    data: {
      listingId:
        listing.id ||
        card.dataset.listingId,

      productName,

      verified:
        verified === true
    }
  });
}


/* =========================================================
   CACHE / SCRIPT HELPERS
========================================================= */

function getAbsoluteUrl(url) {
  return new URL(
    url,
    window.location.href
  ).href;
}

function getCacheKey(url) {
  return getAbsoluteUrl(url);
}

function registerExistingScripts() {
  /*
   * Only the truly global notification script
   * should be considered already loaded.
   *
   * Do NOT register page scripts here.
   */

  document
    .querySelectorAll(
      'script[src]'
    )
    .forEach(script => {
      const src =
        script.getAttribute(
          'src'
        );

      if (!src) {
        return;
      }

      const absoluteUrl =
        getAbsoluteUrl(
          src
        );

      const pathname =
        new URL(
          absoluteUrl
        ).pathname;

      if (
        pathname.endsWith(
          '/notifications.js'
        )
      ) {
        window.__goviDirectLoadedScripts.add(
          absoluteUrl
        );
      }
    });
}

async function getPreloadedPage(url) {
  const absoluteUrl =
    getAbsoluteUrl(url);

  if (
    window.__goviDirectPageCache.has(
      absoluteUrl
    )
  ) {
    return window.__goviDirectPageCache.get(
      absoluteUrl
    );
  }

  try {
    const cache =
      await caches.open(
        GOVI_PRELOAD_CACHE
      );

    const response =
      await cache.match(
        getCacheKey(absoluteUrl)
      );

    if (response) {
      const html =
        await response.text();

      window.__goviDirectPageCache.set(
        absoluteUrl,
        html
      );

      return html;
    }
  } catch (error) {
    console.warn(
      'GoviDirect cache read failed:',
      error
    );
  }

  const response =
    await fetch(
      absoluteUrl,
      {
        cache: 'no-store'
      }
    );

  if (!response.ok) {
    throw new Error(
      `Failed to load page: ${response.status}`
    );
  }

  const html =
    await response.text();

  window.__goviDirectPageCache.set(
    absoluteUrl,
    html
  );

  return html;
}

async function getCachedAsset(url) {
  const absoluteUrl =
    getAbsoluteUrl(url);

  try {
    const cache =
      await caches.open(
        GOVI_PRELOAD_CACHE
      );

    const response =
      await cache.match(
        getCacheKey(absoluteUrl)
      );

    if (response) {
      return response;
    }
  } catch (error) {
    console.warn(
      'GoviDirect asset cache read failed:',
      error
    );
  }

  return null;
}

async function loadScript(src) {
  const absoluteUrl =
    getAbsoluteUrl(src);

  if (
    window.__goviDirectLoadedScripts.has(
      absoluteUrl
    )
  ) {
    return;
  }

  const cachedResponse =
    await getCachedAsset(
      absoluteUrl
    );

  if (cachedResponse) {
    const scriptText =
      await cachedResponse.text();

    const script =
      document.createElement('script');

    script.type =
      'text/javascript';

    script.dataset.goviDirectLoaded =
      'true';

    script.text =
      `${scriptText}\n//# sourceURL=${absoluteUrl}`;

    document.body.appendChild(
      script
    );

    window.__goviDirectLoadedScripts.add(
      absoluteUrl
    );

    return;
  }

  await new Promise(
    (resolve, reject) => {
      const script =
        document.createElement(
          'script'
        );

      script.src =
        absoluteUrl;

      script.async = false;

      script.onload = () => {
        window.__goviDirectLoadedScripts.add(
          absoluteUrl
        );

        resolve();
      };

      script.onerror = () => {
        reject(
          new Error(
            `Failed to load script: ${absoluteUrl}`
          )
        );
      };

      document.body.appendChild(
        script
      );
    }
  );
}

async function loadPageScripts(
  documentElement,
  targetUrl
) {
  const scripts =
    Array.from(
      documentElement.querySelectorAll(
        'script[src]'
      )
    );

  for (const script of scripts) {
    const src =
      script.getAttribute('src');

    if (!src) {
      continue;
    }

    const absoluteUrl =
      new URL(
        src,
        targetUrl
      ).href;

    const pathname =
      new URL(
        absoluteUrl
      ).pathname;

    /*
     * NEVER load the router again.
     */
    if (
      pathname.endsWith(
        '/Discover/router.js'
      )
    ) {
      continue;
    }

    /*
     * Global notifications script.
     *
     * Load it only once.
     */
    if (
      pathname.endsWith(
        '/notifications.js'
      )
    ) {
      if (
        !window.__goviDirectLoadedScripts.has(
          absoluteUrl
        )
      ) {
        await loadScript(
          absoluteUrl
        );
      }

      continue;
    }

    /*
     * PAGE SCRIPT
     *
     * We load it once.
     *
     * Initialization itself is handled separately
     * by initializeCurrentPage().
     */
    if (
      !window.__goviDirectLoadedScripts.has(
        absoluteUrl
      )
    ) {
      await loadScript(
        absoluteUrl
      );
    }
  }
}

async function loadPageStyles(
  documentElement,
  targetUrl
) {
  const links =
    Array.from(
      documentElement.querySelectorAll(
        'link[rel="stylesheet"]'
      )
    );

  const existingStyles =
    new Set(
      Array.from(
        document.querySelectorAll(
          'link[rel="stylesheet"]'
        )
      ).map(link =>
        new URL(
          link.getAttribute('href'),
          window.location.href
        ).href
      )
    );

  for (const link of links) {
    const href =
      link.getAttribute('href');

    if (!href) {
      continue;
    }

    const absoluteUrl =
      new URL(
        href,
        targetUrl
      ).href;

    const target =
      new URL(
        absoluteUrl,
        targetUrl
      );

    if (
      target.origin !==
      window.location.origin
    ) {
      continue;
    }

    if (
      existingStyles.has(
        absoluteUrl
      )
    ) {
      continue;
    }

    await new Promise(resolve => {
      const newLink =
        document.createElement(
          'link'
        );

      newLink.rel =
        'stylesheet';

      newLink.href =
        absoluteUrl;

      newLink.onload =
        resolve;

      newLink.onerror =
        resolve;

      document.head.appendChild(
        newLink
      );
    });

    existingStyles.add(
      absoluteUrl
    );
  }
}


/* =========================================================
   CART
========================================================= */

function saveToCart(product) {
  let cart = [];

  try {
    cart =
      JSON.parse(
        localStorage.getItem(
          'goviDirectCart'
        )
      ) || [];
  } catch (error) {
    cart = [];
  }

  if (!Array.isArray(cart)) {
    cart = [];
  }

  const existingIndex =
    cart.findIndex(item =>
      item.name === product.name &&
      item.farmer === product.farmer
    );

  if (existingIndex !== -1) {
    cart[existingIndex].quantity =
      (
        Number(
          cart[existingIndex].quantity
        ) || 0
      ) +
      (
        Number(product.quantity) || 1
      );
  } else {
    cart.push({
      ...product,
      quantity:
        Number(product.quantity) || 1
    });
  }

  localStorage.setItem(
    'goviDirectCart',
    JSON.stringify(cart)
  );

  window.dispatchEvent(
    new CustomEvent(
      'cartUpdated',
      {
        detail: cart
      }
    )
  );
}


/* =========================================================
   DISCOVER INITIALIZATION
========================================================= */

function init() {
  if (!requireAuthentication()) {
    return;
  }

  const appContent =
    document.getElementById(
      'app-content'
    );

  const productGrid =
    document.querySelector(
      '#product-grid'
    );

  if (
    !appContent ||
    !productGrid
  ) {
    return;
  }

  setupAccountProfile();

  const locationButton =
    document.querySelector(
      'header .inline-flex'
    );

  if (locationButton) {
    locationButton.id =
      'location-button';

    locationButton.setAttribute(
      'type',
      'button'
    );

    locationButton.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">
        location_on
      </span>
      <span id="location-label">Colombo</span>
    `;

    const savedLocation =
      localStorage.getItem(
        'goviDirectLocation'
      );

    if (savedLocation) {
      const label =
        document.getElementById(
          'location-label'
        );

      if (label) {
        label.textContent =
          savedLocation;
      }
    }

    if (
      !locationButton.dataset
        .locationInitialized
    ) {
      locationButton.dataset
        .locationInitialized =
        'true';

      locationButton.addEventListener(
        'click',
        () => {
          requestLocation();
        }
      );
    }
  }

  syncStoredVerificationToListings();

  loadFarmerListings();

  updateVerifiedBadges();

  setupFiltering();

  setupProductModal();

  setupAdminVerification();
}


/* =========================================================
   LOCATION
========================================================= */

function requestLocation() {
  const label =
    document.getElementById(
      'location-label'
    );

  if (
    !navigator.geolocation
  ) {
    return;
  }

  if (
    !window.isSecureContext &&
    window.location.hostname !==
      'localhost'
  ) {
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const latitude =
        position.coords.latitude;

      const longitude =
        position.coords.longitude;

      const location =
        'Current location';

      localStorage.setItem(
        'goviDirectLocation',
        location
      );

      if (label) {
        label.textContent =
          location;
      }

      window.dispatchEvent(
        new CustomEvent(
          'goviDirectLocationUpdated',
          {
            detail: {
              latitude,
              longitude,
              location
            }
          }
        )
      );
    },
    error => {
      console.warn(
        'Location permission/location lookup failed:',
        error
      );
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    }
  );
}


/* =========================================================
   FARMER LISTINGS
========================================================= */

function loadFarmerListings() {
  const productGrid =
    document.getElementById(
      'product-grid'
    );

  if (!productGrid) {
    return;
  }

  document
    .querySelectorAll(
      '.farmer-listing-card'
    )
    .forEach(card => {
      card.remove();
    });

  let listings = [];

  try {
    listings =
      JSON.parse(
        localStorage.getItem(
          'goviDirectListings'
        )
      ) || [];
  } catch (error) {
    listings = [];
  }

  if (!Array.isArray(listings)) {
    return;
  }

  listings.forEach(listing => {
    if (!listing) {
      return;
    }

    const card =
      document.createElement(
        'div'
      );

    card.className =
      'product-card farmer-listing-card flex flex-col bg-surface-container-lowest rounded-xl p-space-sm shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow';

    card.dataset.listingId =
      listing.id || '';

    card.dataset.name =
      listing.name || '';

    card.dataset.category =
      listing.category || '';

    card.dataset.price =
      listing.price || '';

    card.dataset.unit =
      listing.unit || 'per kg';

    const farmer =
      getListingOwnerName(listing);

    card.dataset.farmer =
      farmer;

    card.dataset.location =
      listing.location || '';

    card.dataset.harvestDate =
      listing.harvestDate || '';

    card.dataset.farmingMethod =
      listing.farmingMethod || '';

    card.dataset.description =
      listing.description || '';

    card.dataset.img =
      listing.img ||
      listing.image ||
      '';

    card.dataset.verified =
      String(
        isListingVerified(card)
      );

    const image =
      listing.img ||
      listing.image ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';

    const name =
      listing.name ||
      'Fresh Produce';

    const price =
      listing.price ||
      '0';

    const unit =
      listing.unit ||
      'per kg';

    card.innerHTML = `
      <div class="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container-low mb-space-sm">

        <img
          class="w-full h-full object-cover"
          src="${image}"
          alt="${name}"
          loading="lazy"
        >

        <span
          class="verified-product-badge hidden"
          title="Verified by GoviDirect"
        >
          <span class="material-symbols-outlined">
            verified
          </span>
          Verified
        </span>

      </div>

      <div class="flex flex-col flex-1">

        <div class="flex items-center gap-1 min-w-0">

          <h3 class="font-label-lg text-label-lg text-on-surface truncate">
            ${name}
          </h3>

        </div>

        <p class="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
          ${farmer}
        </p>

        <div class="flex items-center justify-between mt-space-sm pt-space-xs">

          <div class="flex flex-col">

            <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Rs. ${price}
            </span>

            <span class="font-label-sm text-label-sm text-on-surface-variant">
              ${unit}
            </span>

          </div>

          <button
            aria-label="View ${name}"
            class="add-btn flex items-center justify-center w-9 h-9 rounded-full bg-primary-container text-on-primary shadow-sm hover:bg-primary active:scale-90 transition-transform"
            type="button"
          >
            <span class="material-symbols-outlined text-[20px]">
              add
            </span>
          </button>

        </div>

      </div>
    `;

    productGrid.appendChild(
      card
    );

    updateVerifiedBadgeForCard(
      card
    );
  });
}


/* =========================================================
   VERIFIED BADGES
========================================================= */

function updateVerifiedBadgeForCard(
  card
) {
  const badge =
    card.querySelector(
      '.verified-product-badge'
    );

  if (!badge) {
    return;
  }

  badge.classList.toggle(
    'hidden',
    card.dataset.verified !==
      'true'
  );
}

function updateVerifiedBadges() {
  document
    .querySelectorAll(
      '.product-card'
    )
    .forEach(card => {
      const storedVerified =
        isListingVerified(card);

      card.dataset.verified =
        String(storedVerified);

      updateVerifiedBadgeForCard(
        card
      );
    });
}


/* =========================================================
   ADMIN VERIFICATION
========================================================= */

function setupAdminVerification() {
  const modal =
    document.getElementById(
      'product-modal'
    );

  const modalCard =
    document.getElementById(
      'product-modal-card'
    );

  if (
    !modal ||
    !modalCard
  ) {
    return;
  }

  if (
    modal.dataset
      .adminVerificationInitialized ===
    'true'
  ) {
    return;
  }

  modal.dataset
    .adminVerificationInitialized =
    'true';

  modal.addEventListener(
    'click',
    event => {
      const button =
        event.target.closest(
          '#admin-verification-toggle'
        );

      if (!button) {
        return;
      }

      if (!isAdmin()) {
        return;
      }

      const listingId =
        button.dataset.listingId ||
        '';

      const productName =
        button.dataset.productName ||
        '';

      const farmer =
        button.dataset.farmer ||
        '';

      let card = null;

      if (listingId) {
        card =
          document.querySelector(
            `.product-card[data-listing-id="${CSS.escape(listingId)}"]`
          );
      }

      if (!card) {
        const cards =
          document.querySelectorAll(
            '.product-card'
          );

        card =
          Array.from(cards).find(
            candidate =>
              candidate.dataset.name ===
                productName &&
              candidate.dataset.farmer ===
                farmer
          );
      }

      if (!card) {
        return;
      }

      const verified =
        isListingVerified(card);

      const newValue =
        !verified;

      setListingVerified(
        card,
        newValue
      );

      updateVerifiedBadgeForCard(
        card
      );

      if (
        card.dataset.listingId
      ) {
        notifyListingOwner(
          card,
          newValue
        );
      }

      const currentlyVerified =
        isListingVerified(card);

      button.textContent =
        currentlyVerified
          ? 'De-verify Listing'
          : 'Verify Listing';

      button.classList.toggle(
        'bg-primary',
        !currentlyVerified
      );

      button.classList.toggle(
        'bg-error',
        currentlyVerified
      );

      const status =
        modalCard.querySelector(
          '#admin-verification-status'
        );

      if (status) {
        status.textContent =
          currentlyVerified
            ? 'This listing is verified.'
            : 'This listing is not verified.';
      }
    }
  );
}

function createAdminVerificationControl(
  card
) {
  if (
    !isAdmin() ||
    !card
  ) {
    return '';
  }

  const verified =
    isListingVerified(card);

  card.dataset.verified =
    String(verified);

  const listingId =
    card.dataset.listingId ||
    '';

  const name =
    card.dataset.name ||
    '';

  const farmer =
    card.dataset.farmer ||
    '';

  return `
    <div class="mt-5 rounded-2xl bg-surface-container-low p-4">

      <div class="flex items-center justify-between gap-4">

        <div>

          <p class="font-semibold text-on-surface">
            Admin Verification
          </p>

          <p
            id="admin-verification-status"
            class="text-sm text-on-surface-variant mt-1"
          >
            ${
              verified
                ? 'This listing is verified.'
                : 'This listing is not verified.'
            }
          </p>

        </div>

        <button
          id="admin-verification-toggle"
          type="button"
          data-listing-id="${listingId}"
          data-product-name="${name}"
          data-farmer="${farmer}"
          class="${
            verified
              ? 'bg-error'
              : 'bg-primary'
          } text-white rounded-xl px-4 py-2 font-semibold text-sm whitespace-nowrap"
        >
          ${
            verified
              ? 'De-verify Listing'
              : 'Verify Listing'
          }
        </button>

      </div>

    </div>
  `;
}


/* =========================================================
   FILTERING
========================================================= */

function setupFiltering() {
  const searchInput =
    document.querySelector(
      'input[placeholder*="Search fresh produce"]'
    ) ||
    document.querySelector(
      'input[placeholder*="Search"]'
    );

  const categoryPills =
    document.querySelectorAll(
      '.category-pill'
    );

  const listingCount =
    document.getElementById(
      'listing-count'
    );

  const cards =
    () =>
      Array.from(
        document.querySelectorAll(
          '.product-card'
        )
      );

  let activeCategory =
    'all';

  const allPill =
    Array.from(
      categoryPills
    ).find(pill => {
      const text =
        pill.textContent
          .trim()
          .toLowerCase();

      return (
        text === 'all' ||
        text === 'all products' ||
        text === 'all produce'
      );
    });

  if (allPill) {
    categoryPills.forEach(
      pill => {
        pill.classList.remove(
          'bg-primary-container'
        );
      }
    );

    allPill.classList.add(
      'bg-primary-container'
    );
  }

  function getCategoryValue(
    pill
  ) {
    if (!pill) {
      return 'all';
    }

    return (
      pill.dataset.category ||
      pill.getAttribute(
        'data-category'
      ) ||
      pill.textContent
        .trim()
        .toLowerCase()
    );
  }

  function applyFilters() {
    const searchTerm =
      searchInput
        ? searchInput.value
            .trim()
            .toLowerCase()
        : '';

    const allCards =
      cards();

    let visibleCount = 0;

    allCards.forEach(card => {
      const name =
        (
          card.dataset.name ||
          ''
        ).toLowerCase();

      const farmer =
        (
          card.dataset.farmer ||
          ''
        ).toLowerCase();

      const description =
        (
          card.dataset.description ||
          ''
        ).toLowerCase();

      const location =
        (
          card.dataset.location ||
          ''
        ).toLowerCase();

      const category =
        (
          card.dataset.category ||
          ''
        ).toLowerCase();

      const searchableText =
        [
          name,
          farmer,
          description,
          location,
          category
        ].join(' ');

      const matchesSearch =
        !searchTerm ||
        searchableText.includes(
          searchTerm
        );

      const matchesCategory =
        activeCategory === 'all' ||
        !activeCategory ||
        category ===
          activeCategory;

      const visible =
        matchesSearch &&
        matchesCategory;

      card.style.display =
        visible
          ? ''
          : 'none';

      if (visible) {
        visibleCount++;
      }
    });

    if (listingCount) {
      listingCount.textContent =
        `${visibleCount} ${
          visibleCount === 1
            ? 'listing'
            : 'listings'
        }`;
    }
  }

  cards().forEach(card => {
    card.style.display = '';
  });

  if (listingCount) {
    listingCount.textContent =
      `${cards().length} ${
        cards().length === 1
          ? 'listing'
          : 'listings'
      }`;
  }

  if (searchInput) {
    searchInput.oninput =
      applyFilters;
  }

  categoryPills.forEach(
    pill => {
      pill.onclick = () => {
        const category =
          getCategoryValue(
            pill
          )
            .trim()
            .toLowerCase();

        activeCategory =
          category ||
          'all';

        categoryPills.forEach(
          otherPill => {
            otherPill.classList.remove(
              'bg-primary-container'
            );
          }
        );

        pill.classList.add(
          'bg-primary-container'
        );

        applyFilters();
      };
    }
  );

  applyFilters();
}


/* =========================================================
   PRODUCT MODAL
========================================================= */

function openProductModal(modal) {
  if (!modal) {
    return;
  }

  modal.classList.remove(
    'hidden',
    'opacity-0',
    'pointer-events-none'
  );

  modal.classList.add(
    'opacity-100',
    'pointer-events-auto'
  );

  const modalCard =
    document.getElementById(
      'product-modal-card'
    );

  if (modalCard) {
    modalCard.classList.remove(
      'translate-y-full',
      'sm:translate-y-4'
    );

    modalCard.classList.add(
      'translate-y-0'
    );
  }

  document.body.style.overflow =
    'hidden';
}

function closeProductModal(modal) {
  if (!modal) {
    return;
  }

  const modalCard =
    document.getElementById(
      'product-modal-card'
    );

  if (modalCard) {
    modalCard.classList.remove(
      'translate-y-0'
    );

    modalCard.classList.add(
      'translate-y-full',
      'sm:translate-y-4'
    );
  }

  modal.classList.remove(
    'opacity-100',
    'pointer-events-auto'
  );

  modal.classList.add(
    'opacity-0',
    'pointer-events-none'
  );

  document.body.style.overflow =
    '';
}

function showProductModal(
  card
) {
  if (!card) {
    return;
  }

  const modal =
    document.getElementById(
      'product-modal'
    );

  const modalCard =
    document.getElementById(
      'product-modal-card'
    );

  if (
    !modal ||
    !modalCard
  ) {
    return;
  }

  const verified =
    isListingVerified(card);

  card.dataset.verified =
    String(verified);

  const name =
    card.dataset.name ||
    'Fresh Produce';

  const price =
    card.dataset.price ||
    '0';

  const unit =
    card.dataset.unit ||
    'per kg';

  const farmer =
    card.dataset.farmer ||
    'Local Farmer';

  const location =
    card.dataset.location ||
    'Sri Lanka';

  const harvestDate =
    card.dataset.harvestDate ||
    'Not specified';

  const farmingMethod =
    card.dataset.farmingMethod ||
    'Not specified';

  const description =
    card.dataset.description ||
    'Fresh produce supplied directly by a local farmer.';

  const image =
    card.dataset.img ||
    (
      card.querySelector(
        'img'
      )?.src || ''
    );

  let quantity = 1;

  function updateTotal() {
    const total =
      (
        Number(price) ||
        0
      ) * quantity;

    const totalElement =
      modalCard.querySelector(
        '#modal-product-total'
      );

    const quantityElement =
      modalCard.querySelector(
        '#modal-product-quantity'
      );

    if (totalElement) {
      totalElement.textContent =
        `Rs. ${total.toLocaleString()}`;
    }

    if (quantityElement) {
      quantityElement.textContent =
        quantity;
    }
  }

  modalCard.innerHTML = `
    <div class="relative">

      <img
        src="${image}"
        alt="${name}"
        class="w-full h-64 object-cover"
      />

      <button
        type="button"
        id="close-product-modal"
        class="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-sm"
      >
        <span class="material-symbols-outlined">
          close
        </span>
      </button>

    </div>

    <div class="p-5">

      <div class="flex items-start justify-between gap-4">

        <div>

          <p class="text-sm text-on-surface-variant">
            ${farmer}
          </p>

          <h2 class="text-2xl font-bold text-on-surface mt-1">
            ${name}
          </h2>

          ${
            verified
              ? `
                <div class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-container px-3 py-1">

                  <span class="material-symbols-outlined text-primary text-[16px]">
                    verified
                  </span>

                  <span class="text-xs font-semibold text-primary">
                    Verified Listing
                  </span>

                </div>
              `
              : ''
          }

        </div>

        <div class="text-right shrink-0">

          <p class="text-xl font-bold text-primary">
            Rs. ${price}
          </p>

          <p class="text-sm text-on-surface-variant">
            / ${unit}
          </p>

        </div>

      </div>

      <div class="grid grid-cols-2 gap-3 mt-5">

        <div class="rounded-xl bg-surface-container-low p-3">

          <p class="text-xs text-on-surface-variant">
            Location
          </p>

          <p class="text-sm font-medium text-on-surface mt-1">
            ${location}
          </p>

        </div>

        <div class="rounded-xl bg-surface-container-low p-3">

          <p class="text-xs text-on-surface-variant">
            Harvest date
          </p>

          <p class="text-sm font-medium text-on-surface mt-1">
            ${harvestDate}
          </p>

        </div>

        <div class="rounded-xl bg-surface-container-low p-3 col-span-2">

          <p class="text-xs text-on-surface-variant">
            Farming method
          </p>

          <p class="text-sm font-medium text-on-surface mt-1">
            ${farmingMethod}
          </p>

        </div>

      </div>

      <div class="mt-5">

        <h3 class="font-semibold text-on-surface">
          About this produce
        </h3>

        <p class="text-sm text-on-surface-variant leading-6 mt-2">
          ${description}
        </p>

      </div>

      <div class="mt-6 flex items-center justify-between gap-4">

        <div>

          <p class="text-sm text-on-surface-variant">
            Quantity
          </p>

          <div class="flex items-center gap-3 mt-2">

            <button
              type="button"
              id="modal-minus"
              class="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center"
            >
              <span class="material-symbols-outlined">
                remove
              </span>
            </button>

            <span
              id="modal-product-quantity"
              class="font-semibold min-w-5 text-center"
            >
              1
            </span>

            <button
              type="button"
              id="modal-plus"
              class="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center"
            >
              <span class="material-symbols-outlined">
                add
              </span>
            </button>

          </div>

        </div>

        <div class="text-right">

          <p class="text-sm text-on-surface-variant">
            Total
          </p>

          <p
            id="modal-product-total"
            class="text-xl font-bold text-primary mt-1"
          >
            Rs. ${Number(price || 0).toLocaleString()}
          </p>

        </div>

      </div>

      <button
        type="button"
        id="modal-add-to-cart"
        class="w-full mt-6 rounded-xl bg-primary text-white py-3 font-semibold"
      >
        Add to cart
      </button>

      ${createAdminVerificationControl(card)}

    </div>
  `;

  openProductModal(
    modal
  );

  const closeButton =
    modalCard.querySelector(
      '#close-product-modal'
    );

  if (closeButton) {
    closeButton.onclick =
      () => {
        closeProductModal(
          modal
        );
      };
  }

  const minus =
    modalCard.querySelector(
      '#modal-minus'
    );

  const plus =
    modalCard.querySelector(
      '#modal-plus'
    );

  if (minus) {
    minus.onclick =
      () => {
        quantity =
          Math.max(
            1,
            quantity - 1
          );

        updateTotal();
      };
  }

  if (plus) {
    plus.onclick =
      () => {
        quantity += 1;

        updateTotal();
      };
  }

  const modalAdd =
    modalCard.querySelector(
      '#modal-add-to-cart'
    );

  if (modalAdd) {
    modalAdd.onclick =
      () => {
        saveToCart({
          id:
            card.dataset.listingId ||
            '',

          name:
            card.dataset.name ||
            '',

          category:
            card.dataset.category ||
            '',

          price:
            Number(
              card.dataset.price
            ) || 0,

          unit:
            card.dataset.unit ||
            'per kg',

          farmer:
            card.dataset.farmer ||
            '',

          location:
            card.dataset.location ||
            '',

          harvestDate:
            card.dataset.harvestDate ||
            '',

          farmingMethod:
            card.dataset.farmingMethod ||
            '',

          description:
            card.dataset.description ||
            '',

          img:
            card.dataset.img ||
            (
              card.querySelector(
                'img'
              )?.src || ''
            ),

          verified:
            isListingVerified(
              card
            ),

          quantity
        });

        const original =
          modalAdd.innerHTML;

        modalAdd.innerHTML = `
          <span class="material-symbols-outlined align-middle text-[18px]">
            check
          </span>
          Added to cart
        `;

        setTimeout(() => {
          if (
            modalAdd.isConnected
          ) {
            modalAdd.innerHTML =
              original;
          }

          closeProductModal(
            modal
          );
        }, 700);
      };
  }

  updateTotal();
}

function setupProductModal() {
  const modal =
    document.getElementById(
      'product-modal'
    );

  const modalCard =
    document.getElementById(
      'product-modal-card'
    );

  if (
    !modal ||
    !modalCard
  ) {
    return;
  }

  if (
    modal.dataset
      .productModalInitialized ===
    'true'
  ) {
    return;
  }

  modal.dataset
    .productModalInitialized =
    'true';

  modal.addEventListener(
    'click',
    event => {
      if (
        event.target === modal
      ) {
        closeProductModal(
          modal
        );
      }
    }
  );
}


/* =========================================================
   PRODUCT INTERACTIONS
========================================================= */

if (
  !window.__goviDirectProductInteractionAttached
) {
  window.__goviDirectProductInteractionAttached =
    true;

  document.addEventListener(
    'click',
    event => {

      const addButton =
        event.target.closest(
          '.add-btn'
        );

      if (addButton) {
        const card =
          addButton.closest(
            '.product-card'
          );

        if (!card) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        showProductModal(
          card
        );

        return;
      }

      const card =
        event.target.closest(
          '.product-card'
        );

      if (!card) {
        return;
      }

      if (
        event.target.closest(
          'button'
        ) ||
        event.target.closest(
          'a'
        )
      ) {
        return;
      }

      showProductModal(
        card
      );
    }
  );
}


/* =========================================================
   ESCAPE KEY
========================================================= */

if (
  !window.__goviDirectEscapeHandlerAttached
) {
  window.__goviDirectEscapeHandlerAttached =
    true;

  document.addEventListener(
    'keydown',
    event => {
      if (
        event.key !== 'Escape'
      ) {
        return;
      }

      const modal =
        document.getElementById(
          'product-modal'
        );

      if (
        modal &&
        !modal.classList.contains(
          'pointer-events-none'
        )
      ) {
        closeProductModal(
          modal
        );
      }

      closeAccountProfile();
    }
  );
}


/* =========================================================
   ROUTER
========================================================= */

function initializeRouter() {
  if (
    window.__goviDirectRouterReady ||
    !requireAuthentication()
  ) {
    return;
  }

  window.__goviDirectRouterReady =
    true;

  registerExistingScripts();

  let navigationInProgress =
    false;

  let navigationToken =
    0;


  /* =======================================================
     ACTIVE NAVIGATION TAB
  ======================================================= */

  function updateActiveTab(
    currentPath = window.location.pathname
  ) {
    document
      .querySelectorAll(
        'nav a[data-path], nav a'
      )
      .forEach(link => {

        const href =
          link.getAttribute(
            'href'
          );

        if (!href) {
          return;
        }

        let linkPath = '';

        try {
          linkPath =
            new URL(
              href,
              window.location.href
            ).pathname;
        } catch (error) {
          return;
        }

        const samePath =
          linkPath === currentPath;

        link.classList.remove(
          'text-primary',
          'text-on-surface-variant'
        );

        link.classList.add(
          samePath
            ? 'text-primary'
            : 'text-on-surface-variant'
        );
      });
  }


  /* =======================================================
     CLEAN CURRENT PAGE
  ======================================================= */

  function prepareForNavigation() {
    const productModal =
      document.getElementById(
        'product-modal'
      );

    if (productModal) {
      closeProductModal(
        productModal
      );
    }

    closeAccountProfile();

    document.body.style.overflow =
      '';

    document.body.classList.remove(
      'verification-modal-open'
    );

    document
      .querySelectorAll(
        '.is-open'
      )
      .forEach(element => {
        element.classList.remove(
          'is-open'
        );
      });
  }


  /* =======================================================
     PAGE OUT ANIMATION
  ======================================================= */

  async function animatePageOut(
    appContent
  ) {
    if (!appContent) {
      return;
    }

    appContent.classList.remove(
      'page-transitioning'
    );

    void appContent.offsetWidth;

    appContent.classList.add(
      'page-transitioning'
    );

    await new Promise(
      resolve => {
        setTimeout(
          resolve,
          180
        );
      }
    );
  }


  /* =======================================================
     PAGE IN ANIMATION
  ======================================================= */

  function animatePageIn(
    appContent
  ) {
    if (!appContent) {
      return;
    }

    requestAnimationFrame(
      () => {
        requestAnimationFrame(
          () => {
            appContent.classList.remove(
              'page-transitioning'
            );
          }
        );
      }
    );
  }


  /* =======================================================
     SPA NAVIGATION
  ======================================================= */

  async function navigateTo(
  targetUrl,
  options = {}
) {
  const {
    addHistory = true,
    replaceHistory = false,
    forceNavigation = false
  } = options;

  if (
    navigationInProgress
  ) {
    return;
  }

  const absoluteUrl =
    getAbsoluteUrl(
      targetUrl
    );

  const targetLocation =
    new URL(
      absoluteUrl
    );

  const currentLocation =
    new URL(
      window.location.href
    );

  const sameUrl =
    targetLocation.pathname ===
      currentLocation.pathname &&
    targetLocation.search ===
      currentLocation.search &&
    targetLocation.hash ===
      currentLocation.hash;

  if (
    sameUrl &&
    !forceNavigation
  ) {
    updateActiveTab(
      targetLocation.pathname
    );

    await initializeCurrentPage(
      absoluteUrl
    );

    return;
  }

  const appContent =
    document.getElementById(
      'app-content'
    );

  /*
   * If this page isn't using the SPA container,
   * use normal browser navigation.
   */
  if (!appContent) {
    window.location.href =
      absoluteUrl;

    return;
  }

  navigationInProgress =
    true;

  const currentNavigationToken =
    ++navigationToken;

  try {
    /*
     * ========================================
     * 1. CLEAN OLD PAGE
     * ========================================
     */

    prepareForNavigation();

    /*
     * ========================================
     * 2. ANIMATE OLD PAGE OUT
     * ========================================
     */

    await animatePageOut(
      appContent
    );

    if (
      currentNavigationToken !==
      navigationToken
    ) {
      return;
    }

    /*
     * ========================================
     * 3. FETCH TARGET HTML
     * ========================================
     */

    const html =
      await getPreloadedPage(
        absoluteUrl
      );

    /*
     * ========================================
     * 4. PARSE TARGET
     * ========================================
     */

    const targetDocument =
      new DOMParser().parseFromString(
        html,
        'text/html'
      );

    const targetContent =
      targetDocument.getElementById(
        'app-content'
      );

    if (!targetContent) {
      throw new Error(
        'Target page does not contain #app-content.'
      );
    }

    /*
     * ========================================
     * 5. LOAD CSS
     * ========================================
     */

    await loadPageStyles(
      targetDocument,
      absoluteUrl
    );

    /*
     * ========================================
     * 6. CLEAR OLD PAGE
     * ========================================
     */

    appContent.innerHTML = '';

    /*
     * ========================================
     * 7. INSERT NEW PAGE HTML
     * ========================================
     */

    appContent.innerHTML =
      targetContent.innerHTML;

    /*
     * ========================================
     * 8. PREPARE TRANSITION
     * ========================================
     */

    appContent.classList.add(
      'page-transitioning'
    );

    /*
     * ========================================
     * 9. LOAD TARGET JAVASCRIPT
     *
     * IMPORTANT:
     *
     * The HTML is already in the REAL DOM.
     * Page JS can now safely query it.
     * ========================================
     */

    await loadPageScripts(
      targetDocument,
      absoluteUrl
    );

    /*
     * ========================================
     * 10. UPDATE URL
     * ========================================
     */

    if (addHistory) {
      if (replaceHistory) {
        history.replaceState(
          {},
          '',
          absoluteUrl
        );
      } else {
        history.pushState(
          {},
          '',
          absoluteUrl
        );
      }
    }

    /*
     * ========================================
     * 11. UPDATE NAVIGATION
     * ========================================
     */

    updateActiveTab(
      targetLocation.pathname
    );

    /*
     * ========================================
     * 12. RESET SCROLL
     * ========================================
     */

    window.scrollTo(
      0,
      0
    );

    /*
     * ========================================
     * 13. INITIALIZE THE ACTUAL PAGE
     *
     * THIS IS THE BIG FIX.
     * ========================================
     */

    await initializeCurrentPage(
      absoluteUrl
    );

    /*
     * ========================================
     * 14. FIRE SPA LIFECYCLE EVENT
     * ========================================
     */

    document.dispatchEvent(
      new CustomEvent(
        'pageLoaded',
        {
          detail: {
            url: absoluteUrl
          }
        }
      )
    );

    /*
     * ========================================
     * 15. ANIMATE IN
     * ========================================
     */

    animatePageIn(
      appContent
    );

  } catch (error) {
    console.error(
      'GoviDirect SPA navigation failed:',
      error
    );

    appContent.classList.remove(
      'page-transitioning'
    );

    /*
     * If SPA navigation genuinely fails,
     * fall back to a real page navigation.
     */
    window.location.href =
      absoluteUrl;

    return;

  } finally {
    navigationInProgress =
      false;
  }
}


  /* =======================================================
     INITIAL ACTIVE TAB
  ======================================================= */

  updateActiveTab();


  /* =======================================================
     NORMAL NAVIGATION CLICKS
  ======================================================= */

  if (
    !window.__goviDirectNavigationHandlerAttached
  ) {
    window.__goviDirectNavigationHandlerAttached =
      true;

    document.addEventListener(
      'click',
      async event => {

        /* ================================================
           PROFILE BUTTON
        ================================================ */

        const profileButton =
          event.target.closest(
            '#profile-button'
          );

        if (profileButton) {
          event.preventDefault();
          event.stopPropagation();

          openAccountProfile();

          return;
        }


        /* ================================================
           FIND NAVIGATION LINK
        ================================================ */

        const link =
          event.target.closest(
            'nav a[data-path], nav a'
          );

        if (!link) {
          return;
        }

        const href =
          link.getAttribute(
            'href'
          );

        if (!href) {
          return;
        }


        /* ================================================
           IGNORE MODIFIER CLICKS
        ================================================ */

        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }


        /* ================================================
           IGNORE EXTERNAL / SPECIAL LINKS
        ================================================ */

        if (
          href.startsWith(
            'http://'
          ) ||
          href.startsWith(
            'https://'
          ) ||
          href.startsWith(
            '#'
          ) ||
          href.startsWith(
            'javascript:'
          )
        ) {
          return;
        }


        /* ================================================
           SAME ORIGIN
        ================================================ */

        let targetUrl;

        try {
          targetUrl =
            new URL(
              href,
              window.location.href
            );
        } catch (error) {
          return;
        }

        const currentUrl =
          new URL(
            window.location.href
          );

        if (
          targetUrl.origin !==
          currentUrl.origin
        ) {
          return;
        }

        event.preventDefault();


        /* ================================================
           SPA NAVIGATION
        ================================================ */

        await navigateTo(
          targetUrl.href,
          {
            addHistory: true,
            replaceHistory: false,
            forceNavigation: false
          }
        );
      }
    );
  }


  /* =======================================================
     BROWSER BACK / FORWARD
  ======================================================= */

  if (
    !window.__goviDirectPopstateHandlerAttached
  ) {
    window.__goviDirectPopstateHandlerAttached =
      true;

    window.addEventListener(
      'popstate',
      async () => {

        const targetUrl =
          window.location.href;

        await navigateTo(
          targetUrl,
          {
            addHistory: false,
            replaceHistory: false,
            forceNavigation: true
          }
        );
      }
    );
  }
}


/* =========================================================
   ROBUST PAGE STARTUP
========================================================= */

function setupGlobalNotifications() {
  const notificationScript =
    getAbsoluteUrl(
      '../notifications.js'
    );

  if (
    window.__goviDirectLoadedScripts.has(
      notificationScript
    )
  ) {
    return;
  }

  loadScript(
    '../notifications.js'
  ).catch(error => {
    console.error(
      'Failed to load notifications.js:',
      error
    );
  });
}

function startRouter() {
  initializeRouter();

  setupAccountProfile();

  setupGlobalNotifications();

  if (
    document.getElementById(
      'product-grid'
    )
  ) {
    init();
  }
}


/* =========================================================
   SPA PAGE INITIALIZATION

   This listener is deliberately attached to DOCUMENT.

   navigateTo() dispatches pageLoaded on DOCUMENT,
   allowing Cart and Harvest to initialize correctly
   after SPA navigation.
========================================================= */

if (
  !window.__goviDirectPageLifecycleAttached
) {
  window.__goviDirectPageLifecycleAttached =
    true;

  document.addEventListener(
    'pageLoaded',
    event => {

      document.body.style.overflow =
        '';

      document.body.classList.remove(
        'verification-modal-open'
      );

      setupAccountProfile();

      setupGlobalNotifications();
    }
  );
}


/* =========================================================
   START APPLICATION
========================================================= */

if (
  document.readyState ===
  'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    startRouter,
    {
      once: true
    }
  );
} else {
  startRouter();
}