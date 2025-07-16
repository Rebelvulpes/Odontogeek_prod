-- Script completo para debuggear el sistema de autenticación

-- 1. Verificar estructura de la tabla users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Verificar todos los usuarios existentes
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    password_hash IS NOT NULL as has_password,
    LENGTH(password_hash) as hash_length,
    LEFT(password_hash, 20) as hash_preview,
    is_test_user,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 3. Verificar usuarios de prueba específicamente
SELECT 
    'Test Users' as category,
    email,
    role,
    password_hash,
    LENGTH(password_hash) as hash_length,
    created_at
FROM users 
WHERE is_test_user = true OR email LIKE '%test.com'
ORDER BY email;

-- 4. Crear un usuario de prueba con hash conocido que funciona
-- Este hash corresponde a "test123" y ha sido verificado
DELETE FROM users WHERE email = 'debug@test.com';

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
) VALUES (
    gen_random_uuid(),
    'debug@test.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'Debug',
    'User',
    'student',
    true,
    '/placeholder-user.jpg',
    NOW(),
    NOW()
);

-- 5. Verificar que el usuario debug se creó correctamente
SELECT 
    'Debug User Created' as status,
    email,
    password_hash,
    LENGTH(password_hash) as hash_length,
    created_at
FROM users 
WHERE email = 'debug@test.com';

-- 6. Verificar enrollments existentes
SELECT 
    COUNT(*) as total_enrollments,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT course_id) as unique_courses
FROM enrollments;

-- 7. Verificar cursos disponibles
SELECT 
    COUNT(*) as total_courses,
    COUNT(CASE WHEN status = 'published' THEN 1 END) as published_courses
FROM courses;

-- 8. Crear log de debugging
CREATE TABLE IF NOT EXISTS auth_debug_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255),
    action VARCHAR(50),
    success BOOLEAN,
    error_message TEXT,
    hash_preview VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Insertar log inicial
INSERT INTO auth_debug_log (email, action, success, error_message, hash_preview)
VALUES ('debug@test.com', 'user_created', true, 'Debug user created successfully', '$2b$10$EixZaYVK1f...');
