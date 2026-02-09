-- Función para decrementar stock al vender
CREATE OR REPLACE FUNCTION decrement_stock(
  variant_id UUID,
  amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity - amount
  WHERE id = variant_id
  AND stock_quantity >= amount;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuficiente o variante no encontrada';
  END IF;
END;
$$;

-- Función para incrementar stock (devoluciones o reposición)
CREATE OR REPLACE FUNCTION increment_stock(
  variant_id UUID,
  amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE product_variants
  SET stock_quantity = stock_quantity + amount
  WHERE id = variant_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Variante no encontrada';
  END IF;
END;
$$;

-- Función para obtener resumen de inventario por producto
CREATE OR REPLACE FUNCTION get_product_stock_summary(product_uuid UUID)
RETURNS TABLE (
  total_variants BIGINT,
  total_stock BIGINT,
  low_stock_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_variants,
    COALESCE(SUM(stock_quantity), 0)::BIGINT as total_stock,
    COUNT(*) FILTER (WHERE stock_quantity <= min_stock_alert)::BIGINT as low_stock_count
  FROM product_variants
  WHERE product_id = product_uuid;
END;
$$;
