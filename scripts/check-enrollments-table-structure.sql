-- Verificar la estructura actual de la tabla enrollments
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
ORDER BY ordinal_position;

-- Verificar si existen datos en la tabla
SELECT COUNT(*) as total_enrollments FROM enrollments;

-- Ver algunos registros de ejemplo si existen
SELECT * FROM enrollments LIMIT 5;

-- Verificar la estructura de la tabla courses para referencia
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;
