-- Eliminar tabla existente si tiene problemas
DROP TABLE IF EXISTS enrollments CASCADE;

-- Crear tabla de inscripciones sin restricciones de clave foránea
CREATE TABLE enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices básicos
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolled_at);

-- Insertar datos de ejemplo usando IDs de cursos reales y UUIDs aleatorios para usuarios
DO $$
DECLARE
    course_record RECORD;
    sample_user_id UUID;
BEGIN
    -- Para cada curso existente, crear algunas inscripciones de ejemplo
    FOR course_record IN SELECT id FROM courses WHERE NOT archived LIMIT 5 LOOP
        -- Crear 3-5 inscripciones por curso con diferentes usuarios
        FOR i IN 1..3 LOOP
            sample_user_id := gen_random_uuid();
            INSERT INTO enrollments (user_id, course_id, enrolled_at) VALUES
            (sample_user_id, course_record.id, NOW() - INTERVAL '1 day' * (i * 10))
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
    
    -- Mensaje de confirmación
    RAISE NOTICE 'Tabla enrollments creada exitosamente con datos de ejemplo';
END $$;

-- Verificar que se crearon los datos
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
