# 🌸 Serene Sanctuary Salon & Spa — Appointment Booking Website

> A modern, calming, mobile-first appointment booking web application built for a luxury beauty salon and spa in **Karachi, Pakistan** (DHA Phase 6 / Clifton).

---

## 💎 Key Highlights & Tech Stack

- **Zero Build Step / No Bundler / No Node.js Dependency**: Built purely with **HTML5**, **modern CSS3**, and **Vanilla JavaScript**.
- **Tailwind CSS via CDN**: Instant luxury typography, responsive utility styling, and sleek layout grids.
- **Supabase Backend & Realtime**: Integrated with `@supabase/supabase-js` via CDN for PostgreSQL database storage, double-booking prevention, and realtime booking alerts.
- **Works Out of the Box**: Double-click `index.html` directly in your browser. If Supabase keys have not been configured yet, an intelligent local data layer seamlessly handles browsing, bookings, and admin features.

---

## 📁 Project Structure

```
salon_web/
├── .github/workflows/
│   └── auto-article.yml    # GitHub Actions workflow for scheduled & manual AI article generation
├── scripts/
│   └── generate-article.js # Automated Gemini AI article generator & publisher
├── index.html              # Home page (Hero, featured rituals, articles preview, reviews, Karachi location & WhatsApp)
├── about.html              # Story, 4 pillars of excellence, certified team bios, and salon philosophy
├── services.html           # Categorized service catalog with live search & direct booking CTA
├── booking.html            # 6-Step interactive booking wizard with conflict-free slot scheduling
├── gallery.html            # Visual portfolio & ambience gallery with full-screen lightbox
├── articles.html           # Beauty journal & articles (haircare, skincare, bridal guides, reader modal)
├── admin.html              # Staff & management portal (Dashboard, Bookings, Services CRUD, Settings)
├── css/
│   └── style.css           # Luxury color variables, custom calendar, pill buttons, micro-animations
├── js/
│   ├── supabase-config.js  # Supabase client credentials & unified fallback data repository
│   ├── app.js              # Shared utilities (navigation drawer, toast system, PKR currency formatter)
│   ├── services.js         # Service catalog logic, search, category filtering
│   ├── booking.js          # Booking engine, vanilla calendar, live slot generator, .ics / Google Cal export
│   ├── gallery.js          # Image filters and interactive lightbox modal
│   ├── articles.js         # Articles repository, search filter, category tabs & reader modal controller
│   └── admin.js            # Admin analytics, status manager, service CRUD, staff management
├── supabase-schema.sql     # Complete PostgreSQL/Supabase schema with RLS & conflict prevention
└── README.md               # Quickstart and deployment guide
```

---

## 🚀 Quickstart Guide

### Option A: Immediate Browser Preview (Zero Setup)
Simply navigate into the `salon_web` folder and double-click `index.html` to open it in Chrome, Edge, Safari, or Firefox. Everything (including interactive booking and the admin panel) works right away in demo preview mode.

### Option B: Connect Your Real Supabase Database

1. **Create a Free Supabase Project**:
   - Go to [supabase.com](https://supabase.com) and create a new project.
2. **Execute the Database Schema**:
   - In your Supabase Project Dashboard, navigate to the **SQL Editor** tab.
   - Open [supabase-schema.sql](file:///e:/website_project/salon_web/supabase-schema.sql), copy its entire contents, paste it into the Supabase SQL editor, and click **RUN**.
   - This creates all tables (`salon_settings`, `service_categories`, `services`, `staff`, `staff_availability`, `customers`, `bookings`), RLS policies, double-booking prevention functions, and seeds default services and staff.
   - *Note*: Customers and Bookings tables start completely empty for real client appointments.
3. **Add Your Supabase Credentials**:
   - In Supabase, go to **Project Settings** → **API**.
   - Copy your **Project URL** and **anon public key**.
   - Open [js/supabase-config.js](file:///e:/website_project/salon_web/js/supabase-config.js) and paste them in the `SUPABASE_CONFIG` object:
     ```javascript
     const SUPABASE_CONFIG = {
       url: 'https://your-project-id.supabase.co',
       anonKey: 'your-anon-public-key-here'
     };
     ```
   - Save the file. The website is now fully connected to your live database!

---

## 🛠️ Admin & Staff Management Portal

- **URL**: `admin.html`
- **Features**:
  - **Live Dashboard**: Today's booking count, estimated weekly revenue in PKR, active specialists and treatments.
  - **Appointment Management**: Filter by status (*Pending, Confirmed, Completed, Cancelled*), filter by date, instant search by customer name/phone/ref, mark as completed, cancel, and WhatsApp chat launcher.
  - **Treatment Catalog CRUD**: Add, edit, or delete services, set duration (minutes), category, and price in PKR.
  - **Specialist Management**: Add/edit stylists, assign specialties, and toggle active availability.
  - **Salon Settings**: Edit Karachi address, contact numbers, opening/closing hours, and slot intervals.
- **Demo Access**: Click the **"1-Click Demo Login"** button or enter password `admin123`.

---

## 🤖 Automated AI Article Generator (GitHub Actions)

The website features an automated GitHub Action (`.github/workflows/auto-article.yml`) powered by **Google Gemini AI**:
1. **Searches & Identifies Trending Salon Topics**: Automatically discovers trending beauty, skincare, haircare, and bridal topics tailored for Karachi clients.
2. **Generates High-Quality Articles**: Produces rich editorial content attributed to our certified master specialists with expert advice and service booking links.
3. **Auto-Publishes & Deploys**: Automatically appends the new article into `js/articles.js`, commits, and pushes to `main` branch, triggering instant redeployment.

### How to Trigger:
- **Automatic**: Runs automatically twice a week (every Monday & Thursday at 11:00 AM PKT).
- **Manual (1-Click)**:
  1. Go to your GitHub repository -> **Actions** tab.
  2. Select **Auto-Generate Trending Salon Article**.
  3. Click **Run workflow** -> **Run workflow**.

### Configuring Your Gemini API Key Secret:
1. In your GitHub repository, go to **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret**.
3. Name: `GEMINI_API_KEY`
4. Value: Paste your Gemini API Key.
5. Click **Add secret**.

---

## 🌐 Free 1-Minute Deployment

### Deploy with Netlify Drop (Easiest)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `salon_web` folder onto the browser window.
3. Your website is instantly live with a custom HTTPS URL!

### Deploy with Vercel
1. Install Vercel CLI (`npx vercel`) or push the folder to a GitHub repository and import it into [vercel.com](https://vercel.com).
2. Select default static settings and click Deploy.

### Deploy with GitHub Pages
1. Push the files to a GitHub repository.
2. In repository **Settings** → **Pages**, set Branch to `main` and root folder `/`.
3. Save, and your site is live at `https://<username>.github.io/<repo-name>/`.

---

## 📞 Karachi Salon Details (Placeholder Defaults)
- **Salon Name**: Serene Sanctuary Salon & Spa
- **Location**: Plot 14-C, Main Khayaban-e-Shahbaz, Phase 6, D.H.A, Karachi, Pakistan
- **Hours**: Monday to Sunday, 11:00 AM – 08:00 PM
- **Contact / WhatsApp**: `+92 300 9876543`
