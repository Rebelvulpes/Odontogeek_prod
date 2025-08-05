-- 1. Verificar estructura de tabla users
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar todos los usuarios existentes
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    CASE 
        WHEN password_hash IS NOT NULL THEN 'Hash presente: ' || LEFT(password_hash, 30) || '...'
        ELSE 'Sin hash' 
    END as password_status,
    LENGTH(password_hash) as hash_length
FROM users 
ORDER BY created_at DESC;

-- 3. Verificar si existe el usuario de prueba específico
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    password_hash,
    created_at
FROM users 
WHERE email = 'estudiante@test.com';

-- 4. Contar total de usuarios por rol
SELECT 
    role,
    COUNT(*) as total
FROM users 
GROUP BY role;

-- 5. Verificar estructura de enrollments si existe
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar enrollments existentes
SELECT 
    e.id,
    e.user_id,
    e.course_id,
    u.email as user_email,
    c.title as course_title,
    e.created_at
FROM enrollments e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN courses c ON e.course_id = c.id
ORDER BY e.created_at DESC;
