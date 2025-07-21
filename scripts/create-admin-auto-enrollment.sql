-- Crear función para verificar si un usuario es administrador
CREATE OR REPLACE FUNCTION is_user_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para verificar acceso a lecciones
CREATE OR REPLACE FUNCTION check_lesson_access(user_id UUID, lesson_id UUID)
RETURNS TABLE (
  has_access BOOLEAN,
  access_type TEXT,
  lesson_info JSONB
) AS $$
DECLARE
  lesson_record RECORD;
  is_admin BOOLEAN;
  is_enrolled BOOLEAN;
BEGIN
  -- Obtener información de la lección
  SELECT l.*, c.title as course_title, c.price as course_price
  INTO lesson_record
  FROM lessons l
  JOIN courses c ON l.course_id = c.id
  WHERE l.id = lesson_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'not_found'::TEXT, '{}'::JSONB;
    RETURN;
  END IF;

  -- Verificar si es administrador
  SELECT is_user_admin(user_id) INTO is_admin;
  
  IF is_admin THEN
    RETURN QUERY SELECT TRUE, 'admin'::TEXT, 
      jsonb_build_object(
        'lesson', row_to_json(lesson_record),
        'access_reason', 'Administrator access'
      );
    RETURN;
  END IF;

  -- Verificar si la lección es gratuita
  IF lesson_record.is_free THEN
    RETURN QUERY SELECT TRUE, 'free'::TEXT,
      jsonb_build_object(
        'lesson', row_to_json(lesson_record),
        'access_reason', 'Free lesson'
      );
    RETURN;
  END IF;

  -- Verificar inscripción en el curso
  SELECT EXISTS (
    SELECT 1 FROM enrollments 
    WHERE user_id = check_lesson_access.user_id 
    AND course_id = lesson_record.course_id 
    AND status = 'active'
  ) INTO is_enrolled;

  IF is_enrolled THEN
    RETURN QUERY SELECT TRUE, 'enrolled'::TEXT,
      jsonb_build_object(
        'lesson', row_to_json(lesson_record),
        'access_reason', 'Enrolled in course'
      );
    RETURN;
  END IF;

  -- Sin acceso
  RETURN QUERY SELECT FALSE, 'denied'::TEXT,
    jsonb_build_object(
      'lesson', row_to_json(lesson_record),
      'access_reason', 'Not enrolled and lesson is not free'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función para obtener cursos de un usuario
CREATE OR REPLACE FUNCTION get_user_courses(user_id UUID)
RETURNS TABLE (
  course_id UUID,
  title TEXT,
  description TEXT,
  price DECIMAL,
  thumbnail_url TEXT,
  difficulty_level TEXT,
  created_at TIMESTAMPTZ,
  enrollment_info JSONB,
  access_type TEXT
) AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Verificar si es administrador
  SELECT is_user_admin(user_id) INTO is_admin;
  
  IF is_admin THEN
    -- Los administradores ven todos los cursos
    RETURN QUERY
    SELECT 
      c.id,
      c.title,
      c.description,
      c.price,
      c.thumbnail_url,
      c.difficulty_level,
      c.created_at,
      jsonb_build_object(
        'enrolled_at', NOW(),
        'progress', 100,
        'status', 'admin'
      ) as enrollment_info,
      'admin'::TEXT as access_type
    FROM courses c
    WHERE c.archived = FALSE
    ORDER BY c.created_at DESC;
  ELSE
    -- Los estudiantes solo ven cursos inscritos
    RETURN QUERY
    SELECT 
      c.id,
      c.title,
      c.description,
      c.price,
      c.thumbnail_url,
      c.difficulty_level,
      c.created_at,
      jsonb_build_object(
        'enrolled_at', e.enrolled_at,
        'progress', e.progress,
        'status', e.status,
        'completed_at', e.completed_at
      ) as enrollment_info,
      'enrolled'::TEXT as access_type
    FROM courses c
    JOIN enrollments e ON c.id = e.course_id
    WHERE e.user_id = get_user_courses.user_id
    AND e.status = 'active'
    AND c.archived = FALSE
    ORDER BY e.enrolled_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear tabla para logs de acceso de estudiantes
CREATE TABLE IF NOT EXISTS student_access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  access_type TEXT NOT NULL CHECK (access_type IN ('admin', 'free', 'enrolled', 'denied')),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_student_access_logs_user_id ON student_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_student_access_logs_course_id ON student_access_logs(course_id);
CREATE INDEX IF NOT EXISTS idx_student_access_logs_lesson_id ON student_access_logs(lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_access_logs_created_at ON student_access_logs(created_at);

-- Habilitar RLS en la tabla de logs
ALTER TABLE student_access_logs ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propios logs
CREATE POLICY "Users can view own access logs" ON student_access_logs
  FOR SELECT USING (user_id = auth.uid());

-- Política para que los administradores vean todos los logs
CREATE POLICY "Admins can view all access logs" ON student_access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Política para insertar logs
CREATE POLICY "Allow insert access logs" ON student_access_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Crear vista para acceso fácil de administradores a cursos
CREATE OR REPLACE VIEW admin_course_access AS
SELECT 
  c.*,
  'admin' as access_type,
  jsonb_build_object(
    'enrolled_at', NOW(),
    'progress', 100,
    'status', 'admin'
  ) as enrollment_info
FROM courses c
WHERE c.archived = FALSE;

-- Comentarios para documentación
COMMENT ON FUNCTION is_user_admin(UUID) IS 'Verifica si un usuario tiene rol de administrador';
COMMENT ON FUNCTION check_lesson_access(UUID, UUID) IS 'Verifica el acceso de un usuario a una lección específica';
COMMENT ON FUNCTION get_user_courses(UUID) IS 'Obtiene los cursos accesibles para un usuario según su rol';
COMMENT ON TABLE student_access_logs IS 'Registra todos los intentos de acceso a cursos y lecciones';
COMMENT ON VIEW admin_course_access IS 'Vista simplificada para acceso de administradores a todos los cursos';

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Sistema de acceso automático para administradores y lecciones gratuitas configurado correctamente';
  RAISE NOTICE 'Funciones creadas: is_user_admin, check_lesson_access, get_user_courses';
  RAISE NOTICE 'Tabla creada: student_access_logs';
  RAISE NOTICE 'Vista creada: admin_course_access';
  RAISE NOTICE 'Políticas RLS configuradas para seguridad';
END $$;
