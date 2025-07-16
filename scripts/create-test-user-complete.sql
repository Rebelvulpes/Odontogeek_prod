-- Crear usuario de prueba con hash de contraseña
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
  '$2b$10$rOzJqQZ8kVZZ8kVZZ8kVZOzJqQZ8kVZZ8kVZZ8kVZOzJqQZ8kVZZ8k', -- hash de 'test123'
  'María',
  'González',
  'student',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

-- Verificar que el usuario fue creado
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
WHERE email = 'estudiante@test.com';
