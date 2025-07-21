-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check lesson access
CREATE OR REPLACE FUNCTION check_lesson_access(
  user_id UUID,
  lesson_id INTEGER,
  course_id INTEGER
)
RETURNS TABLE(
  has_access BOOLEAN,
  is_admin BOOLEAN,
  is_free BOOLEAN,
  is_enrolled BOOLEAN
) AS $$
DECLARE
  lesson_record RECORD;
  admin_check BOOLEAN;
  enrollment_check BOOLEAN;
BEGIN
  -- Get lesson details
  SELECT * INTO lesson_record
  FROM lessons l
  WHERE l.id = lesson_id AND l.course_id = check_lesson_access.course_id;

  -- Check if lesson exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, FALSE, FALSE, FALSE;
    RETURN;
  END IF;

  -- Check if user is admin
  admin_check := is_user_admin(check_lesson_access.user_id);

  -- Check if user is enrolled in the course
  enrollment_check := EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.user_id = check_lesson_access.user_id 
    AND e.course_id = check_lesson_access.course_id
    AND e.status = 'active'
  );

  -- Determine access
  IF admin_check THEN
    -- Admin has access to everything
    RETURN QUERY SELECT TRUE, TRUE, lesson_record.is_free, enrollment_check;
  ELSIF lesson_record.is_free THEN
    -- Free lessons are accessible to logged-in users
    RETURN QUERY SELECT TRUE, FALSE, TRUE, enrollment_check;
  ELSIF enrollment_check THEN
    -- Enrolled users have access to premium content
    RETURN QUERY SELECT TRUE, FALSE, lesson_record.is_free, TRUE;
  ELSE
    -- No access
    RETURN QUERY SELECT FALSE, FALSE, lesson_record.is_free, FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user courses based on role
CREATE OR REPLACE FUNCTION get_user_courses(user_id UUID)
RETURNS TABLE(
  course_id INTEGER,
  title VARCHAR,
  description TEXT,
  price DECIMAL,
  thumbnail_url TEXT,
  difficulty_level VARCHAR,
  access_type VARCHAR,
  progress_percentage INTEGER
) AS $$
DECLARE
  admin_check BOOLEAN;
BEGIN
  -- Check if user is admin
  admin_check := is_user_admin(get_user_courses.user_id);

  IF admin_check THEN
    -- Admin gets all courses
    RETURN QUERY
    SELECT 
      c.id,
      c.title,
      c.description,
      c.price,
      c.thumbnail_url,
      c.difficulty_level,
      'admin'::VARCHAR as access_type,
      100 as progress_percentage
    FROM courses c
    WHERE c.archived = FALSE
    ORDER BY c.created_at DESC;
  ELSE
    -- Regular user gets enrolled courses
    RETURN QUERY
    SELECT 
      c.id,
      c.title,
      c.description,
      c.price,
      c.thumbnail_url,
      c.difficulty_level,
      'enrolled'::VARCHAR as access_type,
      COALESCE(e.progress_percentage, 0) as progress_percentage
    FROM courses c
    INNER JOIN enrollments e ON c.id = e.course_id
    WHERE e.user_id = get_user_courses.user_id
    AND e.status = 'active'
    AND c.archived = FALSE
    ORDER BY e.created_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create student access logs table
CREATE TABLE IF NOT EXISTS student_access_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  access_type VARCHAR(20) NOT NULL, -- 'admin', 'free', 'enrolled', 'denied'
  success BOOLEAN NOT NULL DEFAULT FALSE,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_student_access_logs_user_id ON student_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_student_access_logs_course_id ON student_access_logs(course_id);
CREATE INDEX IF NOT EXISTS idx_student_access_logs_created_at ON student_access_logs(created_at);

-- Enable RLS on student_access_logs
ALTER TABLE student_access_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_access_logs
CREATE POLICY "Users can view their own access logs" ON student_access_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all access logs" ON student_access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can insert access logs" ON student_access_logs
  FOR INSERT WITH CHECK (true);

-- Create view for admin course access
CREATE OR REPLACE VIEW admin_course_access AS
SELECT 
  u.id as user_id,
  u.email,
  u.first_name,
  u.last_name,
  c.id as course_id,
  c.title as course_title,
  'admin' as access_type,
  100 as progress_percentage,
  NOW() as granted_at
FROM users u
CROSS JOIN courses c
WHERE u.role = 'admin' AND c.archived = FALSE;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_lesson_access(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_courses(UUID) TO authenticated;
GRANT SELECT ON admin_course_access TO authenticated;
GRANT ALL ON student_access_logs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE student_access_logs_id_seq TO authenticated;

-- Insert some test data for free lessons (optional)
UPDATE lessons 
SET is_free = TRUE 
WHERE id IN (
  SELECT id FROM lessons 
  ORDER BY RANDOM() 
  LIMIT 3
);

COMMIT;
