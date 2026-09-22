// ==========================================
// FARMER TERMS & SERVICES MODAL
// ==========================================

function initFarmerTermsModal() {
  const termsButton = document.getElementById('farmerTermsLink');
  const modal = document.getElementById('farmerTermsModal');
  const closeButton = document.getElementById('closeFarmerTermsBtn');
  const doneButton = document.getElementById('farmerTermsDoneBtn');
  const backdrop = document.getElementById('farmerTermsBackdrop');

  if (!termsButton || !modal) {
    return;
  }

  if (modal.dataset.initialized === 'true') {
    return;
  }

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


// ==========================================
// MAIN INITIALIZATION
// ==========================================

function init() {
  const appContent = document.getElementById('app-content');

  if (!appContent) {
    return;
  }

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


  const harvestForm = document.getElementById('harvestForm');
  const photoBox = document.getElementById('photoBox');
  const photoInput = document.getElementById('photoInput');
  const photoPreview = document.getElementById('photoPreviewOverlay');
  const previewImg = document.getElementById('previewImg');

  const categoryButtons = document.querySelectorAll('.category-btn');

  const selectedCategoryInput =
    document.getElementById('selectedCategory');


  // ==========================================
  // 1. CATEGORY PICKER
  // ==========================================

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


  // ==========================================
  // 2. PHOTO ATTACHMENT
  // ==========================================

  const defaultImage =
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600';

  let uploadedImageData = defaultImage;


  if (photoBox && photoInput) {

    photoBox.onclick = () => {
      photoInput.click();
    };


    photoInput.onchange = async () => {

      const [file] = photoInput.files;

      if (!file) {
        return;
      }


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


  // ==========================================
  // 3. FORM SUBMISSION
  // ==========================================

  if (harvestForm) {

    harvestForm.onsubmit = async e => {

      e.preventDefault();


      const cropInput =
        document.getElementById('cropName');

      const qtyInput =
        document.getElementById('quantityInput');

      const priceInput =
        document.getElementById('priceInput');

      const locInput =
        document.getElementById('locationInput');


      if (
        !cropInput ||
        !qtyInput ||
        !priceInput
      ) {
        return;
      }


      const crop = cropInput.value.trim();
      const qty = qtyInput.value;
      const price = priceInput.value;

      const loc = locInput
        ? locInput.value.trim()
        : '';


      const category = selectedCategoryInput
        ? selectedCategoryInput.value
        : 'Vegetables';


      if (
        !crop ||
        !qty ||
        !price
      ) {
        return;
      }


      const btn =
        document.getElementById('publishBtn');

      if (!btn) {
        return;
      }


      const originalText = btn.innerHTML;


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

          farmingMethod:
            'Organic / Direct',

          description:
            `Fresh batch of ${crop} harvested locally. Quantity available: ${qty} kg.`,

          category: category,

          img:
            uploadedImageData,

          verified: false,

          verificationStatus:
            'not_verified',

          createdAt:
            Date.now()
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


// ==========================================
// LOCATION
// ==========================================

function initHarvestLocation() {

  const locationInput =
    document.getElementById('locationInput');

  if (!locationInput) {
    return;
  }


  const storageKey =
    'goviDirectLocation';


  const applySavedLocation = () => {

    try {

      const savedLocation =
        JSON.parse(
          localStorage.getItem(storageKey)
        );


      if (
        savedLocation &&
        savedLocation.label &&
        !locationInput.value.trim()
      ) {
        locationInput.value =
          savedLocation.label;
      }

    } catch (error) {

      console.error(
        'Failed to read saved GoviDirect location:',
        error
      );
    }
  };


  applySavedLocation();


  window.addEventListener(
    'goviDirectReadableLocationUpdated',
    event => {

      const location =
        event.detail;


      if (
        location &&
        location.label &&
        !locationInput.value.trim()
      ) {
        locationInput.value =
          location.label;
      }
    }
  );


  window.addEventListener(
    'goviDirectLocationUpdated',
    event => {

      const location =
        event.detail;


      if (
        !location ||
        typeof location.latitude !== 'number' ||
        typeof location.longitude !== 'number'
      ) {
        return;
      }


      reverseGeocodeHarvestLocation(
        location,
        locationInput
      );
    }
  );


  if (!localStorage.getItem(storageKey)) {

    requestHarvestLocation(
      locationInput
    );

    return;
  }


  try {

    const savedLocation =
      JSON.parse(
        localStorage.getItem(storageKey)
      );


    if (
      savedLocation &&
      savedLocation.label
    ) {
      return;
    }


    if (
      savedLocation &&
      typeof savedLocation.latitude === 'number' &&
      typeof savedLocation.longitude === 'number'
    ) {

      reverseGeocodeHarvestLocation(
        savedLocation,
        locationInput
      );

      return;
    }

  } catch (error) {

    console.error(
      'Failed to inspect saved location:',
      error
    );
  }


  requestHarvestLocation(
    locationInput
  );
}


function requestHarvestLocation(
  locationInput
) {

  if (!navigator.geolocation) {
    return;
  }


  if (!window.isSecureContext) {

    console.warn(
      'Location access requires HTTPS or localhost.'
    );

    return;
  }


  navigator.geolocation.getCurrentPosition(

    position => {

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
        'goviDirectLocation',
        JSON.stringify(location)
      );


      reverseGeocodeHarvestLocation(
        location,
        locationInput
      );
    },


    error => {

      console.warn(
        'Could not retrieve harvest location:',
        error
      );
    },


    {
      enableHighAccuracy: false,
      timeout: 15000,
      maximumAge: 0
    }
  );
}


async function reverseGeocodeHarvestLocation(
  location,
  locationInput
) {

  if (
    !location ||
    typeof location.latitude !== 'number' ||
    typeof location.longitude !== 'number'
  ) {
    return;
  }


  try {

    const url =
      'https://api.bigdatacloud.net/data/reverse-geocode-client' +
      `?latitude=${encodeURIComponent(location.latitude)}` +
      `&longitude=${encodeURIComponent(location.longitude)}` +
      '&localityLanguage=en';


    const response =
      await fetch(url);


    if (!response.ok) {

      throw new Error(
        `Reverse geocoding failed: ${response.status}`
      );
    }


    const data =
      await response.json();


    const city =
      data.city ||
      data.locality ||
      data.localityName ||
      '';


    const subdivision =
      data.principalSubdivision ||
      '';


    let label =
      city ||
      subdivision ||
      data.countryName ||
      '';


    if (
      city &&
      subdivision &&
      city.toLowerCase() !==
        subdivision.toLowerCase()
    ) {

      label =
        `${city}, ${subdivision}`;
    }


    if (!label) {
      return;
    }


    let savedLocation = {};


    try {

      savedLocation =
        JSON.parse(
          localStorage.getItem(
            'goviDirectLocation'
          )
        ) || {};

    } catch (error) {

      savedLocation = {};
    }


    savedLocation.latitude =
      location.latitude;

    savedLocation.longitude =
      location.longitude;

    savedLocation.accuracy =
      location.accuracy;

    savedLocation.updatedAt =
      location.updatedAt ||
      Date.now();

    savedLocation.label =
      label;


    localStorage.setItem(
      'goviDirectLocation',
      JSON.stringify(savedLocation)
    );


    if (
      locationInput &&
      !locationInput.value.trim()
    ) {

      locationInput.value =
        label;
    }


    const locationLabel =
      document.getElementById(
        'location-label'
      );


    if (locationLabel) {

      locationLabel.textContent =
        label;
    }


    window.dispatchEvent(
      new CustomEvent(
        'goviDirectReadableLocationUpdated',
        {
          detail: savedLocation
        }
      )
    );


  } catch (error) {

    console.error(
      'Failed to reverse geocode harvest location:',
      error
    );
  }
}


// ==========================================
// 4. VERIFICATION MODAL
// ==========================================

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


  if (
    !verificationBtn ||
    !modal
  ) {
    return;
  }


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
        modal.classList.contains('is-open')
      ) {

        closeModal();
      }

    }
  );
}


// ==========================================
// 5. IMAGE COMPRESSION & PERSISTENCE
// ==========================================

function compressImageToDataUrl(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload = event => {

        const img =
          new Image();


        img.onload = () => {

          const maxSize =
            1000;

          let width =
            img.width;

          let height =
            img.height;


          if (
            width > maxSize ||
            height > maxSize
          ) {

            if (width > height) {

              height =
                Math.round(
                  height *
                  (maxSize / width)
                );

              width =
                maxSize;

            } else {

              width =
                Math.round(
                  width *
                  (maxSize / height)
                );

              height =
                maxSize;
            }
          }


          const canvas =
            document.createElement(
              'canvas'
            );


          canvas.width =
            width;

          canvas.height =
            height;


          const ctx =
            canvas.getContext(
              '2d'
            );


          if (!ctx) {

            reject(
              new Error(
                'Could not create image canvas'
              )
            );

            return;
          }


          ctx.drawImage(
            img,
            0,
            0,
            width,
            height
          );


          const dataUrl =
            canvas.toDataURL(
              'image/jpeg',
              0.82
            );


          resolve(dataUrl);
        };


        img.onerror = () => {

          reject(
            new Error(
              'Could not load image'
            )
          );
        };


        img.src =
          event.target.result;
      };


      reader.onerror = () => {

        reject(
          new Error(
            'Could not read image file'
          )
        );
      };


      reader.readAsDataURL(
        file
      );
    }
  );
}


