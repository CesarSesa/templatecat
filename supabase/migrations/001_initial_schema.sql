-- =====================================================
-- PROYECTO MICHE - TIENDA DE ROPA
-- Base de datos inicial
-- =====================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CATEGORÍAS
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Seed inicial
INSERT INTO categories (name, slug, sort_order) VALUES
('Vestidos', 'vestidos', 1),
('Poleras y Tops', 'poleras', 2),
('Pantalones', 'pantalones', 3),
('Faldas', 'faldas', 4),
('Chaquetas', 'chaquetas', 5),
('Ropa Interior', 'ropa-interior', 6),
('Accesorios', 'accesorios', 7);

-- 3. PRODUCTOS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  price INTEGER NOT NULL,
  cost_price INTEGER,
  currency VARCHAR(3) DEFAULT 'CLP',
  category_id UUID REFERENCES categories(id),
  available_sizes TEXT[] DEFAULT ARRAY['XS','S','M','L','XL'],
  available_colors TEXT[] DEFAULT ARRAY['Negro','Blanco','Azul','Rojo'],
  images TEXT[],
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 4. VARIANTES DE INVENTARIO
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL,
  color VARCHAR(50) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 3,
  sku VARCHAR(50),
  UNIQUE(product_id, size, color)
);

-- 5. VENTAS
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_date TIMESTAMP DEFAULT now(),
  total_amount INTEGER NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 6. ITEMS DE VENTA
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  product_name VARCHAR(255),
  size VARCHAR(10),
  color VARCHAR(50),
  quantity INTEGER DEFAULT 1,
  unit_price INTEGER,
  unit_cost INTEGER,
  subtotal INTEGER GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- 7. GASTOS
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE DEFAULT CURRENT_DATE,
  category VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  supplier_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

-- 8. PERFILES DE USUARIO
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  phone VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (id)
);

-- 9. ÍNDICES
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_stock ON product_variants(stock_quantity);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_expenses_date ON expenses(expense_date);

-- 10. RLS (SEGURIDAD)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Public read active products"
ON products FOR SELECT TO public USING (active = true);

CREATE POLICY "Admin full access products"
ON products FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin full access variants"
ON product_variants FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin full access sales"
ON sales FOR ALL TO authenticated USING (true);

CREATE POLICY "Admin full access expenses"
ON expenses FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 11. STORAGE BUCKET PARA IMÁGENES
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas Storage
CREATE POLICY "Public read products images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

CREATE POLICY "Authenticated upload products"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- 12. VISTAS PARA DASHBOARD
CREATE VIEW low_stock_alert AS
SELECT 
  p.name as product_name,
  pv.size,
  pv.color,
  pv.stock_quantity,
  pv.min_stock_alert
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.stock_quantity <= pv.min_stock_alert
AND p.active = true;

CREATE VIEW daily_sales_summary AS
SELECT 
  DATE(sale_date) as date,
  COUNT(*) as total_sales,
  SUM(total_amount) as total_revenue
FROM sales
GROUP BY DATE(sale_date)
ORDER BY date DESC;
