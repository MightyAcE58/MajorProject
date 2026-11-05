(() => {
  'use strict';

  // Bootstrap custom form validation
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });

  // Carousel navigation arrows
  document.addEventListener('DOMContentLoaded', () => {
    const arrowButtons = document.querySelectorAll('.carousel-arrow');
    arrowButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const carousel = document.getElementById(targetId);
        if (!carousel) return;

        const scrollAmount = 600;
        if (btn.classList.contains('prev-btn')) {
          carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
          carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      });
    });

    // Destination live search filter (if search input exists on index page)
    const searchWhereInput = document.getElementById('searchWhereInput');
    const expandedSearchBar = document.getElementById('expandedSearchBar');
    if (searchWhereInput) {
      searchWhereInput.addEventListener('input', () => {
        const query = searchWhereInput.value.trim().toLowerCase();
        filterListings(query);
      });

      if (expandedSearchBar) {
        expandedSearchBar.addEventListener('submit', (e) => {
          e.preventDefault();
          const query = searchWhereInput.value.trim().toLowerCase();
          filterListings(query);
        });
      }
    }

    // Category tab filter
    const categoryTabs = document.querySelectorAll('.nav-category-tab');
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        // Only prevent default if we're already on the listings page
        if (window.location.pathname.startsWith('/listings') && !window.location.pathname.includes('/new')) {
          e.preventDefault();
          categoryTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          const category = tab.getAttribute('data-category');
          if (category === 'all') {
            filterListings('');
          } else {
            filterListings(category);
          }
        }
      });
    });

    // Tax Pill Interactive Toggle
    const taxPill = document.getElementById('taxPill');
    if (taxPill) {
      taxPill.addEventListener('click', () => {
        const pillText = taxPill.querySelector('.pill-text');
        if (pillText) {
          if (pillText.textContent.includes('include all fees')) {
            pillText.textContent = 'Display total before taxes';
          } else {
            pillText.textContent = 'Prices include all fees';
          }
        }
      });
    }

    // Compact search bar on show page
    const compactBar = document.getElementById('compactSearchBar');
    const expandedBar = document.getElementById('expandedSearchBar');
    const isShowPage = document.querySelector('.airbnb-show-page');
    if (isShowPage && compactBar && expandedBar) {
      compactBar.classList.remove('d-none');
      expandedBar.classList.add('d-none');
    }
  });
})();

// Wishlist Heart Button Toggle
function toggleWishlist(event, btn) {
  event.preventDefault();
  event.stopPropagation();
  const icon = btn.querySelector('i');
  if (icon.classList.contains('fa-regular')) {
    icon.classList.remove('fa-regular');
    icon.classList.add('fa-solid');
    btn.classList.add('active');
  } else {
    icon.classList.remove('fa-solid');
    icon.classList.add('fa-regular');
    btn.classList.remove('active');
  }
}

// Client-side listings filtering
function filterListings(query) {
  const cards = document.querySelectorAll('.listing-card-wrapper');
  let matchedCount = 0;

  cards.forEach(card => {
    const location = card.getAttribute('data-location') || '';
    const title = card.getAttribute('data-title') || '';

    if (!query || location.includes(query) || title.includes(query)) {
      card.style.display = '';
      matchedCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Check section visibility
  const sections = document.querySelectorAll('.listings-section');
  sections.forEach(sec => {
    const visibleCards = sec.querySelectorAll('.listing-card-wrapper:not([style*="display: none"])');
    if (visibleCards.length === 0 && query !== '') {
      sec.style.display = 'none';
    } else {
      sec.style.display = '';
    }
  });

  const noResults = document.getElementById('noResultsNotice');
  if (noResults) {
    if (matchedCount === 0 && query !== '') {
      noResults.classList.remove('d-none');
    } else {
      noResults.classList.add('d-none');
    }
  }
}

function clearSearchFilter() {
  const input = document.getElementById('searchWhereInput');
  if (input) input.value = '';
  filterListings('');
}
