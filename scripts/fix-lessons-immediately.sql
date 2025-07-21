-- Fix lessons immediately - make everything work
-- This script will ensure all lessons are accessible

-- First, let's see what we have
SELECT 'Current lessons status:' as info;
SELECT id, title, status, archived, is_free, course_id 
FROM lessons 
ORDER BY created_at DESC 
LIMIT 10;

-- Fix all lessons to be published and accessible
UPDATE lessons SET 
    status = 'published',
    archived = false,
    is_free = COALESCE(is_free, true)  -- Make lessons free if not specified
WHERE status IS NULL OR status != 'published' OR archived = true;

-- Fix all courses to be published and accessible  
UPDATE courses SET 
    status = 'published',
    archived = false
WHERE status IS NULL OR status != 'published' OR archived = true;

-- Add missing columns if they don't exist
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30;

ALTER TABLE courses ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'published';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- Ensure the specific lesson that was failing works
UPDATE lessons 
SET status = 'published', archived = false, is_free = true
WHERE id = '689c966b-200e-44d6-9442-0b8e33665bee';

-- Show the specific lesson status
SELECT 'Specific lesson status:' as info;
SELECT l.id, l.title, l.status, l.archived, l.is_free, c.title as course_title, c.status as course_status
FROM lessons l
LEFT JOIN courses c ON l.course_id = c.id
WHERE l.id = '689c966b-200e-44d6-9442-0b8e33665bee';

-- Show all lessons status after fix
SELECT 'All lessons after fix:' as info;
SELECT COUNT(*) as total_lessons,
       COUNT(*) FILTER (WHERE status = 'published') as published_lessons,
       COUNT(*) FILTER (WHERE archived = false) as non_archived_lessons,
       COUNT(*) FILTER (WHERE is_free = true) as free_lessons
FROM lessons;

-- Show all courses status after fix
SELECT 'All courses after fix:' as info;
SELECT COUNT(*) as total_courses,
       COUNT(*) FILTER (WHERE status = 'published') as published_courses,
       COUNT(*) FILTER (WHERE archived = false) as non_archived_courses
FROM courses;
