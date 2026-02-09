-- Agregar soporte multi-moneda a property_drafts

-- Nuevas columnas para manejo de monedas
ALTER TABLE property_drafts 
ADD COLUMN IF NOT EXISTS detected_price_original INTEGER,
ADD COLUMN IF NOT EXISTS detected_price_currency VARCHAR(3) DEFAULT 'CLP';

-- Actualizar registros existentes (si hay price, asumir CLP)
UPDATE property_drafts 
SET detected_price_currency = 'CLP',
    detected_price_original = detected_price
WHERE detected_price IS NOT NULL 
  AND detected_price_currency IS NULL;

-- Verificar columnas creadas
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'property_drafts'
ORDER BY ordinal_position;
