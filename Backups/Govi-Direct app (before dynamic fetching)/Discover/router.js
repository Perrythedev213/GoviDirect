// ==========================================
// 0. CART HELPER FUNCTION
// ==========================================

function saveToCart(product) {
  const cartKey = 'goviDirectCart';
  let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

  const qtyToAdd = product.quantity || 1;

  const existingIndex = cart.findIndex(
    item =>
      item.name === product.name &&
      item.farmer === product.farmer
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += qtyToAdd;
  } else {
    product.quantity = qtyToAdd;
    cart.push(product);
  }

  localStorage.setItem(
    cartKey,
    JSON.stringify(cart)
  );

  window.dispatchEvent(
    new CustomEvent('cartUpdated', {
      detail: cart
    })
  );
}


// ==========================================
// 1. PAGE TRANSITION & GEOLOCATION INIT
// ==========================================

function init() {
  const appContent =
    document.getElementById('app-content');

  if (appContent) {
    appContent.classList.add(
      'page-transitioning'
    );

    requestAnimationFrame(() => {
      appContent.classList.remove(
        'page-transitioning'
      );
    });
  }


  // ------------------------------------------
  // Geolocation Trigger Setup
  // ------------------------------------------

  (() => {
    const storageKey =
      'goviDirectLocation';

    const staticChip =
      document.querySelector(
        'header .inline-flex'
      );

    if (!staticChip) {
      return;
    }

    let locationButton =
      document.getElementById(
        'location-button'
      );

    if (!locationButton) {
      locationButton =
        document.createElement('button');

      locationButton.type = 'button';

      locationButton.id =
        'location-button';

      locationButton.className =
        `${staticChip.className} cursor-pointer transition-colors hover:bg-surface-container active:scale-95 disabled:cursor-wait disabled:opacity-70`;

      locationButton.setAttribute(
        'aria-label',
        'Use my current location'
      );

      locationButton.innerHTML =
        '<span class="material-symbols-outlined text-[14px] text-primary-container">location_on</span>' +
        '<span id="location-label">Colombo</span>';

      staticChip.replaceWith(
        locationButton
      );
    }

    const locationLabel =
      document.getElementById(
        'location-label'
      );

    const showSavedLocation = () => {
      if (
        localStorage.getItem(
          storageKey
        ) &&
        locationLabel
      ) {
        locationLabel.textContent =
          'Current location';
      }
    };

    showSavedLocation();


    const saveLocation = position => {
      const location = {
        latitude:
          position.coords.latitude,

        longitude:
          position.coords.longitude,

        accuracy:
          position.coords.accuracy,

        updatedAt:
          Date.now()
      };

      localStorage.setItem(
        storageKey,
        JSON.stringify(location)
      );

      if (locationLabel) {
        locationLabel.textContent =
          'Current location';
      }

      locationButton.title =
        `Updated to ±${Math.round(location.accuracy)} m accuracy`;

      window.dispatchEvent(
        new CustomEvent(
          'goviDirectLocationUpdated',
          {
            detail: location
          }
        )
      );
    };


    const requestLocation = () => {
      if (!window.isSecureContext) {
        if (locationLabel) {
          locationLabel.textContent =
            'Use HTTPS for location';
        }

        locationButton.title =
          'Location access requires an HTTPS or localhost connection.';

        return;
      }

      if (!navigator.geolocation) {
        if (locationLabel) {
          locationLabel.textContent =
            'Location unsupported';
        }

        return;
      }

      locationButton.disabled = true;

      if (locationLabel) {
        locationLabel.textContent =
          'Locating…';
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          saveLocation(position);
          locationButton.disabled =
            false;
        },

        error => {
          const messages = {
            [error.PERMISSION_DENIED]:
              'Enable location',

            [error.POSITION_UNAVAILABLE]:
              'Location signal unavailable',

            [error.TIMEOUT]:
              'Location timed out'
          };

          if (locationLabel) {
            locationLabel.textContent =
              messages[error.code] ||
              'Location unavailable';
          }

          locationButton.disabled =
            false;
        },

        {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 0
        }
      );
    };

    locationButton.onclick =
      requestLocation;
  })();


  // ------------------------------------------
  // Load Farmer Listings
  // ------------------------------------------

  loadFarmerListings();


  // ------------------------------------------
  // Verified Badge Setup
  // ------------------------------------------

  updateVerifiedBadges();


  // ------------------------------------------
  // Filtering
  // ------------------------------------------

  setupFiltering();
}


