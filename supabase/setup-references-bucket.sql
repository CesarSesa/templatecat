-- Crear bucket para archivos de referencia

-- 1. Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('references', 'references', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de acceso para el bucket references

-- Permitir lectura pública
DROP POLICY IF EXISTS "Allow public read references" ON storage.objects;
CREATE POLICY "Allow public read references"
ON storage.objects FOR SELECT
USING (bucket_id = 'references');

-- Permitir escritura a usuarios autenticados
DROP POLICY IF EXISTS "Allow authenticated upload references" ON storage.objects;
CREATE POLICY "Allow authenticated upload references"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'references');

-- Permitir eliminación a usuarios autenticados
DROP POLICY IF EXISTS "Allow authenticated delete references" ON storage.objects;
CREATE POLICY "Allow authenticated delete references"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'references');

-- 3. Verificar configuración
SELECT name, public FROM storage.buckets WHERE id = 'references';
