-- 1. Eliminar datos de prueba existentes
DELETE FROM lesson_progress WHERE user_id IN (SELECT id FROM users WHERE is_test_user = true);
DELETE FROM enrollments WHERE user_id IN (SELECT id FROM users WHERE is_test_user = true);
DELETE FROM users WHERE is_test_user = true;

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
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdBJGGqQCQvpJIXOZQeP6.Uq6rOvC',
    'Admin',
    'Prueba',
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
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdBJGGqQCQvpJIXOZQeP6.Uq6rOvC',
    'Estudiante',
    'Prueba',
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
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdBJGGqQCQvpJIXOZQeP6.Uq6rOvC',
    'María',
    'González',
    'student',
    true,
    NOW(),
    NOW()
);

-- 5. Obtener IDs para crear enrollments
DO $$
DECLARE
    student1_id UUID;
    student2_id UUID;
    course_ids UUID[];
    course_id UUID;
BEGIN
    -- Obtener IDs de estudiantes
    SELECT id INTO student1_id FROM users WHERE email = 'estudiante@test.com';
    SELECT id INTO student2_id FROM users WHERE email = 'estudiante2@test.com';
    
    -- Obtener algunos cursos existentes
    SELECT ARRAY(SELECT id FROM courses LIMIT 3) INTO course_ids;
    
    -- Crear enrollments para estudiante 1
    IF array_length(course_ids, 1) > 0 THEN
        FOREACH course_id IN ARRAY course_ids
        LOOP
            INSERT INTO enrollments (
                id,
                user_id,
                course_id,
                status,
                progress_percentage,
                last_accessed_at,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                student1_id,
                course_id,
                'active',
                FLOOR(RANDOM() * 100),
                NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 7),
                NOW() - INTERVAL '1 day' * FLOOR(RANDOM() * 30),
                NOW()
            );
        END LOOP;
    END IF;
    
    -- Crear enrollments para estudiante 2 (solo 1 curso)
    IF array_length(course_ids, 1) > 0 THEN
        INSERT INTO enrollments (
            id,
            user_id,
            course_id,
            status,
            progress_percentage,
            last_accessed_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            student2_id,
            course_ids[1],
            'active',
            25.0,
            NOW() - INTERVAL '2 days',
            NOW() - INTERVAL '15 days',
            NOW()
        );
    END IF;
END $$;

-- 6. Verificar datos creados
SELECT 
    'USUARIOS CREADOS' as tipo,
    COUNT(*) as cantidad
FROM users 
WHERE is_test_user = true

UNION ALL

SELECT 
    'ENROLLMENTS CREADOS' as tipo,
    COUNT(*) as cantidad
FROM enrollments e
JOIN users u ON e.user_id = u.id
WHERE u.is_test_user = true;

-- Mostrar usuarios de prueba creados
SELECT 
    email,
    first_name,
    last_name,
    role,
    LEFT(password_hash, 30) as hash_preview,
    created_at
FROM users 
WHERE is_test_user = true
ORDER BY role, email;
