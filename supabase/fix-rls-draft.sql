-- FIX RLS PARA PROPERTY_DRAFTS
-- Ejecutar en Supabase Dashboard → SQL Editor

-- 1. Habilitar RLS (si no está habilitado)
ALTER TABLE property_drafts ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes que puedan conflictuar
DROP POLICY IF EXISTS "Allow authenticated insert" ON property_drafts;
DROP POLICY IF EXISTS "Allow authenticated select" ON property_drafts;
DROP POLICY IF EXISTS "Allow authenticated update" ON property_drafts;
DROP POLICY IF EXISTS "Allow authenticated delete" ON property_drafts;

-- 3. Crear políticas para usuarios autenticados
CREATE POLICY "Allow authenticated insert"
ON property_drafts FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated select"
ON property_drafts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated update"
ON property_drafts FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated delete"
ON property_drafts FOR DELETE
TO authenticated
USING (true);

-- 4. También permitir a usuarios anónimos (para testing)
-- Si quieres que funcione sin login, descomenta esto:
-- CREATE POLICY "Allow anon insert"
-- ON property_drafts FOR INSERT
-- TO anon
-- WITH CHECK (true);

-- Verificar que las políticas se crearon
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'property_drafts';
