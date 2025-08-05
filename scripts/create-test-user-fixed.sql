-- Crear usuario de prueba con UUID válido para testing del dashboard
-- Contraseña: test123 (hasheada con bcrypt)

-- Generar UUID para el usuario de prueba
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    course_1_id UUID;
    course_2_id UUID;
    enrollment_1_id UUID := gen_random_uuid();
    enrollment_2_id UUID := gen_random_uuid();
BEGIN
    -- Insertar usuario de prueba
    INSERT INTO users (
      id,
      email,
      first_name,
      last_name,
      role,
      password_hash,
      avatar_url,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      'estudiante@test.com',
      'María',
      'González',
      'student',
      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- test123
      NULL,
      NOW(),
      NOW()
    ) ON CONFLICT (email) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      password_hash = EXCLUDED.password_hash,
      updated_at = NOW();

    -- Obtener el ID del usuario (en caso de que ya existiera)
    SELECT id INTO test_user_id FROM users WHERE email = 'estudiante@test.com';

    -- Crear tabla lesson_progress si no existe
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      lesson_id UUID NOT NULL,
      course_id UUID NOT NULL,
      completed_at TIMESTAMP WITH TIME ZONE,
      watch_time_seconds INTEGER DEFAULT 0,
      is_completed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE(user_id, lesson_id)
    );

    -- Obtener IDs de cursos existentes
    SELECT id INTO course_1_id FROM courses WHERE status = 'published' ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO course_2_id FROM courses WHERE status = 'published' AND id != course_1_id ORDER BY created_at DESC LIMIT 1;

    -- Solo crear enrollments si hay cursos disponibles
    IF course_1_id IS NOT NULL THEN
        -- Primer enrollment
        INSERT INTO enrollments (
          id,
          user_id,
          course_id,
          enrolled_at,
          progress_percentage,
          completed_at,
          status
        ) VALUES (
          enrollment_1_id,
          test_user_id,
          course_1_id,
          NOW() - INTERVAL '10 days',
          65.5,
          NULL,
          'active'
        ) ON CONFLICT (user_id, course_id) DO UPDATE SET
          progress_percentage = EXCLUDED.progress_percentage,
          status = EXCLUDED.status;

        -- Crear progreso de lecciones para el primer curso
        INSERT INTO lesson_progress (
          id,
          user_id,
          lesson_id,
          course_id,
          completed_at,
          watch_time_seconds,
          is_completed
        )
        SELECT 
          gen_random_uuid(),
          test_user_id,
          l.id,
          l.course_id,
          CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY l.order_index) <= 3 
            THEN NOW() - INTERVAL '2 days'
            ELSE NULL
          END,
          CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY l.order_index) <= 3 
            THEN (COALESCE(l.duration_minutes, 30) * 60)
            ELSE (COALESCE(l.duration_minutes, 30) * 30)
          END,
          CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY l.order_index) <= 3 
            THEN true
            ELSE false
          END
        FROM lessons l
        WHERE l.course_id = course_1_id
        AND l.archived = false
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET
          completed_at = EXCLUDED.completed_at,
          watch_time_seconds = EXCLUDED.watch_time_seconds,
          is_completed = EXCLUDED.is_completed;
    END IF;

    -- Segundo enrollment si hay un segundo curso
    IF course_2_id IS NOT NULL THEN
        INSERT INTO enrollments (
          id,
          user_id,
          course_id,
          enrolled_at,
          progress_percentage,
          completed_at,
          status
        ) VALUES (
          enrollment_2_id,
          test_user_id,
          course_2_id,
          NOW() - INTERVAL '5 days',
          30.0,
          NULL,
          'active'
        ) ON CONFLICT (user_id, course_id) DO UPDATE SET
          progress_percentage = EXCLUDED.progress_percentage,
          status = EXCLUDED.status;

        -- Crear progreso de lecciones para el segundo curso
        INSERT INTO lesson_progress (
          id,
          user_id,
          lesson_id,
          course_id,
          completed_at,
          watch_time_seconds,
          is_completed
        )
        SELECT 
          gen_random_uuid(),
          test_user_id,
          l.id,
          l.course_id,
          CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY l.order_index) <= 2 
            THEN NOW() - INTERVAL '1 day'
            ELSE NULL
          END,
          CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY l.order_index) <= 2 
            THEN (COALESCE(l.duration_minutes, 30) * 60)
            ELSE (COALESCE(l.duration_minutes, 30) * 20)
          END,
          CASE 
            WHEN ROW_NUMBER() OVER (ORDER BY l.order_index) <= 2 
            THEN true
            ELSE false
          END
        FROM lessons l
        WHERE l.course_id = course_2_id
        AND l.archived = false
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET
          completed_at = EXCLUDED.completed_at,
          watch_time_seconds = EXCLUDED.watch_time_seconds,
          is_completed = EXCLUDED.is_completed;
    END IF;

    -- Mostrar información del usuario creado
    RAISE NOTICE 'Usuario de prueba creado exitosamente:';
    RAISE NOTICE 'Email: estudiante@test.com';
    RAISE NOTICE 'Contraseña: test123';
    RAISE NOTICE 'Nombre: María González';
    RAISE NOTICE 'ID: %', test_user_id;

END $$;

-- Verificar que el usuario fue creado
SELECT 
  'Usuario creado:' as info,
  id,
  email,
  first_name || ' ' || last_name as nombre_completo,
  role,
  created_at
FROM users 
WHERE email = 'estudiante@test.com';

-- Verificar enrollments
SELECT 
  'Enrollments:' as info,
  e.id,
  c.title as curso,
  e.progress_percentage as progreso,
  e.enrolled_at
FROM enrollments e
JOIN courses c ON e.course_id = c.id
JOIN users u ON e.user_id = u.id
WHERE u.email = 'estudiante@test.com';
