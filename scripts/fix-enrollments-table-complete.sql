-- Agregar columnas faltantes a la tabla enrollments
DO $$ 
BEGIN
    -- Agregar columna status si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'status') THEN
        ALTER TABLE enrollments ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
    
    -- Agregar columna progress_percentage si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'progress_percentage') THEN
        ALTER TABLE enrollments ADD COLUMN progress_percentage DECIMAL(5,2) DEFAULT 0.00;
    END IF;
    
    -- Agregar columna completed_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'completed_at') THEN
        ALTER TABLE enrollments ADD COLUMN completed_at TIMESTAMP;
    END IF;
    
    -- Agregar columna last_accessed_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'last_accessed_at') THEN
        ALTER TABLE enrollments ADD COLUMN last_accessed_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- Crear tabla lesson_progress si no existe
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    watch_time INTEGER DEFAULT 0, -- en segundos
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course_id ON lesson_progress(course_id);

-- Verificar estructura de enrollments
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
ORDER BY ordinal_position;
