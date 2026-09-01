/**
 * ==============================================================================
 * SHARED APPLICATION UTILITIES (app.js)
 * ==============================================================================
 */

// Format PKR Currency (e.g. Rs. 3,500)
function formatPKR(amount) {
  if (amount === undefined || amount === null) return 'Rs. 0';
  const num = Number(amount);
  return 'Rs. ' + num.toLocaleString('en-PK');
}

// Format Duration (e.g. "45 mins" or "1 hr 30 mins")
function formatDuration(minutes) {
  const mins = Number(minutes) || 0;
  if (mins < 60) return `${mins} mins`;
  const hrs = Math.floor(mins / 60);
  const remaining = mins % 60;
  return remaining > 0 ? `${hrs}h ${remaining}m` : `${hrs} hr${hrs > 1 ? 's' : ''}`;
}

// Toast Notification System
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  
  let iconHtml = '✨';
  if (type === 'success') iconHtml = '✅';
  if (type === 'error') iconHtml = '⚠️';

  toast.innerHTML = `
    <span class="text-xl flex-shrink-0">${iconHtml}</span>
    <div class="text-sm font-medium text-stone-800 flex-1 leading-snug">${message}</div>
    <button class="text-stone-400 hover:text-stone-700 ml-2 text-xs font-bold" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

// Mobile Menu Toggle Initializer
function initMobileNavigation() {
  const mobileToggle = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
    });
  }

  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  }
}

// Sticky Header Scroll Effect
function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('shadow-sm');
    } else {
      header.classList.remove('shadow-sm');
    }
  });
}

// Generate WhatsApp Direct Link
function openWhatsApp(message = "Hi! I'd like to inquire about booking an appointment at Serene Sanctuary Salon.") {
  const phone = '923009876543'; // Standard Karachi formatted WhatsApp
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initHeaderScroll();
});
