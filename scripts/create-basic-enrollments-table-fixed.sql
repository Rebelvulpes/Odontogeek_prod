-- Script para crear tabla de inscripciones básica y datos de ejemplo
-- Versión corregida sin restricciones de clave foránea

-- Eliminar tabla existente si existe
DROP TABLE IF EXISTS enrollments CASCADE;

-- Crear tabla de inscripciones básica
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active'
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_user_email ON enrollments(user_email);
CREATE INDEX idx_enrollments_status ON enrollments(status);

-- Obtener IDs de cursos existentes para usar en los datos de ejemplo
DO $$
DECLARE
    course_ids INTEGER[];
    sample_course_id INTEGER;
BEGIN
    -- Obtener hasta 3 IDs de cursos existentes
    SELECT ARRAY(SELECT id FROM courses WHERE NOT archived LIMIT 3) INTO course_ids;
    
    -- Solo insertar datos si hay cursos disponibles
    IF array_length(course_ids, 1) > 0 THEN
        -- Insertar algunas inscripciones de ejemplo usando IDs reales
        
        -- Para el primer curso (si existe)
        sample_course_id := course_ids[1];
        INSERT INTO enrollments (course_id, user_email, enrolled_at, status) VALUES
        (sample_course_id, 'estudiante1@ejemplo.com', CURRENT_TIMESTAMP - INTERVAL '5 days', 'active'),
        (sample_course_id, 'estudiante2@ejemplo.com', CURRENT_TIMESTAMP - INTERVAL '3 days', 'active');
        
        -- Para el segundo curso (si existe)
        IF array_length(course_ids, 1) > 1 THEN
            sample_course_id := course_ids[2];
            INSERT INTO enrollments (course_id, user_email, enrolled_at, status) VALUES
            (sample_course_id, 'estudiante3@ejemplo.com', CURRENT_TIMESTAMP - INTERVAL '2 days', 'active');
        END IF;
        
        -- Para el tercer curso (si existe)
        IF array_length(course_ids, 1) > 2 THEN
            sample_course_id := course_ids[3];
            INSERT INTO enrollments (course_id, user_email, enrolled_at, status) VALUES
            (sample_course_id, 'estudiante4@ejemplo.com', CURRENT_TIMESTAMP - INTERVAL '1 day', 'active');
        END IF;
        
        RAISE NOTICE 'Tabla enrollments creada exitosamente con % inscripciones de ejemplo', 
                     (SELECT COUNT(*) FROM enrollments);
    ELSE
        RAISE NOTICE 'Tabla enrollments creada pero sin datos de ejemplo (no hay cursos disponibles)';
    END IF;
END $$;

-- Verificar los datos insertados
SELECT 
    'Inscripciones por curso' as tipo,
    course_id,
    COUNT(*) as total_inscripciones
FROM enrollments 
GROUP BY course_id
ORDER BY course_id;

-- Mostrar resumen total
SELECT 
    'Resumen total' as tipo,
    COUNT(*) as total_inscripciones,
    COUNT(DISTINCT course_id) as cursos_con_inscripciones,
    COUNT(DISTINCT user_email) as estudiantes_unicos
FROM enrollments;

-- Verificar que los course_ids existen en la tabla courses
SELECT 
    'Verificación de integridad' as tipo,
    e.course_id,
    c.title as curso_titulo,
    c.price as precio_curso,
    COUNT(e.id) as inscripciones
FROM enrollments e
LEFT JOIN courses c ON e.course_id = c.id
GROUP BY e.course_id, c.title, c.price
ORDER BY e.course_id;
