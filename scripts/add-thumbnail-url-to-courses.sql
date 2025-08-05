-- Agregar columna thumbnail_url a la tabla courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Crear índice para optimizar búsquedas por imagen
CREATE INDEX IF NOT EXISTS idx_courses_thumbnail_url ON courses(thumbnail_url);

-- Comentario sobre el campo
COMMENT ON COLUMN courses.thumbnail_url IS 'URL de la imagen miniatura del curso (recomendado: 1080x1080px)';

-- Actualizar algunos cursos existentes con URLs de ejemplo (opcional)
UPDATE courses 
SET thumbnail_url = 'https://res.cloudinary.com/demo/image/upload/c_fill,w_1080,h_1080/sample.jpg'
WHERE id IN (
  SELECT id FROM courses 
  WHERE thumbnail_url IS NULL 
  LIMIT 3
);
