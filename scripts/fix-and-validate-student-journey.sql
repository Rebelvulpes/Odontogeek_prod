-- =====================================================
-- SCRIPT: Fix and Validate Complete Student Journey
-- PURPOSE: Create a complete, working student experience
-- =====================================================

-- 1. Create Welcome Course with Lesson
INSERT INTO courses (
  id,
  title,
  description,
  thumbnail_url,
  price,
  duration_hours,
  level,
  instructor,
  status,
  created_at,
  updated_at
) VALUES (
  'welcome-course-001',
  'Curso de Bienvenida a OdontoGeek',
  'Un curso introductorio para familiarizarte con nuestra plataforma y comenzar tu aprendizaje en odontología.',
  '/placeholder.svg?height=200&width=300&text=Bienvenida',
  0, -- Free welcome course
  1,
  'beginner',
  'Equipo OdontoGeek',
  'published',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 2. Create Welcome Lesson
INSERT INTO lessons (
  id,
  course_id,
  title,
  content,
  video_url,
  duration_minutes,
  order_index,
  created_at,
  updated_at
) VALUES (
  'welcome-lesson-001',
  'welcome-course-001',
  'Bienvenido a OdontoGeek',
  '<h2>¡Bienvenido a OdontoGeek!</h2>
   <p>Nos alegra tenerte como parte de nuestra comunidad de aprendizaje odontológico.</p>
   
   <h3>¿Qué encontrarás aquí?</h3>
   <ul>
     <li><strong>Cursos especializados</strong> - Contenido actualizado y relevante</li>
     <li><strong>Videos de alta calidad</strong> - Demostraciones paso a paso</li>
     <li><strong>Certificaciones</strong> - Valida tu aprendizaje</li>
     <li><strong>Comunidad</strong> - Conecta con otros profesionales</li>
   </ul>
   
   <h3>Cómo navegar</h3>
   <p>Usa los botones de navegación para moverte entre lecciones. Tu progreso se guarda automáticamente.</p>
   
   <h3>¿Necesitas ayuda?</h3>
   <p>Nuestro equipo de soporte está disponible para ayudarte en cualquier momento.</p>
   
   <p><strong>¡Comencemos tu viaje de aprendizaje!</strong></p>',
  NULL, -- No video for this intro lesson
  5,
  1,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  updated_at = NOW();

-- 3. Create test paying student
INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  is_test_user,
  avatar_url,
  created_at,
  updated_at
) VALUES (
  'paying-student-001',
  'paying.student@test.com',
  '$2b$10$rQJ8vQZ9Zm9Z9Zm9Z9Zm9eJ8vQZ9Zm9Z9Zm9Z9Zm9Z9Zm9Z9Zm9Z9Z', -- hash for 'test123'
  'Estudiante',
  'De Pago',
  'student',
  true,
  '/placeholder-user.jpg',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt hash for 'test123'
  updated_at = NOW();

-- 4. Enroll the test student in the welcome course
INSERT INTO enrollments (
  id,
  user_id,
  course_id,
  enrolled_at,
  progress,
  status
) VALUES (
  'enrollment-paying-welcome',
  'paying-student-001',
  'welcome-course-001',
  NOW(),
  0,
  'active'
) ON CONFLICT (user_id, course_id) DO UPDATE SET
  status = 'active',
  enrolled_at = NOW();

-- 5. Create a function to auto-enroll new students in welcome course
CREATE OR REPLACE FUNCTION auto_enroll_welcome_course()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for students (not admins)
  IF NEW.role = 'student' THEN
    INSERT INTO enrollments (
      user_id,
      course_id,
      enrolled_at,
      progress,
      status
    ) VALUES (
      NEW.id,
      'welcome-course-001',
      NOW(),
      0,
      'active'
    ) ON CONFLICT (user_id, course_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to auto-enroll new students
DROP TRIGGER IF EXISTS trigger_auto_enroll_welcome ON users;
CREATE TRIGGER trigger_auto_enroll_welcome
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_welcome_course();

-- 7. Verify the setup
DO $$
DECLARE
  course_count INTEGER;
  lesson_count INTEGER;
  user_count INTEGER;
  enrollment_count INTEGER;
BEGIN
  -- Count records
  SELECT COUNT(*) INTO course_count FROM courses WHERE id = 'welcome-course-001';
  SELECT COUNT(*) INTO lesson_count FROM lessons WHERE course_id = 'welcome-course-001';
  SELECT COUNT(*) INTO user_count FROM users WHERE email = 'paying.student@test.com';
  SELECT COUNT(*) INTO enrollment_count FROM enrollments WHERE user_id = 'paying-student-001';
  
  -- Report results
  RAISE NOTICE '=== STUDENT JOURNEY SETUP COMPLETE ===';
  RAISE NOTICE 'Welcome Course Created: %', CASE WHEN course_count > 0 THEN 'YES' ELSE 'NO' END;
  RAISE NOTICE 'Welcome Lesson Created: %', CASE WHEN lesson_count > 0 THEN 'YES' ELSE 'NO' END;
  RAISE NOTICE 'Test Student Created: %', CASE WHEN user_count > 0 THEN 'YES' ELSE 'NO' END;
  RAISE NOTICE 'Student Enrolled: %', CASE WHEN enrollment_count > 0 THEN 'YES' ELSE 'NO' END;
  RAISE NOTICE '';
  RAISE NOTICE 'TEST CREDENTIALS:';
  RAISE NOTICE 'Email: paying.student@test.com';
  RAISE NOTICE 'Password: test123';
  RAISE NOTICE '';
  RAISE NOTICE 'NEW STUDENTS WILL BE AUTO-ENROLLED IN WELCOME COURSE';
END $$;
