-- Script para validar y arreglar el flujo completo de un estudiante de pago.

-- 1. Asegurar que la columna video_url existe en la tabla de lecciones.
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_url VARCHAR(255);

-- 2. Crear un curso de bienvenida si no existe.
INSERT INTO courses (id, title, description, instructor, price, status, thumbnail_url, duration_hours, level)
VALUES (
    'def-welcome-course-01',
    'Curso de Bienvenida a OdontoGeek',
    'Una introducción a nuestra plataforma. Aprende a navegar por tus cursos y sacar el máximo provecho de tu aprendizaje.',
    'Dr. Geek',
    0.00,
    'published',
    '/placeholder.svg?width=400&height=225',
    1,
    'Principiante'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Crear una lección de bienvenida para el curso.
INSERT INTO lessons (id, course_id, title, description, video_url, duration_minutes, order_index, is_free)
VALUES (
    'def-welcome-lesson-01',
    'def-welcome-course-01',
    '¡Bienvenido a Bordo!',
    'En esta lección, te mostraremos cómo funciona la plataforma.',
    'https://storage.googleapis.com/v0-public-assets/odontogeek-welcome.mp4',
    5,
    1,
    true
)
ON CONFLICT (id) DO NOTHING;

-- 4. Crear un estudiante de prueba de pago garantizado.
-- Este usuario nos servirá para probar el flujo completo.
INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_test_user)
VALUES (
    'def-paying-student-01',
    'paying.student@test.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- Contraseña: test123
    'Estudiante',
    'De Pago',
    'student',
    true
)
ON CONFLICT (id) DO UPDATE SET
    password_hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    updated_at = NOW();

-- 5. Inscribir al estudiante de prueba en el curso de bienvenida.
INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
VALUES (
    'def-paying-student-01',
    'def-welcome-course-01',
    NOW(),
    'active'
)
ON CONFLICT (user_id, course_id) DO NOTHING;

-- 6. Inscribir a TODOS los estudiantes existentes sin cursos en el curso de bienvenida.
-- Esto asegura que ningún estudiante se quede sin contenido accesible.
INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
SELECT u.id, 'def-welcome-course-01', NOW(), 'active'
FROM users u
WHERE u.role = 'student' AND NOT EXISTS (
    SELECT 1 FROM enrollments e WHERE e.user_id = u.id
);

-- 7. Registrar la operación en el log de acceso.
INSERT INTO student_access_log (action, success, error_message)
VALUES ('fix_student_journey', true, 'Se creó curso/lección de bienvenida y se inscribió a todos los estudiantes sin cursos.');

-- 8. Reporte final de verificación.
SELECT 
    'VERIFICACIÓN DEL FLUJO DE ESTUDIANTE' as report,
    (SELECT COUNT(*) FROM users WHERE id = 'def-paying-student-01') as test_student_exists,
    (SELECT COUNT(*) FROM courses WHERE id = 'def-welcome-course-01') as welcome_course_exists,
    (SELECT COUNT(*) FROM lessons WHERE id = 'def-welcome-lesson-01') as welcome_lesson_exists,
    (SELECT COUNT(*) FROM enrollments WHERE user_id = 'def-paying-student-01' AND course_id = 'def-welcome-course-01') as test_enrollment_exists;
