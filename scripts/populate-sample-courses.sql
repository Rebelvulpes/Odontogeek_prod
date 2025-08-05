-- Insertar cursos de ejemplo con etiquetas

-- Primero, obtener los IDs de las etiquetas para usarlos en las relaciones
DO $$
DECLARE
    implantologia_id UUID;
    endodoncia_id UUID;
    ortodoncia_id UUID;
    periodoncia_id UUID;
    cirugia_id UUID;
    protesis_id UUID;
    estetica_id UUID;
    basico_id UUID;
    intermedio_id UUID;
    avanzado_id UUID;
    
    curso1_id UUID;
    curso2_id UUID;
    curso3_id UUID;
    curso4_id UUID;
    curso5_id UUID;
    curso6_id UUID;
    curso7_id UUID;
    curso8_id UUID;
    curso9_id UUID;
    curso10_id UUID;
    curso11_id UUID;
    curso12_id UUID;
    curso13_id UUID;
    curso14_id UUID;
    curso15_id UUID;
BEGIN
    -- Obtener IDs de etiquetas
    SELECT id INTO implantologia_id FROM course_tags WHERE slug = 'implantologia';
    SELECT id INTO endodoncia_id FROM course_tags WHERE slug = 'endodoncia';
    SELECT id INTO ortodoncia_id FROM course_tags WHERE slug = 'ortodoncia';
    SELECT id INTO periodoncia_id FROM course_tags WHERE slug = 'periodoncia';
    SELECT id INTO cirugia_id FROM course_tags WHERE slug = 'cirugia-oral';
    SELECT id INTO protesis_id FROM course_tags WHERE slug = 'protesis';
    SELECT id INTO estetica_id FROM course_tags WHERE slug = 'estetica-dental';
    SELECT id INTO basico_id FROM course_tags WHERE slug = 'basico';
    SELECT id INTO intermedio_id FROM course_tags WHERE slug = 'intermedio';
    SELECT id INTO avanzado_id FROM course_tags WHERE slug = 'avanzado';

    -- Insertar cursos de ejemplo
    INSERT INTO courses (title, description, price, duration_hours, total_lessons, status) VALUES
    ('Implantología Básica: Fundamentos', 'Introducción a los conceptos básicos de implantología dental', 199.00, 8, 12, 'published'),
    ('Endodoncia Avanzada con Microscopio', 'Técnicas avanzadas de endodoncia utilizando microscopio operatorio', 349.00, 15, 20, 'published'),
    ('Ortodoncia Invisible: Alineadores', 'Tratamiento ortodóncico con alineadores transparentes', 299.00, 12, 16, 'published'),
    ('Periodoncia Regenerativa', 'Técnicas de regeneración periodontal y manejo de defectos óseos', 279.00, 10, 14, 'published'),
    ('Cirugía Oral Menor', 'Procedimientos quirúrgicos básicos en la consulta dental', 229.00, 9, 13, 'published'),
    ('Prótesis Fija sobre Implantes', 'Rehabilitación protésica sobre implantes dentales', 399.00, 18, 24, 'published'),
    ('Estética Dental con Carillas', 'Diseño y colocación de carillas de porcelana', 319.00, 14, 18, 'published'),
    ('Implantología Avanzada: Casos Complejos', 'Manejo de casos complejos en implantología', 449.00, 20, 28, 'published'),
    ('Endodoncia en Dientes Posteriores', 'Técnicas específicas para molares y premolares', 259.00, 11, 15, 'published'),
    ('Ortodoncia Interceptiva', 'Tratamiento ortodóncico en dentición mixta', 239.00, 10, 14, 'published'),
    ('Manejo de Tejidos Blandos', 'Cirugía plástica periodontal y estética gingival', 289.00, 12, 16, 'published'),
    ('Prótesis Removible Moderna', 'Técnicas actualizadas en prótesis parcial y total', 199.00, 8, 12, 'published'),
    ('Blanqueamiento Dental Profesional', 'Técnicas de blanqueamiento en consultorio y domiciliario', 149.00, 6, 8, 'published'),
    ('Implantología Inmediata', 'Colocación de implantes post-extracción', 359.00, 16, 22, 'published'),
    ('Radiología Digital Avanzada', 'Interpretación de CBCT y radiografías digitales', 179.00, 7, 10, 'published')
    RETURNING id INTO curso1_id, curso2_id, curso3_id, curso4_id, curso5_id, curso6_id, curso7_id, curso8_id, curso9_id, curso10_id, curso11_id, curso12_id, curso13_id, curso14_id, curso15_id;

    -- Obtener los IDs de los cursos insertados
    SELECT id INTO curso1_id FROM courses WHERE title = 'Implantología Básica: Fundamentos';
    SELECT id INTO curso2_id FROM courses WHERE title = 'Endodoncia Avanzada con Microscopio';
    SELECT id INTO curso3_id FROM courses WHERE title = 'Ortodoncia Invisible: Alineadores';
    SELECT id INTO curso4_id FROM courses WHERE title = 'Periodoncia Regenerativa';
    SELECT id INTO curso5_id FROM courses WHERE title = 'Cirugía Oral Menor';
    SELECT id INTO curso6_id FROM courses WHERE title = 'Prótesis Fija sobre Implantes';
    SELECT id INTO curso7_id FROM courses WHERE title = 'Estética Dental con Carillas';
    SELECT id INTO curso8_id FROM courses WHERE title = 'Implantología Avanzada: Casos Complejos';
    SELECT id INTO curso9_id FROM courses WHERE title = 'Endodoncia en Dientes Posteriores';
    SELECT id INTO curso10_id FROM courses WHERE title = 'Ortodoncia Interceptiva';
    SELECT id INTO curso11_id FROM courses WHERE title = 'Manejo de Tejidos Blandos';
    SELECT id INTO curso12_id FROM courses WHERE title = 'Prótesis Removible Moderna';
    SELECT id INTO curso13_id FROM courses WHERE title = 'Blanqueamiento Dental Profesional';
    SELECT id INTO curso14_id FROM courses WHERE title = 'Implantología Inmediata';
    SELECT id INTO curso15_id FROM courses WHERE title = 'Radiología Digital Avanzada';

    -- Asociar etiquetas a los cursos
    INSERT INTO course_tag_relations (course_id, tag_id) VALUES
    -- Curso 1: Implantología Básica
    (curso1_id, implantologia_id),
    (curso1_id, basico_id),
    
    -- Curso 2: Endodoncia Avanzada
    (curso2_id, endodoncia_id),
    (curso2_id, avanzado_id),
    
    -- Curso 3: Ortodoncia Invisible
    (curso3_id, ortodoncia_id),
    (curso3_id, intermedio_id),
    
    -- Curso 4: Periodoncia Regenerativa
    (curso4_id, periodoncia_id),
    (curso4_id, avanzado_id),
    
    -- Curso 5: Cirugía Oral Menor
    (curso5_id, cirugia_id),
    (curso5_id, basico_id),
    
    -- Curso 6: Prótesis Fija sobre Implantes
    (curso6_id, protesis_id),
    (curso6_id, implantologia_id),
    (curso6_id, avanzado_id),
    
    -- Curso 7: Estética Dental con Carillas
    (curso7_id, estetica_id),
    (curso7_id, intermedio_id),
    
    -- Curso 8: Implantología Avanzada
    (curso8_id, implantologia_id),
    (curso8_id, avanzado_id),
    
    -- Curso 9: Endodoncia en Posteriores
    (curso9_id, endodoncia_id),
    (curso9_id, intermedio_id),
    
    -- Curso 10: Ortodoncia Interceptiva
    (curso10_id, ortodoncia_id),
    (curso10_id, basico_id),
    
    -- Curso 11: Manejo de Tejidos Blandos
    (curso11_id, periodoncia_id),
    (curso11_id, cirugia_id),
    (curso11_id, intermedio_id),
    
    -- Curso 12: Prótesis Removible
    (curso12_id, protesis_id),
    (curso12_id, basico_id),
    
    -- Curso 13: Blanqueamiento
    (curso13_id, estetica_id),
    (curso13_id, basico_id),
    
    -- Curso 14: Implantología Inmediata
    (curso14_id, implantologia_id),
    (curso14_id, cirugia_id),
    (curso14_id, avanzado_id),
    
    -- Curso 15: Radiología Digital
    (curso15_id, intermedio_id);

END $$;
