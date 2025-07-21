-- Verificar y corregir la estructura de la base de datos para lecciones
-- Este script asegura que la estructura coincida con el código

-- 1. Verificar que la tabla lessons existe y tiene la estructura correcta
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 1,
    is_free BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft',
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Agregar columnas faltantes si no existen
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 1;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;

-- 3. Verificar que la tabla courses existe
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    is_free BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Verificar que la tabla enrollments existe
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'active',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insertar curso de prueba si no existe ninguno
INSERT INTO courses (title, description, status, is_free, price)
SELECT 
    'Curso de Prueba - Odontología Básica',
    'Un curso de prueba para verificar el sistema de lecciones',
    'published',
    true,
    0.00
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE status = 'published');

-- 6. Insertar lección de prueba para cada curso que no tenga lecciones
INSERT INTO lessons (title, description, content, video_url, duration_minutes, order_index, is_free, status, course_id)
SELECT 
    'Introducción a ' || c.title,
    'Lección introductoria para el curso ' || c.title,
    '<h2>Bienvenido al curso</h2><p>En esta lección aprenderás los conceptos básicos.</p><ul><li>Conceptos fundamentales</li><li>Herramientas necesarias</li><li>Objetivos del curso</li></ul>',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    15,
    1,
    true,
    'published',
    c.id
FROM courses c
WHERE c.status = 'published' 
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.course_id = c.id);

-- 7. Verificar la estructura final
SELECT 
    'lessons' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'published') as published_lessons,
    COUNT(*) FILTER (WHERE is_free = true) as free_lessons
FROM lessons
UNION ALL
SELECT 
    'courses' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'published') as published_courses,
    COUNT(*) FILTER (WHERE is_free = true) as free_courses
FROM courses
UNION ALL
SELECT 
    'enrollments' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'active') as active_enrollments,
    0 as unused_column
FROM enrollments;

-- 8. Mostrar algunas lecciones de ejemplo
SELECT 
    l.id,
    l.title,
    l.status,
    l.is_free,
    l.order_index,
    c.title as course_title,
    c.status as course_status
FROM lessons l
JOIN courses c ON l.course_id = c.id
WHERE l.status = 'published'
ORDER BY c.title, l.order_index
LIMIT 10;
