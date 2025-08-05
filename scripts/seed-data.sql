-- Insertar etiquetas de ejemplo
INSERT INTO course_tags (name, slug, color, description) VALUES
('Implantología', 'implantologia', '#E11D48', 'Cursos especializados en implantes dentales y técnicas quirúrgicas'),
('Endodoncia', 'endodoncia', '#7C3AED', 'Tratamientos de conducto y terapia pulpar'),
('Ortodoncia', 'ortodoncia', '#059669', 'Corrección de maloclusiones y alineamiento dental'),
('Periodoncia', 'periodoncia', '#DC2626', 'Tratamiento de enfermedades periodontales y encías'),
('Cirugía Oral', 'cirugia-oral', '#EA580C', 'Procedimientos quirúrgicos en cavidad oral'),
('Estética Dental', 'estetica-dental', '#DB2777', 'Odontología cosmética y restaurativa'),
('Odontopediatría', 'odontopediatria', '#0891B2', 'Odontología especializada en niños'),
('Prótesis', 'protesis', '#7C2D12', 'Rehabilitación protésica fija y removible')
ON CONFLICT (slug) DO NOTHING;

-- Insertar cursos de ejemplo
INSERT INTO courses (title, description, price, instructor, duration_hours, status, thumbnail_url) VALUES
(
    'Implantología Avanzada: Técnicas Quirúrgicas Modernas',
    'Curso completo sobre las últimas técnicas en implantología dental, incluyendo planificación digital, cirugía guiada y manejo de complicaciones. Aprende de casos clínicos reales y desarrolla habilidades avanzadas en rehabilitación implantológica.',
    299.99,
    'Dr. Carlos Mendoza',
    15,
    'published',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1080&h=1080&fit=crop&crop=center'
),
(
    'Endodoncia Clínica: Protocolos Actualizados',
    'Domina los protocolos modernos de endodoncia con técnicas de instrumentación rotatoria, obturación termoplástica y manejo del dolor postoperatorio. Incluye casos complejos y retratamientos.',
    249.99,
    'Dra. Ana Rodríguez',
    12,
    'published',
    'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1080&h=1080&fit=crop&crop=center'
),
(
    'Ortodoncia Interceptiva en Dentición Mixta',
    'Aprende a diagnosticar y tratar maloclusiones en desarrollo durante la dentición mixta. Técnicas de ortodoncia interceptiva, aparatología removible y fija temprana.',
    199.99,
    'Dr. Miguel Torres',
    10,
    'published',
    'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1080&h=1080&fit=crop&crop=center'
),
(
    'Periodoncia Regenerativa: Nuevos Enfoques',
    'Curso avanzado sobre técnicas regenerativas en periodoncia, incluyendo uso de biomateriales, membranas y factores de crecimiento para la regeneración del periodonto.',
    349.99,
    'Dr. Roberto Silva',
    18,
    'published',
    'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1080&h=1080&fit=crop&crop=center'
),
(
    'Cirugía Oral Menor: Técnicas Fundamentales',
    'Fundamentos de cirugía oral menor, incluyendo extracciones complejas, cirugía preprotésica, manejo de tejidos blandos y control de complicaciones.',
    179.99,
    'Dra. Patricia López',
    8,
    'published',
    'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=1080&h=1080&fit=crop&crop=center'
),
(
    'Estética Dental Integral: Carillas y Coronas',
    'Curso completo sobre odontología estética, incluyendo diseño de sonrisa, preparaciones conservadoras, carillas de porcelana y coronas libres de metal.',
    279.99,
    'Dr. Fernando García',
    14,
    'published',
    'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=1080&h=1080&fit=crop&crop=center'
)
ON CONFLICT DO NOTHING;

-- Obtener IDs de cursos y etiquetas para crear relaciones
DO $$
DECLARE
    curso_implantologia UUID;
    curso_endodoncia UUID;
    curso_ortodoncia UUID;
    curso_periodoncia UUID;
    curso_cirugia UUID;
    curso_estetica UUID;
    
    tag_implantologia UUID;
    tag_endodoncia UUID;
    tag_ortodoncia UUID;
    tag_periodoncia UUID;
    tag_cirugia UUID;
    tag_estetica UUID;
