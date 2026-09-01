/**
 * ==============================================================================
 * BOOKING WIZARD ENGINE (booking.js)
 * Step-by-Step Luxury Appointment Scheduling with Double-Booking Prevention
 * ==============================================================================
 */

const BookingState = {
  currentStep: 1,
  selectedService: null,
  selectedStaff: { id: 'any', name: 'Any Available Specialist' },
  selectedDate: null, // YYYY-MM-DD
  selectedTimeSlot: null, // "14:00"
  calculatedEndTime: null, // "14:45"
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  notes: '',
  confirmedBooking: null
};

// Calendar view helper state
let calendarCurrentMonth = new Date().getMonth();
let calendarCurrentYear = new Date().getFullYear();

let availableServices = [];
let availableStaff = [];
let salonSettings = null;

async function initBookingWizard() {
  try {
    [salonSettings, availableServices, availableStaff] = await Promise.all([
      window.SalonDB.getSettings(),
      window.SalonDB.getServices(),
      window.SalonDB.getStaff()
    ]);

    // Check if preselected service passed via query string ?service=ID
    const urlParams = new URLSearchParams(window.location.search);
    const preselectedServiceId = urlParams.get('service');
    if (preselectedServiceId) {
      const match = availableServices.find(s => s.id === preselectedServiceId);
      if (match) {
        BookingState.selectedService = match;
      }
    }

    renderStep1Services();
    renderStep2Staff();
    renderCalendar();
    updateStepUI();

    // If preselected service, update summary card immediately
    updateBookingSummaryBar();
  } catch (err) {
    console.error('Error initializing booking wizard:', err);
    showToast('Failed to initialize booking options.', 'error');
  }
}

// ------------------------------------------------------------------------------
// STEP NAVIGATION
// ------------------------------------------------------------------------------
function goToStep(stepNumber) {
  // Validation before proceeding
  if (stepNumber > BookingState.currentStep) {
    if (BookingState.currentStep === 1 && !BookingState.selectedService) {
      showToast('Please select a service or treatment to proceed.', 'error');
      return;
    }
    if (BookingState.currentStep === 3 && !BookingState.selectedDate) {
      showToast('Please select a date on the calendar.', 'error');
      return;
    }
    if (BookingState.currentStep === 4 && !BookingState.selectedTimeSlot) {
      showToast('Please select an available time slot.', 'error');
      return;
    }
  }

  BookingState.currentStep = stepNumber;
  updateStepUI();
  window.scrollTo({ top: 180, behavior: 'smooth' });

  if (stepNumber === 4) {
    loadAndRenderTimeSlots();
  }
  if (stepNumber === 5) {
    renderStep5Review();
  }
}

function updateStepUI() {
  const steps = [1, 2, 3, 4, 5, 6];
  steps.forEach(s => {
    const el = document.getElementById(`step-panel-${s}`);
    const dot = document.getElementById(`step-dot-${s}`);
    const line = document.getElementById(`step-line-${s}`);

    if (el) {
      if (s === BookingState.currentStep) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }

    if (dot) {
      if (s === BookingState.currentStep) {
        dot.className = 'step-dot active';
      } else if (s < BookingState.currentStep) {
        dot.className = 'step-dot completed';
      } else {
        dot.className = 'step-dot';
      }
    }

    if (line) {
      if (s < BookingState.currentStep) {
        line.classList.add('active');
      } else {
        line.classList.remove('active');
      }
    }
  });

  updateBookingSummaryBar();
}

