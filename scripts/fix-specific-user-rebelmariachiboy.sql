-- Script para verificar y arreglar el usuario específico rebelmariachiboy@gmail.com

-- 1. Verificar si el usuario existe
SELECT 
    'Usuario Existente' as status,
    id,
    email,
    first_name,
    last_name,
    role,
    password_hash IS NOT NULL as has_password,
    LENGTH(password_hash) as hash_length,
    LEFT(password_hash, 30) as hash_preview,
    created_at,
    updated_at
FROM users 
WHERE email = 'rebelmariachiboy@gmail.com';

-- 2. Si el usuario existe pero tiene problemas con el hash, lo arreglamos
UPDATE users 
SET 
    password_hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    updated_at = NOW()
WHERE email = 'rebelmariachiboy@gmail.com' 
AND (password_hash IS NULL OR LENGTH(password_hash) < 50);

-- 3. Si el usuario no existe, lo creamos con un hash que sabemos que funciona
INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_test_user,
    avatar_url,
    created_at,
    updated_at
) 
SELECT 
    gen_random_uuid(),
    'rebelmariachiboy@gmail.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Usuario',
    'Rebel',
    'student',
    false,
    '/placeholder-user.jpg',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'rebelmariachiboy@gmail.com'
);

-- 4. Verificar que el usuario está correctamente configurado
SELECT 
    'Usuario Verificado' as status,
    id,
    email,
    first_name,
    last_name,
    role,
    password_hash,
    LENGTH(password_hash) as hash_length,
    created_at
FROM users 
WHERE email = 'rebelmariachiboy@gmail.com';

-- 5. Crear log de la operación
INSERT INTO auth_debug_log (email, action, success, error_message, hash_preview)
VALUES (
    'rebelmariachiboy@gmail.com', 
    'user_fixed', 
    true, 
    'Usuario arreglado/creado con hash funcional', 
    '$2b$10$EixZaYVK1f...'
);
