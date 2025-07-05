-- Verificar y corregir la estructura de la tabla enrollments
-- Primero verificamos qué columnas existen
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
ORDER BY ordinal_position;

-- Agregar columnas faltantes si no existen
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'completed';

ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Actualizar registros existentes
UPDATE enrollments 
SET payment_status = 'completed' 
WHERE payment_status IS NULL;

-- Actualizar amounts basado en el precio del curso
UPDATE enrollments 
SET amount = courses.price 
FROM courses 
WHERE enrollments.course_id = courses.id 
AND (enrollments.amount = 0 OR enrollments.amount IS NULL);

-- Verificar la estructura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
ORDER BY ordinal_position;

-- Mostrar algunos registros de ejemplo
SELECT e.id, e.course_id, e.payment_status, e.amount, c.title, c.price
FROM enrollments e
JOIN courses c ON e.course_id = c.id
LIMIT 10;
