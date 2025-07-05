-- Script para probar que los filtros funcionen correctamente
-- Verificar que existen cursos con diferentes precios y tags

-- 1. Verificar cursos gratuitos y de pago
SELECT 
  title,
  price,
  CASE 
    WHEN price = 0 THEN 'Gratuito'
    ELSE 'De pago'
  END as tipo_precio
FROM courses 
WHERE status = 'published' AND archived != true
ORDER BY price;

-- 2. Verificar tags disponibles
SELECT 
  t.id,
  t.name,
  t.slug,
  t.color,
  COUNT(ct.course_id) as cursos_count
FROM tags t
LEFT JOIN course_tags ct ON t.id = ct.tag_id
LEFT JOIN courses c ON ct.course_id = c.id AND c.status = 'published' AND c.archived != true
GROUP BY t.id, t.name, t.slug, t.color
ORDER BY cursos_count DESC;

-- 3. Verificar relación cursos-tags
SELECT 
  c.title,
  c.price,
  t.name as tag_name,
  t.color as tag_color
FROM courses c
JOIN course_tags ct ON c.id = ct.course_id
JOIN tags t ON ct.tag_id = t.id
WHERE c.status = 'published' AND c.archived != true
ORDER BY c.title, t.name;

-- 4. Verificar que los cursos tienen lecciones
SELECT 
  c.title,
  COUNT(l.id) as total_lecciones,
  COUNT(CASE WHEN l.is_free = true THEN 1 END) as lecciones_gratuitas
FROM courses c
LEFT JOIN lessons l ON c.id = l.course_id AND l.archived != true
WHERE c.status = 'published' AND c.archived != true
GROUP BY c.id, c.title
ORDER BY c.title;

-- 5. Verificar inscripciones para mostrar estudiantes
SELECT 
  c.title,
  COUNT(e.id) as estudiantes_inscritos
FROM courses c
LEFT JOIN enrollments e ON c.id = e.course_id
WHERE c.status = 'published' AND c.archived != true
GROUP BY c.id, c.title
ORDER BY estudiantes_inscritos DESC;
