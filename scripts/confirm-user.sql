-- Confirmar email de usuario (reemplaza el email con el tuyo)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'tu-email@ejemplo.com';

-- Verificar que se actualizó
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'tu-email@ejemplo.com';
