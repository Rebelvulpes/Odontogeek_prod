-- Crear tabla de inscripciones simple
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    amount_paid DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Crear índices básicos
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolled_at);

-- Insertar algunos datos de ejemplo para testing
INSERT INTO enrollments (user_id, course_id, amount_paid) VALUES
(gen_random_uuid(), (SELECT id FROM courses LIMIT 1), 99.99),
(gen_random_uuid(), (SELECT id FROM courses LIMIT 1), 149.99)
ON CONFLICT (user_id, course_id) DO NOTHING;
