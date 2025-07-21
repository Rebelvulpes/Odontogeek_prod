-- Clean unwanted courses and fix database structure
-- This script will remove test courses and ensure proper structure

-- First, let's see what courses exist
SELECT id, title, instructor_name, created_at, status, archived 
FROM courses 
ORDER BY created_at DESC;

-- Check if course_tags table exists and has course_id column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_tags') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_tags' AND column_name = 'course_id') THEN
            -- Remove course tags for unwanted courses
            DELETE FROM course_tags WHERE course_id IN (
                SELECT id FROM courses 
                WHERE title = 'Curso de Introducción a la Odontología' 
                AND instructor_name = 'Dr. Juan Pérez'
            );
        END IF;
    END IF;
END $$;

-- Check if lessons table exists and has course_id column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'course_id') THEN
            -- Remove lessons for unwanted courses
            DELETE FROM lessons WHERE course_id IN (
                SELECT id FROM courses 
                WHERE title = 'Curso de Introducción a la Odontología' 
                AND instructor_name = 'Dr. Juan Pérez'
            );
        END IF;
    END IF;
END $$;

-- Check if enrollments table exists and has course_id column
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'course_id') THEN
            -- Remove enrollments for unwanted courses
            DELETE FROM enrollments WHERE course_id IN (
                SELECT id FROM courses 
                WHERE title = 'Curso de Introducción a la Odontología' 
                AND instructor_name = 'Dr. Juan Pérez'
            );
        END IF;
    END IF;
END $$;

-- Remove the unwanted test course
DELETE FROM courses 
WHERE title = 'Curso de Introducción a la Odontología' 
AND instructor_name = 'Dr. Juan Pérez';

-- Also remove any other test courses that might have appeared
DELETE FROM courses 
WHERE title LIKE '%Test%' 
OR title LIKE '%Prueba%' 
OR instructor_name LIKE '%Test%'
OR instructor_name LIKE '%Prueba%';

-- Ensure all tables have proper archived columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        ALTER TABLE lessons ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carousel_slides') THEN
        ALTER TABLE carousel_slides ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update existing records to not be archived by default
UPDATE courses SET archived = false WHERE archived IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        UPDATE lessons SET archived = false WHERE archived IS NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carousel_slides') THEN
        UPDATE carousel_slides SET archived = false WHERE archived IS NULL;
    END IF;
END $$;

-- Ensure proper status values
UPDATE courses SET status = 'published' WHERE status IS NULL OR status = '';

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        UPDATE lessons SET status = 'published' WHERE status IS NULL OR status = '';
    END IF;
END $$;

-- Fix any lessons that might be orphaned or have invalid course_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'course_id') THEN
            DELETE FROM lessons WHERE course_id NOT IN (SELECT id FROM courses);
        END IF;
    END IF;
END $$;

-- Ensure thumbnail_url column exists and has proper type
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carousel_slides') THEN
        ALTER TABLE carousel_slides ADD COLUMN IF NOT EXISTS image_url TEXT;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_archived_status ON courses(archived, status);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        CREATE INDEX IF NOT EXISTS idx_lessons_archived_status ON lessons(archived, status);
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'course_id') THEN
            CREATE INDEX IF NOT EXISTS idx_lessons_course_id_status ON lessons(course_id, status, archived);
        END IF;
    END IF;
END $$;

-- Show current state after cleanup
SELECT 'Total courses: ' || COUNT(*) as info FROM courses;
SELECT 'Published courses: ' || COUNT(*) as info FROM courses WHERE status = 'published' AND archived = false;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        RAISE NOTICE 'Total lessons: %', (SELECT COUNT(*) FROM lessons);
        RAISE NOTICE 'Published lessons: %', (SELECT COUNT(*) FROM lessons WHERE status = 'published' AND archived = false);
    END IF;
END $$;

-- Show any remaining courses
SELECT id, title, instructor_name, status, archived, created_at 
FROM courses 
WHERE archived = false 
ORDER BY created_at DESC;
