-- Fix lesson access functions and create proper lesson data
-- This script ensures lessons exist and access functions work correctly

-- First, let's check what lessons exist
DO $$
BEGIN
    RAISE NOTICE 'Current lessons in database:';
END $$;

SELECT 
    l.id,
    l.title,
    l.course_id,
    c.title as course_title,
    l.is_free,
    l.order_index
FROM lessons l
LEFT JOIN courses c ON l.course_id = c.id
ORDER BY l.course_id, l.order_index;

-- Create some sample lessons if none exist
INSERT INTO lessons (
    course_id,
    title,
    description,
    content,
    video_url,
    duration_minutes,
    order_index,
    is_free,
    created_at,
    updated_at
) 
SELECT 
    c.id,
    'Introducción a ' || c.title,
    'Lección introductoria del curso ' || c.title,
    '<h2>Bienvenido al curso</h2><p>En esta lección aprenderás los conceptos básicos de ' || c.title || '.</p><p>Esta es una lección de ejemplo que te ayudará a familiarizarte con la plataforma.</p>',
    NULL,
    15,
    1,
    true, -- Make first lesson free
    NOW(),
    NOW()
FROM courses c
WHERE NOT EXISTS (
    SELECT 1 FROM lessons l WHERE l.course_id = c.id
)
LIMIT 5;

-- Add a second lesson for each course
INSERT INTO lessons (
    course_id,
    title,
    description,
    content,
    video_url,
    duration_minutes,
    order_index,
    is_free,
    created_at,
    updated_at
) 
SELECT 
    c.id,
    'Conceptos Fundamentales - ' || c.title,
    'Segunda lección del curso ' || c.title,
    '<h2>Conceptos Fundamentales</h2><p>En esta lección profundizaremos en los conceptos fundamentales de ' || c.title || '.</p><p>Aprenderás técnicas avanzadas y mejores prácticas.</p>',
    NULL,
    25,
    2,
    false, -- Make second lesson premium
    NOW(),
    NOW()
FROM courses c
WHERE EXISTS (
    SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.order_index = 1
)
AND NOT EXISTS (
    SELECT 1 FROM lessons l WHERE l.course_id = c.id AND l.order_index = 2
)
LIMIT 5;

-- Create or replace the lesson access check function
CREATE OR REPLACE FUNCTION check_lesson_access(
    p_user_id INTEGER,
    p_lesson_id INTEGER,
    p_course_id INTEGER DEFAULT NULL
)
RETURNS TABLE(
    has_access BOOLEAN,
    is_admin BOOLEAN,
    is_free BOOLEAN,
    is_enrolled BOOLEAN,
    access_reason TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role TEXT;
    v_lesson_free BOOLEAN;
    v_enrollment_active BOOLEAN;
    v_lesson_exists BOOLEAN;
    v_actual_course_id INTEGER;
BEGIN
    -- Check if lesson exists and get its course_id
    SELECT 
        l.is_free, 
        l.course_id,
        true
    INTO 
        v_lesson_free, 
        v_actual_course_id,
        v_lesson_exists
    FROM lessons l 
    WHERE l.id = p_lesson_id;
    
    -- If lesson doesn't exist, return no access
    IF NOT v_lesson_exists THEN
        RETURN QUERY SELECT 
            false::BOOLEAN, 
            false::BOOLEAN, 
            false::BOOLEAN, 
            false::BOOLEAN, 
            'Lesson not found'::TEXT;
        RETURN;
    END IF;
    
    -- Validate course_id if provided
    IF p_course_id IS NOT NULL AND v_actual_course_id != p_course_id THEN
        RETURN QUERY SELECT 
            false::BOOLEAN, 
            false::BOOLEAN, 
            false::BOOLEAN, 
            false::BOOLEAN, 
            'Lesson does not belong to specified course'::TEXT;
        RETURN;
    END IF;
    
    -- Get user role
    SELECT role INTO v_user_role FROM users WHERE id = p_user_id;
    
    -- Check if user is admin
    IF v_user_role = 'admin' THEN
        RETURN QUERY SELECT 
            true::BOOLEAN, 
            true::BOOLEAN, 
            v_lesson_free::BOOLEAN, 
            false::BOOLEAN, 
            'Admin access'::TEXT;
        RETURN;
    END IF;
    
    -- Check if lesson is free
    IF v_lesson_free THEN
        RETURN QUERY SELECT 
            true::BOOLEAN, 
            false::BOOLEAN, 
            true::BOOLEAN, 
            false::BOOLEAN, 
            'Free lesson access'::TEXT;
        RETURN;
    END IF;
    
    -- Check enrollment for paid lessons
    SELECT 
        CASE WHEN e.status = 'active' THEN true ELSE false END
    INTO v_enrollment_active
    FROM enrollments e
    WHERE e.user_id = p_user_id 
    AND e.course_id = v_actual_course_id;
    
    IF v_enrollment_active THEN
        RETURN QUERY SELECT 
            true::BOOLEAN, 
            false::BOOLEAN, 
            false::BOOLEAN, 
            true::BOOLEAN, 
            'Enrolled access'::TEXT;
        RETURN;
    END IF;
    
    -- No access
    RETURN QUERY SELECT 
        false::BOOLEAN, 
        false::BOOLEAN, 
        v_lesson_free::BOOLEAN, 
        false::BOOLEAN, 
        'No access - enrollment required'::TEXT;
END;
$$;

-- Create simple admin check function
CREATE OR REPLACE FUNCTION is_user_admin(p_user_id INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM users WHERE id = p_user_id;
    RETURN COALESCE(v_role = 'admin', false);
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_lesson_access(INTEGER, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin(INTEGER) TO anon, authenticated;

-- Create student access log table if it doesn't exist
CREATE TABLE IF NOT EXISTS student_access_log (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id),
    email TEXT,
    action TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    error_code TEXT,
    error_message TEXT,
    ip_address TEXT,
    user_agent TEXT,
    session_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_access_log_student_id ON student_access_log(student_id);
CREATE INDEX IF NOT EXISTS idx_student_access_log_created_at ON student_access_log(created_at);
CREATE INDEX IF NOT EXISTS idx_student_access_log_action ON student_access_log(action);

-- Grant permissions on the log table
GRANT SELECT, INSERT ON student_access_log TO anon, authenticated;
GRANT USAGE ON SEQUENCE student_access_log_id_seq TO anon, authenticated;

-- Show final lesson count
DO $$
DECLARE
    lesson_count INTEGER;
    course_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO lesson_count FROM lessons;
    SELECT COUNT(*) INTO course_count FROM courses;
    
    RAISE NOTICE 'Database setup complete:';
    RAISE NOTICE '- Courses: %', course_count;
    RAISE NOTICE '- Lessons: %', lesson_count;
    RAISE NOTICE '- Functions created: check_lesson_access, is_user_admin';
    RAISE NOTICE '- Log table: student_access_log';
END $$;

-- Show sample lessons created
SELECT 
    'Sample lessons:' as info,
    l.id,
    l.title,
    c.title as course_title,
    l.is_free,
    l.order_index
FROM lessons l
JOIN courses c ON l.course_id = c.id
ORDER BY c.id, l.order_index
LIMIT 10;
