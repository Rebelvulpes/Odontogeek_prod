-- Agregar columna thumbnail_url a la tabla courses si no existe
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);

-- Crear índice para optimizar búsquedas por imagen
CREATE INDEX IF NOT EXISTS idx_courses_thumbnail ON courses(thumbnail_url) WHERE thumbnail_url IS NOT NULL;

-- Actualizar algunos cursos existentes con imágenes de ejemplo
UPDATE courses SET thumbnail_url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/dental-implants.jpg' 
WHERE title LIKE '%Implantología%' AND thumbnail_url IS NULL;

UPDATE courses SET thumbnail_url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/endodontics.jpg' 
WHERE title LIKE '%Endodoncia%' AND thumbnail_url IS NULL;

UPDATE courses SET thumbnail_url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/orthodontics.jpg' 
WHERE title LIKE '%Ortodoncia%' AND thumbnail_url IS NULL;

UPDATE courses SET thumbnail_url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/periodontics.jpg' 
WHERE title LIKE '%Periodoncia%' AND thumbnail_url IS NULL;

UPDATE courses SET thumbnail_url = 'https://res.cloudinary.com/demo/image/upload/v1234567890/oral-surgery.jpg' 
WHERE title LIKE '%Cirugía%' AND thumbnail_url IS NULL;
