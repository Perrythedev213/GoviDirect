// ==========================================
// CART PAGE & INTERACTION LOGIC
// ==========================================
function init() {
  // Triggers the fade-in animation on page load/transition
  const appContent = document.getElementById('app-content');
  if (appContent) {
    appContent.classList.add('page-transitioning');
    requestAnimationFrame(() => {
      appContent.classList.remove('page-transitioning');
    });
  }

  let currentDonation = 250; // Initial default matching the active 'Rs. 250' button
  const delivery = 150;

  const donationToggle = document.getElementById('donationToggle');
  const customContainer = document.getElementById('customDonationContainer');
  const customInput = document.getElementById('customDonationInput');
  const donationButtons = document.querySelectorAll('.donation-btn');
  const trackOrderBtn = document.getElementById('trackOrderBtn');
  const cartListContainer = document.getElementById('cartItemsList');

  // Order Tracking Button Event
  if (trackOrderBtn) {
    trackOrderBtn.onclick = () => {
      alert('Opening Live Dispatch Map for #GD-1048...');
    };
  }

  // Update total calculations and item counts dynamically
  function updateTotals() {
    const cartItems = document.querySelectorAll('.cart-item');
    let subtotal = 0;
    let totalItemsCount = 0;

    cartItems.forEach(item => {
      const pricePerUnit = parseFloat(item.getAttribute('data-price')) || 0;
      const qtySpan = item.querySelector('.item-qty');
      const qty = parseInt(qtySpan?.innerText, 10) || 0;
      
      const itemTotal = pricePerUnit * qty;
      totalItemsCount += qty;
      subtotal += itemTotal;

      // Update individual item total price display
      const itemTotalLabel = item.querySelector('.item-total-price');
      if (itemTotalLabel) {
        itemTotalLabel.innerText = 'Rs. ' + itemTotal.toLocaleString();
      }
    });

    const isDonating = donationToggle ? donationToggle.checked : false;
    const effectiveDonation = isDonating ? currentDonation : 0;
    const total = subtotal + delivery + effectiveDonation;

    // Update Header and summary text labels
    const cartHeaderCount = document.getElementById('cartHeaderCount');
    const badgeCount = document.getElementById('badgeCount');
    const subtotalLabel = document.getElementById('subtotalLabel');
    const donationRow = document.getElementById('donationRow');
    const donationLabel = document.getElementById('donationAmountLabel');
    const totalLabel = document.getElementById('totalAmountLabel');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cartHeaderCount) cartHeaderCount.innerText = `${totalItemsCount} farm-direct items ready for dispatch`;
    if (badgeCount) badgeCount.innerText = `${totalItemsCount} Items`;
    if (subtotalLabel) subtotalLabel.innerText = `Rs. ${subtotal.toLocaleString()}`;

    if (donationRow) {
      donationRow.style.display = (isDonating && currentDonation > 0) ? 'flex' : 'none';
    }
    if (donationLabel) {
      donationLabel.innerText = 'Rs. ' + currentDonation.toLocaleString();
    }
    if (totalLabel) {
      totalLabel.innerText = 'Rs. ' + total.toLocaleString();
    }

    // Handle empty cart state visually if needed
    if (cartItems.length === 0) {
      if (cartListContainer) {
        cartListContainer.innerHTML = `
          <div class="bg-surface-container-lowest rounded-xl p-space-lg text-center space-y-space-sm shadow-sm">
            <span class="material-symbols-outlined text-[48px] text-outline">shopping_bag</span>
            <h2 class="font-headline-sm text-headline-sm text-on-surface">Your basket is empty</h2>
            <p class="font-body-sm text-body-sm text-on-surface-variant">Explore local farms to add fresh harvest items.</p>
          </div>
        `;
      }
      if (checkoutBtn) {
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    } else {
      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }
  }

  // Bind Cart Interactions using Event Delegation on the Cart List Container
  if (cartListContainer) {
    // Clean up any old listeners by cloning or direct assignment
    cartListContainer.onclick = (e) => {
      const item = e.target.closest('.cart-item');
      if (!item) return;

      const qtySpan = item.querySelector('.item-qty');
      const minusBtn = e.target.closest('.qty-minus');
      const plusBtn = e.target.closest('.qty-plus');
      const deleteBtn = e.target.closest('.item-delete');

      // Decrease quantity
      if (minusBtn && qtySpan) {
        let qty = parseInt(qtySpan.innerText, 10);
        if (qty > 1) {
          qtySpan.innerText = qty - 1;
          updateTotals();
        } else {
          item.remove();
          updateTotals();
        }
      }

      // Increase quantity
      if (plusBtn && qtySpan) {
        let qty = parseInt(qtySpan.innerText, 10);
        qtySpan.innerText = qty + 1;
        updateTotals();
      }

      // Delete item completely
      if (deleteBtn) {
        item.remove();
        updateTotals();
      }

      // Click quantity number to type custom value
      if (e.target.classList.contains('item-qty') && qtySpan) {
        const currentVal = qtySpan.innerText;
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.value = currentVal;
        input.className = 'w-12 text-center font-label-lg text-label-lg bg-surface text-on-surface rounded border border-primary focus:outline-none';
        
        qtySpan.replaceWith(input);
        input.focus();
        input.select();

        const saveInput = () => {
          let newVal = parseInt(input.value, 10);
          if (isNaN(newVal) || newVal < 1) newVal = 1;
          
          qtySpan.innerText = newVal;
          input.replaceWith(qtySpan);
          updateTotals();
        };

        input.onblur = saveInput;
        input.onkeydown = (ev) => {
          if (ev.key === 'Enter') saveInput();
        };
      }
    };
  }

  // Set selected donation pill
  function setDonation(amount, btnElement) {
    if (amount === 'custom') {
      customContainer?.classList.remove('hidden');
      customInput?.focus();
      const val = parseInt(customInput?.value, 10);
      currentDonation = (!isNaN(val) && val > 0) ? val : 0;
    } else {
      customContainer?.classList.add('hidden');
      currentDonation = parseInt(amount, 10);
    }

    donationButtons.forEach(b => {
      b.classList.remove('bg-primary-container', 'text-on-primary', 'shadow-sm', 'active-btn');
      b.classList.add('bg-surface-container-low', 'text-on-surface');
    });

    btnElement.classList.add('bg-primary-container', 'text-on-primary', 'shadow-sm', 'active-btn');
    btnElement.classList.remove('bg-surface-container-low', 'text-on-surface');

    if (donationToggle && !donationToggle.checked) {
      donationToggle.checked = true;
    }

    updateTotals();
  }

  donationButtons.forEach(btn => {
    btn.onclick = () => {
      const amount = btn.getAttribute('data-amount');
      setDonation(amount, btn);
    };
  });

  if (customInput) {
    customInput.oninput = () => {
      const val = parseInt(customInput.value, 10);
      currentDonation = (!isNaN(val) && val > 0) ? val : 0;
      updateTotals();
    };
  }

  if (donationToggle) {
    donationToggle.onchange = updateTotals;
  }

  updateTotals();
}

// Run on initial fresh page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Run when navigating between tabs dynamically via your router
document.addEventListener('pageLoaded', init);