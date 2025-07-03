-- Agregar columna archived a la tabla lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Crear índice para lecciones archivadas
CREATE INDEX IF NOT EXISTS idx_lessons_archived ON lessons(archived) WHERE archived = true;

-- Actualizar la consulta de cursos para excluir lecciones archivadas por defecto
-- (esto se manejará en las consultas de la aplicación)
