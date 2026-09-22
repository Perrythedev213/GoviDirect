// ==========================================
// CART PAGE & INTERACTION LOGIC
// ==========================================
(function() {

  function initBuyerTermsModal() {
  const modal = document.getElementById("buyerTermsModal");
  const backdrop = document.getElementById("buyerTermsBackdrop");
  const closeBtn = document.getElementById("closeBuyerTermsBtn");
  const doneBtn = document.getElementById("buyerTermsDoneBtn");
  const termsLink = document.getElementById("buyerTermsLink");

  if (!modal || !backdrop || !closeBtn || !doneBtn || !termsLink) {
    return;
  }

  if (modal.dataset.initialized === "true") {
    return;
  }

  modal.dataset.initialized = "true";

  const originalParent = modal.parentElement;
  const originalNextSibling = modal.nextSibling;

  function openModal() {
    // Move modal outside #app-content so the header/page CSS
    // cannot affect its position.
    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      modal.classList.add("is-open");
    });
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    setTimeout(() => {
      modal.classList.add("hidden");

      // Put it back where it originally came from.
      if (modal.parentElement === document.body && originalParent) {
        if (originalNextSibling && originalNextSibling.parentElement === originalParent) {
          originalParent.insertBefore(modal, originalNextSibling);
        } else {
          originalParent.appendChild(modal);
        }
      }
    }, 180);
  }

  termsLink.addEventListener("click", (event) => {
    event.preventDefault();
    openModal();
  });

  closeBtn.addEventListener("click", closeModal);
  doneBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

  function initCartPage() {

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


    let currentDonation = 250;

    const deliveryFee = 350;


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


    // Buyer Terms
    initBuyerTermsModal();


    // Order Tracking Button Event
    if (trackOrderBtn) {

      trackOrderBtn.onclick = () => {

        alert(
          'Opening Live Dispatch Map for #GD-1048...'
        );

      };

    }


    // Donation Pill Selection Logic
    donationButtons.forEach(btn => {

      btn.onclick = () => {

        donationButtons.forEach(b => {

          b.classList.remove(
            'bg-primary-container',
            'text-on-primary',
            'shadow-sm'
          );

          b.classList.add(
            'bg-surface-container-low',
            'text-on-surface'
          );

        });


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

    });


    if (customInput) {

      customInput.oninput = () => {

        currentDonation =
          parseFloat(
            customInput.value
          ) || 0;

        renderCart();

      };

    }


    if (donationToggle) {

      donationToggle.onchange = () => {

        renderCart();

      };

    }


    // ==========================================
    // CORE RENDER & CALCULATION FUNCTION
    // ==========================================

    window.renderCart = function() {

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

      if (cart.length === 0) {

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

        container.innerHTML = '';


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

          checkoutBtn.disabled = true;

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

        checkoutBtn.disabled = false;

        checkoutBtn.classList.remove(
          'opacity-50',
          'cursor-not-allowed'
        );

      }


      let subtotal = 0;

      let totalItemsCount = 0;


      // ==========================================
      // BUILD CART ITEMS
      // ==========================================

      container.innerHTML =
        cart.map(
          (item, index) => {

            const itemPrice =
              parseFloat(item.price) || 0;

            const itemQuantity =
              Number(item.quantity) || 0;

            const itemTotal =
              itemPrice * itemQuantity;

            subtotal += itemTotal;

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
                        ${item.farmer}
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
      function(index, change) {

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
            (Number(cart[index].quantity) || 0) +
            change;


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