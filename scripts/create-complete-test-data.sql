-- Limpiar datos existentes
DELETE FROM lesson_progress WHERE user_id IN (SELECT id FROM users WHERE is_test_user = true);
DELETE FROM enrollments WHERE user_id IN (SELECT id FROM users WHERE is_test_user = true);
DELETE FROM users WHERE is_test_user = true;

-- Crear usuarios de prueba con hashes correctos
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
) VALUES 
-- Admin de prueba (password: test123)
(
    gen_random_uuid(),
    'admin@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdBJGGqQCQvpJIXOZQeP6.Uq6rOvC',
    'Admin',
    'Prueba',
    'admin',
    true,
    '/placeholder-user.jpg',
    NOW(),
    NOW()
),
-- Estudiante 1 (password: test123)
(
    gen_random_uuid(),
    'estudiante@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdBJGGqQCQvpJIXOZQeP6.Uq6rOvC',
    'Estudiante',
    'Prueba',
    'student',
    true,
    '/placeholder-user.jpg',
    NOW(),
    NOW()
),
-- Estudiante 2 (password: test123)
(
    gen_random_uuid(),
    'estudiante2@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdBJGGqQCQvpJIXOZQeP6.Uq6rOvC',
    'María',
    'González',
    'student',
    true,
    '/placeholder-user.jpg',
    NOW(),
    NOW()
);

-- Crear enrollments para los estudiantes
WITH student_users AS (
    SELECT id, email FROM users WHERE role = 'student' AND is_test_user = true
),
available_courses AS (
    SELECT id FROM courses WHERE status = 'published' LIMIT 3
)
INSERT INTO enrollments (
    id,
    user_id,
    course_id,
    enrolled_at,
    progress,
    completed_at,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    s.id,
    c.id,
    NOW() - INTERVAL '30 days' * RANDOM(),
    CASE 
        WHEN RANDOM() > 0.7 THEN 100
        WHEN RANDOM() > 0.4 THEN FLOOR(RANDOM() * 80 + 20)
        ELSE FLOOR(RANDOM() * 40)
    END as progress,
    CASE 
        WHEN RANDOM() > 0.7 THEN NOW() - INTERVAL '7 days' * RANDOM()
        ELSE NULL
    END as completed_at,
    NOW(),
    NOW()
FROM student_users s
CROSS JOIN available_courses c
WHERE RANDOM() > 0.3; -- Solo algunos enrollments

-- Verificar datos creados
SELECT 
    'Usuarios creados' as tipo,
    COUNT(*) as cantidad
FROM users 
WHERE is_test_user = true

UNION ALL

SELECT 
    'Enrollments creados' as tipo,
    COUNT(*) as cantidad
FROM enrollments e
JOIN users u ON e.user_id = u.id
WHERE u.is_test_user = true

UNION ALL

SELECT 
    'Usuarios por rol' as tipo,
    role || ': ' || COUNT(*) as cantidad
FROM users 
WHERE is_test_user = true
GROUP BY role;

-- Mostrar usuarios creados
SELECT 
    email,
    first_name,
    last_name,
    role,
    LEFT(password_hash, 20) as hash_preview,
    created_at
FROM users 
WHERE is_test_user = true
ORDER BY role, email;
