// ==========================================
// CART PAGE & INTERACTION LOGIC
// ==========================================
(function() {

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
        getStoredListingById(item.listingId);

      if (byId) {
        return byId;
      }
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

        if (itemName && listingName !== itemName) {
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

    if (!Array.isArray(cart) || cart.length === 0) {
      return;
    }

    const buyerName =
      getBuyerName();

    const buyerUsername =
      getBuyerUsername();

    const orderDate =
      new Date();

    const orderDateTime =
      formatOrderDateTime(orderDate);

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


  function initBuyerTermsModal() {

    const modal =
      document.getElementById(
        "buyerTermsModal"
      );

    const backdrop =
      document.getElementById(
        "buyerTermsBackdrop"
      );

    const closeBtn =
      document.getElementById(
        "closeBuyerTermsBtn"
      );

    const doneBtn =
      document.getElementById(
        "buyerTermsDoneBtn"
      );

    const termsLink =
      document.getElementById(
        "buyerTermsLink"
      );

    const checkoutBtn =
      document.getElementById(
        "checkoutBtn"
      );

    if (
      !modal ||
      !backdrop ||
      !closeBtn ||
      !doneBtn ||
      !termsLink
    ) {
      return;
    }

    if (
      modal.dataset.initialized === "true"
    ) {
      return;
    }

    modal.dataset.initialized =
      "true";

    const originalParent =
      modal.parentElement;

    const originalNextSibling =
      modal.nextSibling;


    function openModal() {

      if (
        modal.parentElement !==
        document.body
      ) {
        document.body.appendChild(
          modal
        );
      }

      modal.classList.remove(
        "hidden"
      );

      modal.setAttribute(
        "aria-hidden",
        "false"
      );

      document.body.style.overflow =
        "hidden";

      requestAnimationFrame(() => {

        modal.classList.add(
          "is-open"
        );

      });

    }


    function closeModal() {

      modal.classList.remove(
        "is-open"
      );

      modal.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.style.overflow =
        "";

      setTimeout(() => {

        modal.classList.add(
          "hidden"
        );

        if (
          modal.parentElement ===
            document.body &&
          originalParent
        ) {

          if (
            originalNextSibling &&
            originalNextSibling.parentElement ===
              originalParent
          ) {

            originalParent.insertBefore(
              modal,
              originalNextSibling
            );

          } else {

            originalParent.appendChild(
              modal
            );

          }

        }

      }, 180);

    }


    termsLink.addEventListener(
      "click",
      event => {

        event.preventDefault();

        openModal();

      }
    );


    if (checkoutBtn) {

      checkoutBtn.addEventListener(
        "click",
        event => {

          event.preventDefault();

          if (
            checkoutBtn.disabled
          ) {
            return;
          }

          openModal();

        }
      );

    }


    doneBtn.addEventListener(
      "click",
      () => {

        const cart =
          JSON.parse(
            localStorage.getItem(
              'goviDirectCart'
            )
          ) || [];

        if (
          cart.length === 0
        ) {

          closeModal();

          return;

        }

        /*
         * The order is considered placed
         * only after the buyer confirms
         * the Buyer Terms.
         */
        sendOrderNotifications(
          cart
        );

        /*
         * Prevent the same checkout
         * confirmation from sending again
         * while the modal is still open.
         */
        doneBtn.disabled = true;

        doneBtn.textContent =
          'Order Placed';

        setTimeout(() => {

          doneBtn.disabled = false;

          doneBtn.textContent =
            'I Understand';

          closeModal();

        }, 350);

      }
    );


    closeBtn.addEventListener(
      "click",
      closeModal
    );


    backdrop.addEventListener(
      "click",
      closeModal
    );


    document.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Escape" &&
          !modal.classList.contains(
            "hidden"
          )
        ) {

          closeModal();

        }

      }
    );

  }


  function initCartPage() {

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


    let currentDonation =
      250;

    const deliveryFee =
      350;


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


    initBuyerTermsModal();


    if (trackOrderBtn) {

      trackOrderBtn.onclick = () => {

        alert(
          'Opening Live Dispatch Map for #GD-1048...'
        );

      };

    }


    donationButtons.forEach(
      btn => {

        btn.onclick = () => {

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


          renderCart();

        };

      }
    );


    if (customInput) {

      customInput.oninput =
        () => {

          currentDonation =
            parseFloat(
              customInput.value
            ) || 0;

          renderCart();

        };

    }


    if (donationToggle) {

      donationToggle.onchange =
        () => {

          renderCart();

        };

    }


    // ==========================================
    // CORE RENDER & CALCULATION FUNCTION
    // ==========================================

    window.renderCart =
      function() {

        const cartKey =
          'goviDirectCart';

        let cart =
          JSON.parse(
            localStorage.getItem(
              cartKey
            )
          ) || [];


        const container =
          document.getElementById(
            'cart-items-container'
          );

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


        if (!container) {
          return;
        }


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

          return;

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
                  item.price
                ) || 0;

              const itemQuantity =
                Number(
                  item.quantity
                ) || 0;

              const itemTotal =
                itemPrice *
                itemQuantity;

              subtotal +=
                itemTotal;

              totalItemsCount +=
                itemQuantity;


              return `
                <div class="cart-item bg-surface-container-lowest rounded-xl p-space-sm shadow-sm flex items-center gap-space-sm">

                  <img
                    class="w-16 h-16 rounded-lg object-cover shrink-0"
                    src="${item.img}"
                    alt="${item.name}"
                  >

                  <div class="flex-1 min-w-0">

                    <div class="flex items-start justify-between gap-space-xs">

                      <div>

                        <span class="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                          ${item.farmer || 'Direct Farm Seller'}
                        </span>

                        <h2 class="font-headline-sm text-headline-sm text-on-surface truncate">
                          ${item.name}
                        </h2>

                        <p class="font-body-sm text-body-sm text-on-surface-variant">
                          Rs. ${item.price} / ${item.unit}
                        </p>

                      </div>


                      <button
                        onclick="removeItem(${index})"
                        aria-label="Remove item"
                        class="item-delete text-outline hover:text-error p-1 transition-colors"
                        type="button"
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
                          onclick="updateQuantity(${index}, -1)"
                          class="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:bg-surface rounded active:scale-90 transition-transform"
                          type="button"
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
                          onclick="updateQuantity(${index}, 1)"
                          class="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:bg-surface rounded active:scale-90 transition-transform"
                          type="button"
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
        // UPDATE HEADER COUNTS
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
        // DONATION CALCULATIONS
        // ==========================================

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

          donationLabel.innerText =
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

      };


    // ==========================================
    // QUANTITY MODIFIER
    // ==========================================

    window.updateQuantity =
      function(
        index,
        change
      ) {

        const cartKey =
          'goviDirectCart';

        let cart =
          JSON.parse(
            localStorage.getItem(
              cartKey
            )
          ) || [];


        if (cart[index]) {

          cart[index].quantity =
            (
              Number(
                cart[index].quantity
              ) || 0
            ) + change;


          if (
            cart[index].quantity <= 0
          ) {

            cart.splice(
              index,
              1
            );

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


          renderCart();

        }

      };


    // ==========================================
    // REMOVE ITEM
    // ==========================================

    window.removeItem =
      function(index) {

        const cartKey =
          'goviDirectCart';

        let cart =
          JSON.parse(
            localStorage.getItem(
              cartKey
            )
          ) || [];


        cart.splice(
          index,
          1
        );


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


        renderCart();

      };


    // ==========================================
    // INITIAL RENDER
    // ==========================================

    renderCart();

  }


  // ==========================================
  // STANDARD LOADING
  // ==========================================

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      initCartPage
    );

  } else {

    initCartPage();

  }


  // ==========================================
  // SPA NAVIGATION
  // ==========================================

  document.addEventListener(
    'pageLoaded',
    () => {

      initCartPage();

    }
  );


  // ==========================================
  // CART UPDATES
  // ==========================================

  window.addEventListener(
    'cartUpdated',
    () => {

      if (
        typeof window.renderCart ===
        'function'
      ) {

        window.renderCart();

      } else {

        initCartPage();

      }

    }
  );

})();