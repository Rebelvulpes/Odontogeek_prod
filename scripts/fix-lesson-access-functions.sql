-- Verificar estructura actual de las tablas
DO $$
DECLARE
    lesson_id_type TEXT;
    course_id_type TEXT;
BEGIN
    -- Verificar tipo de ID en lessons
    SELECT data_type INTO lesson_id_type
    FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'id';
    
    -- Verificar tipo de course_id en lessons
    SELECT data_type INTO course_id_type
    FROM information_schema.columns 
    WHERE table_name = 'lessons' AND column_name = 'course_id';
    
    RAISE NOTICE 'Lesson ID type: %, Course ID type: %', lesson_id_type, course_id_type;
END $$;

-- Mostrar lecciones existentes para debug
SELECT 
    'Lecciones existentes:' as info,
    l.id,
    l.title,
    l.course_id,
    c.title as course_title,
    l.is_free,
    l.order_index
FROM lessons l
LEFT JOIN courses c ON l.course_id = c.id
ORDER BY l.course_id, l.order_index
LIMIT 20;

-- Crear lecciones de ejemplo si no existen (usando UUIDs)
DO $$
DECLARE
    course_record RECORD;
    lesson_count INTEGER;
    new_lesson_id UUID;
BEGIN
    RAISE NOTICE 'Verificando y creando lecciones...';
    
    -- Para cada curso, verificar si tiene lecciones
    FOR course_record IN 
        SELECT id, title FROM courses ORDER BY created_at LIMIT 10
    LOOP
        SELECT COUNT(*) INTO lesson_count 
        FROM lessons 
        WHERE course_id = course_record.id;
        
        RAISE NOTICE 'Curso: % (ID: %) - Lecciones existentes: %', 
            course_record.title, course_record.id, lesson_count;
        
        -- Si el curso no tiene lecciones, crear algunas
        IF lesson_count = 0 THEN
            RAISE NOTICE 'Creando lecciones para curso: %', course_record.title;
            
            -- Lección 1 - Gratuita
            INSERT INTO lessons (
                id,
                course_id,
                title,
                description,
                content,
                order_index,
                is_free,
                duration_minutes,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                course_record.id,
                'Introducción - ' || course_record.title,
                'Lección introductoria gratuita del curso',
                '<h2>Bienvenido al curso</h2><p>Esta es una lección de introducción gratuita donde aprenderás los conceptos básicos.</p><p>Contenido incluye:</p><ul><li>Objetivos del curso</li><li>Metodología</li><li>Recursos necesarios</li></ul><p>Esta lección es completamente gratuita y está disponible para todos los usuarios registrados.</p>',
                1,
                true,
                15,
                NOW(),
                NOW()
            ) RETURNING id INTO new_lesson_id;
            
            RAISE NOTICE 'Creada lección gratuita con ID: %', new_lesson_id;
            
            -- Lección 2 - Premium
            INSERT INTO lessons (
                id,
                course_id,
                title,
                description,
                content,
                order_index,
                is_free,
                duration_minutes,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                course_record.id,
                'Fundamentos - ' || course_record.title,
                'Lección premium con contenido avanzado',
                '<h2>Fundamentos Avanzados</h2><p>En esta lección premium profundizaremos en:</p><ul><li>Conceptos avanzados</li><li>Técnicas especializadas</li><li>Casos prácticos</li><li>Ejercicios interactivos</li></ul><p>Esta lección requiere inscripción al curso para acceder al contenido completo.</p>',
                2,
                false,
                30,
                NOW(),
                NOW()
            ) RETURNING id INTO new_lesson_id;
            
            RAISE NOTICE 'Creada lección premium con ID: %', new_lesson_id;
            
            -- Lección 3 - Premium
            INSERT INTO lessons (
                id,
                course_id,
                title,
                description,
                content,
                order_index,
                is_free,
                duration_minutes,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                course_record.id,
                'Práctica Avanzada - ' || course_record.title,
                'Lección práctica con casos reales',
                '<h2>Práctica Avanzada</h2><p>Aplicaremos todo lo aprendido en casos reales:</p><ul><li>Casos de estudio</li><li>Resolución de problemas</li><li>Mejores prácticas</li><li>Tips profesionales</li></ul><p>Incluye ejercicios prácticos y evaluaciones.</p>',
                3,
                false,
                45,
                NOW(),
                NOW()
            ) RETURNING id INTO new_lesson_id;
            
            RAISE NOTICE 'Creada lección práctica con ID: %', new_lesson_id;
        END IF;
    END LOOP;
    
    -- Mostrar resumen final
    RAISE NOTICE '=== RESUMEN DE LECCIONES CREADAS ===';
    FOR course_record IN 
        SELECT 
            c.id,
            c.title,
            COUNT(l.id) as total_lessons,
            COUNT(CASE WHEN l.is_free = true THEN 1 END) as free_lessons
        FROM courses c
        LEFT JOIN lessons l ON c.id = l.course_id
        GROUP BY c.id, c.title
        ORDER BY c.created_at
        LIMIT 10
    LOOP
        RAISE NOTICE 'Curso: % - Total: % lecciones (% gratuitas)', 
            course_record.title, course_record.total_lessons, course_record.free_lessons;
    END LOOP;
    
