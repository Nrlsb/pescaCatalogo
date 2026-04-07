-- ============================================================
-- PESCASHOP - SUPABASE SCHEMA
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------
-- PROFILES (extiende auth.users de Supabase)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name     TEXT,
    phone         TEXT,
    role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- CATEGORIES
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    slug          TEXT NOT NULL UNIQUE,
    description   TEXT,
    image_url     TEXT,
    parent_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order    INT NOT NULL DEFAULT 0,
    is_active     BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- PRODUCTS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id        UUID REFERENCES categories(id) ON DELETE SET NULL,
    name               TEXT NOT NULL,
    slug               TEXT NOT NULL UNIQUE,
    description        TEXT,
    sku                TEXT UNIQUE,
    brand              TEXT,
    price              NUMERIC(10,2) NOT NULL,
    compare_at_price   NUMERIC(10,2),
    cost_price         NUMERIC(10,2),
    weight_grams       INT,
    images             TEXT[] DEFAULT '{}',
    is_active          BOOLEAN NOT NULL DEFAULT true,
    is_featured        BOOLEAN NOT NULL DEFAULT false,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Variantes de producto (talla, color, etc.)
CREATE TABLE IF NOT EXISTS product_variants (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    sku           TEXT UNIQUE,
    price_delta   NUMERIC(10,2) NOT NULL DEFAULT 0,
    sort_order    INT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- INVENTORY
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id    UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id    UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity      INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (product_id, variant_id)
);

-- Historial de movimientos de stock
CREATE TABLE IF NOT EXISTS inventory_movements (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id    UUID NOT NULL REFERENCES products(id),
    variant_id    UUID REFERENCES product_variants(id),
    delta         INT NOT NULL,
    reason        TEXT NOT NULL CHECK (reason IN (
                      'sale_online', 'sale_pos', 'purchase', 'adjustment', 'return', 'damage'
                  )),
    reference_id  UUID,
    notes         TEXT,
    created_by    UUID REFERENCES profiles(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- ORDERS
-- ----------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE TABLE IF NOT EXISTS orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number        TEXT NOT NULL UNIQUE,
    customer_id         UUID REFERENCES profiles(id),
    channel             TEXT NOT NULL DEFAULT 'online' CHECK (channel IN ('online', 'pos')),
    status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                            'pending', 'confirmed', 'processing',
                            'shipped', 'delivered', 'cancelled', 'refunded'
                        )),
    shipping_name       TEXT,
    shipping_email      TEXT,
    shipping_phone      TEXT,
    shipping_address    JSONB,
    shipping_method     TEXT,
    shipping_cost       NUMERIC(10,2) NOT NULL DEFAULT 0,
    subtotal            NUMERIC(10,2) NOT NULL,
    discount_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax_amount          NUMERIC(10,2) NOT NULL DEFAULT 0,
    total               NUMERIC(10,2) NOT NULL,
    payment_method      TEXT,
    payment_status      TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
                            'pending', 'paid', 'failed', 'refunded'
                        )),
    payment_reference   TEXT,
    pos_cashier_id      UUID REFERENCES profiles(id),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Items de cada pedido
