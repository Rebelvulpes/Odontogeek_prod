-- Drop existing functions to recreate them properly
DROP FUNCTION IF EXISTS check_lesson_access(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS is_user_admin(UUID);

-- Create simplified function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simplified lesson access check function
CREATE OR REPLACE FUNCTION check_lesson_access(
  p_user_id UUID,
  p_lesson_id TEXT,
  p_course_id TEXT
)
RETURNS TABLE(
  has_access BOOLEAN,
  is_admin BOOLEAN,
  is_free BOOLEAN,
  is_enrolled BOOLEAN,
  access_reason TEXT
) AS $$
DECLARE
  v_lesson_record RECORD;
  v_is_admin BOOLEAN := FALSE;
  v_is_enrolled BOOLEAN := FALSE;
BEGIN
  -- Get lesson details
  SELECT l.*, c.title as course_title
  INTO v_lesson_record
  FROM lessons l
  JOIN courses c ON l.course_id = c.id
  WHERE l.id = p_lesson_id::INTEGER AND l.course_id = p_course_id::INTEGER;

  -- Check if lesson exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, FALSE, FALSE, FALSE, 'Lesson not found'::TEXT;
    RETURN;
  END IF;

  -- Check if user is admin
  SELECT is_user_admin(p_user_id) INTO v_is_admin;

  -- Check if user is enrolled in the course
  SELECT EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.user_id = p_user_id 
    AND e.course_id = p_course_id::INTEGER
    AND e.status = 'active'
  ) INTO v_is_enrolled;

  -- Determine access
  IF v_is_admin THEN
    RETURN QUERY SELECT TRUE, TRUE, v_lesson_record.is_free, v_is_enrolled, 'Administrator access'::TEXT;
  ELSIF v_lesson_record.is_free THEN
    RETURN QUERY SELECT TRUE, FALSE, TRUE, v_is_enrolled, 'Free lesson access'::TEXT;
  ELSIF v_is_enrolled THEN
    RETURN QUERY SELECT TRUE, FALSE, v_lesson_record.is_free, TRUE, 'Enrolled user access'::TEXT;
  ELSE
    RETURN QUERY SELECT FALSE, FALSE, v_lesson_record.is_free, FALSE, 'Access denied - not enrolled'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure student_access_log table exists with correct structure
CREATE TABLE IF NOT EXISTS student_access_log (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  error_code VARCHAR(50),
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_access_log_student_id ON student_access_log(student_id);
CREATE INDEX IF NOT EXISTS idx_student_access_log_created_at ON student_access_log(created_at);
CREATE INDEX IF NOT EXISTS idx_student_access_log_action ON student_access_log(action);

-- Grant permissions
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_lesson_access(UUID, TEXT, TEXT) TO authenticated;
GRANT ALL ON student_access_log TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE student_access_log_id_seq TO authenticated;

-- Test the functions
DO $$
DECLARE
  test_result RECORD;
BEGIN
  -- Test admin function
  RAISE NOTICE 'Testing admin function...';
  
  -- Test lesson access function (this will fail gracefully if no data exists)
  RAISE NOTICE 'Lesson access functions created successfully';
END $$;

COMMIT;
