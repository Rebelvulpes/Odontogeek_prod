-- Ensure courses table has all required columns
DO $$ 
BEGIN
    -- Check if courses table exists, if not create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
        CREATE TABLE courses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) DEFAULT 0,
            instructor_name VARCHAR(255),
            thumbnail_url TEXT,
            duration_hours INTEGER,
            difficulty_level VARCHAR(50) DEFAULT 'principiante',
            status VARCHAR(50) DEFAULT 'published',
            archived BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created courses table';
    END IF;

    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'archived') THEN
        ALTER TABLE courses ADD COLUMN archived BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added archived column to courses';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'status') THEN
        ALTER TABLE courses ADD COLUMN status VARCHAR(50) DEFAULT 'published';
        RAISE NOTICE 'Added status column to courses';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'difficulty_level') THEN
        ALTER TABLE courses ADD COLUMN difficulty_level VARCHAR(50) DEFAULT 'principiante';
        RAISE NOTICE 'Added difficulty_level column to courses';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;
        RAISE NOTICE 'Added thumbnail_url column to courses';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'duration_hours') THEN
        ALTER TABLE courses ADD COLUMN duration_hours INTEGER;
        RAISE NOTICE 'Added duration_hours column to courses';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor_name') THEN
        ALTER TABLE courses ADD COLUMN instructor_name VARCHAR(255);
        RAISE NOTICE 'Added instructor_name column to courses';
    END IF;

    -- Ensure lessons table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lessons') THEN
        CREATE TABLE lessons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            video_url TEXT,
            content TEXT,
            duration_minutes INTEGER DEFAULT 0,
            order_index INTEGER DEFAULT 0,
            is_free BOOLEAN DEFAULT FALSE,
            archived BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created lessons table';
    END IF;

    -- Add missing columns to lessons if they don't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'content') THEN
        ALTER TABLE lessons ADD COLUMN content TEXT;
        RAISE NOTICE 'Added content column to lessons';
    END IF;

    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'archived') THEN
        ALTER TABLE lessons ADD COLUMN archived BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added archived column to lessons';
    END IF;

    -- Ensure enrollments table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        CREATE TABLE enrollments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            progress DECIMAL(5,2) DEFAULT 0,
            completed_at TIMESTAMP WITH TIME ZONE,
            UNIQUE(user_id, course_id)
        );
        
        RAISE NOTICE 'Created enrollments table';
    END IF;

    -- Ensure tags table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tags') THEN
        CREATE TABLE tags (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL UNIQUE,
            slug VARCHAR(100) NOT NULL UNIQUE,
            color VARCHAR(7) DEFAULT '#3B82F6',
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Created tags table';
    END IF;

    -- Ensure course_tags table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_tags') THEN
        CREATE TABLE course_tags (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(course_id, tag_id)
        );
        
        RAISE NOTICE 'Created course_tags table';
    END IF;

    -- Create indexes for better performance
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'courses' AND indexname = 'idx_courses_status') THEN
        CREATE INDEX idx_courses_status ON courses(status);
        RAISE NOTICE 'Created index on courses.status';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'courses' AND indexname = 'idx_courses_archived') THEN
        CREATE INDEX idx_courses_archived ON courses(archived);
        RAISE NOTICE 'Created index on courses.archived';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'lessons' AND indexname = 'idx_lessons_course_id') THEN
        CREATE INDEX idx_lessons_course_id ON lessons(course_id);
        RAISE NOTICE 'Created index on lessons.course_id';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'lessons' AND indexname = 'idx_lessons_archived') THEN
        CREATE INDEX idx_lessons_archived ON lessons(archived);
        RAISE NOTICE 'Created index on lessons.archived';
    END IF;

    -- Update any NULL values to defaults
    UPDATE courses SET 
        status = 'published' WHERE status IS NULL,
        archived = FALSE WHERE archived IS NULL,
        difficulty_level = 'principiante' WHERE difficulty_level IS NULL,
        price = 0 WHERE price IS NULL;

    UPDATE lessons SET 
        archived = FALSE WHERE archived IS NULL,
        is_free = FALSE WHERE is_free IS NULL,
        duration_minutes = 0 WHERE duration_minutes IS NULL,
        order_index = 0 WHERE order_index IS NULL;

    RAISE NOTICE 'Database structure verification completed successfully';

END $$;

-- Verify the structure
SELECT 
    'courses' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN archived = FALSE THEN 1 END) as active_records
FROM courses
UNION ALL
SELECT 
    'lessons' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN archived = FALSE THEN 1 END) as active_records
FROM lessons
UNION ALL
SELECT 
    'enrollments' as table_name,
    COUNT(*) as total_records,
    COUNT(*) as active_records
FROM enrollments;
