// ==========================================
// CART PAGE & INTERACTION LOGIC
// ==========================================

(function () {

  let currentDonation = 250;
  const deliveryFee = 350;

  // ==========================================
  // USER HELPERS
  // ==========================================

  function getCurrentUser() {

    if (
      window.GoviDirectAuth &&
      typeof window.GoviDirectAuth.getCurrentUser === 'function'
    ) {
      return window.GoviDirectAuth.getCurrentUser();
    }

    try {
      return JSON.parse(
        localStorage.getItem('goviDirectSession')
      );
    } catch (error) {
      return null;
    }

  }


  function getBuyerName() {

    const user = getCurrentUser();

    if (!user) {
      return 'Buyer';
    }

    const candidates = [
      user.accountName,
      user.name,
      user.fullName,
      user.username,
      user.displayName
    ];

    for (const candidate of candidates) {

      if (
        typeof candidate === 'string' &&
        candidate.trim()
      ) {
        return candidate.trim();
      }

    }

    return 'Buyer';

  }


  function getBuyerUsername() {

    const user = getCurrentUser();

    if (!user) {
      return '';
    }

    const candidates = [
      user.username,
      user.accountName,
      user.name,
      user.displayName
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
          localStorage.getItem('goviDirectListings')
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
          String(listing.id) === String(listingId)
      ) || null
    );

  }


  function findStoredListingForCartItem(item) {

    if (!item) {
      return null;
    }

    if (item.listingId) {

      const byId =
        getStoredListingById(
          item.listingId
        );

      if (byId) {
        return byId;
      }

    }

    let listings = [];

    try {

      listings =
        JSON.parse(
          localStorage.getItem('goviDirectListings')
        ) || [];

    } catch (error) {

      return null;

    }

    if (!Array.isArray(listings)) {
      return null;
    }

    const itemName =
      typeof item.name === 'string'
        ? item.name.trim().toLowerCase()
        : '';

    const itemFarmer =
      typeof item.farmer === 'string'
        ? item.farmer.trim().toLowerCase()
        : '';

    return (
      listings.find(listing => {

        if (!listing) {
          return false;
        }

        const listingName =
          typeof listing.name === 'string'
            ? listing.name.trim().toLowerCase()
            : '';

        if (
          itemName &&
          listingName !== itemName
        ) {
          return false;
        }

        if (!itemFarmer) {
          return true;
        }

        const listingFarmer =
          typeof listing.farmer === 'string'
            ? listing.farmer.trim().toLowerCase()
            : '';

        const ownerName =
          typeof listing.ownerName === 'string'
            ? listing.ownerName.trim().toLowerCase()
            : '';

        const sellerName =
          typeof listing.sellerName === 'string'
            ? listing.sellerName.trim().toLowerCase()
            : '';

        return (
          listingFarmer === itemFarmer ||
          ownerName === itemFarmer ||
          sellerName === itemFarmer
        );

      }) || null
    );

  }


  function getCartItemOwner(item) {

    const storedListing =
      findStoredListingForCartItem(item);

    if (storedListing) {

      return {

        username:
          getListingOwnerUsername(
            storedListing
          ),

        accountType:
          getListingOwnerAccountType(
            storedListing
          ),

        listing:
          storedListing

      };

    }

    return {

      username:
        getListingOwnerUsername(item),

      accountType:
        getListingOwnerAccountType(item),

      listing:
        item

    };

  }


  function formatOrderDateTime(date) {

    return new Intl.DateTimeFormat(
      'en-LK',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: true
      }
    ).format(date);

  }


  // ==========================================
  // ORDER NOTIFICATIONS
  // ==========================================

  function sendOrderNotifications(cart) {

    if (
      !window.GoviDirectNotifications ||
      typeof window.GoviDirectNotifications.add !== 'function'
    ) {

      console.warn(
        'GoviDirectNotifications is not available.'
      );

      return;

    }

    if (
      !Array.isArray(cart) ||
      cart.length === 0
    ) {
      return;
    }

    const buyerName =
      getBuyerName();

    const buyerUsername =
      getBuyerUsername();

    const orderDate =
      new Date();

    const orderDateTime =
      formatOrderDateTime(
        orderDate
      );

    const orderTimestamp =
      orderDate.toISOString();

    cart.forEach(item => {

      if (!item) {
        return;
      }

      const owner =
        getCartItemOwner(item);

      if (!owner.username) {

        console.warn(
          'Could not determine the farmer account for:',
          item.name
        );

        return;

      }

      const quantity =
        Number(item.quantity) || 0;

      const unitPrice =
        parseFloat(item.price) || 0;

      const itemTotal =
        unitPrice * quantity;

      const productName =
        item.name ||
        owner.listing?.name ||
        'Harvest item';

      const unit =
        item.unit ||
        owner.listing?.unit ||
        'unit';

      window.GoviDirectNotifications.add({

        recipientUsername:
          owner.username,

        recipientAccountType:
          owner.accountType || 'seller',

        title:
          'Order placed',

        message:
          `${buyerName} placed an order for ${quantity} ${unit} of "${productName}". Price: Rs. ${itemTotal.toFixed(2)}. Placed: ${orderDateTime}.`,

        icon:
          'shopping_bag',

        type:
          'order_placed',

        data: {

          orderId:
            `GD-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)
              .toUpperCase()}`,

          listingId:
            item.listingId ||
            owner.listing?.id ||
            null,

          productName:
            productName,

          buyerName:
            buyerName,

          buyerUsername:
            buyerUsername,

          quantity:
            quantity,

          unit:
            unit,

          unitPrice:
            unitPrice,

          itemTotal:
            itemTotal,

          placedAt:
            orderTimestamp,

          placedAtFormatted:
            orderDateTime

        }

      });

    });

  }


  // ==========================================
  // BUYER TERMS MODAL
  // ==========================================

  function initBuyerTermsModal() {

    const modal =
      document.getElementById(
        'buyerTermsModal'
      );

    if (!modal) {
      console.error(
        '[GoviDirect] Buyer Terms modal not found.'
      );
      return;
    }

    if (modal.dataset.initialized === 'true') {
      return;
    }

    modal.dataset.initialized = 'true';


    function openModal() {

      const currentModal =
        document.getElementById(
          'buyerTermsModal'
        );

      if (!currentModal) {
        console.error(
          '[GoviDirect] Cannot open Buyer Terms: modal not found.'
        );
        return;
      }

      currentModal.classList.remove(
        'hidden'
      );

      currentModal.classList.add(
        'is-open',
        'opacity-100',
        'pointer-events-auto'
      );

      currentModal.setAttribute(
        'aria-hidden',
        'false'
      );

      document.body.style.overflow =
        'hidden';

      console.log(
        '[GoviDirect] Buyer Terms opened.'
      );

    }


    function closeModal() {

      const currentModal =
        document.getElementById(
          'buyerTermsModal'
        );

      if (!currentModal) {
        return;
      }

      currentModal.classList.remove(
        'is-open',
        'opacity-100',
        'pointer-events-auto'
      );

      currentModal.classList.add(
        'opacity-0',
        'pointer-events-none'
      );

      currentModal.setAttribute(
        'aria-hidden',
        'true'
      );

      document.body.style.overflow =
        '';

      setTimeout(() => {

        if (
          currentModal.isConnected &&
          currentModal.classList.contains(
            'opacity-0'
          )
        ) {
          currentModal.classList.add(
            'hidden'
          );
        }

      }, 180);

    }


    // ==========================================
    // TERMS LINK
    // ==========================================

    const termsLink =
      document.getElementById(
        'buyerTermsLink'
      );

    if (termsLink) {

      termsLink.onclick =
        event => {

          event.preventDefault();
          event.stopPropagation();

          openModal();

        };

    }


    // ==========================================
    // CHECKOUT BUTTON
    // ==========================================

    const checkoutBtn =
      document.getElementById(
        'checkoutBtn'
      );

    if (checkoutBtn) {

      checkoutBtn.onclick =
        event => {

          event.preventDefault();
          event.stopPropagation();

          if (checkoutBtn.disabled) {
            return;
          }

          let cart = [];

          try {

            cart =
              JSON.parse(
                localStorage.getItem(
                  'goviDirectCart'
                ) || '[]'
              );

          } catch (error) {

            cart = [];

          }

          if (
            !Array.isArray(cart) ||
            cart.length === 0
          ) {

            console.log(
              '[GoviDirect] Checkout blocked: cart is empty.'
            );

            return;

          }

          openModal();

        };

    } else {

      console.error(
        '[GoviDirect] checkoutBtn not found during Cart initialization.'
      );

    }


    // ==========================================
    // CLOSE BUTTON
    // ==========================================

    const closeBtn =
      document.getElementById(
        'closeBuyerTermsBtn'
      );

    if (closeBtn) {

      closeBtn.onclick =
        event => {

          event.preventDefault();
          event.stopPropagation();

          closeModal();

        };

    }


    // ==========================================
    // BACKDROP
    // ==========================================

    const backdrop =
      document.getElementById(
        'buyerTermsBackdrop'
      );

    if (backdrop) {

      backdrop.onclick =
        event => {

          if (
            event.target === backdrop
          ) {
            closeModal();
          }

        };

    }


    // ==========================================
    // I UNDERSTAND
    // ==========================================

    const doneBtn =
      document.getElementById(
        'buyerTermsDoneBtn'
      );

    if (doneBtn) {

      doneBtn.onclick =
        event => {

          event.preventDefault();
          event.stopPropagation();

          if (
            doneBtn.dataset.processing === 'true'
          ) {
            return;
          }

          doneBtn.dataset.processing =
            'true';

          doneBtn.disabled =
            true;

          let cart = [];

          try {

            cart =
              JSON.parse(
                localStorage.getItem(
                  'goviDirectCart'
                ) || '[]'
              );

          } catch (error) {

            cart = [];

          }

          if (
            !Array.isArray(cart) ||
            cart.length === 0
          ) {

            closeModal();

            doneBtn.disabled =
              false;

            doneBtn.dataset.processing =
              'false';

            return;

          }

          sendOrderNotifications(
            cart
          );

          const originalHTML =
            doneBtn.innerHTML;

          doneBtn.innerHTML = `
            <span class="material-symbols-outlined align-middle text-[18px]">
              check
            </span>
            Order Placed
          `;

          setTimeout(() => {

            closeModal();

            doneBtn.innerHTML =
              originalHTML;

            doneBtn.disabled =
              false;

            doneBtn.dataset.processing =
              'false';

          }, 700);

        };

    }


    // ==========================================
    // ESCAPE
    // ==========================================

    if (
      !window.__goviDirectBuyerTermsEscapeHandler
    ) {

      window.__goviDirectBuyerTermsEscapeHandler =
        event => {

          if (
            event.key !== 'Escape'
          ) {
            return;
          }

          const currentModal =
            document.getElementById(
              'buyerTermsModal'
            );

          if (!currentModal) {
            return;
          }

          if (
            currentModal.classList.contains(
              'hidden'
            )
          ) {
            return;
          }

          closeModal();

        };

      document.addEventListener(
        'keydown',
        window.__goviDirectBuyerTermsEscapeHandler
      );

    }

  }


  // ==========================================
  // CORE CART RENDER
  // ==========================================

  window.renderCart =
    function () {

      const container =
        document.getElementById(
          'cart-items-container'
        );

      if (!container) {
        return false;
      }

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


      const emptyState =
        document.getElementById(
          'empty-cart-state'
        );

      const cartContent =
        document.getElementById(
          'cart-content-wrapper'
        );

      const subtotalEl =
        document.getElementById(
          'cart-subtotal'
        );

      const totalEl =
        document.getElementById(
          'cart-total'
        );

      const cartHeaderCount =
        document.getElementById(
          'cartHeaderCount'
        );

      const badgeCount =
        document.getElementById(
          'badgeCount'
        );

      const donationRow =
        document.getElementById(
          'donationRow'
        );

      const donationLabel =
        document.getElementById(
          'donationAmountLabel'
        );

      const checkoutBtn =
        document.getElementById(
          'checkoutBtn'
        );


      // ==========================================
      // EMPTY CART
      // ==========================================

      if (
        cart.length === 0
      ) {

        if (emptyState) {

          emptyState.classList.remove(
            'hidden'
          );

        }

        if (cartContent) {

          cartContent.classList.add(
            'hidden'
          );

        }

        container.innerHTML =
          '';

        if (subtotalEl) {

          subtotalEl.textContent =
            'Rs. 0.00';

        }

        if (totalEl) {

          totalEl.textContent =
            'Rs. 0.00';

        }

        if (cartHeaderCount) {

          cartHeaderCount.textContent =
            '0 farm-direct items ready for dispatch';

        }

        if (badgeCount) {

          badgeCount.textContent =
            '0 Items';

        }

        if (checkoutBtn) {

          checkoutBtn.disabled =
            true;

          checkoutBtn.classList.add(
            'opacity-50',
            'cursor-not-allowed'
          );

        }

        if (donationRow) {

          donationRow.style.display =
            'none';

        }

        return true;

      }


      // ==========================================
      // CART HAS ITEMS
      // ==========================================

      if (emptyState) {

        emptyState.classList.add(
          'hidden'
        );

      }

      if (cartContent) {

        cartContent.classList.remove(
          'hidden'
        );

      }

      if (checkoutBtn) {

        checkoutBtn.disabled =
          false;

        checkoutBtn.classList.remove(
          'opacity-50',
          'cursor-not-allowed'
        );

      }


      let subtotal =
        0;

      let totalItemsCount =
        0;


      // ==========================================
      // BUILD CART ITEMS
      // ==========================================

      container.innerHTML =
        cart.map(
          (item, index) => {

            const itemPrice =
              parseFloat(
                item?.price
              ) || 0;

            const itemQuantity =
              Number(
                item?.quantity
              ) || 0;

            const itemTotal =
              itemPrice *
              itemQuantity;

            subtotal +=
              itemTotal;

            totalItemsCount +=
              itemQuantity;


            return `
              <div
                class="cart-item bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex items-center gap-space-sm"
                data-cart-index="${index}"
              >

                <img
                  class="w-16 h-16 rounded-lg object-cover shrink-0"
                  src="${item?.img || ''}"
                  alt="${item?.name || 'Cart item'}"
                >

                <div class="flex-1 min-w-0">

                  <div class="flex items-start justify-between gap-space-xs">

                    <div>

                      <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                        ${item?.farmer || 'Direct Farm Seller'}
                      </span>

                      <h2 class="font-headline-sm text-headline-sm text-on-surface truncate">
                        ${item?.name || 'Harvest item'}
                      </h2>

                      <p class="font-body-sm text-body-sm text-on-surface-variant">
                        Rs. ${itemPrice.toFixed(2)} / ${item?.unit || 'unit'}
                      </p>

                    </div>


                    <button
                      class="item-delete text-outline hover:text-error p-1 transition-colors"
                      type="button"
                      data-cart-action="remove"
                      data-cart-index="${index}"
                      aria-label="Remove item"
                    >

                      <span class="material-symbols-outlined text-[20px]">
                        delete
                      </span>

                    </button>

                  </div>


                  <div class="flex items-center justify-between mt-space-xs">

                    <span class="item-total-price font-headline-sm text-headline-sm text-primary-container">
                      Rs. ${itemTotal.toFixed(0)}
                    </span>


                    <div class="flex items-center bg-surface-container-low rounded-lg p-0.5">

                      <button
                        class="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:bg-surface rounded active:scale-90 transition-transform"
                        type="button"
                        data-cart-action="decrease"
                        data-cart-index="${index}"
                        aria-label="Decrease quantity"
                      >

                        <span class="material-symbols-outlined text-[16px]">
                          remove
                        </span>

                      </button>


                      <span class="item-qty w-8 text-center font-label-lg text-label-lg text-on-surface">
                        ${itemQuantity}
                      </span>


                      <button
                        class="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:bg-surface rounded active:scale-90 transition-transform"
                        type="button"
                        data-cart-action="increase"
                        data-cart-index="${index}"
                        aria-label="Increase quantity"
                      >

                        <span class="material-symbols-outlined text-[16px]">
                          add
                        </span>

                      </button>

                    </div>

                  </div>

                </div>

              </div>
            `;

          }
        ).join('');


      // ==========================================
      // UPDATE COUNTS
      // ==========================================

      if (cartHeaderCount) {

        cartHeaderCount.textContent =
          `${totalItemsCount} farm-direct item(s) ready for dispatch`;

      }

      if (badgeCount) {

        badgeCount.textContent =
          `${totalItemsCount} Items`;

      }


      // ==========================================
      // DONATION
      // ==========================================

      const donationToggle =
        document.getElementById(
          'donationToggle'
        );

      const isDonating =
        donationToggle
          ? donationToggle.checked
          : false;

      const effectiveDonation =
        isDonating
          ? currentDonation
          : 0;


      if (donationRow) {

        donationRow.style.display =
          (
            isDonating &&
            currentDonation > 0
          )
            ? 'flex'
            : 'none';

      }

      if (donationLabel) {

        donationLabel.textContent =
          'Rs. ' +
          currentDonation.toLocaleString();

      }


      // ==========================================
      // FINAL TOTAL
      // ==========================================

      const finalTotal =
        subtotal +
        deliveryFee +
        effectiveDonation;


      if (subtotalEl) {

        subtotalEl.textContent =
          `Rs. ${subtotal.toFixed(2)}`;

      }

      if (totalEl) {

        totalEl.textContent =
          `Rs. ${finalTotal.toFixed(2)}`;

      }

      return true;

    };


  // ==========================================
  // CART ITEM EVENTS
  // ==========================================

  function setupCartItemEvents() {

    const container =
      document.getElementById(
        'cart-items-container'
      );

    if (!container) {
      return;
    }

    if (
      container.dataset.eventsInitialized === 'true'
    ) {
      return;
    }

    container.dataset.eventsInitialized =
      'true';


    container.addEventListener(
      'click',
      event => {

        const button =
          event.target.closest(
            '[data-cart-action]'
          );

        if (
          !button ||
          !container.contains(button)
        ) {
          return;
        }

        const index =
          Number(
            button.dataset.cartIndex
          );

        const action =
          button.dataset.cartAction;

        if (
          !Number.isInteger(index)
        ) {
          return;
        }

        if (
          action === 'remove'
        ) {

          window.removeItem(
            index
          );

          return;

        }

        if (
          action === 'decrease'
        ) {

          window.updateQuantity(
            index,
            -1
          );

          return;

        }

        if (
          action === 'increase'
        ) {

          window.updateQuantity(
            index,
            1
          );

        }

      }
    );

  }


  // ==========================================
  // INITIALIZE CART PAGE
  // ==========================================

  function initCartPage() {

    const container =
      document.getElementById(
        'cart-items-container'
      );

    if (!container) {
      return;
    }


    setupCartItemEvents();


    // ==========================================
    // PAGE TRANSITION
    // ==========================================

    const appContent =
      document.getElementById(
        'app-content'
      );

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


    // ==========================================
    // DONATION CONTROLS
    // ==========================================

    const donationToggle =
      document.getElementById(
        'donationToggle'
      );

    const customContainer =
      document.getElementById(
        'customDonationContainer'
      );

    const customInput =
      document.getElementById(
        'customDonationInput'
      );

    const donationButtons =
      document.querySelectorAll(
        '.donation-btn'
      );

    const trackOrderBtn =
      document.getElementById(
        'trackOrderBtn'
      );


    // ==========================================
    // BUYER TERMS
    // ==========================================

    initBuyerTermsModal();


    // ==========================================
    // TRACK ORDER
    // ==========================================

    if (trackOrderBtn) {

      trackOrderBtn.onclick =
        () => {

          alert(
            'Opening Live Dispatch Map for #GD-1048...'
          );

        };

    }


    // ==========================================
    // DONATION BUTTONS
    // ==========================================

    donationButtons.forEach(
      btn => {

        if (
          btn.dataset.donationInitialized === 'true'
        ) {
          return;
        }

        btn.dataset.donationInitialized =
          'true';


        btn.addEventListener(
          'click',
          () => {

            donationButtons.forEach(
              b => {

                b.classList.remove(
                  'bg-primary-container',
                  'text-on-primary',
                  'shadow-sm'
                );

                b.classList.add(
                  'bg-surface-container-low',
                  'text-on-surface'
                );

              }
            );


            btn.classList.remove(
              'bg-surface-container-low',
              'text-on-surface'
            );

            btn.classList.add(
              'bg-primary-container',
              'text-on-primary',
              'shadow-sm'
            );


            const amountAttr =
              btn.getAttribute(
                'data-amount'
              );


            if (
              amountAttr === 'custom'
            ) {

              if (customContainer) {

                customContainer.classList.remove(
                  'hidden'
                );

              }

              if (customInput) {

                currentDonation =
                  parseFloat(
                    customInput.value
                  ) || 0;

                customInput.focus();

              }

            } else {

              if (customContainer) {

                customContainer.classList.add(
                  'hidden'
                );

              }

              currentDonation =
                parseFloat(
                  amountAttr
                ) || 0;

            }


            window.renderCart();

          }
        );

      }
    );


    // ==========================================
    // CUSTOM DONATION
    // ==========================================

    if (
      customInput &&
      customInput.dataset.donationInputInitialized !== 'true'
    ) {

      customInput.dataset.donationInputInitialized =
        'true';

      customInput.addEventListener(
        'input',
        () => {

          currentDonation =
            parseFloat(
              customInput.value
            ) || 0;

          window.renderCart();

        }
      );

    }


    // ==========================================
    // DONATION TOGGLE
    // ==========================================

    if (
      donationToggle &&
      donationToggle.dataset.donationToggleInitialized !== 'true'
    ) {

      donationToggle.dataset.donationToggleInitialized =
        'true';

      donationToggle.addEventListener(
        'change',
        () => {

          window.renderCart();

        }
      );

    }


    // ==========================================
    // FIRST RENDER
    // ==========================================

    window.renderCart();

  }


  // ==========================================
  // MAKE CART INITIALIZER AVAILABLE TO ROUTER
  // ==========================================

  window.initCartPage =
    initCartPage;


  // ==========================================
  // QUANTITY MODIFIER
  // ==========================================

  window.updateQuantity =
    function (
      index,
      change
    ) {

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


      if (
        !cart[index]
      ) {
        return;
      }


      const currentQuantity =
        Number(
          cart[index].quantity
        ) || 0;

      cart[index].quantity =
        currentQuantity +
        Number(change || 0);


      if (
        cart[index].quantity <= 0
      ) {

        cart.splice(
          index,
          1
        );

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

    };


  // ==========================================
  // REMOVE ITEM
  // ==========================================

  window.removeItem =
    function (index) {

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


      if (
        index < 0 ||
        index >= cart.length
      ) {
        return;
      }


      cart.splice(
        index,
        1
      );


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

    };


  // ==========================================
  // PAGE LOADED — SPA ROUTER
  // ==========================================

  if (
    !window.__goviCartPageLoadedListenerAttached
  ) {

    window.__goviCartPageLoadedListenerAttached =
      true;

    document.addEventListener(
      'pageLoaded',
      event => {

        const url =
          event?.detail?.url || '';

        if (
          url &&
          !url.includes('/Cart/')
        ) {
          return;
        }

        requestAnimationFrame(() => {

          initCartPage();

        });

      }
    );

  }


  // ==========================================
  // CART UPDATED
  // ==========================================

  window.addEventListener(
    'cartUpdated',
    () => {

      const cartContainer =
        document.getElementById(
          'cart-items-container'
        );

      if (!cartContainer) {
        return;
      }

      window.renderCart();

    }
  );


  // ==========================================
  // NORMAL PAGE LOAD
  // ==========================================

  function bootCartPage() {

    requestAnimationFrame(() => {

      initCartPage();

    });

  }


  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      bootCartPage,
      {
        once: true
      }
    );

  } else {

    bootCartPage();

  }

})();