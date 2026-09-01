/**
 * ==============================================================================
 * SALON DEMO - SUPABASE CONFIGURATION & DATA LAYER
 * Beauty Salon & Spa (Karachi, Pakistan)
 * ==============================================================================
 * 
 * Instructions:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Run the SQL from `supabase-schema.sql` in your Supabase SQL Editor.
 * 3. Replace the placeholder values below with your Project URL and anon public key.
 * 4. If keys are left blank or invalid, the app automatically switches to an
 *    intelligent Demo/Local Storage mode so all features work flawlessly offline.
 */

// >>> INSERT YOUR SUPABASE CREDENTIALS HERE <<<
const SUPABASE_CONFIG = {
  url: 'https://tiftfpuqfafkqhqesmyd.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpZnRmcHVxZmFma3FocWVzbXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMjc4OTgsImV4cCI6MjEwMzYwMzg5OH0.dSqpvDtcPv2XZujhgehco-BvDUYhQpixmRL2CmqkGos'
};

// Initialize Supabase Client
let _supabaseClient = null;

function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_CONFIG.url && 
    SUPABASE_CONFIG.anonKey && 
    SUPABASE_CONFIG.url.startsWith('https://') &&
    SUPABASE_CONFIG.anonKey.length > 20 &&
    !SUPABASE_CONFIG.url.includes('YOUR_PROJECT_URL')
  );
}

if (typeof window !== 'undefined' && window.supabase && isSupabaseConfigured()) {
  try {
    _supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('✅ Supabase Client initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Could not initialize Supabase client:', err);
  }
}

/**
 * ==============================================================================
 * MOCK / DEFAULT FALLBACK DATA (For offline testing & immediate preview)
 * ==============================================================================
 */
const DEFAULT_SALON_SETTINGS = {
  salon_name: 'Serene Sanctuary Salon & Spa',
  tagline: 'Karachi’s Premier Destination for Luxury Hair, Skin & Bridal Transformations',
  phone: '+92 300 9876543',
  whatsapp: '+92 300 9876543',
  email: 'hello@serenesalon.pk',
  address: 'Plot 14-C, Main Khayaban-e-Shahbaz, Phase 6, D.H.A',
  city: 'Karachi',
  country: 'Pakistan',
  opening_time: '11:00',
  closing_time: '20:00',
  slot_interval_minutes: 30,
  buffer_minutes: 15,
  currency: 'PKR',
  currency_symbol: 'Rs.',
  hero_image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80'
};

const DEFAULT_CATEGORIES = [
  { id: 'cat-hair', name: 'Hair Styling & Treatments', slug: 'hair', description: 'Expert cuts, blowouts, organic keratin treatments & luxury balayage.', icon_name: 'scissors', display_order: 1 },
  { id: 'cat-skin', name: 'Skin & Advanced Facials', slug: 'skin', description: 'Dermatologist-approved HydraFacials, glow peels & deep cleansing.', icon_name: 'sparkles', display_order: 2 },
  { id: 'cat-nails', name: 'Nails, Mani & Pedi', slug: 'nails', description: 'Spa manicure, Russian pedicure, gel extensions and custom nail art.', icon_name: 'hand', display_order: 3 },
  { id: 'cat-bridal', name: 'Bridal & Party Makeup', slug: 'bridal', description: 'Signature bridal makeovers, Barat/Walima glams & engagement looks.', icon_name: 'crown', display_order: 4 },
  { id: 'cat-spa', name: 'Spa, Massage & Wellness', slug: 'spa', description: 'Aromatherapy massages, hot stone therapy, and body polishing rituals.', icon_name: 'flower', display_order: 5 },
  { id: 'cat-grooming', name: 'Waxing, Threading & Lashes', slug: 'grooming', description: 'Full body soothing wax, organic threading, lash lift & tint.', icon_name: 'eye', display_order: 6 }
];

