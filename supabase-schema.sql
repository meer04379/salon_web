-- ==============================================================================
-- SALON DEMO - SUPABASE DATABASE SCHEMA
-- Beauty Salon & Luxury Spa (Karachi, Pakistan)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if re-running (clean slate)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS staff_availability CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS salon_settings CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- ------------------------------------------------------------------------------
-- 1. SALON SETTINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE salon_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_name VARCHAR(255) NOT NULL DEFAULT 'Serene Sanctuary Salon & Spa',
    tagline VARCHAR(255) DEFAULT 'Luxury Beauty, Wellness & Bridal Experience in Karachi',
    phone VARCHAR(50) DEFAULT '+92 300 1234567',
    whatsapp VARCHAR(50) DEFAULT '+92 300 1234567',
    email VARCHAR(255) DEFAULT 'appointments@serenesalon.pk',
    address TEXT DEFAULT 'Plot 12-C, 7th Commercial Lane, Zamzama, Clifton',
    city VARCHAR(100) DEFAULT 'Karachi',
    country VARCHAR(100) DEFAULT 'Pakistan',
    opening_time TIME NOT NULL DEFAULT '11:00:00',
    closing_time TIME NOT NULL DEFAULT '20:00:00',
    slot_interval_minutes INT NOT NULL DEFAULT 30,
    buffer_minutes INT NOT NULL DEFAULT 15,
    currency VARCHAR(10) DEFAULT 'PKR',
    currency_symbol VARCHAR(10) DEFAULT 'Rs.',
    hero_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. SERVICE CATEGORIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'sparkles',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. SERVICES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    duration_minutes INT NOT NULL DEFAULT 45,
    image_url TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. STAFF TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    role_title VARCHAR(150) DEFAULT 'Beauty Specialist',
    specialties TEXT,
    bio TEXT,
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. STAFF AVAILABILITY (WORKING HOURS / OFF-DAYS)
-- ------------------------------------------------------------------------------
CREATE TABLE staff_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL DEFAULT '11:00:00',
    end_time TIME NOT NULL DEFAULT '20:00:00',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. CUSTOMERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);

