-- Crear tabla de inscripciones básica
CREATE TABLE IF NOT EXISTS enrollments (
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

-- Insertar algunos datos de ejemplo para testing (usando IDs de cursos existentes)
DO $$
DECLARE
    course_record RECORD;
BEGIN
    -- Insertar inscripciones de ejemplo para cada curso existente
    FOR course_record IN SELECT id FROM courses LIMIT 3 LOOP
        INSERT INTO enrollments (user_id, course_id) VALUES
        (gen_random_uuid(), course_record.id),
        (gen_random_uuid(), course_record.id),
        (gen_random_uuid(), course_record.id)
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
