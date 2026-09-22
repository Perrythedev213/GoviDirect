const GOVI_PRELOAD_CACHE = 'goviDirect-app-v1';

window.__goviDirectLoadedScripts =
  window.__goviDirectLoadedScripts || new Set();

window.__goviDirectPageCache =
  window.__goviDirectPageCache || new Map();

window.__goviDirectRouterReady =
  window.__goviDirectRouterReady || false;


/* =========================================================
   URL / CACHE HELPERS
========================================================= */

function getAbsoluteUrl(url, baseUrl = window.location.href) {
  return new URL(url, baseUrl).href;
}

function getCacheKey(url) {
  return getAbsoluteUrl(url);
}


/* =========================================================
   REGISTER ALREADY-LOADED SCRIPTS
========================================================= */

function registerExistingScripts() {
  document.querySelectorAll('script[src]').forEach(script => {
    const src = script.getAttribute('src');

    if (!src) {
      return;
    }

    try {
      window.__goviDirectLoadedScripts.add(
        getAbsoluteUrl(src)
      );
    } catch (error) {
      console.warn(
        'Could not register existing script:',
        error
      );
    }
  });
}


/* =========================================================
   GET PRELOADED PAGE
========================================================= */

async function getPreloadedPage(url) {
  const absoluteUrl = getAbsoluteUrl(url);

  if (window.__goviDirectPageCache.has(absoluteUrl)) {
    return window.__goviDirectPageCache.get(absoluteUrl);
  }

  if ('caches' in window) {
    try {
      const cache = await caches.open(
        GOVI_PRELOAD_CACHE
      );

      const response = await cache.match(
        absoluteUrl
      );

      if (response) {
        const html = await response.text();

        window.__goviDirectPageCache.set(
          absoluteUrl,
          html
        );

        return html;
      }
    } catch (error) {
      console.warn(
        'Cache Storage lookup failed:',
        error
      );
    }
  }

  const response = await fetch(
    absoluteUrl,
    {
      cache: 'default'
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to load ${url}: HTTP ${response.status}`
    );
  }

  const html = await response.text();

  window.__goviDirectPageCache.set(
    absoluteUrl,
    html
  );

  return html;
}


/* =========================================================
   GET CACHED ASSET
========================================================= */

async function getCachedAsset(url) {
  const absoluteUrl = getAbsoluteUrl(url);

  if ('caches' in window) {
    try {
      const cache = await caches.open(
        GOVI_PRELOAD_CACHE
      );

      const response = await cache.match(
        absoluteUrl
      );

      if (response) {
        return response;
      }
    } catch (error) {
      console.warn(
        'Could not access preload cache:',
        error
      );
    }
  }

  return null;
}


/* =========================================================
   LOAD SCRIPT
========================================================= */

async function loadScript(src) {
  const absoluteSrc = getAbsoluteUrl(src);

  if (
    window.__goviDirectLoadedScripts.has(
      absoluteSrc
    )
  ) {
    return;
  }

  const cachedResponse =
    await getCachedAsset(absoluteSrc);

  if (cachedResponse) {
    const scriptText =
      await cachedResponse.text();

    const script =
      document.createElement('script');

    script.type = 'text/javascript';
    script.async = false;
    script.dataset.goviPreloaded = 'true';
    script.textContent = scriptText;

    document.body.appendChild(script);

    window.__goviDirectLoadedScripts.add(
      absoluteSrc
    );

    return;
  }

  await new Promise((resolve, reject) => {
    const script =
      document.createElement('script');

    script.src = absoluteSrc;
    script.async = false;

    script.onload = () => {
      window.__goviDirectLoadedScripts.add(
        absoluteSrc
      );

      resolve();
    };

    script.onerror = error => {
      reject(error);
    };

    document.body.appendChild(script);
  });
}


/* =========================================================
   LOAD TARGET PAGE SCRIPTS
========================================================= */

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

  for (const scriptElement of scripts) {
    const src =
      scriptElement.getAttribute('src');

    if (!src) {
      continue;
    }

    const absoluteSrc =
      getAbsoluteUrl(
        src,
        targetUrl
      );

    if (
      absoluteSrc.includes(
        '/Discover/router.js'
      )
    ) {
      continue;
    }

    await loadScript(
      absoluteSrc
    );
  }
}


/* =========================================================
   CART
========================================================= */

function saveToCart(product) {
  const cartKey =
    'goviDirectCart';

  let cart =
    JSON.parse(
      localStorage.getItem(cartKey)
    ) || [];

  const qtyToAdd =
    product.quantity || 1;

  const existingIndex =
    cart.findIndex(
      item =>
        item.name === product.name &&
        item.farmer === product.farmer
    );

  if (existingIndex > -1) {
    cart[existingIndex].quantity +=
      qtyToAdd;
  } else {
    product.quantity =
      qtyToAdd;

    cart.push(product);
  }

  localStorage.setItem(
    cartKey,
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
  const storageKey =
    'goviDirectLocation';

  const locationButton =
    document.querySelector(
      'header .inline-flex'
    );

  if (
    locationButton &&
    !locationButton.id
  ) {
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

      <span
        id="location-label"
        class="truncate max-w-[140px]"
      >
        Colombo
      </span>
    `;
  }

  function showSavedLocation() {
    const label =
      document.getElementById(
        'location-label'
      );

    if (!label) {
      return;
    }

    try {
      const saved =
        JSON.parse(
          localStorage.getItem(
            storageKey
          )
        );

      if (
        saved &&
        saved.label
      ) {
        label.textContent =
          saved.label;
      } else if (
        saved &&
        saved.latitude &&
        saved.longitude
      ) {
        label.textContent =
          'Current location';
      }
    } catch (error) {
      console.warn(
        'Could not read saved location:',
        error
      );
    }
  }

  function saveLocation(position) {
    const data = {
      latitude:
        position.coords.latitude,

      longitude:
        position.coords.longitude,

      accuracy:
        position.coords.accuracy,

      updatedAt:
        new Date().toISOString()
    };

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(data)
      );
    } catch (error) {
      console.warn(
        'Could not save location:',
        error
      );
    }

    window.dispatchEvent(
      new CustomEvent(
        'goviDirectLocationUpdated',
        {
          detail: data
        }
      )
    );
  }

  function requestLocation() {
    if (!window.isSecureContext) {
      return;
    }

    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      saveLocation,

      error => {
        console.warn(
          'Location request failed:',
          error.message
        );
      },

      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 0
      }
    );
  }

  showSavedLocation();

  const locationBtn =
    document.getElementById(
      'location-button'
    );

  if (locationBtn) {
    locationBtn.onclick =
      requestLocation;
  }

  loadFarmerListings();
  updateVerifiedBadges();
  setupFiltering();
}