function updateBookingSummaryBar() {
  const bar = document.getElementById('booking-summary-sidebar');
  if (!bar) return;

  const srvName = document.getElementById('summary-service-name');
  const srvPrice = document.getElementById('summary-service-price');
  const srvDuration = document.getElementById('summary-service-duration');
  const staffEl = document.getElementById('summary-staff');
  const dateEl = document.getElementById('summary-date');
  const timeEl = document.getElementById('summary-time');

  if (BookingState.selectedService) {
    if (srvName) srvName.textContent = BookingState.selectedService.name;
    if (srvPrice) srvPrice.textContent = formatPKR(BookingState.selectedService.price);
    if (srvDuration) srvDuration.textContent = formatDuration(BookingState.selectedService.duration_minutes);
  } else {
    if (srvName) srvName.textContent = 'None selected';
    if (srvPrice) srvPrice.textContent = 'Rs. 0';
    if (srvDuration) srvDuration.textContent = '--';
  }

  if (staffEl) {
    staffEl.textContent = BookingState.selectedStaff ? BookingState.selectedStaff.name : 'Any Available Specialist';
  }

  if (dateEl) {
    if (BookingState.selectedDate) {
      const d = new Date(BookingState.selectedDate + 'T00:00:00');
      dateEl.textContent = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } else {
      dateEl.textContent = 'Not selected';
    }
  }

  if (timeEl) {
    timeEl.textContent = BookingState.selectedTimeSlot ? `${formatTime12h(BookingState.selectedTimeSlot)} (${BookingState.calculatedEndTime ? formatTime12h(BookingState.calculatedEndTime) : ''})` : 'Not selected';
  }
}

// ------------------------------------------------------------------------------
// STEP 1: SERVICES SELECTION
// ------------------------------------------------------------------------------
function renderStep1Services() {
  const container = document.getElementById('step1-services-list');
  if (!container) return;

  container.innerHTML = availableServices.map(service => {
    const isSelected = BookingState.selectedService && BookingState.selectedService.id === service.id;
    return `
      <div 
        onclick="selectService('${service.id}')"
        class="cursor-pointer p-4 md:p-5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-4 ${
          isSelected 
            ? 'border-[#C59B8E] bg-[#FDF9F7] shadow-sm ring-1 ring-[#C59B8E]' 
            : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/60'
        }"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
            <img src="${service.image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80'}" class="w-full h-full object-cover" />
          </div>
          <div>
            <h4 class="font-serif font-semibold text-stone-900 text-base md:text-lg">${service.name}</h4>
            <div class="flex items-center gap-2 text-xs text-stone-500 mt-1">
              <span class="bg-stone-100 px-2 py-0.5 rounded-full font-medium">⏱️ ${formatDuration(service.duration_minutes)}</span>
              ${service.is_popular ? '<span class="text-[#99685B] font-semibold">✨ Popular</span>' : ''}
            </div>
          </div>
        </div>

        <div class="text-right flex-shrink-0">
          <span class="block font-bold text-stone-900 text-sm md:text-base">${formatPKR(service.price)}</span>
          <span class="text-xs font-semibold ${isSelected ? 'text-[#99685B]' : 'text-stone-400'}">
            ${isSelected ? '✓ Selected' : 'Choose'}
          </span>
        </div>
      </div>
    `;
  }).join('');
}

function selectService(serviceId) {
  const service = availableServices.find(s => s.id === serviceId);
  if (service) {
    BookingState.selectedService = service;
    renderStep1Services();
    updateBookingSummaryBar();
  }
}

// ------------------------------------------------------------------------------
// STEP 2: STAFF SELECTION
// ------------------------------------------------------------------------------
function renderStep2Staff() {
  const container = document.getElementById('step2-staff-list');
  if (!container) return;

  const staffOptions = [
    {
      id: 'any',
      name: 'Any Available Specialist',
      role_title: 'Maximum flexibility & slot availability',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    },
    ...availableStaff
  ];

  container.innerHTML = staffOptions.map(stf => {
    const isSelected = BookingState.selectedStaff && BookingState.selectedStaff.id === stf.id;
    return `
      <div 
        onclick="selectStaff('${stf.id}')"
        class="cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex items-center gap-4 ${
          isSelected 
            ? 'border-[#C59B8E] bg-[#FDF9F7] shadow-sm ring-1 ring-[#C59B8E]' 
            : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/60'
        }"
      >
        <img 
          src="${stf.avatar_url}" 
          alt="${stf.name}"
          class="w-14 h-14 rounded-full object-cover border-2 ${isSelected ? 'border-[#C59B8E]' : 'border-stone-200'}"
        />
        <div class="flex-1">
          <h4 class="font-serif font-semibold text-stone-900 text-base">${stf.name}</h4>
          <p class="text-xs text-stone-500 line-clamp-1">${stf.role_title}</p>
          ${stf.specialties ? `<p class="text-[11px] text-[#99685B] mt-0.5 font-medium">${stf.specialties}</p>` : ''}
        </div>
        <div class="text-right">
          <span class="w-6 h-6 rounded-full border flex items-center justify-center text-xs ${isSelected ? 'bg-[#C59B8E] text-white border-[#C59B8E]' : 'border-stone-300 text-transparent'}">
            ✓
          </span>
        </div>
      </div>
    `;
  }).join('');
}