-- ------------------------------------------------------------------------------
-- 7. BOOKINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref VARCHAR(20) NOT NULL UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    service_name VARCHAR(255) NOT NULL,
    staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
    staff_name VARCHAR(150),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45,
    total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_staff_date ON bookings(staff_id, booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_ref ON bookings(booking_ref);

-- ------------------------------------------------------------------------------
-- 8. HELPER FUNCTION: DOUBLE-BOOKING CONFLICT CHECK
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_booking_conflict(
    p_staff_id UUID,
    p_booking_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INT;
BEGIN
    IF p_staff_id IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT COUNT(*)
    INTO conflict_count
    FROM bookings
    WHERE staff_id = p_staff_id
      AND booking_date = p_booking_date
      AND status NOT IN ('cancelled')
      AND (id <> p_exclude_booking_id OR p_exclude_booking_id IS NULL)
      AND (
          (start_time < p_end_time AND end_time > p_start_time)
      );

    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE salon_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public READ
CREATE POLICY "Public can view salon settings" ON salon_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active categories" ON service_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active staff" ON staff FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view staff availability" ON staff_availability FOR SELECT USING (true);
CREATE POLICY "Public can view booking slots" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public can insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view own booking via reference" ON bookings FOR SELECT USING (true);

-- Authenticated Admin Full Access
CREATE POLICY "Admin full access salon_settings" ON salon_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access service_categories" ON service_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access services" ON services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access staff" ON staff FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access staff_availability" ON staff_availability FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access customers" ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access bookings" ON bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 10. REALTIME CONFIGURATION
-- ------------------------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- ------------------------------------------------------------------------------
-- 11. SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO salon_settings (salon_name, tagline, phone, whatsapp, email, address, city, country, opening_time, closing_time, slot_interval_minutes, buffer_minutes, currency, currency_symbol)
VALUES (
    'Serene Sanctuary Salon & Spa',
    'Karachi’s Premier Destination for Luxury Hair, Skin & Bridal Transformations',
    '+92 300 9876543',
    '+92 300 9876543',
    'hello@serenesalon.pk',
    'Plot 14-C, Main Khayaban-e-Shahbaz, Phase 6, D.H.A',
    'Karachi',
    'Pakistan',
    '11:00:00',
    '20:00:00',
    30,
    15,
    'PKR',
    'Rs.'
);

-- Service Categories
INSERT INTO service_categories (id, name, slug, description, display_order) VALUES
('c1111111-1111-1111-1111-111111111111', 'Hair Styling & Treatments', 'hair', 'Expert cuts, blowouts, organic keratin treatments & luxury balayage.', 1),
('c2222222-2222-2222-2222-222222222222', 'Skin & Advanced Facials', 'skin', 'Dermatologist-approved HydraFacials, glow peels & deep cleansing.', 2),
('c3333333-3333-3333-3333-333333333333', 'Nails, Mani & Pedi', 'nails', 'Spa manicure, Russian pedicure, gel extensions and custom nail art.', 3),
('c4444444-4444-4444-4444-444444444444', 'Bridal & Party Makeup', 'bridal', 'Signature bridal makeovers, Barat/Walima glams & engagement looks.', 4),
('c5555555-5555-5555-5555-555555555555', 'Spa, Massage & Wellness', 'spa', 'Aromatherapy massages, hot stone therapy, and body polishing rituals.', 5),
('c6666666-6666-6666-6666-666666666666', 'Waxing, Threading & Lashes', 'grooming', 'Full body soothing wax, organic threading, lash lift & tint.', 6);

-- Services
INSERT INTO services (category_id, name, slug, description, price, duration_minutes, image_url, is_popular, display_order) VALUES
('c1111111-1111-1111-1111-111111111111', 'Signature Hair Cut & Blowdry', 'hair-cut-blowdry', 'Personalized consultation, deep conditioning wash, master styling cut & bouncy blowdry.', 3500.00, 45, 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80', true, 1),
('c1111111-1111-1111-1111-111111111111', 'Organic Keratin Protein Infusion', 'keratin-treatment', 'Frizz-free, silky smooth hair revitalization with organic formaldehyde-free serum.', 14500.00, 120, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', true, 2),
('c1111111-1111-1111-1111-111111111111', 'Sun-Kissed Balayage & Gloss', 'balayage-gloss', 'Seamless hand-painted highlights tailored to your skin tone, finished with a nourishing toner.', 18000.00, 150, 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80', false, 3),
('c1111111-1111-1111-1111-111111111111', 'Deep Moisture Scalp Spa & Hair Mask', 'scalp-spa-mask', 'Revitalizing scalp massage, steam treatment and botanical oil mask for dry/damaged hair.', 4500.00, 45, 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80', false, 4),
('c2222222-2222-2222-2222-222222222222', 'Serene HydraGlow Facial', 'hydraglow-facial', '7-step medical-grade deep pore vacuum, ultrasonic extraction, hyaluronic infusion and LED therapy.', 8500.00, 60, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80', true, 5),
('c2222222-2222-2222-2222-222222222222', '24K Gold Luxury Radiance Facial', 'gold-radiance-facial', 'Pure 24K gold foil infusion with brightening peptides for luminous, red-carpet ready skin.', 12000.00, 75, 'https://images.unsplash.com/photo-1512290900672-1f5517f694e9?auto=format&fit=crop&w=800&q=80', false, 6),
('c2222222-2222-2222-2222-222222222222', 'Clarifying Anti-Acne Therapy', 'anti-acne-therapy', 'Salicylic acid exfoliation, blue LED light treatment, and soothing botanical tea tree mask.', 6500.00, 50, 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=800&q=80', false, 7),
('c3333333-3333-3333-3333-333333333333', 'Luxury Rose Petal Mani-Pedi Duo', 'rose-petal-mani-pedi', 'Himalayan salt soak, organic rose scrub, cuticle perfection, massage and high-shine OPI polish.', 5500.00, 60, 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80', true, 8),
('c3333333-3333-3333-3333-333333333333', 'Russian Gel Overlay & Custom Nail Art', 'gel-nail-art', 'Precision dry manicure, strengthening BIAB builder gel with bespoke hand-painted nail designs.', 7000.00, 75, 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80', false, 9),
('c4444444-4444-4444-4444-444444444444', 'Royal Barat / Walima Signature Bridal Look', 'signature-bridal-makeup', 'Complete HD airbrush bridal makeup, dupatta/jewelry setting, high-end bridal hairstyle, eyelashes and lenses.', 35000.00, 180, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80', true, 10),
('c4444444-4444-4444-4444-444444444444', 'Engagement & Nikkah Glam', 'engagement-nikkah-glam', 'Soft radiant glow glam, custom eyes, romantic half-updo or soft curls with bridal lashes.', 20000.00, 120, 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', false, 11),
('c4444444-4444-4444-4444-444444444444', 'Signature Party / Evening Glam Makeup', 'party-glam-makeup', 'Full coverage flawless event makeup with statement eye makeup, lashes and custom blowdry styling.', 9500.00, 60, 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=800&q=80', false, 12),
('c5555555-5555-5555-5555-555555555555', 'Aromatherapy Stress Relief Full Body Massage', 'aromatherapy-massage', 'Lavender and eucalyptus warm oil massage targeting muscle knots, tension and promoting deep sleep.', 9000.00, 60, 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80', true, 13),
('c5555555-5555-5555-5555-555555555555', 'Hot Stone & Herbal Detox Therapy', 'hot-stone-massage', 'Heated volcanic stones glide across tension points to boost lymphatic circulation and release stress.', 12500.00, 75, 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80', false, 14),
('c6666666-6666-6666-6666-666666666666', 'Full Body RICA Soothing Wax', 'full-body-rica-wax', 'Gentle Italian Rica wax enriched with aloe vera and titanium dioxide for sensitive, smooth skin.', 8000.00, 60, 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80', false, 15),
('c6666666-6666-6666-6666-666666666666', 'Keratin Lash Lift & Brow Lamination Duo', 'lash-lift-brow-lamination', 'Semi-permanent curl and nourishment for your natural lashes paired with sculpted fluffy brows.', 6500.00, 60, 'https://images.unsplash.com/photo-1583001809873-a128495da465?auto=format&fit=crop&w=800&q=80', false, 16);

-- Staff Members (Fixed Hex UUIDs)
INSERT INTO staff (id, name, role_title, specialties, bio, avatar_url, display_order) VALUES
('f1111111-1111-1111-1111-111111111111', 'Ayesha Malik', 'Senior Hair Artistry Lead', 'Balayage, Keratin, Precision Cuts', 'Trained in Dubai & London with 9+ years elevating luxury hair styling in Karachi.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80', 1),
('f2222222-2222-2222-2222-222222222222', 'Dr. Zara Alvi', 'Master Esthetician & Skin Specialist', 'HydraFacials, Peels, Anti-Aging', 'Certified aesthetic clinician specializing in clinical skin rejuvenation and non-invasive glow treatments.', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80', 2),
('f3333333-3333-3333-3333-333333333333', 'Sana Mir', 'Celebrity Bridal & Glamour Artist', 'Bridal Makeovers, Airbrush, Eye Art', 'Iconic makeup specialist known for modern ethereal bridal glam and red-carpet finishes.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 3),
('f4444444-4444-4444-4444-444444444444', 'Fatima Noor', 'Certified Spa & Wellness Therapist', 'Deep Tissue, Aromatherapy, Hot Stone', 'Dedicated therapist with 8+ years practicing holistic Asian spa rituals and muscle tension relief.', 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=400&q=80', 4);

-- Staff Availability (Default 11:00 AM to 8:00 PM every day Mon-Sun)
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time, is_available)
SELECT s.id, d.day_num, '11:00:00', '20:00:00', true
FROM staff s
CROSS JOIN (
    SELECT 0 AS day_num UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) d;