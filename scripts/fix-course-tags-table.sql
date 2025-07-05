-- Verificar la estructura actual de la tabla course_tags
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'course_tags' 
ORDER BY ordinal_position;

-- Si la tabla no tiene course_id, la recreamos correctamente
DROP TABLE IF EXISTS course_tags CASCADE;

-- Crear tabla course_tags con la estructura correcta
CREATE TABLE course_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, tag_id)
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_course_tags_course_id ON course_tags(course_id);
CREATE INDEX idx_course_tags_tag_id ON course_tags(tag_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE course_tags ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir todas las operaciones (ajustar según necesidades)
CREATE POLICY "Enable all operations for course_tags" ON course_tags
    FOR ALL USING (true);

-- Verificar que la tabla se creó correctamente
SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    tc.constraint_type
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN information_schema.table_constraints tc ON t.table_name = tc.table_name
WHERE t.table_name = 'course_tags'
ORDER BY c.ordinal_position;
