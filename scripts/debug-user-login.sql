-- Script para debuggear el problema de login
-- Verificar si el usuario existe
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  CASE 
    WHEN password_hash IS NOT NULL THEN 'Hash presente (' || LENGTH(password_hash) || ' chars)'
    ELSE 'Sin hash' 
  END as password_status,
  SUBSTRING(password_hash, 1, 20) || '...' as hash_preview
FROM users 
WHERE email = 'estudiante@test.com';

-- Verificar estructura de la tabla users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
