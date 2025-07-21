-- Script para dar acceso automático a administradores a todos los cursos
-- y permitir acceso a lecciones gratuitas para usuarios con cuenta

-- Crear función para verificar si un usuario es admin
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
CREATE OR REPLACE FUNCTION check_lesson_access(
  p_user_id UUID,
  p_course_id UUID,
  p_lesson_id UUID
)
RETURNS TABLE (
  has_access BOOLEAN,
  access_reason TEXT,
  lesson_is_free BOOLEAN
) AS $$
DECLARE
  v_user_role TEXT;
  v_lesson_is_free BOOLEAN;
  v_has_enrollment BOOLEAN;
BEGIN
  -- Obtener rol del usuario
  SELECT role INTO v_user_role
  FROM users
  WHERE id = p_user_id;

  -- Obtener si la lección es gratuita
  SELECT is_free INTO v_lesson_is_free
  FROM lessons
  WHERE id = p_lesson_id AND course_id = p_course_id;

  -- Si no se encuentra la lección, denegar acceso
  IF v_lesson_is_free IS NULL THEN
    RETURN QUERY SELECT FALSE, 'lesson_not_found'::TEXT, FALSE;
    RETURN;
  END IF;

  -- Administradores tienen acceso a todo
  IF v_user_role = 'admin' THEN
    RETURN QUERY SELECT TRUE, 'admin_access'::TEXT, v_lesson_is_free;
    RETURN;
  END IF;

  -- Lecciones gratuitas son accesibles para usuarios con cuenta
  IF v_lesson_is_free = TRUE THEN
    RETURN QUERY SELECT TRUE, 'free_lesson'::TEXT, v_lesson_is_free;
    RETURN;
  END IF;

  -- Para lecciones de pago, verificar inscripción
  SELECT EXISTS(
    SELECT 1 FROM enrollments
    WHERE user_id = p_user_id 
    AND course_id = p_course_id 
    AND status = 'active'
  ) INTO v_has_enrollment;

  IF v_has_enrollment THEN
    RETURN QUERY SELECT TRUE, 'enrolled'::TEXT, v_lesson_is_free;
  ELSE
    RETURN QUERY SELECT FALSE, 'not_enrolled'::TEXT, v_lesson_is_free;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear vista para cursos con acceso de admin
CREATE OR REPLACE VIEW admin_course_access AS
SELECT 
  c.*,
  'admin_access' as access_type,
  100 as progress,
  NOW() as enrolled_at,
  NULL::timestamp as completed_at,
  NULL::timestamp as last_accessed_at
FROM courses c
WHERE EXISTS (
  SELECT 1 FROM users 
  WHERE role = 'admin'
);

-- Función para obtener cursos de un usuario (incluyendo acceso admin)
CREATE OR REPLACE FUNCTION get_user_courses(p_user_id UUID)
RETURNS TABLE (
  course_id UUID,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  price DECIMAL,
  duration_hours INTEGER,
  level TEXT,
  instructor TEXT,
  progress INTEGER,
  enrolled_at TIMESTAMP,
  completed_at TIMESTAMP,
  last_accessed_at TIMESTAMP,
  enrollment_id TEXT,
  status TEXT,
  is_admin_access BOOLEAN
) AS $$
DECLARE
  v_user_role TEXT;
BEGIN
  -- Obtener rol del usuario
  SELECT role INTO v_user_role
  FROM users
  WHERE id = p_user_id;

  -- Si es admin, devolver todos los cursos
  IF v_user_role = 'admin' THEN
    RETURN QUERY
    SELECT 
      c.id,
      c.title,
      c.description,
      c.thumbnail_url,
      c.price,
      c.duration_hours,
      c.level,
      c.instructor,
      100 as progress,
      NOW() as enrolled_at,
      NULL::timestamp as completed_at,
      NULL::timestamp as last_accessed_at,
      ('admin-' || c.id::text) as enrollment_id,
      'admin_access' as status,
      TRUE as is_admin_access
    FROM courses c
    ORDER BY c.created_at DESC;
  ELSE
    -- Para estudiantes, devolver solo cursos inscritos
    RETURN QUERY
    SELECT 
      c.id,
      c.title,
      c.description,
      c.thumbnail_url,
      c.price,
      c.duration_hours,
      c.level,
      c.instructor,
      COALESCE(e.progress, 0) as progress,
      e.enrolled_at,
      e.completed_at,
      e.last_accessed_at,
      e.id::text as enrollment_id,
      e.status,
      FALSE as is_admin_access
    FROM courses c
    INNER JOIN enrollments e ON c.id = e.course_id
    WHERE e.user_id = p_user_id
    ORDER BY e.enrolled_at DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar políticas RLS para permitir acceso a lecciones gratuitas
DROP POLICY IF EXISTS "Users can view lessons they have access to" ON lessons;

CREATE POLICY "Users can view lessons they have access to" ON lessons
FOR SELECT USING (
  -- Administradores pueden ver todas las lecciones
  (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'))
  OR
  -- Lecciones gratuitas son visibles para usuarios autenticados
  (is_free = true AND auth.uid() IS NOT NULL)
  OR
  -- Lecciones de pago requieren inscripción activa
  (is_free = false AND EXISTS (
    SELECT 1 FROM enrollments 
    WHERE user_id = auth.uid() 
    AND course_id = lessons.course_id 
    AND status = 'active'
  ))
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_lessons_is_free ON lessons(is_free);
CREATE INDEX IF NOT EXISTS idx_lessons_course_free ON lessons(course_id, is_free);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course_status ON enrollments(user_id, course_id, status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insertar log de configuración
INSERT INTO student_access_log (
  email,
  action,
  success,
  error_message,
  ip_address,
  user_agent
) VALUES (
  'system@odontogeek.com',
  'admin_auto_access_setup',
  true,
  'Admin auto-access and free lesson access configured successfully',
  'system',
  'database-script'
);

-- Mostrar resumen de configuración
SELECT 
  'Admin users' as user_type,
  COUNT(*) as count
FROM users 
WHERE role = 'admin'

UNION ALL

SELECT 
  'Free lessons' as user_type,
  COUNT(*) as count
FROM lessons 
WHERE is_free = true

UNION ALL

SELECT 
  'Total courses' as user_type,
  COUNT(*) as count
FROM courses

UNION ALL

SELECT 
  'Active enrollments' as user_type,
  COUNT(*) as count
FROM enrollments 
WHERE status = 'active';
