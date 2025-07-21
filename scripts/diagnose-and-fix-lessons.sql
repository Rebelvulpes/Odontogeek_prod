-- Diagnóstico completo del sistema de lecciones
-- Este script identifica y corrige todos los problemas

-- 1. Verificar estructura de tablas
DO $$
BEGIN
    RAISE NOTICE '=== DIAGNÓSTICO DE ESTRUCTURA DE TABLAS ===';
END $$;

-- Verificar estructura de courses
SELECT 
    'COURSES TABLE STRUCTURE:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Verificar estructura de lessons
SELECT 
    'LESSONS TABLE STRUCTURE:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'lessons' 
ORDER BY ordinal_position;

-- 2. Mostrar datos actuales
SELECT 
    'CURSOS EXISTENTES:' as info,
    id,
    title,
    status,
    created_at
FROM courses 
ORDER BY created_at 
LIMIT 10;

SELECT 
    'LECCIONES EXISTENTES:' as info,
    id,
    title,
    course_id,
    is_free,
    order_index
FROM lessons 
ORDER BY course_id, order_index 
LIMIT 20;

-- 3. Limpiar lecciones existentes si hay problemas
DELETE FROM lessons WHERE title LIKE '%Introducción -%' OR title LIKE '%Fundamentos -%' OR title LIKE '%Práctica Avanzada -%';

-- 4. Crear lecciones de prueba para TODOS los cursos
DO $$
DECLARE
    course_record RECORD;
    lesson_count INTEGER;
    new_lesson_id UUID;
BEGIN
    RAISE NOTICE '=== CREANDO LECCIONES DE PRUEBA ===';
    
    -- Para cada curso activo
    FOR course_record IN 
        SELECT id, title 
        FROM courses 
        WHERE status = 'published' OR status IS NULL
        ORDER BY created_at 
        LIMIT 20
    LOOP
        -- Contar lecciones existentes
        SELECT COUNT(*) INTO lesson_count 
        FROM lessons 
        WHERE course_id = course_record.id;
        
        RAISE NOTICE 'Curso: % (ID: %) - Lecciones: %', 
            course_record.title, course_record.id, lesson_count;
        
        -- Crear lecciones si no existen o hay muy pocas
        IF lesson_count < 3 THEN
            -- Lección 1 - GRATUITA
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
                'Lección 1: Introducción a ' || course_record.title,
                'Primera lección gratuita del curso. Accesible para todos los usuarios registrados.',
                '<div class="lesson-content">
                    <h2>🎯 Bienvenido al Curso</h2>
                    <p>Esta es la <strong>primera lección gratuita</strong> del curso <em>' || course_record.title || '</em>.</p>
                    
                    <h3>📚 Lo que aprenderás:</h3>
                    <ul>
                        <li>Objetivos del curso</li>
                        <li>Metodología de enseñanza</li>
                        <li>Recursos necesarios</li>
                        <li>Estructura del programa</li>
                    </ul>
                    
                    <h3>✅ Esta lección es completamente GRATUITA</h3>
                    <p>Puedes acceder a este contenido simplemente estando registrado en la plataforma.</p>
                    
                    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4>💡 Tip:</h4>
                        <p>Toma notas mientras estudias y no dudes en repasar el contenido las veces que necesites.</p>
                    </div>
                </div>',
                1,
                true, -- GRATUITA
                15,
                NOW(),
                NOW()
            ) RETURNING id INTO new_lesson_id;
            
            RAISE NOTICE '✅ Creada lección GRATUITA: %', new_lesson_id;
            
            -- Lección 2 - PREMIUM
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
                'Lección 2: Fundamentos de ' || course_record.title,
                'Segunda lección con contenido premium. Requiere inscripción al curso.',
                '<div class="lesson-content">
                    <h2>🚀 Fundamentos Avanzados</h2>
                    <p>En esta lección <strong>premium</strong> profundizaremos en los conceptos fundamentales.</p>
                    
                    <h3>📖 Contenido incluido:</h3>
                    <ul>
                        <li>Conceptos teóricos avanzados</li>
                        <li>Técnicas especializadas</li>
                        <li>Casos prácticos reales</li>
                        <li>Ejercicios interactivos</li>
                        <li>Material descargable</li>
                    </ul>
                    
                    <h3>🔒 Lección Premium</h3>
                    <p>Esta lección requiere <strong>inscripción al curso</strong> para acceder al contenido completo.</p>
                    
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4>⭐ Beneficios Premium:</h4>
                        <ul>
                            <li>Acceso completo al contenido</li>
                            <li>Certificado de finalización</li>
                            <li>Soporte directo del instructor</li>
                            <li>Acceso de por vida</li>
                        </ul>
                    </div>
                </div>',
                2,
                false, -- PREMIUM
                30,
                NOW(),
                NOW()
            ) RETURNING id INTO new_lesson_id;
            
            RAISE NOTICE '✅ Creada lección PREMIUM: %', new_lesson_id;
            
            -- Lección 3 - PREMIUM
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
                'Lección 3: Práctica Avanzada de ' || course_record.title,
                'Tercera lección con casos prácticos y ejercicios avanzados.',
                '<div class="lesson-content">
                    <h2>💼 Práctica Profesional</h2>
                    <p>Aplicaremos todo lo aprendido en <strong>casos reales</strong> y situaciones profesionales.</p>
                    
                    <h3>🎯 Actividades prácticas:</h3>
                    <ul>
                        <li>Análisis de casos de estudio</li>
                        <li>Resolución de problemas complejos</li>
                        <li>Implementación de mejores prácticas</li>
                        <li>Tips y trucos profesionales</li>
                        <li>Evaluación de conocimientos</li>
                    </ul>
                    
                    <h3>🏆 Objetivos de aprendizaje:</h3>
                    <p>Al finalizar esta lección serás capaz de aplicar todos los conceptos en situaciones reales.</p>
                    
                    <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4>🎓 Certificación:</h4>
                        <p>Completa esta lección para obtener tu certificado de finalización del curso.</p>
                    </div>
                </div>',
                3,
                false, -- PREMIUM
                45,
                NOW(),
                NOW()
            ) RETURNING id INTO new_lesson_id;
            
            RAISE NOTICE '✅ Creada lección PRÁCTICA: %', new_lesson_id;
            
        END IF;
    END LOOP;
    
    RAISE NOTICE '=== RESUMEN FINAL ===';
    
