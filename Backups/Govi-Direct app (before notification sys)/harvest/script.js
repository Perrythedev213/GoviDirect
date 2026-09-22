function initFarmerTermsModal() {
  const termsButton = document.getElementById('farmerTermsLink');
  const modal = document.getElementById('farmerTermsModal');
  const closeButton = document.getElementById('closeFarmerTermsBtn');
  const doneButton = document.getElementById('farmerTermsDoneBtn');
  const backdrop = document.getElementById('farmerTermsBackdrop');

  if (!termsButton || !modal) return;
  if (modal.dataset.initialized === 'true') return;

  modal.dataset.initialized = 'true';

  const openModal = () => {
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      modal.classList.add('is-open');
    });
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    setTimeout(() => {
      if (modal.getAttribute('aria-hidden') === 'true') {
        modal.classList.add('hidden');
      }
    }, 150);
  };

  termsButton.addEventListener('click', openModal);

  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  if (doneButton) {
    doneButton.addEventListener('click', closeModal);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', event => {
    if (
      event.key === 'Escape' &&
      !modal.classList.contains('hidden')
    ) {
      closeModal();
    }
  });
}


function init() {
  const appContent = document.getElementById('app-content');

  if (!appContent) return;

  // Only initialize when the Harvest page is actually loaded.
  if (
    !document.getElementById('harvestForm') ||
    !document.getElementById('listingsFeed')
  ) {
    return;
  }

  // Prevent duplicate initialization while this Harvest page is active.
  if (appContent.dataset.harvestInitialized === 'true') {
    return;
  }

  appContent.dataset.harvestInitialized = 'true';

  appContent.classList.add('page-transitioning');

  requestAnimationFrame(() => {
    appContent.classList.remove('page-transitioning');
  });

  const listingsKey = 'goviDirectListings';

  if (!localStorage.getItem(listingsKey)) {
    localStorage.setItem(
      listingsKey,
      JSON.stringify([])
    );
  }

  updateFeedUI();
  initVerificationModal();
  initFarmerTermsModal();
  initHarvestLocation();

  const harvestForm =
    document.getElementById('harvestForm');

  const photoBox =
    document.getElementById('photoBox');

  const photoInput =
    document.getElementById('photoInput');

  const photoPreview =
    document.getElementById('photoPreviewOverlay');

  const previewImg =
    document.getElementById('previewImg');

  const categoryButtons =
    document.querySelectorAll('.category-btn');

  const selectedCategoryInput =
    document.getElementById('selectedCategory');

  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      categoryButtons.forEach(btn => {
        btn.className =
          'category-btn py-2.5 px-3 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md flex flex-col items-center justify-center gap-1 hover:bg-surface-container transition-all';
      });

      button.className =
        'category-btn py-2.5 px-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex flex-col items-center justify-center gap-1 transition-all shadow-sm';

      if (selectedCategoryInput) {
        selectedCategoryInput.value =
          button.getAttribute('data-category');
      }
    });
  });

  const defaultImage =
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600';

  let uploadedImageData = defaultImage;

  if (photoBox && photoInput) {
    photoBox.onclick = () => {
      photoInput.click();
    };

    photoInput.onchange = async () => {
      const [file] = photoInput.files;

      if (!file) return;

      try {
        uploadedImageData =
          await compressImageToDataUrl(file);

        if (previewImg) {
          previewImg.src = uploadedImageData;
        }

        if (photoPreview) {
          photoPreview.classList.remove('hidden');
        }
      } catch (error) {
        console.error(
          'Failed to process uploaded image:',
          error
        );

        uploadedImageData = defaultImage;
      }
    };
  }

  if (harvestForm) {
    harvestForm.onsubmit = async event => {
      event.preventDefault();

      const cropInput =
        document.getElementById('cropName');

      const qtyInput =
        document.getElementById('quantityInput');

      const priceInput =
        document.getElementById('priceInput');

      const locInput =
        document.getElementById('locationInput');

      if (!cropInput || !qtyInput || !priceInput) {
        return;
      }

      const crop =
        cropInput.value.trim();

      const qty =
        qtyInput.value;

      const price =
        priceInput.value;

      const loc =
        locInput
          ? locInput.value.trim()
          : '';

      const category =
        selectedCategoryInput
          ? selectedCategoryInput.value
          : 'Vegetables';

      if (!crop || !qty || !price) {
        return;
      }

      const btn =
        document.getElementById('publishBtn');

      if (!btn) {
        return;
      }

      const originalText =
        btn.innerHTML;

      btn.innerHTML =
        '<span class="material-symbols-outlined text-[22px] animate-spin">refresh</span> Listing on GoviDirect...';

      btn.disabled = true;

      try {
        let existingListings =
          JSON.parse(
            localStorage.getItem(listingsKey)
          ) || [];

        const listingId =
          'harvest_' + Date.now();

        const newListingItem = {
          id: listingId,
          name: crop,
          price: price,
          quantity: Number(qty),
          unit: 'kg',
          farmer: 'Direct Farm Seller',
          location:
            loc || 'Location unavailable',
          harvestDate: 'Today',
          farmingMethod: 'Organic / Direct',
          description:
            `Fresh batch of ${crop} harvested locally. Quantity available: ${qty} kg.`,
          category: category,
          img: uploadedImageData,
          verified: false,
          verificationStatus: 'not_verified',
          createdAt: Date.now()
        };

        existingListings.unshift(
          newListingItem
        );

        localStorage.setItem(
          listingsKey,
          JSON.stringify(existingListings)
        );

        setTimeout(() => {
          updateFeedUI();

          cropInput.value = '';
          qtyInput.value = '';
          priceInput.value = '';

          if (locInput) {
            locInput.value = '';
          }

          if (photoInput) {
            photoInput.value = '';
          }

          if (photoPreview) {
            photoPreview.classList.add('hidden');
          }

          uploadedImageData =
            defaultImage;

          btn.innerHTML =
            '<span class="material-symbols-outlined text-[22px]">check</span> Published Successfully!';

          btn.classList.remove(
            'bg-primary-container'
          );

          btn.classList.add(
            'bg-surface-tint'
          );

          setTimeout(() => {
            btn.innerHTML =
              originalText;

            btn.classList.remove(
              'bg-surface-tint'
            );

            btn.classList.add(
              'bg-primary-container'
            );

            btn.disabled = false;
          }, 2000);
        }, 600);
      } catch (error) {
        console.error(
          'Failed to save listing:',
          error
        );

        btn.innerHTML =
          originalText;

        btn.disabled = false;

        alert(
          'Could not save the listing. The image may be too large.'
        );
      }
    };
  }
}


