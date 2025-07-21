-- Agregar columna de nivel de dificultad a la tabla courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'principiante';

-- Crear índice para mejorar consultas por nivel
CREATE INDEX IF NOT EXISTS idx_courses_difficulty ON courses(difficulty_level);

-- Insertar etiquetas de nivel de dificultad si no existen
INSERT INTO course_tags (name, slug, color, description) 
VALUES 
  ('Principiante', 'principiante', '#22C55E', 'Cursos para personas que están comenzando en el área')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO course_tags (name, slug, color, description) 
VALUES 
  ('Intermedio', 'intermedio', '#F59E0B', 'Cursos para personas con conocimientos básicos que quieren profundizar')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO course_tags (name, slug, color, description) 
VALUES 
  ('Experto', 'experto', '#EF4444', 'Cursos avanzados para profesionales con experiencia')
ON CONFLICT (slug) DO NOTHING;

-- Verificar que las etiquetas se crearon correctamente
SELECT * FROM course_tags WHERE slug IN ('principiante', 'intermedio', 'experto');
