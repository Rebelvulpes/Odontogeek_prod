-- Crear usuario de prueba con hash real de bcrypt para 'test123'
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
  '$2b$10$K7L/8Y3NTCS..vfL/4Av4.WQgqyPia1kJSMy/4EiYPiremkK6H0jG',
  'María',
  'González',
  'student',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$K7L/8Y3NTCS..vfL/4Av4.WQgqyPia1kJSMy/4EiYPiremkK6H0jG',
  first_name = 'María',
  last_name = 'González',
  role = 'student',
  updated_at = NOW();

-- Verificar que el usuario fue creado correctamente
SELECT id, email, first_name, last_name, role, created_at, 
       CASE WHEN password_hash IS NOT NULL THEN 'Hash presente' ELSE 'Sin hash' END as password_status
FROM users 
WHERE email = 'estudiante@test.com';
