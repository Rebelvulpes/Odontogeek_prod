-- 1. Eliminar datos de prueba existentes
DELETE FROM lesson_progress WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com');
DELETE FROM enrollments WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com');
DELETE FROM users WHERE email LIKE '%@test.com';

-- 2. Crear usuario administrador de prueba
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
    'admin@test.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- test123
    'Admin',
    'Sistema',
    'admin',
    true,
    NOW(),
    NOW()
);

-- 3. Crear usuario estudiante de prueba
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
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- test123
    'María',
    'González',
    'student',
    true,
    NOW(),
    NOW()
);

-- 4. Crear otro usuario estudiante de prueba
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
    'estudiante2@test.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- test123
    'Carlos',
    'Rodríguez',
    'student',
    true,
    NOW(),
    NOW()
);

-- 5. Obtener IDs para crear enrollments
DO $$
DECLARE
    student_id UUID;
    student2_id UUID;
    course_ids UUID[];
BEGIN
    -- Obtener ID del primer estudiante
    SELECT id INTO student_id FROM users WHERE email = 'estudiante@test.com';
    
    -- Obtener ID del segundo estudiante
    SELECT id INTO student2_id FROM users WHERE email = 'estudiante2@test.com';
    
    -- Obtener IDs de cursos existentes (máximo 2)
    SELECT ARRAY(SELECT id FROM courses WHERE status = 'published' LIMIT 2) INTO course_ids;
    
    -- Crear enrollments para el primer estudiante si hay cursos
    IF array_length(course_ids, 1) >= 1 THEN
        INSERT INTO enrollments (
            user_id,
            course_id,
            status,
            progress_percentage,
            last_accessed_at,
            created_at,
            updated_at
        ) VALUES (
            student_id,
            course_ids[1],
            'active',
            65.50,
            NOW() - INTERVAL '2 hours',
            NOW() - INTERVAL '5 days',
            NOW()
        );
        
        -- Crear progreso de lecciones para el primer curso
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, time_spent)
        SELECT 
            student_id,
            l.id,
            true,
            NOW() - INTERVAL '3 days',
            1800 -- 30 minutos
        FROM lessons l 
        WHERE l.course_id = course_ids[1] 
        LIMIT 3;
    END IF;
    
    -- Crear segundo enrollment si hay segundo curso
    IF array_length(course_ids, 1) >= 2 THEN
        INSERT INTO enrollments (
            user_id,
            course_id,
            status,
            progress_percentage,
            last_accessed_at,
            created_at,
            updated_at
        ) VALUES (
            student_id,
            course_ids[2],
            'active',
            30.00,
            NOW() - INTERVAL '1 day',
            NOW() - INTERVAL '3 days',
            NOW()
        );
        
        -- Crear progreso de lecciones para el segundo curso
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, time_spent)
        SELECT 
            student_id,
            l.id,
            true,
            NOW() - INTERVAL '1 day',
            1200 -- 20 minutos
        FROM lessons l 
        WHERE l.course_id = course_ids[2] 
        LIMIT 2;
    END IF;
    
    -- Crear enrollment para el segundo estudiante
    IF array_length(course_ids, 1) >= 1 THEN
        INSERT INTO enrollments (
            user_id,
            course_id,
            status,
            progress_percentage,
            last_accessed_at,
            created_at,
            updated_at
        ) VALUES (
            student2_id,
            course_ids[1],
            'active',
            15.00,
            NOW() - INTERVAL '6 hours',
            NOW() - INTERVAL '2 days',
            NOW()
        );
        
        -- Crear progreso de lecciones para el segundo estudiante
        INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at, time_spent)
        SELECT 
            student2_id,
            l.id,
            true,
            NOW() - INTERVAL '1 day',
            900 -- 15 minutos
        FROM lessons l 
        WHERE l.course_id = course_ids[1] 
        LIMIT 1;
    END IF;
END $$;

-- 6. Verificar datos creados
SELECT 'USUARIOS CREADOS:' as info;
SELECT 
    email,
    first_name,
    last_name,
    role,
    is_test_user,
    created_at
FROM users 
WHERE email LIKE '%@test.com'
ORDER BY created_at;

SELECT 'ENROLLMENTS CREADOS:' as info;
SELECT 
    u.email,
    c.title as course_title,
    e.progress_percentage,
    e.status,
    e.created_at
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
WHERE u.email LIKE '%@test.com'
ORDER BY e.created_at;

SELECT 'PROGRESO DE LECCIONES:' as info;
SELECT 
    u.email,
    c.title as course_title,
    l.title as lesson_title,
    lp.completed,
    lp.completed_at
FROM lesson_progress lp
JOIN users u ON lp.user_id = u.id
JOIN lessons l ON lp.lesson_id = l.id
JOIN courses c ON l.course_id = c.id
WHERE u.email LIKE '%@test.com'
ORDER BY lp.completed_at;