END $$;

-- 5. Verificar lecciones creadas
SELECT 
    'LECCIONES CREADAS:' as status,
    l.id,
    l.title,
    c.title as course_title,
    l.is_free,
    l.order_index,
    l.duration_minutes
FROM lessons l
JOIN courses c ON l.course_id = c.id
ORDER BY c.title, l.order_index;

-- 6. Crear/actualizar funciones de acceso
CREATE OR REPLACE FUNCTION is_user_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM users 
    WHERE id = user_id_param;
    
    RETURN COALESCE(user_role = 'admin', false);
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
    access_reason TEXT,
    lesson_title TEXT,
    course_title TEXT
) AS $$
DECLARE
    lesson_record RECORD;
    user_is_admin BOOLEAN := false;
    user_is_enrolled BOOLEAN := false;
BEGIN
    -- Obtener información de la lección
    SELECT 
        l.id,
        l.title,
        l.course_id,
        l.is_free,
        c.title as course_title
    INTO lesson_record
    FROM lessons l
    JOIN courses c ON l.course_id = c.id
    WHERE l.id = lesson_id_param;
    
    -- Si la lección no existe
    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            false,
            'not_found'::TEXT,
            false,
            false,
            false,
            'Lección no encontrada'::TEXT,
            'N/A'::TEXT,
            'N/A'::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si pertenece al curso correcto
    IF lesson_record.course_id != course_id_param THEN
        RETURN QUERY SELECT 
            false,
            'wrong_course'::TEXT,
            false,
            lesson_record.is_free,
            false,
            'La lección no pertenece a este curso'::TEXT,
            lesson_record.title::TEXT,
            lesson_record.course_title::TEXT;
        RETURN;
    END IF;
    
    -- Verificar si es admin
    user_is_admin := is_user_admin(user_id_param);
    
    -- Admin tiene acceso total
    IF user_is_admin THEN
        RETURN QUERY SELECT 
            true,
            'admin'::TEXT,
            true,
            lesson_record.is_free,
            false,
            'Acceso de administrador'::TEXT,
            lesson_record.title::TEXT,
            lesson_record.course_title::TEXT;
        RETURN;
    END IF;
    
    -- Lección gratuita
    IF lesson_record.is_free THEN
        RETURN QUERY SELECT 
            true,
            'free'::TEXT,
            false,
            true,
            false,
            'Lección gratuita'::TEXT,
            lesson_record.title::TEXT,
            lesson_record.course_title::TEXT;
        RETURN;
    END IF;
    
    -- Verificar inscripción
    SELECT EXISTS(
        SELECT 1 
        FROM enrollments e
        WHERE e.user_id = user_id_param 
        AND e.course_id = course_id_param
        AND e.status = 'active'
    ) INTO user_is_enrolled;
    
    -- Usuario inscrito
    IF user_is_enrolled THEN
        RETURN QUERY SELECT 
            true,
            'enrolled'::TEXT,
            false,
            false,
            true,
            'Usuario inscrito en el curso'::TEXT,
            lesson_record.title::TEXT,
            lesson_record.course_title::TEXT;
        RETURN;
    END IF;
    
    -- Sin acceso
    RETURN QUERY SELECT 
        false,
        'no_access'::TEXT,
        false,
        false,
        false,
        'Requiere inscripción al curso'::TEXT,
        lesson_record.title::TEXT,
        lesson_record.course_title::TEXT;
    RETURN;
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            false,
            'error'::TEXT,
            false,
            false,
            false,
            'Error verificando acceso: ' || SQLERRM,
            'N/A'::TEXT,
            'N/A'::TEXT;
        RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Asegurar permisos
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION check_lesson_access(UUID, UUID, UUID) TO authenticated, anon;

-- 8. Mostrar estadísticas finales
DO $$
DECLARE
    total_courses INTEGER;
    total_lessons INTEGER;
    free_lessons INTEGER;
    premium_lessons INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_courses FROM courses;
    SELECT COUNT(*) INTO total_lessons FROM lessons;
    SELECT COUNT(*) INTO free_lessons FROM lessons WHERE is_free = true;
    SELECT COUNT(*) INTO premium_lessons FROM lessons WHERE is_free = false;
    
    RAISE NOTICE '=== ESTADÍSTICAS FINALES ===';
    RAISE NOTICE 'Total de cursos: %', total_courses;
    RAISE NOTICE 'Total de lecciones: %', total_lessons;
    RAISE NOTICE 'Lecciones gratuitas: %', free_lessons;
    RAISE NOTICE 'Lecciones premium: %', premium_lessons;
    RAISE NOTICE '=== DIAGNÓSTICO COMPLETADO ===';
END $$;

COMMIT;
