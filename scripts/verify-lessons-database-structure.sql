-- Verify and create lessons database structure
-- This script ensures the database structure matches the code requirements

-- Check if courses table exists and has required columns
DO $$
BEGIN
    -- Create courses table if it doesn't exist
    CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        instructor VARCHAR(255),
        price DECIMAL(10,2) DEFAULT 0,
        duration_hours INTEGER DEFAULT 0,
        level VARCHAR(50) DEFAULT 'beginner',
        thumbnail_url TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        is_free BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add missing columns to courses if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_free') THEN
        ALTER TABLE courses ADD COLUMN is_free BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
        ALTER TABLE courses ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;

-- Check if lessons table exists and has required columns
DO $$
BEGIN
    -- Create lessons table if it doesn't exist
    CREATE TABLE IF NOT EXISTS lessons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT,
        video_url TEXT,
        duration_minutes INTEGER DEFAULT 0,
        order_index INTEGER DEFAULT 0,
        is_free BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Add missing columns to lessons if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'is_free') THEN
        ALTER TABLE lessons ADD COLUMN is_free BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'status') THEN
        ALTER TABLE lessons ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'video_url') THEN
        ALTER TABLE lessons ADD COLUMN video_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'content') THEN
        ALTER TABLE lessons ADD COLUMN content TEXT;
    END IF;
END $$;

-- Check if enrollments table exists and has required columns
DO $$
BEGIN
    -- Create enrollments table if it doesn't exist
    CREATE TABLE IF NOT EXISTS enrollments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'active',
        enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        progress DECIMAL(5,2) DEFAULT 0
    );

    -- Add missing columns to enrollments if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'status') THEN
        ALTER TABLE enrollments ADD COLUMN status VARCHAR(50) DEFAULT 'active';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'progress') THEN
        ALTER TABLE enrollments ADD COLUMN progress DECIMAL(5,2) DEFAULT 0;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- Insert sample data if tables are empty
INSERT INTO courses (id, title, description, instructor, price, is_free, status)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Curso de Introducción a la Odontología',
    'Un curso completo sobre los fundamentos de la odontología moderna',
    'Dr. Juan Pérez',
    0,
    true,
    'published'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid);

INSERT INTO courses (id, title, description, instructor, price, is_free, status)
SELECT 
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Endodoncia Avanzada',
    'Técnicas avanzadas en tratamientos de endodoncia',
    'Dra. María García',
    299.99,
    false,
    'published'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE id = '550e8400-e29b-41d4-a716-446655440001'::uuid);

-- Insert sample lessons
INSERT INTO lessons (id, course_id, title, description, content, video_url, duration_minutes, order_index, is_free, status)
SELECT 
    '689c966b-200e-44d6-9442-0b8e33665bee'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Introducción a la Anatomía Dental',
    'Aprende sobre la estructura básica de los dientes',
    '<h1>Anatomía Dental Básica</h1><p>En esta lección aprenderemos sobre la estructura fundamental de los dientes...</p>',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    45,
    1,
    true,
    'published'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id = '689c966b-200e-44d6-9442-0b8e33665bee'::uuid);

INSERT INTO lessons (id, course_id, title, description, content, video_url, duration_minutes, order_index, is_free, status)
SELECT 
    '689c966b-200e-44d6-9442-0b8e33665bef'::uuid,
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'Herramientas Básicas del Dentista',
    'Conoce las herramientas esenciales en odontología',
    '<h1>Herramientas Dentales</h1><p>Las herramientas básicas que todo dentista debe conocer...</p>',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    30,
    2,
    true,
    'published'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id = '689c966b-200e-44d6-9442-0b8e33665bef'::uuid);

INSERT INTO lessons (id, course_id, title, description, content, video_url, duration_minutes, order_index, is_free, status)
SELECT 
    '689c966b-200e-44d6-9442-0b8e33665bf0'::uuid,
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Técnicas de Endodoncia',
    'Procedimientos avanzados en endodoncia',
    '<h1>Endodoncia Avanzada</h1><p>Técnicas especializadas para tratamientos de conducto...</p>',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    60,
    1,
    false,
    'published'
WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE id = '689c966b-200e-44d6-9442-0b8e33665bf0'::uuid);

-- Verify the structure
SELECT 'Courses created: ' || COUNT(*) FROM courses;
SELECT 'Lessons created: ' || COUNT(*) FROM lessons;
SELECT 'Enrollments table exists: ' || CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN 'YES' ELSE 'NO' END;
