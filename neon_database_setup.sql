-- ==============================================================================
-- NEON DATABASE SETUP SCRIPT FOR PURE ROOTED E-COMMERCE
-- ==============================================================================
-- આ સ્ક્રિપ્ટ કોપી કરીને Neon Dashboard -> Postgres database -> SQL Editor માં Run કરો.
-- ==============================================================================

-- 1. Profiles Table Setup
CREATE TABLE IF NOT EXISTS public.profiles (
  id text PRIMARY KEY,
  full_name text,
  email text,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id text PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id text PRIMARY KEY,
    title text NOT NULL,
    description text,
    price numeric NOT NULL,
    category_id text REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name text,
    image_url text,
    badge text,
    in_stock boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    city text,
    state text,
    zip text,
    total_amount numeric NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id text REFERENCES public.products(id) ON DELETE SET NULL,
    quantity integer NOT NULL,
    price_at_purchase numeric NOT NULL
);

-- ==============================================================================
-- 6. Initial Seed Data (Categories & Products)
-- ==============================================================================
INSERT INTO public.categories (id, name, slug) VALUES 
('cat-1', 'Essential Oils', 'essential-oils'),
('cat-2', 'Skincare', 'skincare'),
('cat-3', 'Herbal Teas', 'herbal-teas'),
('cat-4', 'Rituals & Tools', 'rituals-tools')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, title, description, price, category_id, category_name, image_url, badge, in_stock) VALUES
('p-1', 'Pure Argan Oil', 'Organic cold-pressed argan oil for skin and hair.', 1250.0, 'cat-2', 'Skincare', 'assets/Products/product-argan.webp', 'Premium', true),
('p-2', 'Bamboo Body Brush', 'Exfoliating bamboo brush for dry brushing rituals.', 650.0, 'cat-4', 'Rituals & Tools', 'assets/Products/product-brush.webp', null, true),
('p-3', 'Scented Wellness Candle', 'Hand-poured soy candle with essentials oils.', 850.0, 'cat-4', 'Rituals & Tools', 'assets/Products/product-candle.webp', 'New', true),
('p-4', 'Hydrating Face Cream', 'Deeply nourishing botanical face cream.', 950.0, 'cat-2', 'Skincare', 'assets/Products/product-cream.webp', 'Bestseller', true),
('p-5', 'Jade Gua Sha Stone', 'Traditional cooling jade tool for facial massage.', 1100.0, 'cat-4', 'Rituals & Tools', 'assets/Products/product-guasha.webp', 'Popular', true),
('p-6', 'Hibiscus Bliss Tea', 'Vibrant and refreshing hibiscus herbal blend.', 450.0, 'cat-3', 'Herbal Teas', 'assets/Products/product-hibiscus.webp', null, true),
('p-7', 'Natural Incense Sticks', 'Sandalwood and jasmine natural incense.', 350.0, 'cat-4', 'Rituals & Tools', 'assets/Products/product-incense.webp', null, true),
('p-8', 'Herbal Lip Balm', 'Nourishing peppermint and shea butter lip balm.', 250.0, 'cat-2', 'Skincare', 'assets/Products/product-lipbalm.webp', null, true),
('p-9', 'Ceremonial Matcha', 'High-grade Japanese matcha for focus and energy.', 1450.0, 'cat-3', 'Herbal Teas', 'assets/Products/product-matcha.webp', 'Zen', true),
('p-10', 'Essential Oil Blend', 'A special blend for relaxation and grounding.', 550.0, 'cat-1', 'Essential Oils', 'assets/Products/product-oil.webp', null, true),
('p-11', 'Rosemary Essential Oil', 'Pure rosemary oil for memory and hair care.', 480.0, 'cat-1', 'Essential Oils', 'assets/Products/product-rosemary.webp', null, true),
('p-12', 'White Sage Bundle', 'Sustainably sourced sage for cleansing spaces.', 750.0, 'cat-4', 'Rituals & Tools', 'assets/Products/product-sage.webp', 'Spiritual', true),
('p-13', 'Organic Artisan Soap', 'Cold-processed charcoal and lavender soap.', 380.0, 'cat-2', 'Skincare', 'assets/Products/product-soap.webp', null, true),
('p-14', 'Classic Herbal Tea', 'A comforting blend of root herbs and flowers.', 420.0, 'cat-3', 'Herbal Teas', 'assets/Products/product-tea.webp', null, true),
('p-15', 'Tea Tree Essential Oil', 'Powerful purifying tea tree oil.', 490.0, 'cat-1', 'Essential Oils', 'assets/Products/product-teatree.webp', null, true),
('p-16', 'Turmeric Glow Tea', 'Anti-inflammatory turmeric and ginger blend.', 480.0, 'cat-3', 'Herbal Teas', 'assets/Products/product-turmeric.webp', 'Vitality', true)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 7. Permissions for Neon Data API (PostgREST)
-- ==============================================================================
-- Disable RLS on public tables so Data API can read and update
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anonymous, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anonymous, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anonymous, authenticated;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
