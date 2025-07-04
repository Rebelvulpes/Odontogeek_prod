-- Eliminar función problemática si existe
DROP FUNCTION IF EXISTS get_courses_with_tags(INTEGER, INTEGER, TEXT[], TEXT);
DROP FUNCTION IF EXISTS get_courses_with_tags(p_limit INTEGER, p_offset INTEGER, p_tag_slugs TEXT[], p_search TEXT);

-- Limpiar cualquier otra versión de la función
DROP FUNCTION IF EXISTS public.get_courses_with_tags;

-- Verificar que las tablas existen
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('courses', 'course_tags', 'course_tag_relations', 'lessons', 'enrollments');