const DEFAULT_SERVICES = [
  {
    id: 'srv-1',
    category_id: 'cat-hair',
    name: 'Signature Hair Cut & Blowdry',
    description: 'Personalized consultation, deep conditioning wash, master styling cut & bouncy blowdry finish.',
    price: 3500,
    duration_minutes: 45,
    image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
    is_popular: true,
    is_active: true
  },
  {
    id: 'srv-2',
    category_id: 'cat-hair',
    name: 'Organic Keratin Protein Infusion',
    description: 'Frizz-free, silky smooth hair revitalization with organic formaldehyde-free smoothing serum.',
    price: 14500,
    duration_minutes: 120,
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    is_popular: true,
    is_active: true
  },
  {
    id: 'srv-3',
    category_id: 'cat-hair',
    name: 'Sun-Kissed Balayage & Gloss',
    description: 'Seamless hand-painted highlights tailored to your skin tone, finished with a nourishing gloss toner.',
    price: 18000,
    duration_minutes: 150,
    image_url: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
    is_popular: false,
    is_active: true
  },
  {
    id: 'srv-4',
    category_id: 'cat-hair',
    name: 'Deep Moisture Scalp Spa & Mask',
    description: 'Revitalizing scalp massage, steam treatment and botanical oil mask for dry or damaged hair.',
    price: 4500,
    duration_minutes: 45,
    image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    is_popular: false,
    is_active: true
  },
  {
    id: 'srv-5',
    category_id: 'cat-skin',
    name: 'Serene HydraGlow Facial',
    description: '7-step medical-grade deep pore vacuum, ultrasonic extraction, hyaluronic infusion and LED therapy.',
    price: 8500,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    is_popular: true,
    is_active: true
  },
  {
    id: 'srv-6',
    category_id: 'cat-skin',
    name: '24K Gold Luxury Radiance Facial',
    description: 'Pure 24K gold foil infusion with brightening peptides for luminous, red-carpet ready skin.',
    price: 12000,
    duration_minutes: 75,
    image_url: 'https://images.unsplash.com/photo-1512290900672-1f5517f694e9?auto=format&fit=crop&w=800&q=80',
    is_popular: false,
    is_active: true
  },
  {
    id: 'srv-7',
    category_id: 'cat-nails',
    name: 'Luxury Rose Petal Mani-Pedi Duo',
    description: 'Himalayan salt soak, organic rose scrub, cuticle perfection, massage and high-shine polish.',
    price: 5500,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
    is_popular: true,
    is_active: true
  },
  {
    id: 'srv-8',
    category_id: 'cat-bridal',
    name: 'Royal Barat / Walima Signature Bridal Look',
    description: 'Complete HD airbrush bridal makeup, dupatta/jewelry setting, high-end bridal hairstyle, eyelashes and lenses.',
    price: 35000,
    duration_minutes: 180,
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    is_popular: true,
    is_active: true
  },
  {
    id: 'srv-9',
    category_id: 'cat-bridal',
    name: 'Engagement & Nikkah Glam',
    description: 'Soft radiant glow glam, custom eyes, romantic half-updo or soft curls with bridal lashes.',
    price: 20000,
    duration_minutes: 120,
    image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    is_popular: false,
    is_active: true
  },
  {
    id: 'srv-10',
    category_id: 'cat-spa',
    name: 'Aromatherapy Stress Relief Full Body Massage',
    description: 'Lavender and eucalyptus warm oil massage targeting muscle knots, tension and promoting deep calm.',
    price: 9000,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80',
    is_popular: true,
    is_active: true
  },
  {
    id: 'srv-11',
    category_id: 'cat-grooming',
    name: 'Full Body RICA Soothing Wax',
    description: 'Gentle Italian Rica wax enriched with aloe vera and titanium dioxide for sensitive, smooth skin.',
    price: 8000,
    duration_minutes: 60,
    image_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
    is_popular: false,
    is_active: true
  }
];

const DEFAULT_STAFF = [
  {
    id: 'stf-1',
    name: 'Ayesha Malik',
    role_title: 'Senior Hair Artistry Lead',
    specialties: 'Balayage, Keratin, Precision Cuts',
    bio: 'Trained in Dubai & London with 9+ years elevating luxury hair styling in Karachi.',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    is_active: true
  },
  {
    id: 'stf-2',
    name: 'Dr. Zara Alvi',
    role_title: 'Master Esthetician & Skin Specialist',
    specialties: 'HydraFacials, Peels, Anti-Aging',
    bio: 'Certified aesthetic clinician specializing in clinical skin rejuvenation and non-invasive glow treatments.',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    is_active: true
  },
  {
    id: 'stf-3',
    name: 'Sana Mir',
    role_title: 'Celebrity Bridal & Glamour Artist',
    specialties: 'Bridal Makeovers, Airbrush, Eye Art',
    bio: 'Iconic makeup specialist known for modern ethereal bridal glam and red-carpet finishes.',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    is_active: true
  },
  {
    id: 'stf-4',
    name: 'Fatima Noor',
    role_title: 'Certified Spa & Wellness Therapist',
    specialties: 'Deep Tissue, Aromatherapy, Hot Stone',
    bio: 'Dedicated therapist with 8+ years practicing holistic Asian spa rituals and muscle tension relief.',
    avatar_url: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=400&q=80',
    is_active: true
  }
];

/**
 * ==============================================================================
 * UNIFIED DATA REPOSITORY (Auto-detects Supabase vs LocalStorage)
 * ==============================================================================
 */
