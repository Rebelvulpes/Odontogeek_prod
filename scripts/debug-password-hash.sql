-- Script para debuggear el problema del hash de contraseña

-- 1. Verificar el usuario actual
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    password_hash,
    LENGTH(password_hash) as hash_length,
    LEFT(password_hash, 30) as hash_preview,
    created_at
FROM users 
WHERE email = 'estudiante@test.com';

-- 2. Eliminar y recrear el usuario con hash correcto
DELETE FROM users WHERE email = 'estudiante@test.com';

-- 3. Insertar usuario con hash que sabemos que funciona
-- Este hash corresponde a la contraseña "test123"
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
    'estudiante@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdBJGGqQCQvpJIXOZQeP6.Uq6rOvC',
    'Estudiante',
    'Prueba',
    'student',
    true,
    NOW(),
    NOW()
);

-- 4. Verificar que se insertó correctamente
SELECT 
    'Usuario recreado' as status,
    id,
    email,
    password_hash,
    LENGTH(password_hash) as hash_length
FROM users 
WHERE email = 'estudiante@test.com';

-- 5. Verificar todos los usuarios de prueba
SELECT 
    email,
    role,
    LEFT(password_hash, 30) as hash_preview,
    LENGTH(password_hash) as hash_length,
    is_test_user
FROM users 
WHERE is_test_user = true OR email LIKE '%test.com'
ORDER BY email;
