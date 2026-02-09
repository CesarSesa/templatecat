-- Agregar soporte multi-moneda a properties (tabla pública)

-- Nuevas columnas para manejo de monedas
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS price INTEGER,
ADD COLUMN IF NOT EXISTS price_currency VARCHAR(3) DEFAULT 'CLP';

-- Migrar datos existentes
UPDATE properties 
SET price = price_clp,
    price_currency = 'CLP'
WHERE price_clp IS NOT NULL 
  AND price IS NULL;

-- Verificar columnas
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;