function selectStaff(staffId) {
  if (staffId === 'any') {
    BookingState.selectedStaff = { id: 'any', name: 'Any Available Specialist' };
  } else {
    BookingState.selectedStaff = availableStaff.find(s => s.id === staffId);
  }
  renderStep2Staff();
  updateBookingSummaryBar();
}

// ------------------------------------------------------------------------------
// STEP 3: CUSTOM VANILLA CALENDAR DATEPICKER
// ------------------------------------------------------------------------------
function renderCalendar() {
  const monthTitle = document.getElementById('calendar-month-title');
  const daysGrid = document.getElementById('calendar-days-grid');
  if (!daysGrid) return;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (monthTitle) {
    monthTitle.textContent = `${monthNames[calendarCurrentMonth]} ${calendarCurrentYear}`;
  }

  const firstDayIndex = new Date(calendarCurrentYear, calendarCurrentMonth, 1).getDay();
  const totalDays = new Date(calendarCurrentYear, calendarCurrentMonth + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let html = '';

  // Blank days before first day of month
  for (let i = 0; i < firstDayIndex; i++) {
    html += `<div class="aspect-square opacity-0"></div>`;
  }

  // Actual days
  for (let day = 1; day <= totalDays; day++) {
    const thisDate = new Date(calendarCurrentYear, calendarCurrentMonth, day);
    thisDate.setHours(0, 0, 0, 0);

    const isPast = thisDate < today;
    const dateStr = `${calendarCurrentYear}-${String(calendarCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = BookingState.selectedDate === dateStr;

    html += `
      <button 
        type="button"
        ${isPast ? 'disabled' : ''}
        onclick="selectCalendarDate('${dateStr}')"
        class="calendar-day-btn ${isSelected ? 'selected' : ''}"
      >
        <span>${day}</span>
      </button>
    `;
  }

  daysGrid.innerHTML = html;
}

function prevMonth() {
  const today = new Date();
  if (calendarCurrentYear === today.getFullYear() && calendarCurrentMonth === today.getMonth()) {
    return; // Don't navigate to past months
  }

  if (calendarCurrentMonth === 0) {
    calendarCurrentMonth = 11;
    calendarCurrentYear--;
  } else {
    calendarCurrentMonth--;
  }
  renderCalendar();
}

function nextMonth() {
  if (calendarCurrentMonth === 11) {
    calendarCurrentMonth = 0;
    calendarCurrentYear++;
  } else {
    calendarCurrentMonth++;
  }
  renderCalendar();
}

function selectCalendarDate(dateStr) {
  BookingState.selectedDate = dateStr;
  BookingState.selectedTimeSlot = null;
  BookingState.calculatedEndTime = null;
  renderCalendar();
  updateBookingSummaryBar();
  // Automatically move to step 4
  goToStep(4);
}

// ------------------------------------------------------------------------------
// STEP 4: TIME SLOT ENGINE (Dynamic Conflict & Overlap Prevention)
// ------------------------------------------------------------------------------
async function loadAndRenderTimeSlots() {
  const container = document.getElementById('step4-slots-grid');
  const dateDisplay = document.getElementById('selected-date-display');
  if (!container) return;

  if (!BookingState.selectedDate) {
    container.innerHTML = `<p class="col-span-full text-center text-stone-500 py-6">Please select a date first.</p>`;
    return;
  }

  if (dateDisplay) {
    const d = new Date(BookingState.selectedDate + 'T00:00:00');
    dateDisplay.textContent = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  container.innerHTML = `
    <div class="col-span-full text-center py-8 text-stone-400">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-stone-300 border-t-[#C59B8E] mb-2"></div>
      <p class="text-xs">Checking real-time slot availability...</p>
    </div>
  `;

  try {
    // 1. Fetch existing bookings for this date from Supabase / Data Layer
    const existingBookings = await window.SalonDB.getBookingsForDate(
      BookingState.selectedDate,
      BookingState.selectedStaff.id
    );

    // 2. Generate salon time slots (e.g. 11:00 AM to 08:00 PM)
    const openTime = salonSettings?.opening_time || '11:00';
    const closeTime = salonSettings?.closing_time || '20:00';
    const intervalMinutes = salonSettings?.slot_interval_minutes || 30;
    const durationMinutes = BookingState.selectedService ? BookingState.selectedService.duration_minutes : 45;

    const slots = generateTimeSlots(openTime, closeTime, intervalMinutes, durationMinutes, existingBookings);

    if (slots.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-8 bg-stone-50 rounded-2xl border border-stone-200 text-stone-500">
          <p class="font-serif text-lg text-stone-700">All appointments are booked for this day</p>
          <p class="text-xs mt-1">Please select an alternate date or specialist.</p>
          <button onclick="goToStep(3)" class="mt-3 px-4 py-1.5 text-xs font-semibold rounded-full bg-[#C59B8E] text-white">Change Date</button>
        </div>
      `;
      return;
    }

    container.innerHTML = slots.map(slot => {
      const isSelected = BookingState.selectedTimeSlot === slot.time;
      return `
        <button 
          type="button"
          ${slot.isBooked ? 'disabled' : ''}
          onclick="selectTimeSlot('${slot.time}', '${slot.endTime}')"
          class="time-slot-btn ${isSelected ? 'selected' : ''}"
        >
          <span class="block font-medium">${formatTime12h(slot.time)}</span>
          <span class="block text-[10px] ${slot.isBooked ? 'text-stone-400' : 'text-stone-400 font-normal'}">
            ${slot.isBooked ? 'Booked' : `until ${formatTime12h(slot.endTime)}`}
          </span>
        </button>
      `;
    }).join('');

  } catch (error) {
    console.error('Error generating time slots:', error);
    container.innerHTML = `<p class="col-span-full text-center text-red-500 py-6 text-xs">Error calculating slot availability. Please try again.</p>`;
  }
}

function generateTimeSlots(openTimeStr, closeTimeStr, intervalMin, durationMin, existingBookings) {
  const slots = [];
  const [openHour, openMin] = openTimeStr.split(':').map(Number);
  const [closeHour, closeMin] = closeTimeStr.split(':').map(Number);

  let currentMin = openHour * 60 + openMin;
  const maxEndMin = closeHour * 60 + closeMin;

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = BookingState.selectedDate === todayStr;
  const now = new Date();
  const currentDayMinutes = now.getHours() * 60 + now.getMinutes();

  while (currentMin + durationMin <= maxEndMin) {
    const slotStartHour = Math.floor(currentMin / 60);
    const slotStartMin = currentMin % 60;
    const startStr = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`;

    const endSlotTotalMin = currentMin + durationMin;
    const slotEndHour = Math.floor(endSlotTotalMin / 60);
    const slotEndMin = endSlotTotalMin % 60;
    const endStr = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;

    // Conflict Check against existing bookings
    let isBooked = false;

    // Past time slot check for today
    if (isToday && currentMin <= currentDayMinutes + 15) {
      isBooked = true;
    }

    if (!isBooked && existingBookings && existingBookings.length > 0) {
      isBooked = existingBookings.some(b => {
        const bStart = b.start_time.slice(0, 5);
        const bEnd = b.end_time.slice(0, 5);
        // Overlap logic: startStr < bEnd && endStr > bStart
        return (startStr < bEnd && endStr > bStart);
      });
    }

    slots.push({
      time: startStr,
      endTime: endStr,
      isBooked
    });

    currentMin += intervalMin;
  }

  return slots;
}

function selectTimeSlot(startTime, endTime) {
  BookingState.selectedTimeSlot = startTime;
  BookingState.calculatedEndTime = endTime;
  loadAndRenderTimeSlots();
  updateBookingSummaryBar();
}

function formatTime12h(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

// ------------------------------------------------------------------------------
// STEP 5: REVIEW & CUSTOMER DETAILS
// ------------------------------------------------------------------------------
function renderStep5Review() {
  const srvName = document.getElementById('review-service-name');
  const srvDetails = document.getElementById('review-service-details');
  const staffEl = document.getElementById('review-staff-name');
  const dateEl = document.getElementById('review-date-time');
  const totalEl = document.getElementById('review-total-price');

  if (srvName && BookingState.selectedService) {
    srvName.textContent = BookingState.selectedService.name;
    if (srvDetails) srvDetails.textContent = `${formatDuration(BookingState.selectedService.duration_minutes)} Duration • ${BookingState.selectedService.description || ''}`;
  }

  if (staffEl) {
    staffEl.textContent = BookingState.selectedStaff ? BookingState.selectedStaff.name : 'Any Specialist';
  }

  if (dateEl && BookingState.selectedDate && BookingState.selectedTimeSlot) {
    const d = new Date(BookingState.selectedDate + 'T00:00:00');
    const dateFormatted = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    dateEl.textContent = `${dateFormatted} at ${formatTime12h(BookingState.selectedTimeSlot)}`;
  }

  if (totalEl && BookingState.selectedService) {
    totalEl.textContent = formatPKR(BookingState.selectedService.price);
  }
}

// ------------------------------------------------------------------------------
// CONFIRM BOOKING DISPATCH
// ------------------------------------------------------------------------------
async function submitBookingForm(e) {
  if (e) e.preventDefault();

  const nameInput = document.getElementById('customer-name');
  const phoneInput = document.getElementById('customer-phone');
  const emailInput = document.getElementById('customer-email');
  const notesInput = document.getElementById('customer-notes');
  const submitBtn = document.getElementById('confirm-booking-btn');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const email = emailInput ? emailInput.value.trim() : '';
  const notes = notesInput ? notesInput.value.trim() : '';

  if (!name) {
    showToast('Please enter your full name.', 'error');
    if (nameInput) nameInput.focus();
    return;
  }

  // Pakistani phone validation (e.g. 03001234567 or +923001234567)
  const cleanPhone = phone.replace(/[\s-]/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    showToast('Please enter a valid Pakistani mobile number (e.g. 0300-1234567).', 'error');
    if (phoneInput) phoneInput.focus();
    return;
  }

  if (!BookingState.selectedService || !BookingState.selectedDate || !BookingState.selectedTimeSlot) {
    showToast('Incomplete booking information. Please check all steps.', 'error');
    return;
  }

  BookingState.customerName = name;
  BookingState.customerPhone = phone;
  BookingState.customerEmail = email;
  BookingState.notes = notes;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
      Confirming Appointment...
    `;
  }

  try {
    const bookingPayload = {
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      service_id: BookingState.selectedService ? BookingState.selectedService.id : null,
      service_name: BookingState.selectedService ? BookingState.selectedService.name : 'Salon Treatment',
      staff_id: (BookingState.selectedStaff && BookingState.selectedStaff.id !== 'any') ? BookingState.selectedStaff.id : null,
      staff_name: BookingState.selectedStaff ? BookingState.selectedStaff.name : 'Any Available Specialist',
      booking_date: BookingState.selectedDate,
      start_time: BookingState.selectedTimeSlot + ':00',
      end_time: BookingState.calculatedEndTime + ':00',
      duration_minutes: BookingState.selectedService ? BookingState.selectedService.duration_minutes : 45,
      total_price: BookingState.selectedService ? BookingState.selectedService.price : 0,
      status: 'confirmed',
      notes: notes
    };

    const confirmedRecord = await window.SalonDB.createBooking(bookingPayload);
    BookingState.confirmedBooking = confirmedRecord;

    showToast('Appointment successfully confirmed!', 'success');
    renderStep6Confirmation(confirmedRecord);
    goToStep(6);
  } catch (error) {
    console.error('Booking submission error:', error);
    showToast(error.message || 'Could not complete booking. Please try another time.', 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Confirm & Book Appointment</span> →`;
    }
  }
}

// ------------------------------------------------------------------------------
// STEP 6: RECEIPT & CALENDAR EXPORT (.ICS / GOOGLE CALENDAR)
// ------------------------------------------------------------------------------
function renderStep6Confirmation(booking) {
  const refEl = document.getElementById('confirmation-ref');
  const serviceEl = document.getElementById('confirm-service');
  const staffEl = document.getElementById('confirm-staff');
  const dateTimeEl = document.getElementById('confirm-datetime');
  const priceEl = document.getElementById('confirm-price');
  const nameEl = document.getElementById('confirm-name');
  const phoneEl = document.getElementById('confirm-phone');

  if (refEl) refEl.textContent = booking.booking_ref;
  if (serviceEl) serviceEl.textContent = booking.service_name;
  if (staffEl) staffEl.textContent = booking.staff_name || 'Assigned Specialist';
  
  if (dateTimeEl) {
    const d = new Date(booking.booking_date + 'T00:00:00');
    const dStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    dateTimeEl.textContent = `${dStr} at ${formatTime12h(booking.start_time.slice(0, 5))}`;
  }

  if (priceEl) priceEl.textContent = formatPKR(booking.total_price);
  if (nameEl) nameEl.textContent = booking.customer_name;
  if (phoneEl) phoneEl.textContent = booking.customer_phone;
}

// Download .ics file for Apple Calendar, Outlook & Google
function downloadCalendarICS() {
  const b = BookingState.confirmedBooking;
  if (!b) return;

  const dateParts = b.booking_date.split('-');
  const startParts = b.start_time.split(':');
  const endParts = b.end_time.split(':');

  const startFormatted = `${dateParts[0]}${dateParts[1]}${dateParts[2]}T${startParts[0]}${startParts[1]}00`;
  const endFormatted = `${dateParts[0]}${dateParts[1]}${dateParts[2]}T${endParts[0]}${endParts[1]}00`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Serene Sanctuary Salon//Appointment Booking//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${b.booking_ref}@serenesalon.pk`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${startFormatted}`,
    `DTEND:${endFormatted}`,
    `SUMMARY:${b.service_name} at Serene Sanctuary Salon`,
    `DESCRIPTION:Appointment Ref: ${b.booking_ref}\\nStylist: ${b.staff_name}\\nLocation: Karachi, Clifton`,
    'LOCATION:Plot 14-C, Main Khayaban-e-Shahbaz, Phase 6, DHA, Karachi',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `Salon_Appointment_${b.booking_ref}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Open Google Calendar URL
function openGoogleCalendar() {
  const b = BookingState.confirmedBooking;
  if (!b) return;

  const dateParts = b.booking_date.split('-');
  const startParts = b.start_time.split(':');
  const endParts = b.end_time.split(':');

  const startFormatted = `${dateParts[0]}${dateParts[1]}${dateParts[2]}T${startParts[0]}${startParts[1]}00`;
  const endFormatted = `${dateParts[0]}${dateParts[1]}${dateParts[2]}T${endParts[0]}${endParts[1]}00`;

  const title = encodeURIComponent(`${b.service_name} - Serene Sanctuary Salon`);
  const details = encodeURIComponent(`Booking Ref: ${b.booking_ref}\nSpecialist: ${b.staff_name}\nContact: +92 300 9876543`);
  const location = encodeURIComponent('Plot 14-C, Main Khayaban-e-Shahbaz, Phase 6, DHA, Karachi');

  const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startFormatted}/${endFormatted}&details=${details}&location=${location}`;
  window.open(gCalUrl, '_blank');
}

// Send WhatsApp Confirmation Details
function shareBookingWhatsApp() {
  const b = BookingState.confirmedBooking;
  if (!b) return;

  const msg = `*Appointment Confirmation - Serene Sanctuary Salon*\n` +
    `🔖 *Ref:* ${b.booking_ref}\n` +
    `✨ *Service:* ${b.service_name}\n` +
    `👤 *Specialist:* ${b.staff_name}\n` +
    `📅 *Date:* ${b.booking_date}\n` +
    `⏰ *Time:* ${formatTime12h(b.start_time.slice(0, 5))}\n` +
    `💵 *Total:* ${formatPKR(b.total_price)}\n` +
    `📍 *Location:* DHA Phase 6, Karachi\n\nLooking forward to pampering you!`;

  openWhatsApp(msg);
}

document.addEventListener('DOMContentLoaded', initBookingWizard);
