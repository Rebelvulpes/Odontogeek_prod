-- Script para probar directamente el hash de bcrypt
-- Primero eliminamos cualquier usuario de prueba existente
DELETE FROM users WHERE email = 'test-bcrypt@test.com';

-- Insertamos un usuario con un hash que sabemos que es correcto
-- Este hash fue generado con: await bcrypt.hash('test123', 10)
INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_test_user,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'test-bcrypt@test.com',
    '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Test',
    'Bcrypt',
    'student',
    true,
    NOW(),
    NOW()
);

-- Verificar que se creó correctamente
SELECT 
    email,
    password_hash,
    LENGTH(password_hash) as hash_length,
    created_at
FROM users 
WHERE email = 'test-bcrypt@test.com';

-- También actualizar el usuario estudiante existente con el mismo hash
UPDATE users 
SET password_hash = '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    updated_at = NOW()
WHERE email = 'estudiante@test.com';

-- Verificar ambos usuarios
SELECT 
    email,
    LEFT(password_hash, 30) as hash_preview,
    LENGTH(password_hash) as hash_length
FROM users 
WHERE email IN ('estudiante@test.com', 'test-bcrypt@test.com');
