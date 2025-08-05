-- Crear tabla de etiquetas/tags
CREATE TABLE IF NOT EXISTS course_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Color hex para la etiqueta
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de relación muchos a muchos entre cursos y etiquetas
CREATE TABLE IF NOT EXISTS course_tag_relations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES course_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, tag_id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_course_tags_slug ON course_tags(slug);
CREATE INDEX IF NOT EXISTS idx_course_tag_relations_course ON course_tag_relations(course_id);
CREATE INDEX IF NOT EXISTS idx_course_tag_relations_tag ON course_tag_relations(tag_id);

-- Insertar etiquetas predeterminadas
INSERT INTO course_tags (name, slug, color, description) VALUES
('Implantología', 'implantologia', '#10B981', 'Cursos relacionados con implantes dentales'),
('Endodoncia', 'endodoncia', '#F59E0B', 'Tratamientos de conductos radiculares'),
('Ortodoncia', 'ortodoncia', '#8B5CF6', 'Corrección de malposiciones dentales'),
('Periodoncia', 'periodoncia', '#EF4444', 'Tratamiento de enfermedades periodontales'),
('Cirugía Oral', 'cirugia-oral', '#06B6D4', 'Procedimientos quirúrgicos orales'),
('Prótesis', 'protesis', '#F97316', 'Rehabilitación protésica dental'),
('Odontopediatría', 'odontopediatria', '#EC4899', 'Odontología infantil'),
('Estética Dental', 'estetica-dental', '#84CC16', 'Procedimientos estéticos dentales'),
('Radiología', 'radiologia', '#6366F1', 'Diagnóstico por imágenes'),
('Básico', 'basico', '#64748B', 'Cursos de nivel básico'),
('Intermedio', 'intermedio', '#0EA5E9', 'Cursos de nivel intermedio'),
('Avanzado', 'avanzado', '#DC2626', 'Cursos de nivel avanzado')
ON CONFLICT (slug) DO NOTHING;

-- Función para obtener cursos con sus etiquetas
CREATE OR REPLACE FUNCTION get_courses_with_tags(
    p_limit INTEGER DEFAULT 12,
    p_offset INTEGER DEFAULT 0,
    p_tag_slugs TEXT[] DEFAULT NULL,
    p_search TEXT DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    title VARCHAR,
    description TEXT,
    price DECIMAL,
    instructor_id UUID,
    thumbnail_url VARCHAR,
    duration_hours INTEGER,
    total_lessons INTEGER,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived BOOLEAN,
    tags JSON,
    lessons_count BIGINT,
    students_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.description,
        c.price,
        c.instructor_id,
        c.thumbnail_url,
        c.duration_hours,
        c.total_lessons,
        c.status,
        c.created_at,
        c.updated_at,
        c.archived,
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', ct.id,
                    'name', ct.name,
                    'slug', ct.slug,
                    'color', ct.color
                )
            ) FILTER (WHERE ct.id IS NOT NULL),
            '[]'::json
        ) as tags,
        COALESCE(lesson_counts.count, 0) as lessons_count,
        COALESCE(student_counts.count, 0) as students_count
    FROM courses c
    LEFT JOIN course_tag_relations ctr ON c.id = ctr.course_id
    LEFT JOIN course_tags ct ON ctr.tag_id = ct.id
    LEFT JOIN (
        SELECT course_id, COUNT(*) as count
        FROM lessons
        GROUP BY course_id
    ) lesson_counts ON c.id = lesson_counts.course_id
    LEFT JOIN (
        SELECT course_id, COUNT(*) as count
        FROM enrollments
        GROUP BY course_id
    ) student_counts ON c.id = student_counts.course_id
    WHERE 
        c.status = 'published' 
        AND c.archived = FALSE
        AND (p_search IS NULL OR c.title ILIKE '%' || p_search || '%' OR c.description ILIKE '%' || p_search || '%')
        AND (
            p_tag_slugs IS NULL 
            OR EXISTS (
                SELECT 1 
                FROM course_tag_relations ctr2 
                JOIN course_tags ct2 ON ctr2.tag_id = ct2.id 
                WHERE ctr2.course_id = c.id 
                AND ct2.slug = ANY(p_tag_slugs)
            )
        )
    GROUP BY c.id, lesson_counts.count, student_counts.count
    ORDER BY c.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
