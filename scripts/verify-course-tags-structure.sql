-- Verificar si la tabla course_tags existe y tiene la estructura correcta
DO $$
BEGIN
    -- Verificar si la tabla existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_tags') THEN
        -- Crear la tabla si no existe
        CREATE TABLE course_tags (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(course_id, tag_id)
        );
        
        -- Crear índices
        CREATE INDEX idx_course_tags_course_id ON course_tags(course_id);
        CREATE INDEX idx_course_tags_tag_id ON course_tags(tag_id);
        
        -- Habilitar RLS
        ALTER TABLE course_tags ENABLE ROW LEVEL SECURITY;
        
        -- Crear política
        CREATE POLICY "Enable all operations for course_tags" ON course_tags
            FOR ALL USING (true);
            
        RAISE NOTICE 'Tabla course_tags creada correctamente';
    ELSE
        -- Verificar si tiene las columnas correctas
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'course_tags' AND column_name = 'course_id'
        ) THEN
            -- Agregar la columna course_id si no existe
            ALTER TABLE course_tags ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
            CREATE INDEX IF NOT EXISTS idx_course_tags_course_id ON course_tags(course_id);
            RAISE NOTICE 'Columna course_id agregada a course_tags';
        END IF;
        
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'course_tags' AND column_name = 'tag_id'
        ) THEN
            -- Agregar la columna tag_id si no existe
            ALTER TABLE course_tags ADD COLUMN tag_id UUID REFERENCES tags(id) ON DELETE CASCADE;
            CREATE INDEX IF NOT EXISTS idx_course_tags_tag_id ON course_tags(tag_id);
            RAISE NOTICE 'Columna tag_id agregada a course_tags';
        END IF;
        
        RAISE NOTICE 'Tabla course_tags verificada y actualizada';
    END IF;
END $$;

-- Verificar la estructura final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'course_tags' 
ORDER BY ordinal_position;
