function init() {

  const appContent = document.getElementById('app-content');
  if (appContent) {
    appContent.classList.add('page-transitioning');
    requestAnimationFrame(() => {
      appContent.classList.remove('page-transitioning');
    });
  }

  
  const harvestForm = document.getElementById('harvestForm');
  const photoBox = document.getElementById('photoBox');
  const photoInput = document.getElementById('photoInput');
  const photoPreview = document.getElementById('photoPreviewOverlay');
  const previewImg = document.getElementById('previewImg');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const selectedCategoryInput = document.getElementById('selectedCategory');

  // Handle Category Picker
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      categoryButtons.forEach(btn => {
        btn.className = 'category-btn py-2.5 px-3 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md text-label-md flex flex-col items-center justify-center gap-1 hover:bg-surface-container transition-all';
      });
      button.className = 'category-btn py-2.5 px-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md flex flex-col items-center justify-center gap-1 transition-all shadow-sm';
      if (selectedCategoryInput) {
        selectedCategoryInput.value = button.getAttribute('data-category');
      }
    });
  });

  // Handle Photo Attachment
  if (photoBox && photoInput) {
    photoBox.onclick = () => photoInput.click();
    
    photoInput.onchange = () => {
      const [file] = photoInput.files;
      if (!file) return;
      if (previewImg) previewImg.src = URL.createObjectURL(file);
      if (photoPreview) photoPreview.classList.remove('hidden');
    };
  }

  // Handle Form Submission
  if (harvestForm) {
    harvestForm.onsubmit = (e) => {
      e.preventDefault();
      
      const cropInput = document.getElementById('cropName');
      const qtyInput = document.getElementById('quantityInput');
      const priceInput = document.getElementById('priceInput');
      const locInput = document.getElementById('locationInput');

      if (!cropInput || !qtyInput || !priceInput) return;

      const crop = cropInput.value.trim();
      const qty = qtyInput.value;
      const price = priceInput.value;
      const loc = locInput ? locInput.value.trim() : '';

      if (!crop || !qty || !price) return;

      const btn = document.getElementById('publishBtn');
      if (!btn) return;

      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="material-symbols-outlined text-[22px] animate-spin">refresh</span> Listing on GoviDirect...';
      btn.disabled = true;

      setTimeout(() => {
        const feed = document.getElementById('listingsFeed');
        const count = document.getElementById('listingCount');

        if (feed) {
          const newCard = document.createElement('div');
          newCard.className = 'bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md';
          newCard.innerHTML = `
            <div class="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center text-primary-container">
              <span class="material-symbols-outlined text-[28px]">eco</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-1 mb-0.5">
                <h3 class="font-label-lg text-label-lg text-on-surface font-bold truncate">${crop}</h3>
                <span class="shrink-0 px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm font-bold">Just Listed</span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant truncate">${qty} kg listed • ${loc || 'Direct Farm'}</p>
              <div class="flex items-center justify-between mt-1">
                <span class="font-headline-sm text-headline-sm text-primary-container font-bold">Rs. ${price} <span class="font-label-sm text-label-sm font-normal text-on-surface-variant">/ kg</span></span>
              </div>
            </div>
          `;
          feed.prepend(newCard);
        }

        if (count) {
          count.textContent = parseInt(count.textContent || '2', 10) + 1;
        }

        // Reset form inputs
        cropInput.value = '';
        qtyInput.value = '';
        priceInput.value = '';
        if (locInput) locInput.value = '';
        if (photoPreview) photoPreview.classList.add('hidden');

        btn.innerHTML = '<span class="material-symbols-outlined text-[22px]">check</span> Published Successfully!';
        btn.classList.remove('bg-primary-container');
        btn.classList.add('bg-surface-tint');

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('bg-surface-tint');
          btn.classList.add('bg-primary-container');
          btn.disabled = false;
        }, 2000);
      }, 600);
    };
  }
}

// Run on initial fresh page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Run when navigating between tabs dynamically
document.addEventListener('pageLoaded', init);
