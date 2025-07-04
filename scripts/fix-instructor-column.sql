-- Agregar columna instructor_name si no existe
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS instructor_name VARCHAR(255);

-- Agregar columna instructor_id para futuras referencias
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES users(id);

-- Actualizar cursos existentes que no tengan instructor_name
UPDATE courses 
SET instructor_name = 'Dr. Juan Pérez'
WHERE instructor_name IS NULL OR instructor_name = '';

-- Crear índice para mejor performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor_name ON courses(instructor_name);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);

-- Verificar estructura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'courses' 
AND column_name IN ('instructor_name', 'instructor_id');
