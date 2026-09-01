/**
 * ==============================================================================
 * SERVICES CATALOG LOGIC (services.js)
 * ==============================================================================
 */

let allServices = [];
let allCategories = [];
let activeCategory = 'all';

async function initServicesPage() {
  const container = document.getElementById('services-grid');
  const catContainer = document.getElementById('category-filter-bar');
  const searchInput = document.getElementById('service-search-input');

  if (!container) return;

  // Check URL parameters for default category
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  if (initialCategory) activeCategory = initialCategory;

  try {
    // Load Categories & Services
    [allCategories, allServices] = await Promise.all([
      window.SalonDB.getCategories(),
      window.SalonDB.getServices()
    ]);

    renderCategoryFilters(catContainer);
    filterAndRenderServices();

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        filterAndRenderServices();
      });
    }
  } catch (error) {
    console.error('Error loading services:', error);
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-stone-500">
        <p class="text-lg">Failed to load services. Please check your connection.</p>
      </div>
    `;
  }
}

function renderCategoryFilters(container) {
  if (!container) return;

  const categories = [
    { slug: 'all', name: 'All Services' },
    ...allCategories
  ];

  container.innerHTML = categories.map(cat => {
    const isSelected = activeCategory === cat.slug;
    return `
      <button 
        type="button"
        onclick="selectCategory('${cat.slug}')"
        class="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
          isSelected 
            ? 'bg-[#C59B8E] text-white shadow-md shadow-rose-900/10' 
            : 'bg-white text-stone-600 hover:bg-[#F7EDE8] hover:text-[#99685B] border border-stone-200/80'
        }"
      >
        ${cat.name}
      </button>
    `;
  }).join('');
}

function selectCategory(slug) {
  activeCategory = slug;
  const catContainer = document.getElementById('category-filter-bar');
  renderCategoryFilters(catContainer);
  filterAndRenderServices();
}

function filterAndRenderServices() {
  const container = document.getElementById('services-grid');
  const searchInput = document.getElementById('service-search-input');
  const countBadge = document.getElementById('services-count');
  
  if (!container) return;

  const searchQuery = (searchInput ? searchInput.value : '').toLowerCase().trim();

  let filtered = allServices.filter(service => {
    // Category match
    const categoryMatch = activeCategory === 'all' || 
      (service.service_categories && service.service_categories.slug === activeCategory) ||
      (service.category_id && allCategories.find(c => c.slug === activeCategory && c.id === service.category_id));

    // Search query match
    const searchMatch = !searchQuery || 
      service.name.toLowerCase().includes(searchQuery) || 
      (service.description && service.description.toLowerCase().includes(searchQuery));

    return categoryMatch && searchMatch;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} service${filtered.length === 1 ? '' : 's'} available`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-16 bg-white/60 rounded-3xl border border-dashed border-stone-200">
        <span class="text-4xl mb-3 block">🌿</span>
        <h3 class="text-xl font-serif text-stone-800 font-medium">No treatments found</h3>
        <p class="text-stone-500 text-sm mt-1">Try refining your search query or selecting a different category tab.</p>
        <button onclick="selectCategory('all'); if(document.getElementById('service-search-input')) document.getElementById('service-search-input').value='';" class="mt-4 px-4 py-2 text-xs font-semibold rounded-full bg-[#F7EDE8] text-[#99685B] hover:bg-[#EED8CF]">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(service => {
    const imageUrl = service.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
    return `
      <div class="bg-white rounded-3xl overflow-hidden border border-stone-100/80 shadow-soft card-hover flex flex-col group">
        <div class="relative h-56 overflow-hidden bg-stone-100">
          <img 
            src="${imageUrl}" 
            alt="${service.name}"
            loading="lazy" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          ${service.is_popular ? `
            <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#99685B] shadow-sm flex items-center gap-1">
              <span>✨</span> Popular
            </span>
          ` : ''}
          <span class="absolute bottom-3 right-3 bg-stone-900/75 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <span>⏱️</span> ${formatDuration(service.duration_minutes)}
          </span>
        </div>

        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-xl font-serif font-semibold text-stone-900 mb-2 leading-tight group-hover:text-[#99685B] transition-colors">
              ${service.name}
            </h3>
            <p class="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-3">
              ${service.description || 'Pamper yourself with our specialized luxury treatment tailored to rejuvenate and refresh.'}
            </p>
          </div>

          <div class="pt-4 border-t border-stone-100 flex items-center justify-between mt-auto">
            <div>
              <span class="text-xs text-stone-400 block font-medium">Treatment Price</span>
              <span class="text-lg font-bold text-stone-900">${formatPKR(service.price)}</span>
            </div>
            <a 
              href="booking.html?service=${service.id}"
              class="px-5 py-2.5 rounded-full btn-primary text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Book Now</span>
              <span class="text-base leading-none">→</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', initServicesPage);
