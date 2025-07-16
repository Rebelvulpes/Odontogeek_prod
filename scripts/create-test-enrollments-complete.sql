-- Crear enrollments de prueba para el estudiante
DO $$
DECLARE
    student_id UUID;
    course1_id UUID;
    course2_id UUID;
    lesson1_id UUID;
    lesson2_id UUID;
    lesson3_id UUID;
BEGIN
    -- Obtener ID del estudiante
    SELECT id INTO student_id FROM users WHERE email = 'estudiante@test.com';
    
    IF student_id IS NULL THEN
        RAISE EXCEPTION 'Usuario estudiante@test.com no encontrado';
    END IF;
    
    -- Obtener IDs de cursos existentes (tomar los primeros 2)
    SELECT id INTO course1_id FROM courses ORDER BY created_at LIMIT 1;
    SELECT id INTO course2_id FROM courses ORDER BY created_at OFFSET 1 LIMIT 1;
    
    IF course1_id IS NULL OR course2_id IS NULL THEN
        RAISE EXCEPTION 'No hay suficientes cursos en la base de datos';
    END IF;
    
    -- Crear enrollment para curso 1 (65% completado)
    INSERT INTO enrollments (
        id,
        user_id,
        course_id,
        enrolled_at,
        status,
        progress_percentage,
        last_accessed_at
    ) VALUES (
        gen_random_uuid(),
        student_id,
        course1_id,
        NOW() - INTERVAL '30 days',
        'active',
        65.50,
        NOW() - INTERVAL '1 day'
    ) ON CONFLICT (user_id, course_id) DO UPDATE SET
        progress_percentage = 65.50,
        status = 'active',
        last_accessed_at = NOW() - INTERVAL '1 day';
    
    -- Crear enrollment para curso 2 (30% completado)
    INSERT INTO enrollments (
        id,
        user_id,
        course_id,
        enrolled_at,
        status,
        progress_percentage,
        last_accessed_at
    ) VALUES (
        gen_random_uuid(),
        student_id,
        course2_id,
        NOW() - INTERVAL '15 days',
        'active',
        30.00,
        NOW() - INTERVAL '2 days'
    ) ON CONFLICT (user_id, course_id) DO UPDATE SET
        progress_percentage = 30.00,
        status = 'active',
        last_accessed_at = NOW() - INTERVAL '2 days';
    
    -- Obtener algunas lecciones para simular progreso
    SELECT id INTO lesson1_id FROM lessons WHERE course_id = course1_id ORDER BY order_index LIMIT 1;
    SELECT id INTO lesson2_id FROM lessons WHERE course_id = course1_id ORDER BY order_index OFFSET 1 LIMIT 1;
    SELECT id INTO lesson3_id FROM lessons WHERE course_id = course2_id ORDER BY order_index LIMIT 1;
    
    -- Crear progreso de lecciones para curso 1
    IF lesson1_id IS NOT NULL THEN
        INSERT INTO lesson_progress (
            user_id,
            lesson_id,
            course_id,
            completed,
            completed_at,
            watch_time
        ) VALUES (
            student_id,
            lesson1_id,
            course1_id,
            TRUE,
            NOW() - INTERVAL '25 days',
            1800 -- 30 minutos
        ) ON CONFLICT (user_id, lesson_id) DO UPDATE SET
            completed = TRUE,
            completed_at = NOW() - INTERVAL '25 days',
            watch_time = 1800;
    END IF;
    
    IF lesson2_id IS NOT NULL THEN
        INSERT INTO lesson_progress (
            user_id,
            lesson_id,
            course_id,
            completed,
            completed_at,
            watch_time
        ) VALUES (
            student_id,
            lesson2_id,
            course1_id,
            TRUE,
            NOW() - INTERVAL '20 days',
            2100 -- 35 minutos
        ) ON CONFLICT (user_id, lesson_id) DO UPDATE SET
            completed = TRUE,
            completed_at = NOW() - INTERVAL '20 days',
            watch_time = 2100;
    END IF;
    
    -- Crear progreso de lecciones para curso 2
    IF lesson3_id IS NOT NULL THEN
        INSERT INTO lesson_progress (
            user_id,
            lesson_id,
            course_id,
            completed,
            completed_at,
            watch_time
        ) VALUES (
            student_id,
            lesson3_id,
            course2_id,
            TRUE,
            NOW() - INTERVAL '10 days',
            1500 -- 25 minutos
        ) ON CONFLICT (user_id, lesson_id) DO UPDATE SET
            completed = TRUE,
            completed_at = NOW() - INTERVAL '10 days',
            watch_time = 1500;
    END IF;
    
    RAISE NOTICE 'Enrollments y progreso creados para usuario: %', student_id;
END $$;

-- Verificar enrollments creados
SELECT 
    e.id,
    u.email,
    c.title as course_title,
    e.progress_percentage,
    e.status,
    e.enrolled_at
FROM enrollments e
JOIN users u ON e.user_id = u.id
JOIN courses c ON e.course_id = c.id
WHERE u.email = 'estudiante@test.com';

-- Verificar progreso de lecciones
SELECT 
    lp.id,
    u.email,
    c.title as course_title,
    l.title as lesson_title,
    lp.completed,
    lp.completed_at
FROM lesson_progress lp
JOIN users u ON lp.user_id = u.id
JOIN courses c ON lp.course_id = c.id
JOIN lessons l ON lp.lesson_id = l.id
WHERE u.email = 'estudiante@test.com';
