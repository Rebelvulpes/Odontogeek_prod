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
  status,
  created_at,
  updated_at
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
  'active',
  NOW() - INTERVAL '10 days',
  NOW()
FROM test_user tu
CROSS JOIN available_courses ac
ON CONFLICT (user_id, course_id) DO UPDATE SET
  progress_percentage = EXCLUDED.progress_percentage,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Crear progreso de lecciones para simular avance
WITH test_user AS (
  SELECT id as user_id FROM users WHERE email = 'estudiante@test.com'
),
user_courses AS (
  SELECT DISTINCT e.course_id 
  FROM enrollments e 
  JOIN test_user tu ON e.user_id = tu.user_id
),
course_lessons AS (
  SELECT 
    l.id as lesson_id,
    l.course_id,
    l.order_index,
    ROW_NUMBER() OVER (PARTITION BY l.course_id ORDER BY l.order_index) as lesson_number
  FROM lessons l
  JOIN user_courses uc ON l.course_id = uc.course_id
  WHERE l.archived = false
)
INSERT INTO lesson_progress (
  id,
  user_id,
  lesson_id,
  course_id,
  completed_at,
  watch_time_seconds,
  is_completed,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  tu.user_id,
  cl.lesson_id,
  cl.course_id,
  CASE 
    WHEN cl.lesson_number <= 3 THEN NOW() - INTERVAL '2 days'
    ELSE NULL
  END,
  CASE 
    WHEN cl.lesson_number <= 3 THEN 1800 -- 30 minutos en segundos
    ELSE 900 -- 15 minutos parcial
  END,
  CASE 
    WHEN cl.lesson_number <= 3 THEN true
    ELSE false
  END,
  NOW() - INTERVAL '2 days',
  NOW()
FROM test_user tu
CROSS JOIN course_lessons cl
ON CONFLICT (user_id, lesson_id) DO UPDATE SET
  completed_at = EXCLUDED.completed_at,
  watch_time_seconds = EXCLUDED.watch_time_seconds,
  is_completed = EXCLUDED.is_completed,
  updated_at = NOW();

-- Verificar enrollments y progreso creados
SELECT 
  'Enrollments creados:' as info,
  u.email,
  c.title as curso,
  e.progress_percentage as progreso,
  e.status,
  e.enrolled_at
FROM enrollments e
JOIN courses c ON e.course_id = c.id
JOIN users u ON e.user_id = u.id
WHERE u.email = 'estudiante@test.com';

-- Verificar progreso de lecciones
SELECT 
  'Progreso de lecciones:' as info,
  c.title as curso,
  COUNT(*) as total_lecciones,
  COUNT(CASE WHEN lp.is_completed THEN 1 END) as completadas
FROM lesson_progress lp
JOIN lessons l ON lp.lesson_id = l.id
JOIN courses c ON l.course_id = c.id
JOIN users u ON lp.user_id = u.id
WHERE u.email = 'estudiante@test.com'
GROUP BY c.id, c.title;
