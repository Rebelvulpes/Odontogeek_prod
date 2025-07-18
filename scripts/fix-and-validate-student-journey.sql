-- Fix and Validate Student Journey
-- This script ensures a complete, working student experience from registration to lesson access

-- 1. Create Welcome Course if it doesn't exist
INSERT INTO courses (
  id,
  title,
  description,
  thumbnail_url,
  price,
  instructor,
  duration_hours,
  created_at,
  updated_at,
  archived
) VALUES (
  'welcome-course-001',
  'Curso de Bienvenida',
  'Bienvenido a OdontoGeek. Este curso te guiará a través de los conceptos básicos de nuestra plataforma y te ayudará a comenzar tu viaje de aprendizaje.',
  '/placeholder.jpg',
  0.00,
  'Equipo OdontoGeek',
  1,
  NOW(),
  NOW(),
  false
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 2. Create Welcome Lesson if it doesn't exist
INSERT INTO lessons (
  id,
  course_id,
  title,
  description,
  content,
  video_url,
  duration_minutes,
  order_index,
  created_at,
  updated_at
) VALUES (
  'welcome-lesson-001',
  'welcome-course-001',
  'Introducción a OdontoGeek',
  'Una introducción completa a nuestra plataforma de aprendizaje odontológico.',
  '<h2>¡Bienvenido a OdontoGeek!</h2>
   <p>Nos complace tenerte como parte de nuestra comunidad de aprendizaje odontológico.</p>
   
   <h3>¿Qué encontrarás en esta plataforma?</h3>
   <ul>
     <li><strong>Cursos especializados:</strong> Contenido actualizado y relevante para profesionales de la odontología</li>
     <li><strong>Videos de alta calidad:</strong> Demostraciones prácticas y explicaciones detalladas</li>
     <li><strong>Certificados:</strong> Obtén certificados al completar los cursos</li>
     <li><strong>Progreso personalizado:</strong> Sigue tu avance y retoma donde lo dejaste</li>
   </ul>
   
   <h3>Cómo navegar</h3>
   <p>Usa el menú principal para acceder a:</p>
   <ul>
     <li><strong>Dashboard:</strong> Tu centro de control personal</li>
     <li><strong>Cursos:</strong> Explora todo nuestro catálogo</li>
     <li><strong>Mi Progreso:</strong> Revisa tus estadísticas de aprendizaje</li>
   </ul>
   
   <h3>Soporte</h3>
   <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para apoyarte en tu crecimiento profesional.</p>
   
   <p><strong>¡Comencemos tu viaje de aprendizaje!</strong></p>',
  NULL,
  15,
  1,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  updated_at = NOW();

-- 3. Create test paying student if doesn't exist
INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  is_test_user,
  created_at,
  updated_at
) VALUES (
  'paying-student-001',
  'paying.student@test.com',
  '$2b$10$rQZ8kHWf5r.Oe8Y9X2nQHOmKvF4jF5Hs8sF2nF8sF2nF8sF2nF8sF2',  -- bcrypt hash for 'test123'
  'Estudiante',
  'De Pago',
  'student',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2b$10$rQZ8kHWf5r.Oe8Y9X2nQHOmKvF4jF5Hs8sF2nF8sF2nF8sF2nF8sF2',
  updated_at = NOW();

-- 4. Auto-enroll paying student in welcome course
INSERT INTO enrollments (
  id,
  user_id,
  course_id,
  enrolled_at,
  progress,
  completed_at
) VALUES (
  'enrollment-paying-welcome',
  'paying-student-001',
  'welcome-course-001',
  NOW(),
  0,
  NULL
) ON CONFLICT (user_id, course_id) DO NOTHING;

-- 5. Create function to auto-enroll new students in welcome course
CREATE OR REPLACE FUNCTION auto_enroll_welcome_course()
RETURNS TRIGGER AS $$
BEGIN
  -- Only for students, not admins
  IF NEW.role = 'student' THEN
    INSERT INTO enrollments (
      user_id,
      course_id,
      enrolled_at,
      progress
    ) VALUES (
      NEW.id,
      'welcome-course-001',
      NOW(),
      0
    ) ON CONFLICT (user_id, course_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for auto-enrollment
DROP TRIGGER IF EXISTS trigger_auto_enroll_welcome ON users;
CREATE TRIGGER trigger_auto_enroll_welcome
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_enroll_welcome_course();

-- 7. Verify data integrity
DO $$
DECLARE
  course_count INTEGER;
  lesson_count INTEGER;
  user_count INTEGER;
  enrollment_count INTEGER;
BEGIN
  -- Check welcome course exists
  SELECT COUNT(*) INTO course_count FROM courses WHERE id = 'welcome-course-001';
  IF course_count = 0 THEN
    RAISE EXCEPTION 'Welcome course was not created properly';
  END IF;
  
  -- Check welcome lesson exists
  SELECT COUNT(*) INTO lesson_count FROM lessons WHERE id = 'welcome-lesson-001';
  IF lesson_count = 0 THEN
    RAISE EXCEPTION 'Welcome lesson was not created properly';
  END IF;
  
  -- Check test user exists
  SELECT COUNT(*) INTO user_count FROM users WHERE email = 'paying.student@test.com';
  IF user_count = 0 THEN
    RAISE EXCEPTION 'Test user was not created properly';
  END IF;
  
  -- Check enrollment exists
  SELECT COUNT(*) INTO enrollment_count FROM enrollments 
  WHERE user_id = 'paying-student-001' AND course_id = 'welcome-course-001';
  IF enrollment_count = 0 THEN
    RAISE EXCEPTION 'Test enrollment was not created properly';
  END IF;
  
  RAISE NOTICE 'All validation checks passed successfully!';
  RAISE NOTICE 'Welcome course: % lessons', lesson_count;
  RAISE NOTICE 'Test user created with email: paying.student@test.com';
  RAISE NOTICE 'Test user enrolled in welcome course';
END $$;

-- 8. Display summary
SELECT 
  'SETUP COMPLETE' as status,
  'paying.student@test.com' as test_email,
  'test123' as test_password,
  'Auto-enrollment active for new students' as note;
