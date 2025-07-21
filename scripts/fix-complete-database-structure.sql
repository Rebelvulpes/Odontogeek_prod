-- Comprehensive Database Structure Fix
-- This script will ensure all tables have the correct structure

DO $$
BEGIN
    RAISE NOTICE 'Starting comprehensive database structure fix...';
END $$;

-- 1. Fix users table structure
DO $$
BEGIN
    -- Add missing columns to users table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column to users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
        RAISE NOTICE 'Added phone column to users table';
    END IF;
END $$;

-- 2. Fix courses table structure
DO $$
BEGIN
    -- Add missing columns to courses table
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'content') THEN
        ALTER TABLE courses ADD COLUMN content TEXT;
        RAISE NOTICE 'Added content column to courses table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor') THEN
        ALTER TABLE courses ADD COLUMN instructor VARCHAR(255) DEFAULT 'Dr. Instructor';
        RAISE NOTICE 'Added instructor column to courses table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'difficulty_level') THEN
        ALTER TABLE courses ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'beginner';
        RAISE NOTICE 'Added difficulty_level column to courses table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;
        RAISE NOTICE 'Added thumbnail_url column to courses table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'archived') THEN
        ALTER TABLE courses ADD COLUMN archived BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added archived column to courses table';
    END IF;
END $$;

-- 3. Fix lessons table structure - THIS IS THE CRITICAL PART
DO $$
BEGIN
    -- Check if lessons table exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        CREATE TABLE lessons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            content TEXT NOT NULL DEFAULT '',
            video_url TEXT,
            duration_minutes INTEGER DEFAULT 0,
            order_index INTEGER NOT NULL DEFAULT 1,
            is_free BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created lessons table with all required columns';
    ELSE
        -- Add missing columns to existing lessons table
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'content') THEN
            ALTER TABLE lessons ADD COLUMN content TEXT NOT NULL DEFAULT '';
            RAISE NOTICE 'Added content column to lessons table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'description') THEN
            ALTER TABLE lessons ADD COLUMN description TEXT;
            RAISE NOTICE 'Added description column to lessons table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'video_url') THEN
            ALTER TABLE lessons ADD COLUMN video_url TEXT;
            RAISE NOTICE 'Added video_url column to lessons table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'duration_minutes') THEN
            ALTER TABLE lessons ADD COLUMN duration_minutes INTEGER DEFAULT 0;
            RAISE NOTICE 'Added duration_minutes column to lessons table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'order_index') THEN
            ALTER TABLE lessons ADD COLUMN order_index INTEGER NOT NULL DEFAULT 1;
            RAISE NOTICE 'Added order_index column to lessons table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'is_free') THEN
            ALTER TABLE lessons ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
            RAISE NOTICE 'Added is_free column to lessons table';
        END IF;
    END IF;
END $$;

-- 4. Fix enrollments table structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        CREATE TABLE enrollments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            progress INTEGER DEFAULT 0,
            completed_at TIMESTAMP WITH TIME ZONE,
            UNIQUE(user_id, course_id)
        );
        RAISE NOTICE 'Created enrollments table';
    ELSE
        -- Add missing columns
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'progress') THEN
            ALTER TABLE enrollments ADD COLUMN progress INTEGER DEFAULT 0;
            RAISE NOTICE 'Added progress column to enrollments table';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'completed_at') THEN
            ALTER TABLE enrollments ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Added completed_at column to enrollments table';
        END IF;
    END IF;
END $$;

