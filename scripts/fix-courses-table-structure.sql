-- Fix courses table structure to match the code requirements
-- This script adds missing columns and ensures proper structure

-- First, let's check what columns exist in courses table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

-- Add missing columns to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(50) DEFAULT 'beginner';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 0;

-- Ensure lessons table has all required columns
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 0;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

-- Update existing courses to have proper values
UPDATE courses SET is_free = true WHERE price = 0 OR price IS NULL;
UPDATE courses SET is_free = false WHERE price > 0;
UPDATE courses SET status = 'published' WHERE status IS NULL;

-- Update existing lessons to have proper values
UPDATE lessons SET is_free = true WHERE course_id IN (SELECT id FROM courses WHERE is_free = true);
UPDATE lessons SET status = 'published' WHERE status IS NULL OR status = '';

-- Insert sample course if none exist
INSERT INTO courses (id, title, description, instructor, price, is_free, status, level, duration_hours)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Curso de Introducción a la Odontología',
    'Un curso completo sobre los fundamentos de la odontología moderna',
    'Dr. Juan Pérez',
    0,
    true,
    'published',
    'beginner',
    10
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid);

-- Insert the specific lesson that's being tested
INSERT INTO lessons (id, course_id, title, description, content, video_url, duration_minutes, order_index, is_free, status)
SELECT 
    '689c966b-200e-44d6-9442-0b8e33665bee'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Introducción a la Anatomía Dental',
    'Aprende sobre la estructura básica de los dientes y su función en el sistema masticatorio',
    '<div class="lesson-content">
        <h1>Anatomía Dental Básica</h1>
        <p>En esta lección aprenderemos sobre la estructura fundamental de los dientes y su importancia en la odontología.</p>
        
        <h2>Objetivos de la lección</h2>
        <ul>
            <li>Identificar las partes principales de un diente</li>
            <li>Comprender la función de cada estructura dental</li>
            <li>Reconocer los diferentes tipos de dientes</li>
            <li>Entender la importancia de la anatomía dental en el diagnóstico</li>
        </ul>
        
        <h2>Estructura del diente</h2>
        <p>Un diente está compuesto por varias partes importantes:</p>
        <ul>
            <li><strong>Corona:</strong> La parte visible del diente</li>
            <li><strong>Raíz:</strong> La parte que se encuentra dentro del hueso</li>
            <li><strong>Esmalte:</strong> La capa más externa y dura</li>
            <li><strong>Dentina:</strong> La capa intermedia</li>
            <li><strong>Pulpa:</strong> El tejido blando interno</li>
        </ul>
        
        <h2>Tipos de dientes</h2>
        <p>En la dentición humana encontramos cuatro tipos principales:</p>
        <ul>
            <li><strong>Incisivos:</strong> Para cortar</li>
            <li><strong>Caninos:</strong> Para desgarrar</li>
            <li><strong>Premolares:</strong> Para triturar</li>
            <li><strong>Molares:</strong> Para moler</li>
        </ul>
        
        <p>Esta lección es gratuita y está disponible para todos los estudiantes como introducción al curso.</p>
    </div>',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    45,
    1,
    true,
    'published'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id = '689c966b-200e-44d6-9442-0b8e33665bee'::uuid);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);

-- Verify the structure
SELECT 'Courses with is_free column: ' || COUNT(*) FROM courses WHERE is_free IS NOT NULL;
SELECT 'Published courses: ' || COUNT(*) FROM courses WHERE status = 'published';
SELECT 'Published lessons: ' || COUNT(*) FROM lessons WHERE status = 'published';
SELECT 'Free lessons: ' || COUNT(*) FROM lessons WHERE is_free = true;

-- Show the specific lesson being tested
SELECT 
    l.id,
    l.title,
    l.is_free,
    l.status,
    c.title as course_title,
    c.is_free as course_is_free,
    c.status as course_status
FROM lessons l
JOIN courses c ON l.course_id = c.id
WHERE l.id = '689c966b-200e-44d6-9442-0b8e33665bee'::uuid;
