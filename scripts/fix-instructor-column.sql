-- Script para corregir la columna de instructor en la tabla courses
-- Agregar la columna instructor_name si no existe
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_name VARCHAR(255);

-- Actualizar cursos existentes que puedan tener datos en una columna 'instructor' incorrecta
-- Si existe una columna 'instructor', migrar los datos
DO $$
BEGIN
    -- Verificar si existe la columna 'instructor' y migrar datos
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'courses' AND column_name = 'instructor') THEN
        UPDATE courses SET instructor_name = instructor WHERE instructor_name IS NULL;
        ALTER TABLE courses DROP COLUMN instructor;
    END IF;
END $$;

-- Asegurar que la columna instructor_id existe
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES users(id);

-- Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_courses_instructor_name ON courses(instructor_name);
