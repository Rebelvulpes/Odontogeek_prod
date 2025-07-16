-- 1. Eliminar completamente todos los usuarios de prueba y sus datos relacionados
DELETE FROM lesson_progress WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@test.com' OR is_test_user = true
);

DELETE FROM enrollments WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@test.com' OR is_test_user = true
);

DELETE FROM admin_logs WHERE admin_id IN (
    SELECT id FROM users WHERE email LIKE '%@test.com' OR is_test_user = true
);

DELETE FROM users WHERE email LIKE '%@test.com' OR is_test_user = true;

-- 2. Verificar que se eliminaron todos
SELECT 'Usuarios eliminados' as status, COUNT(*) as count 
FROM users WHERE email LIKE '%@test.com' OR is_test_user = true;

-- 3. Crear un nuevo usuario de prueba completamente desde cero
-- Usaremos un hash generado específicamente para 'password123'
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
    'nuevo@test.com',
    '$2b$10$K7L/8Y1Ft8WO4nOqBdUBL.D8LkXd4hQ3vfM0PA4sMYEOw9L8wqtTK',
    'Usuario',
    'Nuevo',
    'student',
    true,
    '/placeholder-user.jpg',
    NOW(),
    NOW()
);

-- 4. Crear también un admin de prueba
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
    'admin-nuevo@test.com',
    '$2b$10$K7L/8Y1Ft8WO4nOqBdUBL.D8LkXd4hQ3vfM0PA4sMYEOw9L8wqtTK',
    'Admin',
    'Nuevo',
    'admin',
    true,
    '/placeholder-user.jpg',
    NOW(),
    NOW()
);

-- 5. Verificar que los nuevos usuarios se crearon correctamente
SELECT 
    email,
    first_name,
    last_name,
    role,
    LEFT(password_hash, 30) as hash_preview,
    LENGTH(password_hash) as hash_length,
    created_at
FROM users 
WHERE is_test_user = true
ORDER BY role, email;

-- 6. Crear algunos enrollments para el estudiante
DO $$
DECLARE
    student_id UUID;
    course_ids UUID[];
BEGIN
    -- Obtener ID del estudiante
    SELECT id INTO student_id FROM users WHERE email = 'nuevo@test.com';
    
    -- Obtener algunos cursos
    SELECT ARRAY(SELECT id FROM courses LIMIT 2) INTO course_ids;
    
    -- Crear enrollments si hay cursos disponibles
    IF array_length(course_ids, 1) > 0 THEN
        INSERT INTO enrollments (
            id,
            user_id,
            course_id,
            enrolled_at,
            progress,
            completed_at,
            created_at,
            updated_at
        ) VALUES 
        (
            gen_random_uuid(),
            student_id,
            course_ids[1],
            NOW() - INTERVAL '10 days',
            75,
            NULL,
            NOW(),
            NOW()
        );
        
        -- Segundo enrollment si hay segundo curso
        IF array_length(course_ids, 1) > 1 THEN
            INSERT INTO enrollments (
                id,
                user_id,
                course_id,
                enrolled_at,
                progress,
                completed_at,
                created_at,
                updated_at
            ) VALUES 
            (
                gen_random_uuid(),
                student_id,
                course_ids[2],
                NOW() - INTERVAL '5 days',
                100,
                NOW() - INTERVAL '1 day',
                NOW(),
                NOW()
            );
        END IF;
    END IF;
END $$;

-- 7. Verificar enrollments creados
SELECT 
    u.email,
    c.title as course_title,
    e.progress,
    e.enrolled_at,
    e.completed_at
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
WHERE u.is_test_user = true;