-- 5. Create course_tags table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_tags') THEN
        CREATE TABLE course_tags (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL UNIQUE,
            color VARCHAR(7) DEFAULT '#3B82F6',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created course_tags table';
    END IF;
END $$;

-- 6. Create course_tag_assignments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_tag_assignments') THEN
        CREATE TABLE course_tag_assignments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            tag_id UUID NOT NULL REFERENCES course_tags(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(course_id, tag_id)
        );
        RAISE NOTICE 'Created course_tag_assignments table';
    END IF;
END $$;

-- 7. Create carousel_slides table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carousel_slides') THEN
        CREATE TABLE carousel_slides (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            subtitle TEXT,
            image_url TEXT,
            link_url TEXT,
            order_index INTEGER NOT NULL DEFAULT 1,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created carousel_slides table';
    END IF;
END $$;

-- 8. Update existing data to ensure consistency
UPDATE courses SET 
    content = COALESCE(content, description, 'Contenido del curso por definir'),
    instructor = COALESCE(instructor, 'Dr. Instructor'),
    difficulty_level = COALESCE(difficulty_level, 'beginner'),
    archived = COALESCE(archived, FALSE)
WHERE content IS NULL OR instructor IS NULL OR difficulty_level IS NULL OR archived IS NULL;

-- 9. Create sample lessons for existing courses that don't have lessons
DO $$
DECLARE
    course_record RECORD;
    lesson_count INTEGER;
BEGIN
    FOR course_record IN SELECT id, title FROM courses LOOP
        SELECT COUNT(*) INTO lesson_count FROM lessons WHERE course_id = course_record.id;
        
        IF lesson_count = 0 THEN
            -- Create 3 sample lessons for each course
            INSERT INTO lessons (course_id, title, description, content, duration_minutes, order_index, is_free, video_url) VALUES
            (course_record.id, 'Introducción a ' || course_record.title, 'Lección introductoria del curso', 
             '<h2>Bienvenido al curso</h2><p>En esta lección introductoria aprenderás los conceptos básicos.</p><ul><li>Objetivos del curso</li><li>Metodología</li><li>Recursos necesarios</li></ul>', 
             15, 1, TRUE, 'https://example.com/video1'),
            
            (course_record.id, 'Conceptos Fundamentales', 'Conceptos básicos y fundamentos teóricos', 
             '<h2>Conceptos Fundamentales</h2><p>En esta lección cubriremos los conceptos fundamentales necesarios para el curso.</p><h3>Temas a cubrir:</h3><ul><li>Definiciones básicas</li><li>Principios fundamentales</li><li>Aplicaciones prácticas</li></ul>', 
             25, 2, FALSE, 'https://example.com/video2'),
            
            (course_record.id, 'Práctica y Aplicación', 'Ejercicios prácticos y casos de estudio', 
             '<h2>Práctica y Aplicación</h2><p>Pondremos en práctica todo lo aprendido con ejercicios y casos reales.</p><h3>Actividades:</h3><ul><li>Ejercicios guiados</li><li>Casos de estudio</li><li>Evaluación práctica</li></ul>', 
             30, 3, FALSE, 'https://example.com/video3');
            
            RAISE NOTICE 'Created 3 sample lessons for course: %', course_record.title;
        END IF;
    END LOOP;
END $$;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_tag_assignments_course_id ON course_tag_assignments(course_id);

-- 11. Verify the structure
DO $$
DECLARE
    table_count INTEGER;
    lesson_count INTEGER;
    course_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_name IN ('users', 'courses', 'lessons', 'enrollments', 'course_tags', 'course_tag_assignments', 'carousel_slides');
    
    SELECT COUNT(*) INTO lesson_count FROM lessons;
    SELECT COUNT(*) INTO course_count FROM courses;
    
    RAISE NOTICE 'Database structure verification:';
    RAISE NOTICE '- Tables created: %', table_count;
    RAISE NOTICE '- Total courses: %', course_count;
    RAISE NOTICE '- Total lessons: %', lesson_count;
    
    -- Verify lessons table has all required columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'content') THEN
        RAISE NOTICE '✓ lessons.content column exists';
    ELSE
        RAISE NOTICE '✗ lessons.content column missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'description') THEN
        RAISE NOTICE '✓ lessons.description column exists';
    ELSE
        RAISE NOTICE '✗ lessons.description column missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'video_url') THEN
        RAISE NOTICE '✓ lessons.video_url column exists';
    ELSE
        RAISE NOTICE '✗ lessons.video_url column missing';
    END IF;
END $$;

RAISE NOTICE 'Comprehensive database structure fix completed successfully!';
