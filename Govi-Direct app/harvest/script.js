const FARMER_LISTINGS_KEY = 'goviDirectListings';

let harvestUploadedImageData =
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600';


function initFarmerTermsModal() {
    const termsButton = document.getElementById('farmerTermsLink');
    const modal = document.getElementById('farmerTermsModal');
    const closeButton = document.getElementById('closeFarmerTermsBtn');
    const backdrop = document.getElementById('farmerTermsBackdrop');

    if (!modal) {
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

    if (termsButton) {
        termsButton.addEventListener('click', event => {
            event.preventDefault();
            openModal();
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', event => {
            event.preventDefault();
            closeModal();
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', event => {
            if (event.target === backdrop) {
                closeModal();
            }
        });
    }

    modal.__goviTermsClose = closeModal;

    modal.__goviTermsEscapeHandler = event => {
        if (
            event.key === 'Escape' &&
            !modal.classList.contains('hidden')
        ) {
            closeModal();
        }
    };

    document.addEventListener(
        'keydown',
        modal.__goviTermsEscapeHandler
    );
}


function closeFarmerTermsModal() {
    const modal = document.getElementById('farmerTermsModal');

    if (!modal) {
        return;
    }

    if (typeof modal.__goviTermsClose === 'function') {
        modal.__goviTermsClose();
        return;
    }

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.add('hidden');

    document.body.style.overflow = '';
}


function initHarvestPage() {
    const appContent = document.getElementById('app-content');
    const harvestForm = document.getElementById('harvestForm');
    const listingsFeed = document.getElementById('listingsFeed');

    if (!appContent || !harvestForm || !listingsFeed) {
        return;
    }

    if (!localStorage.getItem(FARMER_LISTINGS_KEY)) {
        localStorage.setItem(
            FARMER_LISTINGS_KEY,
            JSON.stringify([])
        );
    }

    updateFeedUI();

    initVerificationModal();
    initFarmerTermsModal();
    initHarvestLocation();

    const photoBox = document.getElementById('photoBox');
    const photoInput = document.getElementById('photoInput');
    const photoPreview = document.getElementById('photoPreviewOverlay');
    const previewImg = document.getElementById('previewImg');

    const categoryButtons =
        document.querySelectorAll('.category-btn');

    const selectedCategoryInput =
        document.getElementById('selectedCategory');


    categoryButtons.forEach(button => {
        button.onclick = event => {
            event.preventDefault();

            categoryButtons.forEach(btn => {
                btn.className =
                    'category-btn py-2.5 px-3 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md flex flex-col items-center justify-center gap-1 hover:bg-surface-container transition-all';
            });

            button.className =
                'category-btn py-2.5 px-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex flex-col items-center justify-center gap-1 transition-all shadow-sm';

            if (selectedCategoryInput) {
                selectedCategoryInput.value =
                    button.getAttribute('data-category') || '';
            }
        };
    });


    if (photoBox && photoInput) {
        photoBox.onclick = event => {
            event.preventDefault();
            photoInput.click();
        };

        photoInput.onchange = async () => {
            const file = photoInput.files?.[0];

            if (!file) {
                return;
            }

            try {
                harvestUploadedImageData =
                    await compressImageToDataUrl(file);

                if (previewImg) {
                    previewImg.src = harvestUploadedImageData;
                }

                if (photoPreview) {
                    photoPreview.classList.remove('hidden');
                }
            } catch (error) {
                console.error(
                    'Failed to process uploaded image:',
                    error
                );
            }
        };
    }


    /*
     * PUBLISH BUTTON
     */

    if (
        harvestForm.dataset.publishHandlerAttached !== 'true'
    ) {
        harvestForm.dataset.publishHandlerAttached = 'true';

        harvestForm.addEventListener('submit', event => {
            event.preventDefault();

            console.log(
                'Harvest publish button clicked.'
            );

            openHarvestTermsForPublish();
        });
    }


    /*
     * TERMS "I UNDERSTAND" BUTTON
     */

    const termsDoneBtn =
        document.getElementById('farmerTermsDoneBtn');

    if (
        termsDoneBtn &&
        termsDoneBtn.dataset.publishHandlerAttached !== 'true'
    ) {
        termsDoneBtn.dataset.publishHandlerAttached = 'true';

        termsDoneBtn.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();

            console.log(
                'Farmer terms accepted.'
            );

            /*
             * CLOSE THE TERMS POPUP FIRST
             */
            closeFarmerTermsModal();

            /*
             * THEN PUBLISH
             */
            publishHarvestListing();
        });
    }
}


function openHarvestTermsForPublish() {
    const modal =
        document.getElementById('farmerTermsModal');

    if (!modal) {
        console.error(
            'farmerTermsModal was not found.'
        );
        return;
    }

    modal.classList.remove('hidden');

    modal.setAttribute(
        'aria-hidden',
        'false'
    );

    modal.classList.add(
        'opacity-100',
        'pointer-events-auto'
    );

    modal.classList.remove(
        'opacity-0',
        'pointer-events-none'
    );

    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
        modal.classList.add('is-open');
    });

    console.log(
        'Farmer terms modal opened.'
    );
}


