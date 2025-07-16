-- Crear usuario de prueba con contraseña para testing del dashboard
-- Contraseña: test123 (hasheada con bcrypt)

-- Primero verificar que las columnas existen
DO $$
BEGIN
    -- Agregar avatar_url si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
    
    -- Agregar updated_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Insertar usuario de prueba
INSERT INTO users (
  id,
  email,
  first_name,
  last_name,
  role,
  password_hash,
  avatar_url,
  created_at,
  updated_at
) VALUES (
  'test-student-001',
  'estudiante@test.com',
  'María',
  'González',
  'student',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- test123
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

-- Crear tabla lesson_progress si no existe
CREATE TABLE IF NOT EXISTS lesson_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  watch_time_seconds INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE(user_id, lesson_id)
);

-- Crear algunos enrollments de prueba para el usuario
INSERT INTO enrollments (
  id,
  user_id,
  course_id,
  enrolled_at,
  progress_percentage,
  completed_at,
  status
) 
SELECT 
  'enroll-001',
  'test-student-001',
  c.id,
  NOW() - INTERVAL '10 days',
  65.5,
  NULL,
  'active'
FROM courses c 
WHERE c.status = 'published' 
LIMIT 1
ON CONFLICT (id) DO UPDATE SET
  progress_percentage = EXCLUDED.progress_percentage,
  status = EXCLUDED.status;

-- Segundo enrollment
INSERT INTO enrollments (
  id,
  user_id,
  course_id,
  enrolled_at,
  progress_percentage,
  completed_at,
  status
) 
SELECT 
  'enroll-002',
  'test-student-001',
  c.id,
  NOW() - INTERVAL '5 days',
  30.0,
  NULL,
  'active'
FROM courses c 
WHERE c.status = 'published' 
AND c.id NOT IN (SELECT course_id FROM enrollments WHERE id = 'enroll-001')
LIMIT 1
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
    THEN (COALESCE(l.duration_minutes, 30) * 60)
    ELSE (COALESCE(l.duration_minutes, 30) * 30)
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

-- Mostrar información del usuario creado
SELECT 
  'Usuario de prueba creado exitosamente:' as mensaje,
  email,
  first_name || ' ' || last_name as nombre_completo,
  role,
  'test123' as contraseña
FROM users 
WHERE id = 'test-student-001';

-- Mostrar enrollments creados
SELECT 
  'Enrollments creados:' as info,
  e.id,
  c.title as curso,
  e.progress_percentage as progreso
FROM enrollments e
JOIN courses c ON e.course_id = c.id
WHERE e.user_id = 'test-student-001';
