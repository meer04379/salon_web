/**
 * ==============================================================================
 * ADMIN MANAGEMENT PORTAL (admin.js)
 * Live Bookings, Services CRUD, Staff Roster, Salon Settings & Analytics
 * ==============================================================================
 */

const AdminState = {
  isAuthenticated: false,
  currentUser: null,
  activeTab: 'dashboard',
  bookings: [],
  services: [],
  categories: [],
  staff: [],
  settings: null,
  bookingFilterStatus: 'all',
  bookingFilterDate: '',
  bookingSearchQuery: ''
};

// ------------------------------------------------------------------------------
// INITIALIZATION & AUTHENTICATION
// ------------------------------------------------------------------------------
async function initAdminPanel() {
  checkAuthSession();

  // Bind login form
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }

  // Bind settings form
  const settingsForm = document.getElementById('salon-settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', handleSaveSettings);
  }

  // Bind service modal form
  const serviceForm = document.getElementById('service-modal-form');
  if (serviceForm) {
    serviceForm.addEventListener('submit', handleSaveService);
  }

  // Bind staff modal form
  const staffForm = document.getElementById('staff-modal-form');
  if (staffForm) {
    staffForm.addEventListener('submit', handleSaveStaff);
  }
}

function checkAuthSession() {
  const sessionUser = sessionStorage.getItem('salon_admin_user');
  if (sessionUser) {
    AdminState.isAuthenticated = true;
    AdminState.currentUser = JSON.parse(sessionUser);
    showAdminDashboard();
  } else {
    showLoginScreen();
  }
}

function showLoginScreen() {
  document.getElementById('admin-auth-view')?.classList.remove('hidden');
  document.getElementById('admin-dashboard-view')?.classList.add('hidden');
}

async function showAdminDashboard() {
  document.getElementById('admin-auth-view')?.classList.add('hidden');
  document.getElementById('admin-dashboard-view')?.classList.remove('hidden');

  const adminEmailDisplay = document.getElementById('admin-user-email');
  if (adminEmailDisplay && AdminState.currentUser) {
    adminEmailDisplay.textContent = AdminState.currentUser.email || 'Salon Manager';
  }

  await reloadAllAdminData();
  setupRealtimeSubscription();
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const loginBtn = document.getElementById('login-btn');

  loginBtn.disabled = true;
  loginBtn.innerHTML = 'Signing in...';

  try {
    if (window.SalonDB.isLive && window.SalonDB.client) {
      const { data, error } = await window.SalonDB.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      AdminState.currentUser = { email: data.user.email, id: data.user.id };
    } else {
      // Demo / Local Mode fallback
      if (password === 'admin123' || password === 'salon2026' || email.includes('admin')) {
        AdminState.currentUser = { email: email || 'admin@serenesalon.pk', role: 'owner' };
      } else {
        throw new Error('Invalid demo credentials. Use password "admin123" for preview.');
      }
    }

    sessionStorage.setItem('salon_admin_user', JSON.stringify(AdminState.currentUser));
    AdminState.isAuthenticated = true;
    showToast('Welcome back to Salon Management!', 'success');
    showAdminDashboard();
  } catch (err) {
    showToast(err.message || 'Login failed', 'error');
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = 'Access Portal →';
  }
}

function loginDemoMode() {
  AdminState.currentUser = { email: 'demo.owner@serenesalon.pk', role: 'owner' };
  sessionStorage.setItem('salon_admin_user', JSON.stringify(AdminState.currentUser));
  AdminState.isAuthenticated = true;
  showToast('Logged in as Demo Administrator', 'success');
  showAdminDashboard();
}

function handleLogout() {
  if (window.SalonDB.isLive && window.SalonDB.client) {
    window.SalonDB.client.auth.signOut();
  }
  sessionStorage.removeItem('salon_admin_user');
  AdminState.isAuthenticated = false;
  AdminState.currentUser = null;
  showLoginScreen();
  showToast('Logged out successfully', 'info');
}

// ------------------------------------------------------------------------------
// DATA LOADING & REALTIME
// ------------------------------------------------------------------------------
async function reloadAllAdminData() {
  try {
    [
      AdminState.bookings,
      AdminState.services,
      AdminState.categories,
      AdminState.staff,
      AdminState.settings
    ] = await Promise.all([
      window.SalonDB.getAllBookingsAdmin(),
      window.SalonDB.getAllServicesAdmin(),
      window.SalonDB.getCategories(),
      window.SalonDB.getAllStaffAdmin(),
      window.SalonDB.getSettings()
    ]);

    renderDashboardStats();
    renderBookingsTable();
    renderServicesTable();
    renderStaffCards();
    populateSettingsForm();
  } catch (err) {
    console.error('Error reloading admin data:', err);
    showToast('Failed to load dashboard records.', 'error');
  }
}

