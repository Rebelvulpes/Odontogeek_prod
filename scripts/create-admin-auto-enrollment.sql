-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_uuid AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check lesson access
CREATE OR REPLACE FUNCTION check_lesson_access(
  user_uuid UUID,
  lesson_uuid UUID,
  course_uuid UUID
)
RETURNS TABLE(
  has_access BOOLEAN,
  access_type TEXT,
  reason TEXT
) AS $$
DECLARE
  user_role TEXT;
  is_lesson_free BOOLEAN;
  is_enrolled BOOLEAN;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM users WHERE id = user_uuid;
  
  -- Check if lesson is free
  SELECT is_free INTO is_lesson_free FROM lessons WHERE id = lesson_uuid;
  
  -- Check if user is enrolled
  SELECT EXISTS(
    SELECT 1 FROM enrollments 
    WHERE user_id = user_uuid 
    AND course_id = course_uuid 
    AND status = 'active'
  ) INTO is_enrolled;
  
  -- Admin access
  IF user_role = 'admin' THEN
    RETURN QUERY SELECT true, 'admin'::TEXT, 'Administrator access'::TEXT;
    RETURN;
  END IF;
  
  -- Free lesson access for logged users
  IF is_lesson_free THEN
    RETURN QUERY SELECT true, 'free'::TEXT, 'Free lesson access'::TEXT;
    RETURN;
  END IF;
  
  -- Enrolled user access
  IF is_enrolled THEN
    RETURN QUERY SELECT true, 'enrolled'::TEXT, 'Enrolled user access'::TEXT;
    RETURN;
  END IF;
  
  -- No access
  RETURN QUERY SELECT false, 'denied'::TEXT, 'Access denied'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user courses (including admin auto-access)
CREATE OR REPLACE FUNCTION get_user_courses(user_uuid UUID)
RETURNS TABLE(
  course_id UUID,
  title TEXT,
  description TEXT,
  price DECIMAL,
  thumbnail_url TEXT,
  difficulty_level TEXT,
  created_at TIMESTAMPTZ,
  progress INTEGER,
  access_type TEXT
) AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get user role
  SELECT role INTO user_role FROM users WHERE id = user_uuid;
  
  -- If admin, return all courses with admin access
  IF user_role = 'admin' THEN
    RETURN QUERY
    SELECT 
      c.id,
      c.title,
      c.description,
      c.price,
      c.thumbnail_url,
      c.difficulty_level,
      c.created_at,
      100 as progress, -- Admin has 100% access
      'admin'::TEXT as access_type
    FROM courses c
    WHERE c.archived = false
    ORDER BY c.created_at DESC;
  ELSE
    -- For regular users, return enrolled courses
    RETURN QUERY
    SELECT 
      c.id,
      c.title,
      c.description,
      c.price,
      c.thumbnail_url,
      c.difficulty_level,
      c.created_at,
      COALESCE(e.progress, 0) as progress,
      'enrolled'::TEXT as access_type
    FROM courses c
    INNER JOIN enrollments e ON c.id = e.course_id
    WHERE c.archived = false
    AND e.user_id = user_uuid
    AND e.status = 'active'
    ORDER BY c.created_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for admin course access
CREATE OR REPLACE VIEW admin_course_access AS
SELECT 
  u.id as user_id,
  u.email,
  c.id as course_id,
  c.title as course_title,
  'admin' as access_type,
  100 as progress,
  NOW() as granted_at
FROM users u
CROSS JOIN courses c
WHERE u.role = 'admin'
AND c.archived = false;

-- Create table for student access logs if it doesn't exist
CREATE TABLE IF NOT EXISTS student_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('admin', 'free', 'enrolled', 'denied')),
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_student_access_logs_user_id ON student_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_student_access_logs_course_id ON student_access_logs(course_id);
CREATE INDEX IF NOT EXISTS idx_student_access_logs_accessed_at ON student_access_logs(accessed_at);

-- Add RLS policies for student_access_logs
ALTER TABLE student_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own logs
CREATE POLICY "Users can view their own access logs" ON student_access_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for admins to see all logs
CREATE POLICY "Admins can view all access logs" ON student_access_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for inserting access logs
CREATE POLICY "Allow inserting access logs" ON student_access_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON admin_course_access TO authenticated;
GRANT ALL ON student_access_logs TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_lesson_access(UUID, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_courses(UUID) TO authenticated;

-- Insert some sample data for testing (optional)
-- This will be handled by the application, but we can add some test free lessons
UPDATE lessons 
SET is_free = true 
WHERE title ILIKE '%introducción%' 
   OR title ILIKE '%bienvenida%' 
   OR title ILIKE '%overview%'
   OR order_index = 1;

COMMIT;
