-- Agregar columna archived a la tabla courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Crear índice para cursos archivados
CREATE INDEX IF NOT EXISTS idx_courses_archived ON courses(archived) WHERE archived = true;

-- Actualizar cursos existentes para asegurar que no estén archivados por defecto
UPDATE courses SET archived = FALSE WHERE archived IS NULL;