function setupRealtimeSubscription() {
  if (window.SalonDB.isLive && window.SalonDB.client) {
    try {
      window.SalonDB.client
        .channel('admin-bookings-channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, payload => {
          showToast(`🔔 New Appointment Booked: ${payload.new.customer_name} (${payload.new.service_name})`, 'success', 6000);
          reloadAllAdminData();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription notice:', e);
    }
  }
}

// ------------------------------------------------------------------------------
// TAB SWITCHING
// ------------------------------------------------------------------------------
function switchAdminTab(tabName) {
  AdminState.activeTab = tabName;

  const tabs = ['dashboard', 'bookings', 'services', 'staff', 'settings'];
  tabs.forEach(t => {
    const view = document.getElementById(`tab-content-${t}`);
    const navBtn = document.getElementById(`tab-btn-${t}`);

    if (view) {
      if (t === tabName) view.classList.remove('hidden');
      else view.classList.add('hidden');
    }

    if (navBtn) {
      if (t === tabName) {
        navBtn.className = 'admin-tab-btn active px-4 py-2.5 rounded-xl font-semibold text-sm bg-[#C59B8E] text-white shadow-sm flex items-center gap-2';
      } else {
        navBtn.className = 'admin-tab-btn px-4 py-2.5 rounded-xl font-medium text-sm text-stone-600 hover:bg-[#F7EDE8] hover:text-[#99685B] flex items-center gap-2';
      }
    }
  });
}

// ------------------------------------------------------------------------------
// 1. DASHBOARD OVERVIEW & STATS
// ------------------------------------------------------------------------------
function renderDashboardStats() {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Today's Bookings
  const todayBookings = AdminState.bookings.filter(b => b.booking_date === todayStr && b.status !== 'cancelled');
  const todayEl = document.getElementById('stat-today-count');
  if (todayEl) todayEl.textContent = todayBookings.length;

  // Estimated Weekly Revenue
  const totalRevenue = AdminState.bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
  const revEl = document.getElementById('stat-revenue-total');
  if (revEl) revEl.textContent = formatPKR(totalRevenue);

  // Active Services
  const activeSrvCount = AdminState.services.filter(s => s.is_active !== false).length;
  const srvEl = document.getElementById('stat-services-count');
  if (srvEl) srvEl.textContent = activeSrvCount;

  // Active Staff
  const staffCount = AdminState.staff.filter(s => s.is_active !== false).length;
  const staffEl = document.getElementById('stat-staff-count');
  if (staffEl) staffEl.textContent = staffCount;

  // Render Recent Bookings Widget on Dashboard
  const recentTable = document.getElementById('dashboard-recent-bookings');
  if (recentTable) {
    const recent5 = AdminState.bookings.slice(0, 5);
    if (recent5.length === 0) {
      recentTable.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-stone-400 text-sm">No bookings recorded yet. New appointments will appear here.</td></tr>`;
    } else {
      recentTable.innerHTML = recent5.map(b => `
        <tr class="border-b border-stone-100 hover:bg-stone-50/60 transition-colors text-xs md:text-sm">
          <td class="py-3 px-4 font-mono font-medium text-stone-700">${b.booking_ref}</td>
          <td class="py-3 px-4 font-medium text-stone-900">${b.customer_name}<span class="block text-xs text-stone-400 font-normal">${b.customer_phone}</span></td>
          <td class="py-3 px-4 text-stone-700">${b.service_name}</td>
          <td class="py-3 px-4 text-stone-600">${b.booking_date} • ${b.start_time ? b.start_time.slice(0, 5) : ''}</td>
          <td class="py-3 px-4">${renderStatusBadge(b.status)}</td>
        </tr>
      `).join('');
    }
  }
}

function renderStatusBadge(status) {
  const map = {
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
  };
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Confirmed';
  const cls = map[status] || 'bg-stone-50 text-stone-700 border-stone-200';
  return `<span class="px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}">${label}</span>`;
}

// ------------------------------------------------------------------------------
// 2. BOOKINGS TAB & MANAGEMENT
// ------------------------------------------------------------------------------
function filterBookings(status) {
  AdminState.bookingFilterStatus = status;
  
  const pills = document.querySelectorAll('.booking-filter-pill');
  pills.forEach(p => {
    if (p.dataset.status === status) {
      p.className = 'booking-filter-pill px-4 py-1.5 rounded-full text-xs font-semibold bg-[#C59B8E] text-white';
    } else {
      p.className = 'booking-filter-pill px-4 py-1.5 rounded-full text-xs font-medium bg-white text-stone-600 border border-stone-200 hover:bg-stone-50';
    }
  });

  renderBookingsTable();
}

function handleBookingSearch(e) {
  AdminState.bookingSearchQuery = e.target.value.toLowerCase().trim();
  renderBookingsTable();
}

function handleBookingDateFilter(e) {
  AdminState.bookingFilterDate = e.target.value;
  renderBookingsTable();
}

function renderBookingsTable() {
  const container = document.getElementById('admin-bookings-tbody');
  if (!container) return;

  let filtered = AdminState.bookings.filter(b => {
    const matchStatus = AdminState.bookingFilterStatus === 'all' || b.status === AdminState.bookingFilterStatus;
    const matchDate = !AdminState.bookingFilterDate || b.booking_date === AdminState.bookingFilterDate;
    
    const query = AdminState.bookingSearchQuery;
    const matchQuery = !query || 
      (b.customer_name && b.customer_name.toLowerCase().includes(query)) ||
      (b.customer_phone && b.customer_phone.toLowerCase().includes(query)) ||
      (b.booking_ref && b.booking_ref.toLowerCase().includes(query)) ||
      (b.service_name && b.service_name.toLowerCase().includes(query));

    return matchStatus && matchDate && matchQuery;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<tr><td colspan="7" class="py-12 text-center text-stone-400">No appointments found matching your filter criteria.</td></tr>`;
    return;
  }

  container.innerHTML = filtered.map(b => `
    <tr class="border-b border-stone-100 hover:bg-stone-50/70 transition-colors text-sm">
      <td class="py-3 px-4 font-mono font-semibold text-stone-800">${b.booking_ref}</td>
      <td class="py-3 px-4">
        <div class="font-medium text-stone-900">${b.customer_name}</div>
        <div class="text-xs text-stone-500">${b.customer_phone} ${b.customer_email ? `• ${b.customer_email}` : ''}</div>
      </td>
      <td class="py-3 px-4">
        <div class="text-stone-900 font-medium">${b.service_name}</div>
        <div class="text-xs text-[#99685B] font-semibold">${formatPKR(b.total_price)}</div>
      </td>
      <td class="py-3 px-4 text-stone-600 text-xs">
        ${b.staff_name || 'Any Specialist'}
      </td>
      <td class="py-3 px-4 text-stone-700 text-xs">
        <span class="font-semibold">${b.booking_date}</span>
        <span class="block text-stone-400">${b.start_time ? b.start_time.slice(0, 5) : ''} - ${b.end_time ? b.end_time.slice(0, 5) : ''}</span>
      </td>
      <td class="py-3 px-4">
        ${renderStatusBadge(b.status)}
      </td>
      <td class="py-3 px-4 text-right">
        <div class="inline-flex items-center gap-1.5">
          ${b.status !== 'completed' ? `
            <button 
              onclick="changeBookingStatus('${b.id}', 'completed')" 
              title="Mark Completed" 
              class="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold"
            >✓ Done</button>
          ` : ''}
          ${b.status !== 'cancelled' ? `
            <button 
              onclick="changeBookingStatus('${b.id}', 'cancelled')" 
              title="Cancel Appointment" 
              class="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold"
            >✕</button>
          ` : ''}
          <button 
            onclick="openWhatsApp('Hello ${encodeURIComponent(b.customer_name)}, regarding your appointment (${b.booking_ref}) at Serene Sanctuary Salon...')" 
            title="Chat on WhatsApp" 
            class="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 text-xs"
          >💬</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function changeBookingStatus(bookingId, status) {
  try {
    await window.SalonDB.updateBookingStatus(bookingId, status);
    showToast(`Appointment status updated to ${status}`, 'success');
    await reloadAllAdminData();
  } catch (err) {
    showToast('Failed to update status: ' + err.message, 'error');
  }
}

// ------------------------------------------------------------------------------
// 3. SERVICES MANAGEMENT (CRUD)
// ------------------------------------------------------------------------------
function renderServicesTable() {
  const container = document.getElementById('admin-services-tbody');
  if (!container) return;

  container.innerHTML = AdminState.services.map(s => {
    const cat = AdminState.categories.find(c => c.id === s.category_id);
    const catName = cat ? cat.name : (s.service_categories ? s.service_categories.name : 'General');
    return `
      <tr class="border-b border-stone-100 hover:bg-stone-50/70 transition-colors text-sm">
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            <img src="${s.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=150&q=80'}" class="w-10 h-10 rounded-xl object-cover" />
            <div>
              <div class="font-semibold text-stone-900">${s.name}</div>
              <div class="text-xs text-stone-400 line-clamp-1">${s.description || ''}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-medium text-stone-600">${catName}</td>
        <td class="py-3 px-4 font-semibold text-stone-900">${formatPKR(s.price)}</td>
        <td class="py-3 px-4 text-xs text-stone-500">${formatDuration(s.duration_minutes)}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${s.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}">
            ${s.is_active !== false ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td class="py-3 px-4 text-right">
          <button onclick="openEditServiceModal('${s.id}')" class="px-3 py-1 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 mr-1">Edit</button>
          <button onclick="confirmDeleteService('${s.id}')" class="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddServiceModal() {
  const form = document.getElementById('service-modal-form');
  if (form) form.reset();
  document.getElementById('service-modal-id').value = '';
  document.getElementById('service-modal-title').textContent = 'Add New Treatment';
  populateServiceCategorySelect();
  document.getElementById('service-modal').classList.remove('hidden');
}

function openEditServiceModal(serviceId) {
  const service = AdminState.services.find(s => s.id === serviceId);
  if (!service) return;

  populateServiceCategorySelect();
  document.getElementById('service-modal-id').value = service.id;
  document.getElementById('service-name-input').value = service.name;
  document.getElementById('service-category-input').value = service.category_id || '';
  document.getElementById('service-price-input').value = service.price;
  document.getElementById('service-duration-input').value = service.duration_minutes;
  document.getElementById('service-image-input').value = service.image_url || '';
  document.getElementById('service-description-input').value = service.description || '';
  document.getElementById('service-popular-input').checked = Boolean(service.is_popular);

  document.getElementById('service-modal-title').textContent = 'Edit Treatment';
  document.getElementById('service-modal').classList.remove('hidden');
}

function closeServiceModal() {
  document.getElementById('service-modal')?.classList.add('hidden');
}

function populateServiceCategorySelect() {
  const select = document.getElementById('service-category-input');
  if (!select) return;

  select.innerHTML = AdminState.categories.map(c => `
    <option value="${c.id}">${c.name}</option>
  `).join('');
}

async function handleSaveService(e) {
  e.preventDefault();
  const id = document.getElementById('service-modal-id').value;
  const name = document.getElementById('service-name-input').value.trim();
  const category_id = document.getElementById('service-category-input').value;
  const price = Number(document.getElementById('service-price-input').value);
  const duration_minutes = Number(document.getElementById('service-duration-input').value);
  const image_url = document.getElementById('service-image-input').value.trim();
  const description = document.getElementById('service-description-input').value.trim();
  const is_popular = document.getElementById('service-popular-input').checked;

  try {
    const payload = {
      name,
      category_id,
      price,
      duration_minutes,
      image_url: image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      description,
      is_popular,
      is_active: true
    };
    if (id) payload.id = id;

    await window.SalonDB.saveService(payload);
    showToast('Service saved successfully!', 'success');
    closeServiceModal();
    await reloadAllAdminData();
  } catch (err) {
    showToast('Error saving service: ' + err.message, 'error');
  }
}

async function confirmDeleteService(serviceId) {
  if (confirm('Are you sure you want to delete this service?')) {
    try {
      await window.SalonDB.deleteService(serviceId);
      showToast('Service removed', 'info');
      await reloadAllAdminData();
    } catch (err) {
      showToast('Failed to delete service: ' + err.message, 'error');
    }
  }
}

// ------------------------------------------------------------------------------
// 4. STAFF MANAGEMENT
// ------------------------------------------------------------------------------
function renderStaffCards() {
  const container = document.getElementById('admin-staff-grid');
  if (!container) return;

  container.innerHTML = AdminState.staff.map(stf => `
    <div class="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
      <div class="flex items-start gap-4">
        <img src="${stf.avatar_url}" class="w-14 h-14 rounded-full object-cover border-2 border-stone-100" />
        <div class="flex-1">
          <h4 class="font-serif font-semibold text-stone-900 text-lg">${stf.name}</h4>
          <p class="text-xs text-stone-500">${stf.role_title}</p>
          <p class="text-xs text-[#99685B] font-medium mt-1">${stf.specialties || ''}</p>
        </div>
      </div>
      <div class="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
        <span class="px-2.5 py-0.5 rounded-full font-semibold ${stf.is_active !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'}">
          ${stf.is_active !== false ? 'Active Specialist' : 'On Leave'}
        </span>
        <button onclick="openEditStaffModal('${stf.id}')" class="px-3 py-1 font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200">Edit</button>
      </div>
    </div>
  `).join('');
}

function openAddStaffModal() {
  const form = document.getElementById('staff-modal-form');
  if (form) form.reset();
  document.getElementById('staff-modal-id').value = '';
  document.getElementById('staff-modal-title').textContent = 'Add Team Member';
  document.getElementById('staff-modal').classList.remove('hidden');
}

function openEditStaffModal(staffId) {
  const stf = AdminState.staff.find(s => s.id === staffId);
  if (!stf) return;

  document.getElementById('staff-modal-id').value = stf.id;
  document.getElementById('staff-name-input').value = stf.name;
  document.getElementById('staff-role-input').value = stf.role_title;
  document.getElementById('staff-specialties-input').value = stf.specialties || '';
  document.getElementById('staff-avatar-input').value = stf.avatar_url || '';
  document.getElementById('staff-bio-input').value = stf.bio || '';
  document.getElementById('staff-active-input').checked = stf.is_active !== false;

  document.getElementById('staff-modal-title').textContent = 'Edit Team Member';
  document.getElementById('staff-modal').classList.remove('hidden');
}

function closeStaffModal() {
  document.getElementById('staff-modal')?.classList.add('hidden');
}

async function handleSaveStaff(e) {
  e.preventDefault();
  const id = document.getElementById('staff-modal-id').value;
  const name = document.getElementById('staff-name-input').value.trim();
  const role_title = document.getElementById('staff-role-input').value.trim();
  const specialties = document.getElementById('staff-specialties-input').value.trim();
  const avatar_url = document.getElementById('staff-avatar-input').value.trim();
  const bio = document.getElementById('staff-bio-input').value.trim();
  const is_active = document.getElementById('staff-active-input').checked;

  try {
    const payload = {
      name,
      role_title,
      specialties,
      avatar_url: avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      bio,
      is_active
    };
    if (id) payload.id = id;

    await window.SalonDB.saveStaff(payload);
    showToast('Staff member profile updated!', 'success');
    closeStaffModal();
    await reloadAllAdminData();
  } catch (err) {
    showToast('Error saving staff: ' + err.message, 'error');
  }
}

// ------------------------------------------------------------------------------
// 5. SALON SETTINGS
// ------------------------------------------------------------------------------
function populateSettingsForm() {
  const s = AdminState.settings;
  if (!s) return;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined) el.value = val;
  };

  setVal('set-salon-name', s.salon_name);
  setVal('set-tagline', s.tagline);
  setVal('set-phone', s.phone);
  setVal('set-whatsapp', s.whatsapp);
  setVal('set-email', s.email);
  setVal('set-address', s.address);
  setVal('set-open-time', s.opening_time ? s.opening_time.slice(0, 5) : '11:00');
  setVal('set-close-time', s.closing_time ? s.closing_time.slice(0, 5) : '20:00');
  setVal('set-interval', s.slot_interval_minutes || 30);
  setVal('set-buffer', s.buffer_minutes || 15);
}

async function handleSaveSettings(e) {
  e.preventDefault();
  const getVal = (id) => document.getElementById(id)?.value.trim();

  const payload = {
    salon_name: getVal('set-salon-name'),
    tagline: getVal('set-tagline'),
    phone: getVal('set-phone'),
    whatsapp: getVal('set-whatsapp'),
    email: getVal('set-email'),
    address: getVal('set-address'),
    opening_time: getVal('set-open-time'),
    closing_time: getVal('set-close-time'),
    slot_interval_minutes: Number(getVal('set-interval')) || 30,
    buffer_minutes: Number(getVal('set-buffer')) || 15
  };

  try {
    await window.SalonDB.updateSettings(payload);
    showToast('Salon settings updated successfully!', 'success');
    await reloadAllAdminData();
  } catch (err) {
    showToast('Error updating settings: ' + err.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', initAdminPanel);
