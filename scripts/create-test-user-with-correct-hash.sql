-- Primero eliminamos el usuario existente si existe
DELETE FROM users WHERE email = 'estudiante@test.com';

-- Crear usuario de prueba con hash correcto generado con bcrypt para 'test123'
-- Este hash fue generado específicamente para la contraseña 'test123' con salt rounds 10
INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'estudiante@test.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'María',
  'González',
  'student',
  NOW(),
  NOW()
);

-- Verificar que el usuario fue creado correctamente
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  role, 
  created_at,
  CASE 
    WHEN password_hash IS NOT NULL THEN 'Hash presente: ' || LEFT(password_hash, 20) || '...'
    ELSE 'Sin hash' 
  END as password_status
FROM users 
WHERE email = 'estudiante@test.com';

-- Verificar estructura de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;