END $$;

-- Crear función para verificar si un usuario es admin (compatible con UUIDs)
CREATE OR REPLACE FUNCTION is_user_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM users 
    WHERE id = user_id_param;
    
    RETURN COALESCE(user_role = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para verificar acceso a lección (compatible con UUIDs)
CREATE OR REPLACE FUNCTION check_lesson_access(
    user_id_param UUID,
    lesson_id_param UUID,
    course_id_param UUID
)
RETURNS TABLE(
    has_access BOOLEAN,
    access_type TEXT,
    is_admin BOOLEAN,
    is_free BOOLEAN,
    is_enrolled BOOLEAN,
    access_reason TEXT
) AS $$
DECLARE
    lesson_exists BOOLEAN := false;
    lesson_is_free BOOLEAN := false;
    user_is_admin BOOLEAN := false;
    user_is_enrolled BOOLEAN := false;
    lesson_course_id UUID;
BEGIN
    -- Verificar si la lección existe y obtener información
    SELECT 
        l.course_id,
        l.is_free
    INTO 
        lesson_course_id,
        lesson_is_free
    FROM lessons l
    WHERE l.id = lesson_id_param;
    
    lesson_exists := FOUND;
    
    -- Si la lección no existe, retornar sin acceso
    IF NOT lesson_exists THEN
        RETURN QUERY SELECT 
            false,
            'not_found'::TEXT,
            false,
            false,
            false,
            'Lección no encontrada'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si la lección pertenece al curso correcto
    IF lesson_course_id != course_id_param THEN
        RETURN QUERY SELECT 
            false,
            'wrong_course'::TEXT,
            false,
            lesson_is_free,
            false,
            'La lección no pertenece a este curso'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si el usuario es admin
    user_is_admin := is_user_admin(user_id_param);
    
    -- Si es admin, tiene acceso completo
    IF user_is_admin THEN
        RETURN QUERY SELECT 
            true,
            'admin'::TEXT,
            true,
            lesson_is_free,
            false,
            'Acceso de administrador'::TEXT;
        RETURN;
    END IF;
    
    -- Si la lección es gratuita, permitir acceso
    IF lesson_is_free THEN
        RETURN QUERY SELECT 
            true,
            'free'::TEXT,
            false,
            true,
            false,
            'Lección gratuita'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si el usuario está inscrito en el curso
    SELECT EXISTS(
        SELECT 1 
        FROM enrollments e
        WHERE e.user_id = user_id_param 
        AND e.course_id = course_id_param
        AND e.status = 'active'
    ) INTO user_is_enrolled;
    
    -- Si está inscrito, permitir acceso
    IF user_is_enrolled THEN
        RETURN QUERY SELECT 
            true,
            'enrolled'::TEXT,
            false,
            false,
            true,
            'Usuario inscrito en el curso'::TEXT;
        RETURN;
    END IF;
    
    -- Sin acceso
    RETURN QUERY SELECT 
        false,
        'no_access'::TEXT,
        false,
        false,
        false,
        'Requiere inscripción al curso'::TEXT;
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar permisos
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_lesson_access(UUID, UUID, UUID) TO authenticated;

-- Crear tabla de logs si no existe
CREATE TABLE IF NOT EXISTS student_access_log (
    id SERIAL PRIMARY KEY,
    student_id UUID REFERENCES users(id),
    email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    error_code VARCHAR(50),
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_student_access_log_student_id ON student_access_log(student_id);
CREATE INDEX IF NOT EXISTS idx_student_access_log_created_at ON student_access_log(created_at);
CREATE INDEX IF NOT EXISTS idx_student_access_log_action ON student_access_log(action);

-- Asegurar permisos en la tabla de logs
GRANT SELECT, INSERT ON student_access_log TO authenticated;
GRANT USAGE ON SEQUENCE student_access_log_id_seq TO authenticated;

-- Mostrar lecciones finales creadas
SELECT 
    'Lecciones disponibles:' as status,
    l.id,
    l.title,
    c.title as course_title,
    l.is_free,
    l.order_index,
    l.duration_minutes
FROM lessons l
JOIN courses c ON l.course_id = c.id
ORDER BY c.title, l.order_index
LIMIT 15;

COMMIT;
