-- Crear usuario de prueba para testing del dashboard
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  avatar_url,
  created_at,
  updated_at
) VALUES (
  'test-student-001',
  'estudiante@test.com',
  'María',
  'González',
  'student',
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  updated_at = NOW();

-- Crear algunos enrollments de prueba para el usuario
INSERT INTO enrollments (
  id,
  user_id,
  course_id,
  enrolled_at,
  progress_percentage,
  completed_at,
  status
) VALUES 
  (
    'enroll-001',
    'test-student-001',
    (SELECT id FROM courses WHERE status = 'published' LIMIT 1),
    NOW() - INTERVAL '10 days',
    65.5,
    NULL,
    'active'
  ),
  (
    'enroll-002', 
    'test-student-001',
    (SELECT id FROM courses WHERE status = 'published' OFFSET 1 LIMIT 1),
    NOW() - INTERVAL '5 days',
    30.0,
    NULL,
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  progress_percentage = EXCLUDED.progress_percentage,
  status = EXCLUDED.status;

-- Crear progreso de lecciones para simular avance
INSERT INTO lesson_progress (
  id,
  user_id,
  lesson_id,
  course_id,
  completed_at,
  watch_time_seconds,
  is_completed
)
SELECT 
  'progress-' || l.id || '-test',
  'test-student-001',
  l.id,
  l.course_id,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY l.course_id ORDER BY l.order_index) <= 3 
    THEN NOW() - INTERVAL '2 days'
    ELSE NULL
  END,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY l.course_id ORDER BY l.order_index) <= 3 
    THEN (l.duration_minutes * 60)
    ELSE (l.duration_minutes * 30)
  END,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY l.course_id ORDER BY l.order_index) <= 3 
    THEN true
    ELSE false
  END
FROM lessons l
WHERE l.course_id IN (
  SELECT course_id FROM enrollments WHERE user_id = 'test-student-001'
)
AND l.archived = false
ON CONFLICT (id) DO UPDATE SET
  completed_at = EXCLUDED.completed_at,
  watch_time_seconds = EXCLUDED.watch_time_seconds,
  is_completed = EXCLUDED.is_completed;
