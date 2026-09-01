/**
 * ==============================================================================
 * GALLERY & LIGHTBOX CONTROLLER (gallery.js)
 * ==============================================================================
 */

const GALLERY_ITEMS = [
  {
    id: 1,
    category: 'transformations',
    title: 'Ash Blonde Balayage & Gloss Transformation',
    caption: 'Seamless dimensional highlights with bond-protecting gloss treatment.',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=80',
    tag: 'Hair Transformation'
  },
  {
    id: 2,
    category: 'bridal',
    title: 'Royal Barat Bride HD Airbrush Glam',
    caption: 'Traditional crimson and gold bridal look with handcrafted floral jewelry setting.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    tag: 'Bridal Couture'
  },
  {
    id: 3,
    category: 'ambience',
    title: 'Serene Sanctuary VIP Treatment Suite',
    caption: 'Private aromatherapy suites with custom organic tea station in Karachi.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    tag: 'Spa Ambience'
  },
  {
    id: 4,
    category: 'hair',
    title: 'Voluminous Butterfly Layers & Bouncy Blowdry',
    caption: 'Precision texturizing cut creating effortless movement and volume.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80',
    tag: 'Hair Artistry'
  },
  {
    id: 5,
    category: 'nails',
    title: 'Glazed Donut Chrome Russian Manicure',
    caption: 'Long-lasting BIAB builder gel with pearlescent chrome powder finish.',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80',
    tag: 'Nail Art'
  },
  {
    id: 6,
    category: 'skin',
    title: 'HydraGlow Red Carpet Skin Rejuvenation',
    caption: 'Instant plump, high-hydration glow after 7-step medical facial.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    tag: 'Skin Aesthetics'
  },
  {
    id: 7,
    category: 'bridal',
    title: 'Soft Romantic Nikkah Glam',
    caption: 'Dewy glass skin, champagne soft shimmer eyes and loose textured waves.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    tag: 'Bridal Couture'
  },
  {
    id: 8,
    category: 'ambience',
    title: 'Luxury Hair & Color Lounge',
    caption: 'Ergonomic wash basins with shiatsu massage for the ultimate pampering.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
    tag: 'Interior'
  },
  {
    id: 9,
    category: 'spa',
    title: 'Hot Stone & Himalayan Salt Therapy Suite',
    caption: 'Warm volcanic stones paired with organic botanical essential oils.',
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80',
    tag: 'Wellness'
  }
];

let activeGalleryFilter = 'all';
let currentLightboxIndex = 0;
let filteredGallery = [...GALLERY_ITEMS];

function initGallery() {
  renderGalleryGrid();
  setupLightboxEvents();
}

function filterGallery(category) {
  activeGalleryFilter = category;
  
  // Update filter buttons
  const buttons = document.querySelectorAll('.gallery-filter-btn');
  buttons.forEach(btn => {
    if (btn.dataset.category === category) {
      btn.className = 'gallery-filter-btn px-5 py-2.5 rounded-full text-sm font-medium transition-all bg-[#C59B8E] text-white shadow-md';
    } else {
      btn.className = 'gallery-filter-btn px-5 py-2.5 rounded-full text-sm font-medium transition-all bg-white text-stone-600 hover:bg-[#F7EDE8] hover:text-[#99685B] border border-stone-200';
    }
  });

  renderGalleryGrid();
}

function renderGalleryGrid() {
  const container = document.getElementById('gallery-grid');
  if (!container) return;

  filteredGallery = activeGalleryFilter === 'all' 
    ? GALLERY_ITEMS 
    : GALLERY_ITEMS.filter(item => item.category === activeGalleryFilter);

  container.innerHTML = filteredGallery.map((item, index) => {
    return `
      <div 
        onclick="openLightbox(${index})"
        class="group relative cursor-pointer overflow-hidden rounded-3xl bg-stone-100 shadow-soft card-hover aspect-[4/5]"
      >
        <img 
          src="${item.image}" 
          alt="${item.title}"
          loading="lazy" 
          class="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
        />
        
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300"></div>

        <!-- Content -->
        <div class="absolute inset-0 p-6 flex flex-col justify-between">
          <div>
            <span class="inline-block bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/30">
              ${item.tag}
            </span>
          </div>

          <div class="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <h4 class="text-white font-serif text-lg md:text-xl font-semibold leading-snug drop-shadow-sm">
              ${item.title}
            </h4>
            <p class="text-white/80 text-xs mt-1 line-clamp-2">
              ${item.caption}
            </p>
            <span class="inline-flex items-center gap-1 text-[#DCB8AA] text-xs font-semibold mt-3">
              <span>View Full Photo</span>
              <span>🔍</span>
            </span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ------------------------------------------------------------------------------
// LIGHTBOX MODAL HANDLERS
// ------------------------------------------------------------------------------
function openLightbox(index) {
  currentLightboxIndex = index;
  updateLightboxContent();
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightbox-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

function prevLightboxImage() {
  if (currentLightboxIndex > 0) {
    currentLightboxIndex--;
  } else {
    currentLightboxIndex = filteredGallery.length - 1;
  }
  updateLightboxContent();
}

function nextLightboxImage() {
  if (currentLightboxIndex < filteredGallery.length - 1) {
    currentLightboxIndex++;
  } else {
    currentLightboxIndex = 0;
  }
  updateLightboxContent();
}

function updateLightboxContent() {
  const item = filteredGallery[currentLightboxIndex];
  if (!item) return;

  const img = document.getElementById('lightbox-image');
  const title = document.getElementById('lightbox-title');
  const caption = document.getElementById('lightbox-caption');
  const counter = document.getElementById('lightbox-counter');

  if (img) img.src = item.image;
  if (title) title.textContent = item.title;
  if (caption) caption.textContent = item.caption;
  if (counter) counter.textContent = `${currentLightboxIndex + 1} / ${filteredGallery.length}`;
}

function setupLightboxEvents() {
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('lightbox-modal');
    if (modal && !modal.classList.contains('hidden')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevLightboxImage();
      if (e.key === 'ArrowRight') nextLightboxImage();
    }
  });
}

document.addEventListener('DOMContentLoaded', initGallery);
