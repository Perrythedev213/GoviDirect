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
  const user =
    getCurrentUser();

  if (!user) {
    return '4.8';
  }

  return (
    user.rating ||
    '4.8'
  );
}

function getAccountTypeLabel() {
  const user =
    getCurrentUser();

  if (!user) {
    return 'Account';
  }

  if (
    user.accountType === 'admin' ||
    user.role === 'admin'
  ) {
    return 'Administrator';
  }

  if (
    user.accountType === 'seller'
  ) {
    return 'Farmer / Seller';
  }

  return 'Buyer';
}

function getAccountInitial() {
  const user =
    getCurrentUser();

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

  modal.classList.add(
    'hidden'
  );

  document.body.style.overflow =
    '';
}

function openAccountProfile() {
  const modal =
    document.getElementById(
      'govi-account-profile-modal'
    );

  if (!modal) {
    return;
  }

  modal.classList.remove(
    'hidden'
  );

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

  const user =
    getCurrentUser();

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
    document.createElement(
      'div'
    );

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
            id="account-logout-button"
            class="w-full mt-5 rounded-xl bg-error text-white py-3 font-semibold"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(
    modal
  );

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
  document
    .querySelectorAll('script[src]')
    .forEach(script => {
      window.__goviDirectLoadedScripts.add(
        getAbsoluteUrl(
          script.getAttribute('src')
        )
      );
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
    await fetch(absoluteUrl);

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
      script.getAttribute(
        'src'
      );

    if (!src) {
      continue;
    }

    const absoluteUrl =
      new URL(
        src,
        targetUrl
      ).href;

    const routerPath =
      '/Discover/router.js';

    if (
      new URL(absoluteUrl).pathname.endsWith(
        routerPath
      )
    ) {
      continue;
    }

    await loadScript(
      absoluteUrl
    );
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
        getAbsoluteUrl(
          link.getAttribute('href')
        )
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
      'cartUpdated'
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


/* =========================================================
   ESCAPE KEY
========================================================= */

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

        const samePath =
          new URL(
            href,
            window.location.href
          ).pathname ===
          currentPath;

        link.classList.toggle(
          'text-primary',
          samePath
        );

        link.classList.toggle(
          'text-on-surface-variant',
          !samePath
        );
      });
  }

  updateActiveTab();

  document.addEventListener(
    'click',
    async event => {

      /* ===================================================
         PROFILE BUTTON
      =================================================== */

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


      /* ===================================================
         NORMAL NAVIGATION
      =================================================== */

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

      if (
        href.toLowerCase().includes(
          'cart'
        )
      ) {
        return;
      }

      event.preventDefault();

      const productModal =
        document.getElementById(
          'product-modal'
        );

      if (productModal) {
        closeProductModal(
          productModal
        );
      }

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

      const targetUrl =
        getAbsoluteUrl(
          href
        );

      document.body.classList.add(
        'page-transitioning'
      );

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            150
          )
      );

      try {
        const html =
          await getPreloadedPage(
            targetUrl
          );

        const targetDocument =
          new DOMParser().parseFromString(
            html,
            'text/html'
          );

        const targetContent =
          targetDocument.getElementById(
            'app-content'
          );

        const appContent =
          document.getElementById(
            'app-content'
          );

        if (
          !targetContent ||
          !appContent
        ) {
          throw new Error(
            'Could not find app content in target page.'
          );
        }

        await loadPageStyles(
          targetDocument,
          targetUrl
        );

        delete appContent
          .dataset
          .discoverInitialized;

        delete appContent
          .dataset
          .harvestInitialized;

        appContent.innerHTML =
          targetContent.innerHTML;

        await loadPageScripts(
          targetDocument,
          targetUrl
        );

        history.pushState(
          {},
          '',
          targetUrl
        );

        updateActiveTab(
          new URL(
            targetUrl
          ).pathname
        );

        window.scrollTo(
          0,
          0
        );

        window.dispatchEvent(
          new CustomEvent(
            'pageLoaded',
            {
              detail: {
                url: targetUrl
              }
            }
          )
        );

        requestAnimationFrame(
          () => {
            requestAnimationFrame(
              () => {
                document.body.classList.remove(
                  'page-transitioning'
                );
              }
            );
          }
        );

      } catch (error) {
        console.error(
          'GoviDirect SPA navigation failed:',
          error
        );

        window.location.href =
          targetUrl;
      }
    }
  );

  window.addEventListener(
    'popstate',
    () => {
      window.location.reload();
    }
  );
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
========================================================= */

document.addEventListener(
  'pageLoaded',
  () => {
    document.body.style.overflow =
      '';

    document.body.classList.remove(
      'verification-modal-open'
    );

    setupAccountProfile();

    setupGlobalNotifications();

    if (
      document.getElementById(
        'product-grid'
      )
    ) {
      requestAnimationFrame(
        () => init()
      );
    }
  }
);


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