// ==========================================
// 6. RENDER SAVED LISTINGS
// ==========================================

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


  const savedListings =
    JSON.parse(
      localStorage.getItem(
        'goviDirectListings'
      )
    ) || [];


  if (count) {

    count.textContent =
      savedListings.length;
  }


  feed.innerHTML = '';


  if (
    savedListings.length === 0
  ) {

    const emptyCard =
      document.createElement(
        'div'
      );


    emptyCard.className =
      'flex flex-col items-center justify-center p-8 text-center bg-surface-container-lowest rounded-2xl shadow-sm my-4 w-full border border-dashed border-outline-variant/40';


    emptyCard.innerHTML = `

      <div class="w-20 h-20 mb-3 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shadow-inner">

        <span class="material-symbols-outlined text-[42px]">
          agriculture
        </span>

      </div>


      <h3 class="font-headline-sm text-headline-sm text-on-surface font-bold mb-1">
        No Harvests Listed Yet
      </h3>


      <p class="font-body-md text-body-md text-on-surface-variant max-w-xs mb-3">
        You haven't published any fresh crops to GoviDirect. Fill out the form above to list your first harvest!
      </p>

    `;


    feed.appendChild(
      emptyCard
    );

    return;
  }


  savedListings.forEach(
    item => {

      const newCard =
        document.createElement(
          'div'
        );


      newCard.className =
        'bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between gap-space-md w-full mb-3';


      newCard.setAttribute(
        'data-id',
        item.id
      );


      const verified =
        item.verified === true;


      newCard.innerHTML = `

        <div class="flex items-center gap-space-md min-w-0 flex-1">

          <div class="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center text-primary-container">

            <img
              src="${item.img}"
              alt="${item.name}"
              class="w-full h-full object-cover"
            >

          </div>


          <div class="flex-1 min-w-0">

            <div class="flex items-center justify-between gap-1 mb-0.5">

              <div class="flex items-center gap-1.5 min-w-0">

                <h3 class="font-label-lg text-label-lg text-on-surface font-bold truncate">
                  ${item.name}
                </h3>

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


              <span class="shrink-0 px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold">
                Active
              </span>

            </div>


            <p class="font-body-sm text-body-sm text-on-surface-variant truncate">
              ${item.quantity || 0} kg listed • ${item.location || 'Direct Farm'}
            </p>


            <div class="flex items-center justify-between mt-1">

              <span class="font-headline-sm text-headline-sm text-primary-container font-bold">

                Rs. ${item.price}

                <span class="font-label-sm text-label-sm font-normal text-on-surface-variant">
                  / kg
                </span>

              </span>

            </div>

          </div>

        </div>


        <button
          class="delete-post-btn text-error hover:bg-error/10 p-2 rounded-lg transition-colors shrink-0 cursor-pointer"
          data-id="${item.id}"
          title="Delete listing"
          type="button"
        >

          <span class="material-symbols-outlined text-[20px]">
            delete
          </span>

        </button>

      `;


      feed.appendChild(
        newCard
      );
    }
  );
}


// ==========================================
// 7. DELETE LISTING
// ==========================================

document.addEventListener(
  'click',
  e => {

    const deleteBtn =
      e.target.closest(
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


    let savedListings =
      JSON.parse(
        localStorage.getItem(
          listingsKey
        )
      ) || [];


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


// ==========================================
// 8. INITIALIZATION
// ==========================================

if (
  document.readyState === 'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    init
  );

} else {

  init();
}


// Run when navigating through SPA router
document.addEventListener(
  'pageLoaded',
  init
);