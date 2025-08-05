-- Agregar columna de nivel de dificultad a la tabla courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'principiante';

-- Crear índice para optimizar consultas por nivel de dificultad
CREATE INDEX IF NOT EXISTS idx_courses_difficulty_level ON courses(difficulty_level);

-- Actualizar cursos existentes con nivel principiante por defecto
UPDATE courses 
SET difficulty_level = 'principiante' 
WHERE difficulty_level IS NULL;

-- Agregar constraint para validar valores permitidos
ALTER TABLE courses 
ADD CONSTRAINT check_difficulty_level 
CHECK (difficulty_level IN ('principiante', 'intermedio', 'experto'));

-- Comentarios para documentación
COMMENT ON COLUMN courses.difficulty_level IS 'Nivel de dificultad del curso: principiante, intermedio, experto';