window.SalonDB = {
  isLive: isSupabaseConfigured(),
  client: _supabaseClient,

  // --- Local Storage Helpers ---
  _getLocal(key, fallback) {
    try {
      const data = localStorage.getItem('salon_' + key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  },

  _setLocal(key, value) {
    try {
      localStorage.setItem('salon_' + key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  },

  // --- Settings ---
  async getSettings() {
    if (this.isLive && this.client) {
      const { data, error } = await this.client.from('salon_settings').select('*').limit(1).single();
      if (!error && data) return data;
    }
    return this._getLocal('settings', DEFAULT_SALON_SETTINGS);
  },

  async updateSettings(settingsData) {
    if (this.isLive && this.client) {
      const current = await this.getSettings();
      if (current.id) {
        const { data, error } = await this.client.from('salon_settings').update(settingsData).eq('id', current.id).select().single();
        if (error) throw error;
        return data;
      }
    }
    const current = this._getLocal('settings', DEFAULT_SALON_SETTINGS);
    const updated = { ...current, ...settingsData, updated_at: new Date().toISOString() };
    this._setLocal('settings', updated);
    return updated;
  },

  // --- Categories ---
  async getCategories() {
    if (this.isLive && this.client) {
      const { data, error } = await this.client.from('service_categories').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (!error && data) return data;
    }
    return this._getLocal('categories', DEFAULT_CATEGORIES);
  },

  // --- Services ---
  async getServices(categorySlug = null) {
    if (this.isLive && this.client) {
      let query = this.client.from('services').select('*, service_categories(name, slug)').eq('is_active', true).order('display_order', { ascending: true });
      const { data, error } = await query;
      if (!error && data) {
        if (categorySlug && categorySlug !== 'all') {
          return data.filter(s => s.service_categories && s.service_categories.slug === categorySlug);
        }
        return data;
      }
    }
    const list = this._getLocal('services', DEFAULT_SERVICES);
    if (categorySlug && categorySlug !== 'all') {
      const cats = await this.getCategories();
      const cat = cats.find(c => c.slug === categorySlug);
      if (cat) {
        return list.filter(s => s.category_id === cat.id && s.is_active !== false);
      }
    }
    return list.filter(s => s.is_active !== false);
  },

  async getAllServicesAdmin() {
    if (this.isLive && this.client) {
      const { data, error } = await this.client.from('services').select('*, service_categories(name, slug)').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return this._getLocal('services', DEFAULT_SERVICES);
  },

  async saveService(service) {
    if (this.isLive && this.client) {
      if (service.id && !service.id.startsWith('srv-')) {
        const { data, error } = await this.client.from('services').update(service).eq('id', service.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { id, ...insertData } = service;
        const { data, error } = await this.client.from('services').insert([insertData]).select().single();
        if (error) throw error;
        return data;
      }
    }
    const list = this._getLocal('services', DEFAULT_SERVICES);
    if (service.id) {
      const index = list.findIndex(s => s.id === service.id);
      if (index >= 0) {
        list[index] = { ...list[index], ...service };
      } else {
        list.push(service);
      }
    } else {
      service.id = 'srv-' + Date.now();
      list.push(service);
    }
    this._setLocal('services', list);
    return service;
  },

  async deleteService(serviceId) {
    if (this.isLive && this.client) {
      const { error } = await this.client.from('services').delete().eq('id', serviceId);
      if (error) throw error;
      return true;
    }
    let list = this._getLocal('services', DEFAULT_SERVICES);
    list = list.filter(s => s.id !== serviceId);
    this._setLocal('services', list);
    return true;
  },

  // --- Staff ---
  async getStaff() {
    if (this.isLive && this.client) {
      const { data, error } = await this.client.from('staff').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (!error && data) return data;
    }
    return this._getLocal('staff', DEFAULT_STAFF);
  },

  async getAllStaffAdmin() {
    if (this.isLive && this.client) {
      const { data, error } = await this.client.from('staff').select('*').order('display_order', { ascending: true });
      if (!error && data) return data;
    }
    return this._getLocal('staff', DEFAULT_STAFF);
  },

  async saveStaff(staffMember) {
    if (this.isLive && this.client) {
      if (staffMember.id && !staffMember.id.startsWith('stf-')) {
        const { data, error } = await this.client.from('staff').update(staffMember).eq('id', staffMember.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { id, ...insertData } = staffMember;
        const { data, error } = await this.client.from('staff').insert([insertData]).select().single();
        if (error) throw error;
        return data;
      }
    }
    const list = this._getLocal('staff', DEFAULT_STAFF);
    if (staffMember.id) {
      const idx = list.findIndex(s => s.id === staffMember.id);
      if (idx >= 0) list[idx] = { ...list[idx], ...staffMember };
      else list.push(staffMember);
    } else {
      staffMember.id = 'stf-' + Date.now();
      list.push(staffMember);
    }
    this._setLocal('staff', list);
    return staffMember;
  },

  // --- Bookings & Real-time Conflicts ---
  async getBookingsForDate(dateStr, staffId = null) {
    if (this.isLive && this.client) {
      let q = this.client.from('bookings')
        .select('*')
        .eq('booking_date', dateStr)
        .neq('status', 'cancelled');
      const isValidUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      if (staffId && staffId !== 'any' && isValidUUID(staffId)) {
        q = q.eq('staff_id', staffId);
      }
      const { data, error } = await q;
      if (!error && data) return data;
    }
    // Fallback storage - Starts completely EMPTY
    const bookings = this._getLocal('bookings', []);
    return bookings.filter(b => {
      const matchDate = b.booking_date === dateStr;
      const matchStaff = !staffId || staffId === 'any' || b.staff_id === staffId;
      const notCancelled = b.status !== 'cancelled';
      return matchDate && matchStaff && notCancelled;
    });
  },

  async createBooking(bookingPayload) {
    // Generate clean booking reference code (e.g. SLN-2026-8941)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = 'SLN-2026-' + randomCode;
    bookingPayload.booking_ref = bookingRef;
    bookingPayload.status = bookingPayload.status || 'confirmed';
    bookingPayload.created_at = new Date().toISOString();

    const isValidUUID = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // Ensure staff_id and service_id are valid UUIDs or null for PostgreSQL
    const assignedStaffId = (bookingPayload.staff_id && bookingPayload.staff_id !== 'any' && isValidUUID(bookingPayload.staff_id))
      ? bookingPayload.staff_id
      : null;
    bookingPayload.staff_id = assignedStaffId;

    if (!isValidUUID(bookingPayload.service_id)) {
      bookingPayload.service_id = null;
    }

    if (this.isLive && this.client) {
      // 1. Conflict check on Supabase (only if a specific specialist is chosen)
      if (assignedStaffId) {
        const { data: conflicts } = await this.client
          .from('bookings')
          .select('id, start_time, end_time')
          .eq('staff_id', assignedStaffId)
          .eq('booking_date', bookingPayload.booking_date)
          .neq('status', 'cancelled');

        if (conflicts && conflicts.length > 0) {
          const hasOverlap = conflicts.some(c => {
            return (bookingPayload.start_time < c.end_time && bookingPayload.end_time > c.start_time);
          });
          if (hasOverlap) {
            throw new Error('This time slot is no longer available with the selected stylist. Please pick another slot.');
          }
        }
      }

      // 2. Insert customer or connect
      let customerId = null;
      try {
        const { data: custData } = await this.client
          .from('customers')
          .insert([{
            name: bookingPayload.customer_name,
            phone: bookingPayload.customer_phone,
            email: bookingPayload.customer_email || null,
            notes: bookingPayload.notes || null
          }])
          .select('id')
          .single();
        if (custData) customerId = custData.id;
      } catch (custErr) {
        console.warn('Customer insert notice:', custErr);
      }

      bookingPayload.customer_id = customerId;

      // 3. Insert Booking
      const { data, error } = await this.client
        .from('bookings')
        .insert([bookingPayload])
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    // LocalStorage Fallback Flow
    const existing = this._getLocal('bookings', []);
    if (bookingPayload.staff_id && bookingPayload.staff_id !== 'any') {
      const conflict = existing.some(b => 
        b.booking_date === bookingPayload.booking_date &&
        b.staff_id === bookingPayload.staff_id &&
        b.status !== 'cancelled' &&
        bookingPayload.start_time < b.end_time &&
        bookingPayload.end_time > b.start_time
      );
      if (conflict) {
        throw new Error('This time slot has just been reserved. Please select another slot.');
      }
    }

    bookingPayload.id = 'bkg-' + Date.now();
    existing.push(bookingPayload);
    this._setLocal('bookings', existing);

    // Save customer
    const customers = this._getLocal('customers', []);
    customers.push({
      id: 'cust-' + Date.now(),
      name: bookingPayload.customer_name,
      phone: bookingPayload.customer_phone,
      email: bookingPayload.customer_email,
      created_at: new Date().toISOString()
    });
    this._setLocal('customers', customers);

    return bookingPayload;
  },

  async getAllBookingsAdmin() {
    if (this.isLive && this.client) {
      const { data, error } = await this.client
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false });
      if (!error && data) return data;
    }
    return this._getLocal('bookings', []);
  },

  async updateBookingStatus(bookingId, newStatus) {
    if (this.isLive && this.client) {
      const { data, error } = await this.client
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const list = this._getLocal('bookings', []);
    const idx = list.findIndex(b => b.id === bookingId);
    if (idx >= 0) {
      list[idx].status = newStatus;
      list[idx].updated_at = new Date().toISOString();
      this._setLocal('bookings', list);
      return list[idx];
    }
    throw new Error('Booking not found');
  }
};