CREATE TABLE IF NOT EXISTS order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    variant_id      UUID REFERENCES product_variants(id),
    product_name    TEXT NOT NULL,
    variant_name    TEXT,
    sku             TEXT,
    quantity        INT NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(10,2) NOT NULL,
    subtotal        NUMERIC(10,2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- COUPONS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code             TEXT NOT NULL UNIQUE,
    type             TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
    value            NUMERIC(10,2) NOT NULL,
    min_order_amount NUMERIC(10,2),
    max_uses         INT,
    used_count       INT NOT NULL DEFAULT 0,
    expires_at       TIMESTAMPTZ,
    is_active        BOOLEAN NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- VIEWS
-- ----------------------------------------------------------------

-- Stock por producto
CREATE OR REPLACE VIEW product_stock AS
SELECT
    p.id AS product_id,
    p.name,
    p.sku,
    p.low_stock_threshold,
    COALESCE(SUM(i.quantity), 0) AS total_stock,
    CASE
        WHEN COALESCE(SUM(i.quantity), 0) = 0 THEN 'out_of_stock'
        WHEN COALESCE(SUM(i.quantity), 0) <= p.low_stock_threshold THEN 'low_stock'
        ELSE 'in_stock'
    END AS stock_status
FROM products p
LEFT JOIN inventory i ON i.product_id = p.id
GROUP BY p.id;

-- Ventas diarias
CREATE OR REPLACE VIEW daily_sales AS
SELECT
    DATE(created_at) AS sale_date,
    channel,
    COUNT(*) AS order_count,
    SUM(total) AS revenue
FROM orders
WHERE payment_status = 'paid'
GROUP BY DATE(created_at), channel
ORDER BY sale_date DESC;

-- ----------------------------------------------------------------
-- TRIGGERS
-- ----------------------------------------------------------------

-- Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-crear profile al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-generar número de pedido legible
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number = 'ORD-' || TO_CHAR(now(), 'YYYY') ||
                       LPAD(nextval('order_number_seq')::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_order_number
    BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ----------------------------------------------------------------
-- HELPER FUNCTIONS FOR RLS (To avoid infinite recursion)
-- ----------------------------------------------------------------

-- Verificar si el usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Verificar si el usuario es staff o admin
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'staff')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ----------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Profiles: cada usuario ve/edita solo el suyo
DROP POLICY IF EXISTS "profiles_own_select" ON profiles;
CREATE POLICY "profiles_own_select" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_own_update" ON profiles;
CREATE POLICY "profiles_own_update" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admin puede ver todos los profiles
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all" ON profiles
    FOR ALL USING (is_admin());

-- Products: lectura pública para productos activos
DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products
    FOR SELECT USING (is_active = true);

-- Products: admin puede todo
DROP POLICY IF EXISTS "products_admin_all" ON products;
CREATE POLICY "products_admin_all" ON products
    FOR ALL USING (is_admin());

-- Categories: lectura pública
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories
    FOR SELECT USING (is_active = true);

-- Categories: admin puede todo
DROP POLICY IF EXISTS "categories_admin_all" ON categories;
CREATE POLICY "categories_admin_all" ON categories
    FOR ALL USING (is_admin());

-- Product variants: lectura pública
DROP POLICY IF EXISTS "variants_public_read" ON product_variants;
CREATE POLICY "variants_public_read" ON product_variants
    FOR SELECT USING (true);

-- Inventory: lectura pública
DROP POLICY IF EXISTS "inventory_public_read" ON inventory;
CREATE POLICY "inventory_public_read" ON inventory
    FOR SELECT USING (true);

-- Inventory: solo admin/staff pueden modificar
DROP POLICY IF EXISTS "inventory_staff_write" ON inventory;
CREATE POLICY "inventory_staff_write" ON inventory
    FOR ALL USING (is_staff_or_admin());

-- Inventory movements: admin/staff
DROP POLICY IF EXISTS "movements_staff_all" ON inventory_movements;
CREATE POLICY "movements_staff_all" ON inventory_movements
    FOR ALL USING (is_staff_or_admin());

-- Orders: clientes ven solo los suyos
DROP POLICY IF EXISTS "orders_own" ON orders;
CREATE POLICY "orders_own" ON orders
    FOR SELECT USING (customer_id = auth.uid());

-- Orders: admin/staff ven todos
DROP POLICY IF EXISTS "orders_staff_all" ON orders;
CREATE POLICY "orders_staff_all" ON orders
    FOR ALL USING (is_staff_or_admin());

-- Orders: permite insertar a usuarios autenticados (para checkout)
DROP POLICY IF EXISTS "orders_insert_auth" ON orders;
CREATE POLICY "orders_insert_auth" ON orders
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR customer_id IS NULL);

-- Order items: siguen las mismas reglas que orders
DROP POLICY IF EXISTS "order_items_own" ON order_items;
CREATE POLICY "order_items_own" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid())
    );

DROP POLICY IF EXISTS "order_items_staff_all" ON order_items;
CREATE POLICY "order_items_staff_all" ON order_items
    FOR ALL USING (is_staff_or_admin());

-- ----------------------------------------------------------------
-- DATOS DE EJEMPLO (seed)
-- ----------------------------------------------------------------

-- Categorías iniciales
INSERT INTO categories (name, slug, sort_order) VALUES
    ('Cañas', 'canas', 1),
    ('Señuelos', 'sensuelos', 2),
    ('Líneas y sedal', 'lineas', 3),
    ('Anzuelos', 'anzuelos', 4),
    ('Accesorios', 'accesorios', 5),
    ('Ofertas', 'ofertas', 6)
ON CONFLICT (slug) DO NOTHING;
