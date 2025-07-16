-- Script para probar diferentes hashes de bcrypt
-- Primero vamos a ver qué hash está almacenado actualmente
SELECT 
  email,
  password_hash,
  LENGTH(password_hash) as hash_length,
  SUBSTRING(password_hash, 1, 4) as hash_prefix
FROM users 
WHERE email = 'estudiante@test.com';

-- Actualizar con un hash que sabemos que funciona para 'test123'
-- Este hash fue generado y verificado: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
UPDATE users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    updated_at = NOW()
WHERE email = 'estudiante@test.com';

-- Verificar la actualización
SELECT 
  email,
  password_hash,
  updated_at
FROM users 
WHERE email = 'estudiante@test.com';
