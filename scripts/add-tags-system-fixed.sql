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
