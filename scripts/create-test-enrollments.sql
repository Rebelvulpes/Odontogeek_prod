-- Crear enrollments de prueba para el usuario estudiante
WITH test_user AS (
  SELECT id as user_id FROM users WHERE email = 'estudiante@test.com'
),
available_courses AS (
  SELECT id as course_id, title FROM courses WHERE status = 'published' LIMIT 2
)
INSERT INTO enrollments (
  id,
  user_id,
  course_id,
  enrolled_at,
  progress_percentage,
  status
)
SELECT 
  gen_random_uuid(),
  tu.user_id,
  ac.course_id,
  NOW() - INTERVAL '10 days',
  CASE 
    WHEN ROW_NUMBER() OVER () = 1 THEN 65.5
    ELSE 30.0
  END,
  'active'
FROM test_user tu
CROSS JOIN available_courses ac
ON CONFLICT (user_id, course_id) DO UPDATE SET
  progress_percentage = EXCLUDED.progress_percentage,
  status = EXCLUDED.status;

-- Crear progreso de lecciones
WITH test_user AS (
  SELECT id as user_id FROM users WHERE email = 'estudiante@test.com'
),
user_courses AS (
  SELECT DISTINCT e.course_id 
  FROM enrollments e 
  JOIN test_user tu ON e.user_id = tu.user_id
)
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
  gen_random_uuid(),
  tu.user_id,
  l.id,
  l.course_id,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY l.course_id ORDER BY l.order_index) <= 3 
    THEN NOW() - INTERVAL '2 days'
    ELSE NULL
  END,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY l.course_id ORDER BY l.order_index) <= 3 
    THEN COALESCE(l.duration_minutes, 30) * 60
    ELSE COALESCE(l.duration_minutes, 30) * 30
  END,
  CASE 
    WHEN ROW_NUMBER() OVER (PARTITION BY l.course_id ORDER BY l.order_index) <= 3 
    THEN true
    ELSE false
  END
FROM test_user tu
CROSS JOIN user_courses uc
JOIN lessons l ON l.course_id = uc.course_id
WHERE l.archived = false
ON CONFLICT (user_id, lesson_id) DO UPDATE SET
  completed_at = EXCLUDED.completed_at,
  watch_time_seconds = EXCLUDED.watch_time_seconds,
  is_completed = EXCLUDED.is_completed;

-- Verificar enrollments creados
SELECT 
  'Enrollments creados:' as info,
  e.id,
  c.title as curso,
  e.progress_percentage as progreso,
  e.enrolled_at
FROM enrollments e
JOIN courses c ON e.course_id = c.id
JOIN users u ON e.user_id = u.id
WHERE u.email = 'estudiante@test.com';
