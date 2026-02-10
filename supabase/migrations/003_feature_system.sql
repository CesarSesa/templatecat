-- =====================================================
-- SISTEMA DE FEATURES MODULAR - CATALOGKIT
-- Soporta planes: basic ($50), pro ($80), premium ($120)
-- =====================================================

-- 1. TABLA DE FEATURES DISPONIBLES
CREATE TABLE features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(50) UNIQUE NOT NULL,           -- Identificador único
  name VARCHAR(100) NOT NULL,                -- Nombre legible
  description TEXT,                          -- Descripción para UI
  category VARCHAR(50) NOT NULL,             -- 'core', 'inventory', 'sales', 'analytics'
  default_enabled BOOLEAN DEFAULT false,     -- ¿Activo por defecto?
  min_plan VARCHAR(20) DEFAULT 'basic',      -- 'basic' | 'pro' | 'premium'
  requires_setup BOOLEAN DEFAULT false,      -- ¿Requiere configuración inicial?
  created_at TIMESTAMP DEFAULT now()
);

-- 2. TABLA DE CONFIGURACIÓN POR TENANT (Singleton para single-tenant)
-- En multi-tenant, esto sería por tenant_id
CREATE TABLE tenant_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL DEFAULT 'Mi Negocio',
  business_type VARCHAR(50) DEFAULT 'retail', -- 'retail' | 'services' | 'restaurant'
  plan VARCHAR(20) DEFAULT 'basic',           -- 'basic' | 'pro' | 'premium' | 'custom'
  plan_expires_at TIMESTAMP,
  currency VARCHAR(3) DEFAULT 'CLP',
  timezone VARCHAR(50) DEFAULT 'America/Santiago',
  features_override JSONB DEFAULT '{}',       -- Override de features: {"expenses": true}
  settings JSONB DEFAULT '{}',                -- Configuración adicional
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- 3. TABLA DE FEATURES HABILITADAS (para tracking y auditoría)
CREATE TABLE tenant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key VARCHAR(50) REFERENCES features(key) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  enabled_at TIMESTAMP DEFAULT now(),
  enabled_by UUID REFERENCES auth.users,
  metadata JSONB DEFAULT '{}',               -- Config específica de la feature
  UNIQUE(feature_key)
);

-- 4. SEED: FEATURES DISPONIBLES
INSERT INTO features (key, name, description, category, default_enabled, min_plan, requires_setup) VALUES
-- CORE (TODOS LOS PLANES)
('products', 'Gestión de Productos', 'Catálogo de productos básico', 'core', true, 'basic', false),
('public_catalog', 'Catálogo Público', 'Página de catálogo visible al público', 'core', true, 'basic', false),
('categories', 'Categorías', 'Organización por categorías', 'core', true, 'basic', false),
('images', 'Imágenes de Productos', 'Subida y gestión de imágenes', 'core', true, 'basic', true),

-- INVENTARIO (PRO+)
('inventory', 'Control de Inventario', 'Stock tracking y variantes', 'inventory', false, 'pro', true),
('stock_alerts', 'Alertas de Stock Bajo', 'Notificaciones cuando stock es bajo', 'inventory', false, 'pro', false),
('variants', 'Variantes (Talla/Color)', 'Gestión de variantes de productos', 'inventory', false, 'pro', false),
('barcodes', 'Códigos de Barra/SKU', 'Sistema de SKÚs y códigos de barra', 'inventory', false, 'pro', false),

-- VENTAS (PRO+)
('sales', 'Registro de Ventas', 'Registrar ventas del negocio', 'sales', false, 'pro', false),
('sales_analytics', 'Análisis de Ventas', 'Reportes y gráficos de ventas', 'sales', false, 'pro', false),
('customers', 'Base de Clientes', 'Historial de compras por cliente', 'sales', false, 'pro', false),
('discounts', 'Descuentos y Cupones', 'Sistema de descuentos', 'sales', false, 'premium', false),

-- FINANZAS (PREMIUM)
('expenses', 'Registro de Gastos', 'Tracking de gastos operacionales', 'finance', false, 'premium', false),
('profit_loss', 'Ganancias y Pérdidas', 'Reporte P&L automático', 'finance', false, 'premium', false),
('cash_flow', 'Flujo de Caja', 'Proyección de flujo de caja', 'finance', false, 'premium', false),

-- ANALYTICS (PREMIUM)
('advanced_reports', 'Reportes Avanzados', 'Exportar a Excel/PDF', 'analytics', false, 'premium', false),
('dashboard_widgets', 'Widgets Personalizados', 'Dashboard configurable', 'analytics', false, 'premium', false),