BEGIN
    -- Obtener IDs de cursos
    SELECT id INTO curso_implantologia FROM courses WHERE title LIKE '%Implantología Avanzada%' LIMIT 1;
    SELECT id INTO curso_endodoncia FROM courses WHERE title LIKE '%Endodoncia Clínica%' LIMIT 1;
    SELECT id INTO curso_ortodoncia FROM courses WHERE title LIKE '%Ortodoncia Interceptiva%' LIMIT 1;
    SELECT id INTO curso_periodoncia FROM courses WHERE title LIKE '%Periodoncia Regenerativa%' LIMIT 1;
    SELECT id INTO curso_cirugia FROM courses WHERE title LIKE '%Cirugía Oral Menor%' LIMIT 1;
    SELECT id INTO curso_estetica FROM courses WHERE title LIKE '%Estética Dental%' LIMIT 1;
    
    -- Obtener IDs de etiquetas
    SELECT id INTO tag_implantologia FROM course_tags WHERE slug = 'implantologia';
    SELECT id INTO tag_endodoncia FROM course_tags WHERE slug = 'endodoncia';
    SELECT id INTO tag_ortodoncia FROM course_tags WHERE slug = 'ortodoncia';
    SELECT id INTO tag_periodoncia FROM course_tags WHERE slug = 'periodoncia';
    SELECT id INTO tag_cirugia FROM course_tags WHERE slug = 'cirugia-oral';
    SELECT id INTO tag_estetica FROM course_tags WHERE slug = 'estetica-dental';
    
    -- Crear relaciones curso-etiqueta
    IF curso_implantologia IS NOT NULL AND tag_implantologia IS NOT NULL THEN
        INSERT INTO course_tag_relations (course_id, tag_id) VALUES (curso_implantologia, tag_implantologia) ON CONFLICT DO NOTHING;
    END IF;
    
    IF curso_endodoncia IS NOT NULL AND tag_endodoncia IS NOT NULL THEN
        INSERT INTO course_tag_relations (course_id, tag_id) VALUES (curso_endodoncia, tag_endodoncia) ON CONFLICT DO NOTHING;
    END IF;
    
    IF curso_ortodoncia IS NOT NULL AND tag_ortodoncia IS NOT NULL THEN
        INSERT INTO course_tag_relations (course_id, tag_id) VALUES (curso_ortodoncia, tag_ortodoncia) ON CONFLICT DO NOTHING;
    END IF;
    
    IF curso_periodoncia IS NOT NULL AND tag_periodoncia IS NOT NULL THEN
        INSERT INTO course_tag_relations (course_id, tag_id) VALUES (curso_periodoncia, tag_periodoncia) ON CONFLICT DO NOTHING;
    END IF;
    
    IF curso_cirugia IS NOT NULL AND tag_cirugia IS NOT NULL THEN
        INSERT INTO course_tag_relations (course_id, tag_id) VALUES (curso_cirugia, tag_cirugia) ON CONFLICT DO NOTHING;
    END IF;
    
    IF curso_estetica IS NOT NULL AND tag_estetica IS NOT NULL THEN
        INSERT INTO course_tag_relations (course_id, tag_id) VALUES (curso_estetica, tag_estetica) ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insertar lecciones de ejemplo para el curso de Implantología
DO $$
DECLARE
    curso_id UUID;
BEGIN
    SELECT id INTO curso_id FROM courses WHERE title LIKE '%Implantología Avanzada%' LIMIT 1;
    
    IF curso_id IS NOT NULL THEN
        INSERT INTO lessons (course_id, title, description, video_url, duration_minutes, order_index, is_free) VALUES
        (curso_id, 'Introducción a la Implantología Moderna', 'Conceptos fundamentales y evolución histórica de los implantes dentales', 'https://vz-example.b-cdn.net/intro-implantologia.mp4', 45, 1, true),
        (curso_id, 'Anatomía y Fisiología del Hueso Alveolar', 'Bases biológicas para la osteointegración y cicatrización ósea', 'https://vz-example.b-cdn.net/anatomia-hueso.mp4', 60, 2, false),
        (curso_id, 'Planificación Digital en Implantología', 'Uso de CBCT y software de planificación para casos complejos', 'https://vz-example.b-cdn.net/planificacion-digital.mp4', 75, 3, false),
        (curso_id, 'Técnicas Quirúrgicas Avanzadas', 'Protocolos quirúrgicos para diferentes tipos de implantes', 'https://vz-example.b-cdn.net/tecnicas-quirurgicas.mp4', 90, 4, false),
        (curso_id, 'Manejo de Complicaciones', 'Prevención y tratamiento de complicaciones implantológicas', 'https://vz-example.b-cdn.net/complicaciones.mp4', 55, 5, false)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insertar lecciones de ejemplo para el curso de Endodoncia
DO $$
DECLARE
    curso_id UUID;
BEGIN
    SELECT id INTO curso_id FROM courses WHERE title LIKE '%Endodoncia Clínica%' LIMIT 1;
    
    IF curso_id IS NOT NULL THEN
        INSERT INTO lessons (course_id, title, description, video_url, duration_minutes, order_index, is_free) VALUES
        (curso_id, 'Diagnóstico Endodóntico Diferencial', 'Métodos de diagnóstico y pruebas de vitalidad pulpar', 'https://vz-example.b-cdn.net/diagnostico-endo.mp4', 40, 1, true),
        (curso_id, 'Instrumentación Rotatoria Moderna', 'Sistemas de limas rotatorias y técnicas de preparación', 'https://vz-example.b-cdn.net/instrumentacion.mp4', 65, 2, false),
        (curso_id, 'Irrigación y Desinfección', 'Protocolos de irrigación y uso de hipoclorito de sodio', 'https://vz-example.b-cdn.net/irrigacion.mp4', 50, 3, false),
        (curso_id, 'Obturación Termoplástica', 'Técnicas de obturación con gutapercha termoplástica', 'https://vz-example.b-cdn.net/obturacion.mp4', 70, 4, false)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Crear usuario administrador de ejemplo
INSERT INTO users (email, password_hash, full_name, role, is_active, email_verified) VALUES
('admin@odontogeek.com', '$2b$10$example.hash.here', 'Administrador OdontoGeek', 'admin', true, true)
ON CONFLICT (email) DO NOTHING;