// ==========================================
// 2. LOAD FARMER LISTINGS
// ==========================================

function loadFarmerListings() {
  const productGrid =
    document.getElementById(
      'product-grid'
    );

  if (!productGrid) {
    return;
  }

  const listings =
    JSON.parse(
      localStorage.getItem(
        'goviDirectListings'
      )
    ) || [];

  const existingFarmerCards =
    productGrid.querySelectorAll(
      '.farmer-listing-card'
    );

  existingFarmerCards.forEach(card => {
    card.remove();
  });


  listings.forEach(item => {
    if (!item || !item.name) {
      return;
    }

    const card =
      document.createElement('div');

    card.className =
      'product-card farmer-listing-card flex flex-col bg-surface-container-lowest rounded-xl p-space-sm shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow';

    card.dataset.name =
      item.name || '';

    card.dataset.category =
      item.category || 'Vegetables';

    card.dataset.price =
      item.price ?? '0';

    card.dataset.unit =
      item.unit || 'per kg';

    card.dataset.farmer =
      item.farmer || 'Direct Farm Seller';

    card.dataset.location =
      item.location || 'Colombo';

    card.dataset.harvestDate =
      item.harvestDate || 'Today';

    card.dataset.farmingMethod =
      item.farmingMethod ||
      'Organic / Direct';

    card.dataset.description =
      item.description || '';

    card.dataset.img =
      item.img || '';

    card.dataset.verified =
      item.verified === true
        ? 'true'
        : 'false';

    card.dataset.listingId =
      item.id || '';


    const verified =
      item.verified === true;


    const verifiedBadge =
      verified
        ? `
          <span
            class="verified-product-badge"
            title="Verified by GoviDirect"
          >
            <span class="material-symbols-outlined">
              verified
            </span>
            Verified
          </span>
        `
        : `
          <span
            class="verified-product-badge hidden"
            title="Verified by GoviDirect"
          >
            <span class="material-symbols-outlined">
              verified
            </span>
            Verified
          </span>
        `;


    const image =
      item.img ||
      '';


    card.innerHTML = `
      <div class="relative w-full aspect-square rounded-lg overflow-hidden bg-surface-container-low mb-space-sm">

        ${
          image
            ? `
              <img
                class="w-full h-full object-cover"
                src="${image}"
                alt="${item.name}"
              >
            `
            : `
              <div class="w-full h-full flex items-center justify-center bg-surface-container-low">
                <span class="material-symbols-outlined text-[48px] text-primary-container/40">
                  eco
                </span>
              </div>
            `
        }

      </div>

      <div class="flex flex-col flex-1">

        <div class="flex items-center gap-1 min-w-0">

          <h3 class="font-label-lg text-label-lg text-on-surface truncate">
            ${item.name}
          </h3>

          ${verifiedBadge}

        </div>

        <p class="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
          ${item.farmer || 'Direct Farm Seller'}
        </p>

        <div class="flex items-center justify-between mt-space-sm pt-space-xs">

          <div class="flex flex-col">

            <span class="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Rs. ${item.price ?? 0}
            </span>

            <span class="font-label-sm text-label-sm text-on-surface-variant">
              ${item.unit || 'per kg'}
            </span>

          </div>

          <button
            aria-label="Add ${item.name} to cart"
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

    productGrid.appendChild(card);
  });
}


// ==========================================
// 3. VERIFIED BADGE UPDATE
// ==========================================

function updateVerifiedBadges() {
  const productCards =
    document.querySelectorAll(
      '.product-card'
    );

  productCards.forEach(card => {
    const badge =
      card.querySelector(
        '.verified-product-badge'
      );

    if (!badge) {
      return;
    }

    const verified =
      card.getAttribute(
        'data-verified'
      ) === 'true';

    if (verified) {
      badge.classList.remove(
        'hidden'
      );
    } else {
      badge.classList.add(
        'hidden'
      );
    }
  });
}


// ==========================================
// 4. FILTERING LOGIC
// ==========================================

function setupFiltering() {
  const searchInput =
    document.querySelector(
      'input[placeholder*="Search fresh produce"]'
    );

  const categoryPills =
    document.querySelectorAll(
      '.category-pill'
    );

  const listingCountEl =
    document.getElementById(
      'listing-count'
    );

  let currentCategory =
    'All';

  let searchQuery =
    '';


  function filterProducts() {
    let visibleCount =
      0;

    const productCards =
      document.querySelectorAll(
        '.product-card'
      );

    productCards.forEach(card => {
      const name =
        (
          card.getAttribute(
            'data-name'
          ) || ''
        ).toLowerCase();

      const farmer =
        (
          card.getAttribute(
            'data-farmer'
          ) || ''
        ).toLowerCase();

      const description =
        (
          card.getAttribute(
            'data-description'
          ) || ''
        ).toLowerCase();

      const category =
        (
          card.getAttribute(
            'data-category'
          ) || ''
        ).toLowerCase();


      const matchesCategory =
        currentCategory === 'All' ||
        category ===
          currentCategory.toLowerCase();


      const matchesSearch =
        name.includes(searchQuery) ||
        farmer.includes(searchQuery) ||
        description.includes(searchQuery);


      if (
        matchesCategory &&
        matchesSearch
      ) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display =
          'none';
      }
    });


    if (listingCountEl) {
      listingCountEl.textContent =
        `${visibleCount} listing${
          visibleCount === 1
            ? ''
            : 's'
        }`;
    }
  }


  if (searchInput) {
    searchInput.addEventListener(
      'input',
      e => {
        searchQuery =
          e.target.value
            .toLowerCase()
            .trim();

        filterProducts();
      }
    );
  }


  categoryPills.forEach(pill => {
    pill.addEventListener(
      'click',
      () => {

        categoryPills.forEach(btn => {
          btn.classList.remove(
            'bg-primary-container',
            'text-on-primary'
          );

          btn.classList.add(
            'bg-surface-container-low',
            'text-on-surface-variant'
          );
        });


        pill.classList.remove(
          'bg-surface-container-low',
          'text-on-surface-variant'
        );

        pill.classList.add(
          'bg-primary-container',
          'text-on-primary'
        );


        currentCategory =
          pill.getAttribute(
            'data-category'
          ) ||
          pill.textContent.trim();


        filterProducts();
      }
    );
  });


  filterProducts();
}


// ==========================================
// 5. GLOBAL CLICK DELEGATION
// ==========================================

document.addEventListener(
  'click',
  e => {

    // ------------------------------------------
    // A. Quick Add-to-Cart Button
    // ------------------------------------------

    const addBtn =
      e.target.closest(
        '.add-btn'
      );

    if (addBtn) {
      e.stopPropagation();

      const card =
        addBtn.closest(
          '.product-card'
        );

      if (card) {
        const product = {
          name:
            card.getAttribute(
              'data-name'
            ),

          price:
            card.getAttribute(
              'data-price'
            ),

          unit:
            card.getAttribute(
              'data-unit'
            ),

          farmer:
            card.getAttribute(
              'data-farmer'
            ),

          img:
            card.getAttribute(
              'data-img'
            ),

          quantity: 1
        };

        saveToCart(product);
      }


      const icon =
        addBtn.querySelector(
          '.material-symbols-outlined'
        );

      if (icon) {
        icon.textContent =
          'check';

        addBtn.classList.remove(
          'bg-primary-container'
        );

        addBtn.classList.add(
          'bg-secondary-container',
          'text-on-secondary-container'
        );


        setTimeout(() => {
          icon.textContent =
            'add';

          addBtn.classList.remove(
            'bg-secondary-container',
            'text-on-secondary-container'
          );

          addBtn.classList.add(
            'bg-primary-container',
            'text-on-primary'
          );
        }, 1200);
      }

      return;
    }


    // ------------------------------------------
    // B. Product Card Modal
    // ------------------------------------------

    const card =
      e.target.closest(
        '.product-card'
      );

    if (
      !card ||
      e.target.closest('.add-btn')
    ) {
      return;
    }


    const name =
      card.getAttribute(
        'data-name'
      );

    const priceStr =
      card.getAttribute(
        'data-price'
      );

    const basePrice =
      parseFloat(priceStr) || 0;

    const unit =
      card.getAttribute(
        'data-unit'
      );

    const farmer =
      card.getAttribute(
        'data-farmer'
      );

    const location =
      card.getAttribute(
        'data-location'
      );

    const harvestDate =
      card.getAttribute(
        'data-harvest-date'
      );

    const farmingMethod =
      card.getAttribute(
        'data-farming-method'
      );

    const description =
      card.getAttribute(
        'data-description'
      );

    const img =
      card.getAttribute(
        'data-img'
      );

    const verified =
      card.getAttribute(
        'data-verified'
      ) === 'true';


    let currentModalQty =
      1;


    const modal =
      document.getElementById(
        'product-modal'
      );

    const modalCard =
      document.getElementById(
        'product-modal-card'
      );


    if (modalCard) {

      const verifiedBadge =
        verified
          ? `
            <span
              class="verified-product-badge"
              title="Verified by GoviDirect"
            >
              <span class="material-symbols-outlined">
                verified
              </span>
              Verified
            </span>
          `
          : '';


      modalCard.innerHTML = `

        <div class="relative w-full h-64 bg-surface-container-low">

          <img
            src="${img}"
            alt="${name}"
            class="w-full h-full object-cover"
          >

          <button
            id="closeModalBtn"
            class="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-on-surface shadow-md transition-transform active:scale-95"
            type="button"
          >
            <span class="material-symbols-outlined text-[20px]">
              close
            </span>
          </button>

        </div>


        <div class="p-space-lg flex flex-col gap-space-md">

          <div>

            <div class="flex items-center justify-between gap-2">

              <span class="font-label-md text-label-md text-primary-container uppercase tracking-wider truncate">
                ${farmer}
              </span>

              <span class="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm shrink-0">

                <span class="material-symbols-outlined text-[14px] text-primary-container">
                  location_on
                </span>

                ${location}

              </span>

            </div>


            <div class="flex items-center gap-2 mt-1">

              <h2 class="font-headline-md text-headline-md text-on-surface truncate">
                ${name}
              </h2>

              ${verifiedBadge}

            </div>


            <div class="flex items-baseline gap-space-sm mt-1">

              <span class="font-headline-lg text-headline-lg text-on-surface font-bold">
                Rs. ${basePrice}
              </span>

              <span class="font-label-sm text-label-sm text-on-surface-variant">
                ${unit}
              </span>

            </div>

          </div>


          <div class="bg-surface-container-low rounded-xl p-space-md space-y-2">

            <div class="flex items-center gap-space-sm text-on-surface-variant font-body-sm">

              <span class="material-symbols-outlined text-[18px] text-primary">
                storefront
              </span>

              <span>
                Seller:
                <strong class="text-on-surface">
                  ${farmer}
                </strong>
              </span>

            </div>


            <div class="flex items-center gap-space-sm text-on-surface-variant font-body-sm">

              <span class="material-symbols-outlined text-[18px] text-primary">
                schedule
              </span>

              <span>
                Harvested:
                <strong class="text-on-surface">
                  ${harvestDate}
                </strong>
              </span>

            </div>


            <div class="flex items-center gap-space-sm text-on-surface-variant font-body-sm">

              <span class="material-symbols-outlined text-[18px] text-primary">
                eco
              </span>

              <span>
                Method:
                <strong class="text-on-surface">
                  ${farmingMethod}
                </strong>
              </span>

            </div>

          </div>


          <div>

            <h3 class="font-label-lg text-label-lg text-on-surface mb-1">
              About this Harvest
            </h3>

            <p class="font-body-md text-body-md text-on-surface-variant">
              ${description}
            </p>

          </div>


          <div class="flex items-center justify-between bg-surface-container-low rounded-xl p-space-md">

            <span class="font-label-lg text-label-lg text-on-surface">
              Quantity
            </span>


            <div class="flex items-center bg-surface rounded-lg p-0.5 border border-outline-variant/30">

              <button
                id="modalMinusBtn"
                class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded active:scale-90 transition-transform"
                type="button"
              >
                <span class="material-symbols-outlined text-[16px]">
                  remove
                </span>
              </button>


              <span
                id="modalQtyDisplay"
                class="w-10 text-center font-label-lg text-label-lg text-on-surface"
              >
                1
              </span>


              <button
                id="modalPlusBtn"
                class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:bg-surface-container rounded active:scale-90 transition-transform"
                type="button"
              >
                <span class="material-symbols-outlined text-[16px]">
                  add
                </span>
              </button>

            </div>

          </div>


          <div class="pt-space-sm">

            <button
              id="modalAddBtn"
              class="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-sm shadow-sm hover:bg-primary active:scale-[0.98] transition-all"
              type="button"
            >

              <span class="material-symbols-outlined text-[20px]">
                shopping_bag
              </span>

              Add to Cart • Rs. ${basePrice}

            </button>

          </div>

        </div>
      `;


      const closeModal = () => {

        if (modal) {
          modal.classList.add(
            'opacity-0',
            'pointer-events-none'
          );
        }

        if (modalCard) {
          modalCard.classList.add(
            'translate-y-full',
            'sm:translate-y-4'
          );
        }

        document.body.style.overflow =
          '';
      };


      const closeBtn =
        document.getElementById(
          'closeModalBtn'
        );

      if (closeBtn) {
        closeBtn.onclick =
          closeModal;
      }


      if (modal) {
        modal.onclick =
          ev => {
            if (
              ev.target === modal
            ) {
              closeModal();
            }
          };
      }


      const qtyDisplay =
        document.getElementById(
          'modalQtyDisplay'
        );

      const modalAddBtn =
        document.getElementById(
          'modalAddBtn'
        );

      const modalMinusBtn =
        document.getElementById(
          'modalMinusBtn'
        );

      const modalPlusBtn =
        document.getElementById(
          'modalPlusBtn'
        );


      const updateModalDisplay =
        () => {

          if (qtyDisplay) {
            qtyDisplay.textContent =
              currentModalQty;
          }

          if (modalAddBtn) {
            const totalPrice =
              (
                basePrice *
                currentModalQty
              ).toFixed(0);

            modalAddBtn.innerHTML = `
              <span class="material-symbols-outlined text-[20px]">
                shopping_bag
              </span>

              Add to Cart • Rs. ${totalPrice}
            `;
          }
        };


      if (modalMinusBtn) {
        modalMinusBtn.onclick =
          () => {

            if (
              currentModalQty > 1
            ) {
              currentModalQty--;

              updateModalDisplay();
            }

          };
      }


      if (modalPlusBtn) {
        modalPlusBtn.onclick =
          () => {

            currentModalQty++;

            updateModalDisplay();

          };
      }


      if (modalAddBtn) {
        modalAddBtn.onclick =
          () => {

            saveToCart({
              name,
              price: priceStr,
              unit,
              farmer,
              img,
              quantity:
                currentModalQty
            });


            modalAddBtn.innerHTML = `
              <span class="material-symbols-outlined text-[20px]">
                check
              </span>

              Added ${currentModalQty} to Cart!
            `;


            modalAddBtn.classList.remove(
              'bg-primary-container',
              'text-on-primary'
            );

            modalAddBtn.classList.add(
              'bg-secondary-container',
              'text-on-secondary-container'
            );


            setTimeout(() => {
              closeModal();
            }, 600);

          };
      }

    }


    if (modal) {
      modal.classList.remove(
        'opacity-0',
        'pointer-events-none'
      );

      document.body.style.overflow =
        'hidden';
    }


    if (modalCard) {
      modalCard.classList.remove(
        'translate-y-full',
        'sm:translate-y-4'
      );
    }

  }
);


// ==========================================
// 6. GLOBAL SPA ROUTER
// ==========================================

document.addEventListener(
  'DOMContentLoaded',
  () => {

    function updateActiveTab(
      overrideUrl
    ) {
      const navLinks =
        document.querySelectorAll(
          'nav a'
        );

      const currentPath =
        overrideUrl ||
        window.location.pathname;

      const pathSegments =
        currentPath
          .split('/')
          .filter(Boolean);

      const activeFolder =
        pathSegments.length > 0
          ? pathSegments[
              pathSegments.length - 2
            ]?.toLowerCase()
          : 'discover';


      navLinks.forEach(link => {

        const href =
          link.getAttribute(
            'href'
          );

        if (!href) {
          return;
        }

        const hrefLower =
          href.toLowerCase();

        const childElements =
          link.querySelectorAll(
            'span, a'
          );

        const isMatch =
          (
            activeFolder &&
            hrefLower.includes(
              activeFolder
            )
          ) ||
          (
            pathSegments.length === 0 &&
            hrefLower.includes(
              'discover'
            )
          );


        if (isMatch) {

          link.classList.remove(
            'text-on-surface-variant',
            'text-black',
            'opacity-70'
          );

          link.classList.add(
            'text-primary'
          );


          childElements.forEach(
            el => {

              el.classList.remove(
                'text-on-surface-variant',
                'text-black'
              );

              el.classList.add(
                'text-primary'
              );

            }
          );


          link.setAttribute(
            'aria-current',
            'page'
          );

        } else {

          link.classList.remove(
            'text-primary'
          );

          link.classList.add(
            'text-on-surface-variant'
          );


          childElements.forEach(
            el => {

              el.classList.remove(
                'text-primary'
              );

              el.classList.add(
                'text-on-surface-variant'
              );

            }
          );


          link.removeAttribute(
            'aria-current'
          );

        }

      });
    }


    // ------------------------------------------
    // Load a page's external JavaScript
    // ------------------------------------------

    async function loadPageScripts(
      doc,
      targetUrl
    ) {

      const scripts =
        [
          ...doc.querySelectorAll(
            'script[src]'
          )
        ];


      for (
        const oldScript of scripts
      ) {

        const rawSrc =
          oldScript.getAttribute(
            'src'
          );

        if (!rawSrc) {
          continue;
        }


        const src =
          new URL(
            rawSrc,
            targetUrl
          ).href;


        if (
          src.includes(
            '/discover/router.js'
          )
        ) {
          continue;
        }


        window.__goviDirectLoadedScripts =
          window.__goviDirectLoadedScripts ||
          {};


        if (
          window.__goviDirectLoadedScripts[
            src
          ]
        ) {
          continue;
        }


        await new Promise(
          resolve => {

            const newScript =
              document.createElement(
                'script'
              );

            newScript.src =
              src;

            newScript.async =
              false;


            newScript.onload =
              () => {

                window.__goviDirectLoadedScripts[
                  src
                ] = true;

                resolve();

              };


            newScript.onerror =
              () => {

                console.error(
                  'Failed to load page script:',
                  src
                );

                resolve();

              };


            document.body.appendChild(
              newScript
            );

          }
        );

      }

    }


    updateActiveTab(
      window.location.pathname
    );


    // ------------------------------------------
    // SPA Navigation
    // ------------------------------------------

    document.addEventListener(
      'click',
      async e => {

        const link =
          e.target.closest(
            'nav a[data-path], nav a'
          );

        if (!link) {
          return;
        }


        const targetUrl =
          link.getAttribute(
            'href'
          );


        if (
          !targetUrl ||
          targetUrl === '#' ||
          targetUrl.startsWith('http')
        ) {
          return;
        }


        if (
          targetUrl
            .toLowerCase()
            .includes('cart')
        ) {
          return;
        }


        e.preventDefault();


        const currentMain =
          document.querySelector(
            '#app-content'
          );


        try {

          if (currentMain) {

            currentMain.classList.add(
              'page-transitioning'
            );

            await new Promise(
              resolve =>
                setTimeout(
                  resolve,
                  250
                )
            );

          }


          const response =
            await fetch(
              targetUrl
            );


          if (!response.ok) {
            throw new Error(
              'Network response was not ok'
            );
          }


          const htmlText =
            await response.text();


          const parser =
            new DOMParser();


          const doc =
            parser.parseFromString(
              htmlText,
              'text/html'
            );


          const newMainContentEl =
            doc.querySelector(
              '#app-content'
            );


          if (!newMainContentEl) {
            throw new Error(
              'Target page has no #app-content'
            );
          }


          if (currentMain) {

            currentMain.innerHTML =
              newMainContentEl.innerHTML;

          }


          await loadPageScripts(
            doc,
            targetUrl
          );


          history.pushState(
            null,
            '',
            targetUrl
          );


          updateActiveTab(
            targetUrl
          );


          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });


          document.dispatchEvent(
            new CustomEvent(
              'pageLoaded',
              {
                detail: {
                  url: targetUrl
                }
              }
            )
          );


          if (currentMain) {

            requestAnimationFrame(
              () => {

                requestAnimationFrame(
                  () => {

                    currentMain.classList.remove(
                      'page-transitioning'
                    );

                  }
                );

              }
            );

          }

        } catch (err) {

          console.error(
            'Navigation fetch failed, falling back:',
            err
          );

          window.location.href =
            targetUrl;

        }

      }
    );


    // ------------------------------------------
    // Browser Back / Forward
    // ------------------------------------------

    window.addEventListener(
      'popstate',
      () => {
        window.location.reload();
      }
    );

  }
);


// ==========================================
// 7. INITIAL LOAD
// ==========================================

if (
  document.readyState ===
  'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    init
  );

} else {

  init();

}


document.addEventListener(
  'pageLoaded',
  init
);