function initHarvestLocation() {
  const locationInput =
    document.getElementById('locationInput');

  if (!locationInput) return;

  try {
    const saved =
      JSON.parse(
        localStorage.getItem(
          'goviDirectLocation'
        )
      );

    if (saved && saved.label) {
      locationInput.value =
        saved.label;
    }
  } catch (error) {
    console.warn(
      'Could not load saved location:',
      error
    );
  }

  window.addEventListener(
    'goviDirectReadableLocationUpdated',
    event => {
      if (
        event.detail &&
        event.detail.label
      ) {
        locationInput.value =
          event.detail.label;
      }
    }
  );

  window.addEventListener(
    'goviDirectLocationUpdated',
    event => {
      if (
        event.detail &&
        event.detail.label
      ) {
        locationInput.value =
          event.detail.label;
      }
    }
  );

  if (
    !localStorage.getItem(
      'goviDirectLocation'
    )
  ) {
    requestHarvestLocation();
  }
}


function requestHarvestLocation() {
  if (!navigator.geolocation) {
    return;
  }

  if (!window.isSecureContext) {
    console.warn(
      'Geolocation requires a secure context.'
    );

    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const locationData = {
        latitude:
          position.coords.latitude,

        longitude:
          position.coords.longitude,

        accuracy:
          position.coords.accuracy,

        updatedAt: Date.now()
      };

      localStorage.setItem(
        'goviDirectLocation',
        JSON.stringify(locationData)
      );

      reverseGeocodeHarvestLocation(
        locationData.latitude,
        locationData.longitude
      );
    },
    error => {
      console.warn(
        'Could not get location:',
        error
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }
  );
}


