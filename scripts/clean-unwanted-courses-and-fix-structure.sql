-- Clean unwanted courses and fix database structure
-- This script will remove test courses and ensure proper structure

-- First, let's see what courses exist
SELECT id, title, instructor_name, created_at, status, archived 
FROM courses 
ORDER BY created_at DESC;

DO $$
BEGIN
    -- Add archived column to courses if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'archived'
    ) THEN
        ALTER TABLE courses ADD COLUMN archived BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added archived column to courses table';
    END IF;

    -- Add archived column to lessons if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'archived'
    ) THEN
        ALTER TABLE lessons ADD COLUMN archived BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added archived column to lessons table';
    END IF;

    -- Add is_free column to courses if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'is_free'
    ) THEN
        ALTER TABLE courses ADD COLUMN is_free BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_free column to courses table';
    END IF;

    -- Add is_free column to lessons if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'is_free'
    ) THEN
        ALTER TABLE lessons ADD COLUMN is_free BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_free column to lessons table';
    END IF;

    -- Add duration_minutes column to lessons if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'duration_minutes'
    ) THEN
        ALTER TABLE lessons ADD COLUMN duration_minutes INTEGER DEFAULT 0;
        RAISE NOTICE 'Added duration_minutes column to lessons table';
    END IF;

    -- Update existing lessons duration from duration column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'duration'
    ) THEN
        UPDATE lessons SET duration_minutes = duration WHERE duration_minutes = 0 AND duration IS NOT NULL;
        RAISE NOTICE 'Updated duration_minutes from duration column';
    END IF;

    -- Remove course tags for unwanted courses
    DELETE FROM course_tags WHERE course_id IN (
        SELECT id FROM courses 
        WHERE title = 'Curso de Introducción a la Odontología' 
        AND instructor_name = 'Dr. Juan Pérez'
    );

    -- Remove lessons for unwanted courses
    DELETE FROM lessons WHERE course_id IN (
        SELECT id FROM courses 
        WHERE title = 'Curso de Introducción a la Odontología' 
        AND instructor_name = 'Dr. Juan Pérez'
    );

    -- Remove enrollments for unwanted courses
    DELETE FROM enrollments WHERE course_id IN (
        SELECT id FROM courses 
        WHERE title = 'Curso de Introducción a la Odontología' 
        AND instructor_name = 'Dr. Juan Pérez'
    );

    -- Remove the unwanted test course
    DELETE FROM courses 
    WHERE title = 'Curso de Introducción a la Odontología' 
    AND instructor_name = 'Dr. Juan Pérez';

    -- Also remove any other test courses that might have appeared
    DELETE FROM courses WHERE title LIKE '%Test%' OR title LIKE '%test%' OR title LIKE '%Prueba%';

    -- Ensure proper status values
    UPDATE courses SET status = 'published' WHERE status IS NULL OR status = '';

    -- Publish all draft lessons and courses that should be available
    UPDATE courses 
    SET status = 'published', archived = false 
    WHERE status = 'draft' AND archived = false;

    UPDATE lessons 
    SET status = 'published', archived = false 
    WHERE status = 'draft' AND archived = false;

    -- Make first lesson of each course free for preview
    UPDATE lessons 
    SET is_free = true 
    WHERE order_index = 1;

    -- Clean up any orphaned data
    DELETE FROM lessons WHERE course_id NOT IN (SELECT id FROM courses);

    -- Update course metadata
    UPDATE courses SET 
        updated_at = NOW(),
        is_free = CASE 
            WHEN EXISTS (SELECT 1 FROM lessons WHERE course_id = courses.id AND is_free = true) 
            THEN true 
            ELSE false 
        END
    WHERE status = 'published';

    -- Ensure thumbnail_url column exists and has proper type
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

    -- Add image_url column to carousel_slides if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'carousel_slides' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE carousel_slides ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url column to carousel_slides table';
    END IF;

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_courses_status_archived ON courses(status, archived);
    CREATE INDEX IF NOT EXISTS idx_lessons_status_archived ON lessons(status, archived);
    CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);

    -- Show summary of what we have
    SELECT 
        'Courses' as table_name,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE status = 'published') as published_count,
        COUNT(*) FILTER (WHERE archived = true) as archived_count
    FROM courses
    UNION ALL
    SELECT 
        'Lessons' as table_name,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE status = 'published') as published_count,
        COUNT(*) FILTER (WHERE archived = true) as archived_count
    FROM lessons;

    -- Show specific lesson that was causing the error
    SELECT 
        l.id,
        l.title,
        l.status,
        l.archived,
        l.is_free,
        c.title as course_title,
        c.status as course_status,
        c.archived as course_archived
    FROM lessons l
    JOIN courses c ON l.course_id = c.id
    WHERE l.id = '689c966b-200e-44d6-9442-0b8e33665bee';

    -- Show current state after cleanup
    SELECT 'Total courses: ' || COUNT(*) as info FROM courses;
    SELECT 'Published courses: ' || COUNT(*) as info FROM courses WHERE status = 'published' AND archived = false;

    -- Show any remaining courses
    SELECT id, title, instructor_name, status, archived, created_at 
    FROM courses 
    WHERE archived = false 
    ORDER BY created_at DESC;
END $$;
