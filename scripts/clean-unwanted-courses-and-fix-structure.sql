-- Clean unwanted courses and fix database structure
-- This script will remove test courses and ensure proper structure

-- First, let's see what courses exist
SELECT id, title, instructor_name, created_at, status, archived 
FROM courses 
ORDER BY created_at DESC;

-- Remove the unwanted test course that appeared
DELETE FROM course_tags WHERE course_id IN (
    SELECT id FROM courses 
    WHERE title = 'Curso de Introducción a la Odontología' 
    AND instructor_name = 'Dr. Juan Pérez'
);

DELETE FROM lessons WHERE course_id IN (
    SELECT id FROM courses 
    WHERE title = 'Curso de Introducción a la Odontología' 
    AND instructor_name = 'Dr. Juan Pérez'
);

DELETE FROM enrollments WHERE course_id IN (
    SELECT id FROM courses 
    WHERE title = 'Curso de Introducción a la Odontología' 
    AND instructor_name = 'Dr. Juan Pérez'
);

DELETE FROM courses 
WHERE title = 'Curso de Introducción a la Odontología' 
AND instructor_name = 'Dr. Juan Pérez';

-- Ensure all tables have proper archived columns
ALTER TABLE courses ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE carousel_slides ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Update existing records to not be archived by default
UPDATE courses SET archived = false WHERE archived IS NULL;
UPDATE lessons SET archived = false WHERE archived IS NULL;
UPDATE carousel_slides SET archived = false WHERE archived IS NULL;

-- Ensure proper status values
UPDATE courses SET status = 'published' WHERE status IS NULL OR status = '';
UPDATE lessons SET status = 'published' WHERE status IS NULL OR status = '';

-- Fix any lessons that might be orphaned or have invalid course_id
DELETE FROM lessons WHERE course_id NOT IN (SELECT id FROM courses);

-- Ensure thumbnail_url column exists and has proper type
ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE carousel_slides ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_archived_status ON courses(archived, status);
CREATE INDEX IF NOT EXISTS idx_lessons_archived_status ON lessons(archived, status);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id_status ON lessons(course_id, status, archived);

-- Show current state after cleanup
SELECT 'Total courses: ' || COUNT(*) FROM courses;
SELECT 'Published courses: ' || COUNT(*) FROM courses WHERE status = 'published' AND archived = false;
SELECT 'Total lessons: ' || COUNT(*) FROM lessons;
SELECT 'Published lessons: ' || COUNT(*) FROM lessons WHERE status = 'published' AND archived = false;

-- Show any remaining courses
SELECT id, title, instructor_name, status, archived, created_at 
FROM courses 
WHERE archived = false 
ORDER BY created_at DESC;