async function reverseGeocodeHarvestLocation(
  latitude,
  longitude
) {
  try {
    const response =
      await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
          latitude
        )}&longitude=${encodeURIComponent(
          longitude
        )}&localityLanguage=en`
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    const label =
      data.locality ||
      data.city ||
      data.principalSubdivision ||
      data.countryName ||
      'Location unavailable';

    let saved = {};

    try {
      saved =
        JSON.parse(
          localStorage.getItem(
            'goviDirectLocation'
          )
        ) || {};
    } catch (error) {
      saved = {};
    }

    saved.label = label;

    localStorage.setItem(
      'goviDirectLocation',
      JSON.stringify(saved)
    );

    window.dispatchEvent(
      new CustomEvent(
        'goviDirectReadableLocationUpdated',
        {
          detail: {
            label
          }
        }
      )
    );

    window.dispatchEvent(
      new CustomEvent(
        'goviDirectLocationUpdated',
        {
          detail: {
            label
          }
        }
      )
    );
  } catch (error) {
    console.warn(
      'Reverse geocoding failed:',
      error
    );
  }
}


function initVerificationModal() {
  const verificationBtn =
    document.getElementById(
      'verificationBtn'
    );

  const modal =
    document.getElementById(
      'verificationModal'
    );

  const closeBtn =
    document.getElementById(
      'closeVerificationBtn'
    );

  const backdrop =
    document.getElementById(
      'verificationBackdrop'
    );

  if (!verificationBtn || !modal) {
    return;
  }

  if (
    modal.dataset.initialized === 'true'
  ) {
    return;
  }

  modal.dataset.initialized =
    'true';

  const openModal = () => {
    modal.classList.remove(
      'hidden'
    );

    modal.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'verification-modal-open'
    );

    requestAnimationFrame(() => {
      modal.classList.add(
        'is-open'
      );
    });
  };

  const closeModal = () => {
    modal.classList.remove(
      'is-open'
    );

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove(
      'verification-modal-open'
    );

    setTimeout(() => {
      modal.classList.add(
        'hidden'
      );
    }, 200);
  };

  verificationBtn.addEventListener(
    'click',
    openModal
  );

  if (closeBtn) {
    closeBtn.addEventListener(
      'click',
      closeModal
    );
  }

  if (backdrop) {
    backdrop.addEventListener(
      'click',
      closeModal
    );
  }

  document.addEventListener(
    'keydown',
    event => {
      if (
        event.key === 'Escape' &&
        modal.classList.contains(
          'is-open'
        )
      ) {
        closeModal();
      }
    }
  );
}


function compressImageToDataUrl(
  file
) {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = event => {
        const image =
          new Image();

        image.onload = () => {
          const maxSize = 1000;

          let width =
            image.width;

          let height =
            image.height;

          if (
            width > maxSize ||
            height > maxSize
          ) {
            const scale =
              Math.min(
                maxSize / width,
                maxSize / height
              );

            width =
              Math.round(
                width * scale
              );

            height =
              Math.round(
                height * scale
              );
          }

          const canvas =
            document.createElement(
              'canvas'
            );

          canvas.width =
            width;

          canvas.height =
            height;

          const context =
            canvas.getContext(
              '2d'
            );

          context.drawImage(
            image,
            0,
            0,
            width,
            height
          );

          resolve(
            canvas.toDataURL(
              'image/jpeg',
              0.82
            )
          );
        };

        image.onerror =
          reject;

        image.src =
          event.target.result;
      };

      reader.onerror =
        reject;

      reader.readAsDataURL(file);
    }
  );
}


function updateFeedUI() {
  const feed =
    document.getElementById(
      'listingsFeed'
    );

  const count =
    document.getElementById(
      'listingCount'
    );

  if (!feed) {
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
    listings = [];
  }

  if (count) {
    count.textContent =
      listings.length;
  }

  if (!listings.length) {
    feed.innerHTML = `
      <div class="flex flex-col items-center justify-center text-center py-12 px-6">
        <span class="material-symbols-outlined text-5xl text-on-surface-variant/40">
          inventory_2
        </span>

        <h3 class="mt-4 text-lg font-bold">
          No active listings
        </h3>

        <p class="mt-2 text-sm text-on-surface-variant max-w-sm">
          Your published harvest listings will appear here.
        </p>
      </div>
    `;

    return;
  }

  feed.innerHTML = listings
    .map(item => {
      const verified =
        item.verified === true;

      return `
        <article
          class="relative overflow-hidden rounded-2xl bg-surface-container-low border border-outline-variant/30"
          data-id="${escapeHtml(item.id)}"
        >
          <div class="flex gap-4 p-4">
            <img
              src="${escapeHtml(item.img || '')}"
              alt="${escapeHtml(item.name || 'Harvest')}"
              class="w-24 h-24 rounded-xl object-cover shrink-0"
            >

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h3 class="font-bold truncate">
                      ${escapeHtml(item.name || 'Harvest')}
                    </h3>

                    ${
                      verified
                        ? `
                          <span class="verification-mini-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold">
                            <span class="material-symbols-outlined text-[14px]">
                              verified
                            </span>
                            Verified
                          </span>
                        `
                        : ''
                    }
                  </div>

                  <p class="text-sm text-on-surface-variant mt-1">
                    ${escapeHtml(item.location || 'Location unavailable')}
                  </p>
                </div>

                <button
                  type="button"
                  class="delete-post-btn shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-error hover:bg-error/10 transition-colors"
                  data-id="${escapeHtml(item.id)}"
                  aria-label="Delete listing"
                >
                  <span class="material-symbols-outlined">
                    delete
                  </span>
                </button>
              </div>

              <div class="flex items-center justify-between gap-3 mt-4">
                <span class="text-sm text-on-surface-variant">
                  ${escapeHtml(String(item.quantity || 0))} ${escapeHtml(item.unit || 'kg')} available
                </span>

                <span class="font-bold text-primary-container">
                  Rs. ${escapeHtml(String(item.price || 0))}/kg
                </span>
              </div>

              <div class="mt-3">
                <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  Active
                </span>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}