/* =========================================================
   FARMER LISTINGS
========================================================= */

function loadFarmerListings() {
  const grid =
    document.getElementById(
      'product-grid'
    );

  if (!grid) {
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
    console.warn(
      'Could not load farmer listings:',
      error
    );
  }

  grid
    .querySelectorAll(
      '.farmer-listing-card'
    )
    .forEach(card => {
      card.remove();
    });

  listings.forEach(listing => {
    if (!listing) {
      return;
    }

    const card =
      document.createElement(
        'article'
      );

    card.className =
      'product-card farmer-listing-card';

    card.dataset.name =
      listing.name || '';

    card.dataset.category =
      listing.category || '';

    card.dataset.price =
      listing.price || '';

    card.dataset.unit =
      listing.unit || '';

    card.dataset.farmer =
      listing.farmer || '';

    card.dataset.location =
      listing.location || '';

    card.dataset.harvestDate =
      listing.harvestDate || '';

    card.dataset.farmingMethod =
      listing.farmingMethod || '';

    card.dataset.description =
      listing.description || '';

    card.dataset.img =
      listing.img || '';

    card.dataset.verified =
      String(
        listing.verified || false
      );

    card.dataset.listingId =
      listing.id || '';

    const image =
      listing.img
        ? `
          <img
            src="${listing.img}"
            alt="${listing.name || 'Farmer listing'}"
            class="w-full h-full object-cover"
          >
        `
        : `
          <div class="w-full h-full flex items-center justify-center bg-surface-container-low">
            <span class="material-symbols-outlined text-4xl text-primary">
              agriculture
            </span>
          </div>
        `;

    card.innerHTML = `
      <div class="relative aspect-square overflow-hidden rounded-xl">
        ${image}

        <div
          class="verified-product-badge absolute top-2 left-2 hidden"
        >
          <span class="material-symbols-outlined">
            verified
          </span>

          Verified
        </div>
      </div>

      <div class="pt-3">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h3 class="font-headline-sm text-headline-sm text-on-surface truncate">
              ${listing.name || 'Unnamed crop'}
            </h3>

            <p class="font-body-sm text-body-sm text-on-surface-variant">
              ${listing.farmer || 'Local farmer'}
            </p>
          </div>

          <span class="material-symbols-outlined text-primary shrink-0">
            eco
          </span>
        </div>

        <div class="flex items-center justify-between mt-2">
          <span class="font-headline-sm text-headline-sm text-primary-container">
            Rs. ${listing.price || '0'}
          </span>

          <span class="font-body-sm text-body-sm text-on-surface-variant">
            / ${listing.unit || 'unit'}
          </span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}


/* =========================================================
   VERIFIED BADGES
========================================================= */

function updateVerifiedBadges() {
  document
    .querySelectorAll(
      '.product-card'
    )
    .forEach(card => {
      const badge =
        card.querySelector(
          '.verified-product-badge'
        );

      if (!badge) {
        return;
      }

      badge.classList.toggle(
        'hidden',
        card.dataset.verified !== 'true'
      );
    });
}


/* =========================================================
   FILTERING
========================================================= */

function setupFiltering() {
  const searchInput =
    document.querySelector(
      'input[placeholder*="Search fresh produce"]'
    );

  const categoryPills =
    document.querySelectorAll(
      '.category-pill'
    );

  const listingCount =
    document.getElementById(
      'listing-count'
    );

  function applyFilters() {
    const query =
      searchInput
        ? searchInput.value
            .toLowerCase()
            .trim()
        : '';

    const activePill =
      document.querySelector(
        '.category-pill.bg-primary-container'
      );

    const category =
      activePill
        ? activePill.dataset.category ||
          'all'
        : 'all';

    let visibleCount = 0;

    document
      .querySelectorAll(
        '.product-card'
      )
      .forEach(card => {
        const text = [
          card.dataset.name || '',
          card.dataset.farmer || '',
          card.dataset.description || '',
          card.dataset.location || ''
        ]
          .join(' ')
          .toLowerCase();

        const cardCategory =
          (
            card.dataset.category || ''
          ).toLowerCase();

        const matchesSearch =
          !query ||
          text.includes(query);

        const matchesCategory =
          category === 'all' ||
          !category ||
          cardCategory === category;

        const visible =
          matchesSearch &&
          matchesCategory;

        card.style.display =
          visible ? '' : 'none';

        if (visible) {
          visibleCount++;
        }
      });

    if (listingCount) {
      listingCount.textContent =
        `${visibleCount} fresh listing${
          visibleCount === 1
            ? ''
            : 's'
        }`;
    }
  }

  if (searchInput) {
    searchInput.oninput =
      applyFilters;
  }

  categoryPills.forEach(pill => {
    pill.onclick = () => {
      categoryPills.forEach(other => {
        other.classList.remove(
          'bg-primary-container',
          'text-on-primary'
        );

        other.classList.add(
          'bg-surface-container-lowest',
          'text-on-surface-variant'
        );
      });

      pill.classList.remove(
        'bg-surface-container-lowest',
        'text-on-surface-variant'
      );

      pill.classList.add(
        'bg-primary-container',
        'text-on-primary'
      );

      applyFilters();
    };
  });

  applyFilters();
}


/* =========================================================
   PRODUCT / CART INTERACTIONS
========================================================= */

document.addEventListener(
  'click',
  event => {
    const addButton =
      event.target.closest(
        '.add-btn'
      );

    if (addButton) {
      event.stopPropagation();

      const card =
        addButton.closest(
          '.product-card'
        );

      if (!card) {
        return;
      }

      const product = {
        name:
          card.dataset.name,

        price:
          parseFloat(
            card.dataset.price
          ) || 0,

        unit:
          card.dataset.unit,

        farmer:
          card.dataset.farmer,

        location:
          card.dataset.location,

        harvestDate:
          card.dataset.harvestDate,

        farmingMethod:
          card.dataset.farmingMethod,

        description:
          card.dataset.description,

        img:
          card.dataset.img,

        verified:
          card.dataset.verified ===
          'true',

        quantity:
          1
      };

      saveToCart(product);

      const icon =
        addButton.querySelector(
          '.material-symbols-outlined'
        );

      if (icon) {
        const original =
          icon.textContent;

        icon.textContent =
          'check';

        setTimeout(() => {
          icon.textContent =
            original;
        }, 900);
      }

      return;
    }

    const productCard =
      event.target.closest(
        '.product-card'
      );

    if (
      !productCard ||
      event.target.closest(
        'button'
      )
    ) {
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

    const name =
      productCard.dataset.name || '';

    const price =
      parseFloat(
        productCard.dataset.price
      ) || 0;

    const unit =
      productCard.dataset.unit || '';

    const farmer =
      productCard.dataset.farmer || '';

    const location =
      productCard.dataset.location || '';

    const harvestDate =
      productCard.dataset.harvestDate || '';

    const farmingMethod =
      productCard.dataset.farmingMethod || '';

    const description =
      productCard.dataset.description || '';

    const img =
      productCard.dataset.img || '';

    const verified =
      productCard.dataset.verified ===
      'true';

    let quantity = 1;

    modalCard.innerHTML = `
      <div class="p-5">

        ${
          img
            ? `
              <img
                src="${img}"
                alt="${name}"
                class="w-full aspect-square object-cover rounded-xl mb-4"
              >
            `
            : ''
        }

        <div class="flex items-start justify-between gap-3">
          <div>
            <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider">
              ${farmer}
            </span>

            <h2 class="font-headline-lg text-headline-lg text-on-surface mt-1">
              ${name}
            </h2>

            <p class="text-on-surface-variant mt-1">
              Rs. ${price} / ${unit}
            </p>
          </div>

          ${
            verified
              ? `
                <span class="verified-product-badge">
                  <span class="material-symbols-outlined">
                    verified
                  </span>
                  Verified
                </span>
              `
              : ''
          }
        </div>

        ${
          location
            ? `
              <div class="flex items-center gap-2 mt-4 text-on-surface-variant">
                <span class="material-symbols-outlined text-[18px]">
                  location_on
                </span>
                ${location}
              </div>
            `
            : ''
        }

        ${
          harvestDate
            ? `
              <div class="flex items-center gap-2 mt-2 text-on-surface-variant">
                <span class="material-symbols-outlined text-[18px]">
                  calendar_month
                </span>
                Harvest: ${harvestDate}
              </div>
            `
            : ''
        }

        ${
          farmingMethod
            ? `
              <div class="flex items-center gap-2 mt-2 text-on-surface-variant">
                <span class="material-symbols-outlined text-[18px]">
                  eco
                </span>
                ${farmingMethod}
              </div>
            `
            : ''
        }

        ${
          description
            ? `
              <p class="mt-4 text-on-surface-variant leading-relaxed">
                ${description}
              </p>
            `
            : ''
        }

        <div class="flex items-center justify-between mt-6">

          <div class="flex items-center bg-surface-container-low rounded-lg p-1">

            <button
              type="button"
              id="modal-minus"
              class="w-9 h-9 flex items-center justify-center rounded"
            >
              <span class="material-symbols-outlined">
                remove
              </span>
            </button>

            <span
              id="modal-quantity"
              class="w-10 text-center font-semibold"
            >
              1
            </span>

            <button
              type="button"
              id="modal-plus"
              class="w-9 h-9 flex items-center justify-center rounded"
            >
              <span class="material-symbols-outlined">
                add
              </span>
            </button>

          </div>

          <strong
            id="modal-total"
            class="text-xl text-primary"
          >
            Rs. ${price.toFixed(2)}
          </strong>

        </div>

        <button
          type="button"
          id="modal-add-cart"
          class="w-full mt-5 rounded-xl bg-primary-container text-on-primary py-3 font-semibold"
        >
          Add to cart
        </button>

      </div>
    `;

    const quantityElement =
      document.getElementById(
        'modal-quantity'
      );

    const totalElement =
      document.getElementById(
        'modal-total'
      );

    function updateModal() {
      if (quantityElement) {
        quantityElement.textContent =
          quantity;
      }

      if (totalElement) {
        totalElement.textContent =
          `Rs. ${(price * quantity).toFixed(2)}`;
      }
    }

    document.getElementById(
      'modal-minus'
    )?.addEventListener(
      'click',
      () => {
        quantity =
          Math.max(
            1,
            quantity - 1
          );

        updateModal();
      }
    );

    document.getElementById(
      'modal-plus'
    )?.addEventListener(
      'click',
      () => {
        quantity++;

        updateModal();
      }
    );

    document.getElementById(
      'modal-add-cart'
    )?.addEventListener(
      'click',
      () => {
        saveToCart({
          name,
          price,
          unit,
          farmer,
          location,
          harvestDate,
          farmingMethod,
          description,
          img,
          verified,
          quantity
        });

        modal.classList.add(
          'hidden'
        );

        document.body.style.overflow =
          '';
      }
    );

    modal.classList.remove(
      'hidden'
    );

    document.body.style.overflow =
      'hidden';
  }
);


/* =========================================================
   ROUTER
========================================================= */

function initializeRouter() {
  if (
    window.__goviDirectRouterReady
  ) {
    return;
  }

  window.__goviDirectRouterReady =
    true;

  registerExistingScripts();


  /* =======================================================
     ACTIVE BOTTOM NAV
  ======================================================= */

  const updateActiveTab = overrideUrl => {
    const currentUrl =
      overrideUrl ||
      window.location.href;

    const currentPath =
      new URL(
        currentUrl,
        window.location.href
      ).pathname
        .replace(
          /\/index\.html$/,
          ''
        )
        .replace(
          /\/$/,
          ''
        );

    document
      .querySelectorAll(
        'nav a[data-path], nav a'
      )
      .forEach(link => {
        const path =
          link.getAttribute(
            'data-path'
          ) ||
          link.getAttribute(
            'href'
          );

        if (!path) {
          return;
        }

        const linkPath =
          new URL(
            path,
            window.location.href
          ).pathname
            .replace(
              /\/index\.html$/,
              ''
            )
            .replace(
              /\/$/,
              ''
            );

        const active =
          currentPath === linkPath;

        link.classList.toggle(
          'text-primary',
          active
        );

        link.classList.toggle(
          'text-black',
          !active
        );
      });
  };


  updateActiveTab();


  /* =======================================================
     NAVIGATION
  ======================================================= */

  document.addEventListener(
    'click',
    async event => {
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

      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('javascript:')
      ) {
        return;
      }

      if (
        href.includes('cart')
      ) {
        return;
      }

      event.preventDefault();

      const targetUrl =
        new URL(
          href,
          window.location.href
        ).href;

      const currentUrl =
        window.location.href;

      if (
        getAbsoluteUrl(currentUrl) ===
        getAbsoluteUrl(targetUrl)
      ) {
        return;
      }

      const appContent =
        document.getElementById(
          'app-content'
        );

      try {

        /* -------------------------------------------------
           FADE OUT CURRENT PAGE
        ------------------------------------------------- */

        if (appContent) {
          appContent.classList.add(
            'page-transitioning'
          );

          void appContent.offsetHeight;

          await new Promise(resolve => {
            setTimeout(
              resolve,
              150
            );
          });
        }


        /* -------------------------------------------------
           LOAD TARGET PAGE
        ------------------------------------------------- */

        const html =
          await getPreloadedPage(
            targetUrl
          );

        const parser =
          new DOMParser();

        const doc =
          parser.parseFromString(
            html,
            'text/html'
          );

        const nextContent =
          doc.getElementById(
            'app-content'
          );

        if (!nextContent) {
          throw new Error(
            'Target page does not contain #app-content'
          );
        }

        if (!appContent) {
          throw new Error(
            'Current page does not contain #app-content'
          );
        }


        /* -------------------------------------------------
           SWAP CONTENT
        ------------------------------------------------- */

        appContent.innerHTML =
          nextContent.innerHTML;


        /* -------------------------------------------------
           LOAD PAGE SCRIPTS
        ------------------------------------------------- */

        await loadPageScripts(
          doc,
          targetUrl
        );


        /* -------------------------------------------------
           UPDATE URL
        ------------------------------------------------- */

        history.pushState(
          {},
          '',
          targetUrl
        );


        /* -------------------------------------------------
           UPDATE ACTIVE NAV
        ------------------------------------------------- */

        updateActiveTab(
          targetUrl
        );


        /* -------------------------------------------------
           SCROLL TO TOP
        ------------------------------------------------- */

        window.scrollTo({
          top: 0,
          behavior: 'instant'
        });


        /* -------------------------------------------------
           PAGE LOADED EVENT
        ------------------------------------------------- */

        window.dispatchEvent(
          new CustomEvent(
            'pageLoaded',
            {
              detail: {
                url:
                  targetUrl
              }
            }
          )
        );


        /* -------------------------------------------------
           FADE IN NEW PAGE
        ------------------------------------------------- */

        void appContent.offsetHeight;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            appContent.classList.remove(
              'page-transitioning'
            );
          });
        });

      } catch (error) {
        console.error(
          'SPA navigation failed:',
          error
        );

        window.location.href =
          targetUrl;
      }
    }
  );


  /* =======================================================
     BACK / FORWARD
  ======================================================= */

  window.addEventListener(
    'popstate',
    () => {
      window.location.reload();
    }
  );
}


/* =========================================================
   START ROUTER
========================================================= */

function startRouter() {
  initializeRouter();
}


/* =========================================================
   INITIAL LOAD
========================================================= */

if (
  document.readyState === 'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      requestAnimationFrame(() => {
        startRouter();
      });
    },
    {
      once: true
    }
  );
} else {
  requestAnimationFrame(() => {
    startRouter();
  });
}


/* =========================================================
   PAGE LOADED
========================================================= */

document.addEventListener(
  'pageLoaded',
  () => {
    init();
  }
);