-- ADMIN (PREMIUM)
('multi_user', 'Multi-usuario', 'Roles: admin, vendedor, contador', 'admin', false, 'premium', true),
('api_access', 'API Access', 'Acceso programático a datos', 'admin', false, 'premium', false),
('webhooks', 'Webhooks', 'Integraciones externas', 'admin', false, 'premium', true);

-- 5. INSERTAR CONFIGURACIÓN INICIAL
INSERT INTO tenant_config (business_name, business_type, plan, currency) VALUES
('Mi Negocio', 'retail', 'premium', 'CLP'); -- Por defecto premium para desarrollo

-- 6. HABILITAR FEATURES SEGÚN PLAN
-- Insertar todas las features habilitadas para el plan premium (desarrollo)
INSERT INTO tenant_features (feature_key, enabled)
SELECT key, true FROM features WHERE min_plan IN ('basic', 'pro', 'premium');

-- 7. ÍNDICES
CREATE INDEX idx_tenant_features_enabled ON tenant_features(feature_key, enabled);
CREATE INDEX idx_features_category ON features(category);
CREATE INDEX idx_features_min_plan ON features(min_plan);

-- 8. RLS POLICIES
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_features ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden modificar features
CREATE POLICY "Admin can manage features"
ON features FOR ALL TO authenticated USING (true);

-- Config es singleton, lectura pública para config básica
CREATE POLICY "Public read tenant config"
ON tenant_config FOR SELECT TO public USING (true);

CREATE POLICY "Admin can update tenant config"
ON tenant_config FOR UPDATE TO authenticated USING (true);

-- Features habilitadas: lectura pública
CREATE POLICY "Public read tenant features"
ON tenant_features FOR SELECT TO public USING (true);

CREATE POLICY "Admin can manage tenant features"
ON tenant_features FOR ALL TO authenticated USING (true);

-- 9. FUNCIÓN: VERIFICAR SI UNA FEATURE ESTÁ HABILITADA
CREATE OR REPLACE FUNCTION is_feature_enabled(feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  feature_enabled BOOLEAN;
  plan_level TEXT;
  min_plan_required TEXT;
  plan_values TEXT[] := ARRAY['basic', 'pro', 'premium'];
  plan_index INTEGER;
  min_plan_index INTEGER;
BEGIN
  -- Verificar si hay override en tenant_config
  SELECT (features_override->>feature_name)::BOOLEAN
  INTO feature_enabled
  FROM tenant_config
  LIMIT 1;
  
  -- Si hay override explícito, retornar eso
  IF feature_enabled IS NOT NULL THEN
    RETURN feature_enabled;
  END IF;
  
  -- Obtener plan actual
  SELECT plan INTO plan_level FROM tenant_config LIMIT 1;
  
  -- Obtener plan mínimo requerido para la feature
  SELECT min_plan INTO min_plan_required 
  FROM features 
  WHERE key = feature_name;
  
  -- Si no existe la feature, retornar false
  IF min_plan_required IS NULL THEN
    RETURN false;
  END IF;
  
  -- Comparar niveles de plan
  plan_index := array_position(plan_values, plan_level);
  min_plan_index := array_position(plan_values, min_plan_required);
  
  RETURN plan_index >= min_plan_index;
END;
$$;

-- 10. FUNCIÓN: LISTAR FEATURES DISPONIBLES PARA EL PLAN ACTUAL
CREATE OR REPLACE FUNCTION get_available_features()
RETURNS TABLE (
  key TEXT,
  name TEXT,
  description TEXT,
  category TEXT,
  enabled BOOLEAN,
  min_plan TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_plan TEXT;
BEGIN
  SELECT plan INTO current_plan FROM tenant_config LIMIT 1;
  
  RETURN QUERY
  SELECT 
    f.key::TEXT,
    f.name::TEXT,
    f.description::TEXT,
    f.category::TEXT,
    is_feature_enabled(f.key) as enabled,
    f.min_plan::TEXT
  FROM features f
  ORDER BY 
    CASE f.category 
      WHEN 'core' THEN 1
      WHEN 'inventory' THEN 2
      WHEN 'sales' THEN 3
      WHEN 'finance' THEN 4
      WHEN 'analytics' THEN 5
      WHEN 'admin' THEN 6
    END,
    f.name;
END;
$$;

-- 11. TRIGGER PARA ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_tenant_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenant_config_updated_at
  BEFORE UPDATE ON tenant_config
  FOR EACH ROW
  EXECUTE FUNCTION update_tenant_config_updated_at();