function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


document.addEventListener(
  'click',
  event => {
    const deleteBtn =
      event.target.closest(
        '.delete-post-btn'
      );

    if (!deleteBtn) {
      return;
    }

    const listingId =
      deleteBtn.getAttribute(
        'data-id'
      );

    if (!listingId) {
      return;
    }

    const listingsKey =
      'goviDirectListings';

    let savedListings = [];

    try {
      savedListings =
        JSON.parse(
          localStorage.getItem(
            listingsKey
          )
        ) || [];
    } catch (error) {
      savedListings = [];
    }

    savedListings =
      savedListings.filter(
        item =>
          item.id !== listingId
      );

    localStorage.setItem(
      listingsKey,
      JSON.stringify(
        savedListings
      )
    );

    updateFeedUI();
  }
);


/* ==========================================
   SPA LIFECYCLE
   ========================================== */

function resetHarvestPageState() {
  const appContent =
    document.getElementById(
      'app-content'
    );

  if (appContent) {
    delete appContent.dataset.harvestInitialized;
  }

  const termsModal =
    document.getElementById(
      'farmerTermsModal'
    );

  const verificationModal =
    document.getElementById(
      'verificationModal'
    );

  if (termsModal) {
    termsModal.classList.remove(
      'is-open'
    );

    termsModal.classList.add(
      'hidden'
    );
  }

  if (verificationModal) {
    verificationModal.classList.remove(
      'is-open'
    );

    verificationModal.classList.add(
      'hidden'
    );
  }

  document.body.style.overflow = '';

  document.body.classList.remove(
    'verification-modal-open'
  );
}


function runHarvestInit() {
  const appContent =
    document.getElementById(
      'app-content'
    );

  if (!appContent) {
    return;
  }

  if (
    !document.getElementById(
      'harvestForm'
    )
  ) {
    return;
  }

  init();
}


if (
  document.readyState === 'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    runHarvestInit,
    { once: true }
  );
} else {
  runHarvestInit();
}


document.addEventListener(
  'pageLoaded',
  () => {
    resetHarvestPageState();
    runHarvestInit();
  }
);