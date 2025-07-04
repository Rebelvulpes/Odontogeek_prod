-- Eliminar tabla existente si tiene problemas
DROP TABLE IF EXISTS enrollments CASCADE;

-- Crear tabla de inscripciones básica sin restricciones de clave foránea
CREATE TABLE enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices básicos para performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolled_at);

-- Insertar SOLO 1-2 inscripciones de ejemplo usando IDs de cursos reales
DO $$
DECLARE
    course_record RECORD;
    sample_user_id UUID;
    enrollment_count INTEGER := 0;
BEGIN
    -- Para los primeros 2 cursos existentes, crear 1 inscripción cada uno
    FOR course_record IN SELECT id FROM courses WHERE NOT archived ORDER BY created_at LIMIT 2 LOOP
        sample_user_id := gen_random_uuid();
        INSERT INTO enrollments (user_id, course_id, enrolled_at) VALUES
        (sample_user_id, course_record.id, NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING;
        
        enrollment_count := enrollment_count + 1;
        RAISE NOTICE 'Inscripción creada para curso ID: %', course_record.id;
    END LOOP;
    
    -- Mensaje de confirmación
    RAISE NOTICE 'Tabla enrollments creada con % inscripciones de ejemplo', enrollment_count;
END $$;

-- Verificar que se crearon los datos correctamente
SELECT 
    c.title as curso,
    COUNT(e.id) as inscripciones,
    c.price as precio_curso,
    (COUNT(e.id) * c.price) as ingresos_calculados
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
WHERE NOT c.archived
GROUP BY c.id, c.title, c.price
ORDER BY inscripciones DESC;

-- Mostrar resumen final
SELECT 
    'Total inscripciones' as metric,
    COUNT(*) as value
FROM enrollments
UNION ALL
SELECT 
    'Total cursos con inscripciones' as metric,
    COUNT(DISTINCT course_id) as value
FROM enrollments;