function closeHarvestTerms() {
    closeFarmerTermsModal();
}


function publishHarvestListing() {
    const nameInput =
        document.getElementById('cropName');

    const priceInput =
        document.getElementById('priceInput');

    const quantityInput =
        document.getElementById('quantityInput');

    const locationInput =
        document.getElementById('locationInput');

    const categoryInput =
        document.getElementById('selectedCategory');


    const name =
        nameInput
            ? nameInput.value.trim()
            : '';

    const price =
        priceInput
            ? Number(priceInput.value)
            : 0;

    const quantity =
        quantityInput
            ? Number(quantityInput.value)
            : 0;

    const location =
        locationInput
            ? locationInput.value.trim()
            : '';

    const category =
        categoryInput
            ? categoryInput.value
            : 'Vegetables';


    console.log('PUBLISH DATA:', {
        name,
        price,
        quantity,
        location,
        category
    });


    if (name.length === 0) {
        alert('Please enter a crop name.');

        if (nameInput) {
            nameInput.focus();
        }

        return;
    }


    if (!price || price <= 0) {
        alert('Please enter a valid price.');

        if (priceInput) {
            priceInput.focus();
        }

        return;
    }


    if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity.');

        if (quantityInput) {
            quantityInput.focus();
        }

        return;
    }


    if (location.length === 0) {
        alert('Please enter a farm location.');

        if (locationInput) {
            locationInput.focus();
        }

        return;
    }


    let listings = [];

    try {
        listings =
            JSON.parse(
                localStorage.getItem(
                    FARMER_LISTINGS_KEY
                )
            ) || [];

        if (!Array.isArray(listings)) {
            listings = [];
        }
    } catch {
        listings = [];
    }


    const listing = {
        id: Date.now().toString(),

        name: name,

        category: category,

        price: price,

        quantity: quantity,

        unit: 'kg',

        location: location,

        image: harvestUploadedImageData,

        verified: false,

        createdAt: new Date().toISOString()
    };


    listings.unshift(listing);


    localStorage.setItem(
        FARMER_LISTINGS_KEY,
        JSON.stringify(listings)
    );


    console.log(
        'LISTING PUBLISHED:',
        listing
    );


    updateFeedUI();


    if (nameInput) {
        nameInput.value = '';
    }

    if (priceInput) {
        priceInput.value = '';
    }

    if (quantityInput) {
        quantityInput.value = '';
    }

    if (categoryInput) {
        categoryInput.value = 'Vegetables';
    }


    harvestUploadedImageData =
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600';


    const previewOverlay =
        document.getElementById(
            'photoPreviewOverlay'
        );

    const previewImage =
        document.getElementById(
            'previewImg'
        );


    if (previewOverlay) {
        previewOverlay.classList.add('hidden');
    }

    if (previewImage) {
        previewImage.src = '';
    }


    alert(
        'Listing published successfully!'
    );


    window.dispatchEvent(
        new CustomEvent(
            'goviDirectListingPublished',
            {
                detail: listing
            }
        )
    );
}


window.initHarvestPage =
    initHarvestPage;


