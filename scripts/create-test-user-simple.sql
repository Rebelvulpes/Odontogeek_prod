-- Crear usuario de prueba simple
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  password_hash,
  created_at
) VALUES (
  gen_random_uuid(),
  'estudiante@test.com',
  'María',
  'González',
  'student',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  password_hash = EXCLUDED.password_hash;

-- Verificar que el usuario fue creado
SELECT 
  'Usuario creado exitosamente' as mensaje,
  id,
  email,
  first_name || ' ' || last_name as nombre_completo,
  role,
  'Contraseña: test123' as info
FROM users 
WHERE email = 'estudiante@test.com';
