-- Verificar la estructura actual de la tabla enrollments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
ORDER BY ordinal_position;

-- Si no existe la columna amount, la agregamos
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) DEFAULT 0;

-- Actualizar los registros existentes con el precio del curso
UPDATE enrollments 
SET amount = courses.price 
FROM courses 
WHERE enrollments.course_id = courses.id 
AND enrollments.amount = 0;

-- Verificar que la actualización funcionó
SELECT e.id, e.course_id, e.amount, c.price, c.title
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LIMIT 10;