function initHarvestLocation() {
    const locationInput =
        document.getElementById(
            'locationInput'
        );

    if (!locationInput) {
        return;
    }


    try {
        const saved =
            JSON.parse(
                localStorage.getItem(
                    'goviDirectLocation'
                )
            );

        if (
            saved &&
            saved.label
        ) {
            locationInput.value =
                saved.label;
        }
    } catch (error) {
        console.warn(
            'Could not load saved location:',
            error
        );
    }


    if (
        !window.__goviHarvestLocationListenersAttached
    ) {
        window.__goviHarvestLocationListenersAttached =
            true;


        window.addEventListener(
            'goviDirectReadableLocationUpdated',
            event => {
                const input =
                    document.getElementById(
                        'locationInput'
                    );

                if (
                    input &&
                    event.detail?.label
                ) {
                    input.value =
                        event.detail.label;
                }
            }
        );


        window.addEventListener(
            'goviDirectLocationUpdated',
            event => {
                const input =
                    document.getElementById(
                        'locationInput'
                    );

                if (
                    input &&
                    event.detail?.label
                ) {
                    input.value =
                        event.detail.label;
                }
            }
        );
    }


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

                updatedAt:
                    Date.now()
            };


            localStorage.setItem(
                'goviDirectLocation',
                JSON.stringify(
                    locationData
                )
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
        const url =
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`;


        const response =
            await fetch(url);


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
        } catch {
            saved = {};
        }


        saved.label =
            label;


        localStorage.setItem(
            'goviDirectLocation',
            JSON.stringify(
                saved
            )
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


    if (
        !verificationBtn ||
        !modal
    ) {
        return;
    }


    if (
        modal.dataset.initialized ===
        'true'
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
            if (
                modal.getAttribute(
                    'aria-hidden'
                ) === 'true'
            ) {
                modal.classList.add(
                    'hidden'
                );
            }
        }, 200);
    };


    verificationBtn.addEventListener(
        'click',
        event => {
            event.preventDefault();
            openModal();
        }
    );


    if (closeBtn) {
        closeBtn.addEventListener(
            'click',
            event => {
                event.preventDefault();
                closeModal();
            }
        );
    }


    if (backdrop) {
        backdrop.addEventListener(
            'click',
            event => {
                if (
                    event.target ===
                    backdrop
                ) {
                    closeModal();
                }
            }
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


function compressImageToDataUrl(file) {
    return new Promise(
        (resolve, reject) => {
            const reader =
                new FileReader();


            reader.onload =
                event => {
                    const image =
                        new Image();


                    image.onload =
                        () => {
                            const maxSize =
                                1000;

                            let width =
                                image.width;

                            let height =
                                image.height;


                            if (
                                width >
                                    maxSize ||
                                height >
                                    maxSize
                            ) {
                                const scale =
                                    Math.min(
                                        maxSize /
                                            width,

                                        maxSize /
                                            height
                                    );


                                width =
                                    Math.round(
                                        width *
                                            scale
                                    );

                                height =
                                    Math.round(
                                        height *
                                            scale
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


                            if (!context) {
                                reject(
                                    new Error(
                                        'Could not create canvas context.'
                                    )
                                );

                                return;
                            }


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
                    FARMER_LISTINGS_KEY
                )
            ) || [];

        if (!Array.isArray(listings)) {
            listings = [];
        }
    } catch {
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


    feed.innerHTML =
        listings
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
                                src="${escapeHtml(
                                    item.image ||
                                    item.img ||
                                    harvestUploadedImageData
                                )}"
                                alt="${escapeHtml(
                                    item.name ||
                                    'Harvest'
                                )}"
                                class="w-24 h-24 rounded-xl object-cover shrink-0"
                            >

                            <div class="min-w-0 flex-1">

                                <div class="flex items-start justify-between gap-3">

                                    <div class="min-w-0">

                                        <div class="flex items-center gap-2 flex-wrap">

                                            <h3 class="font-bold truncate">
                                                ${escapeHtml(
                                                    item.name ||
                                                    'Harvest'
                                                )}
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
                                            ${escapeHtml(
                                                item.location ||
                                                'Location unavailable'
                                            )}
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        class="delete-post-btn shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-error hover:bg-error/10 transition-colors"
                                        data-id="${escapeHtml(
                                            item.id
                                        )}"
                                        aria-label="Delete listing"
                                    >

                                        <span class="material-symbols-outlined">
                                            delete
                                        </span>

                                    </button>

                                </div>


                                <div class="flex items-center justify-between gap-3 mt-4">

                                    <span class="text-sm text-on-surface-variant">

                                        ${escapeHtml(
                                            String(
                                                item.quantity ??
                                                0
                                            )
                                        )}

                                        ${escapeHtml(
                                            item.unit ||
                                            'kg'
                                        )}

                                        available

                                    </span>


                                    <span class="font-bold text-primary-container">

                                        Rs. ${escapeHtml(
                                            String(
                                                item.price ??
                                                0
                                            )
                                        )}/kg

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


if (
    !window.__goviHarvestDeleteHandlerAttached
) {
    window.__goviHarvestDeleteHandlerAttached =
        true;


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


            let listings = [];


            try {
                listings =
                    JSON.parse(
                        localStorage.getItem(
                            FARMER_LISTINGS_KEY
                        )
                    ) || [];
            } catch {
                listings = [];
            }


            listings =
                listings.filter(
                    item =>
                        item.id !==
                        listingId
                );


            localStorage.setItem(
                FARMER_LISTINGS_KEY,
                JSON.stringify(
                    listings
                )
            );


            updateFeedUI();
        }
    );
}


function resetHarvestPageState() {
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

        termsModal.classList.remove(
            'opacity-100',
            'pointer-events-auto'
        );

        termsModal.classList.add(
            'opacity-0',
            'pointer-events-none'
        );

        termsModal.removeAttribute(
            'data-initialized'
        );
    }


    if (verificationModal) {
        verificationModal.classList.remove(
            'is-open'
        );

        verificationModal.classList.add(
            'hidden'
        );

        verificationModal.removeAttribute(
            'data-initialized'
        );
    }


    document.body.style.overflow =
        '';

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


    initHarvestPage();
}


if (
    document.readyState ===
    'loading'
) {
    document.addEventListener(
        'DOMContentLoaded',
        runHarvestInit,
        {
            once: true
        }
    );
} else {
    runHarvestInit();
}


if (
    !window.__goviHarvestPageLoadedListenerAttached
) {
    window.__goviHarvestPageLoadedListenerAttached =
        true;


    document.addEventListener(
        'pageLoaded',
        event => {
            const url =
                event?.detail?.url ||
                window.location.href;


            if (
                !url.includes(
                    '/Harvest/'
                )
            ) {
                return;
            }


            resetHarvestPageState();


            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    runHarvestInit();
                });
            });
        }
    );
}