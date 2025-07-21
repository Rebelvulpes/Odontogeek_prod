-- =====================================================
-- SCRIPT COMPLETO PARA CORREGIR LA BASE DE DATOS
-- =====================================================

-- 1. Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Crear o actualizar tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('admin', 'instructor', 'student')),
    avatar_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columnas faltantes si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- 3. Crear o actualizar tabla de cursos
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    instructor VARCHAR(255),
    instructor_id UUID REFERENCES users(id),
    duration_hours INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    thumbnail_url TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_free BOOLEAN DEFAULT false,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columnas faltantes a courses
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'difficulty_level') THEN
        ALTER TABLE courses ADD COLUMN difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'archived') THEN
        ALTER TABLE courses ADD COLUMN archived BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'is_free') THEN
        ALTER TABLE courses ADD COLUMN is_free BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor_id') THEN
        ALTER TABLE courses ADD COLUMN instructor_id UUID REFERENCES users(id);
    END IF;
END $$;

-- 4. Crear o actualizar tabla de lecciones
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columnas faltantes a lessons
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'content') THEN
        ALTER TABLE lessons ADD COLUMN content TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'video_url') THEN
        ALTER TABLE lessons ADD COLUMN video_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'duration_minutes') THEN
        ALTER TABLE lessons ADD COLUMN duration_minutes INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'order_index') THEN
        ALTER TABLE lessons ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'is_free') THEN
        ALTER TABLE lessons ADD COLUMN is_free BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'status') THEN
        ALTER TABLE lessons ADD COLUMN status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published'));
    END IF;
END $$;

-- 5. Crear tabla de inscripciones
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress DECIMAL(5,2) DEFAULT 0.00,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    UNIQUE(user_id, course_id)
);

-- Agregar columnas faltantes a enrollments
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'progress') THEN
        ALTER TABLE enrollments ADD COLUMN progress DECIMAL(5,2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'completed_at') THEN
        ALTER TABLE enrollments ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'status') THEN
        ALTER TABLE enrollments ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'));
    END IF;
END $$;

-- 6. Crear tabla de progreso de lecciones
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    watch_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- 7. Crear tabla de tags para cursos
CREATE TABLE IF NOT EXISTS course_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Crear tabla de relación curso-tags
CREATE TABLE IF NOT EXISTS course_tag_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES course_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, tag_id)
);

-- 9. Crear tabla de carousel
CREATE TABLE IF NOT EXISTS carousel_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    link_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Crear tabla de logs de acceso
CREATE TABLE IF NOT EXISTS student_access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id),
    email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    success BOOLEAN NOT NULL,
    error_code VARCHAR(50),
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_archived ON courses(archived);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_access_log_email ON student_access_log(email);
CREATE INDEX IF NOT EXISTS idx_student_access_log_created_at ON student_access_log(created_at);

-- 12. Crear función para auto-inscribir administradores
CREATE OR REPLACE FUNCTION auto_enroll_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Si es un admin, inscribirlo automáticamente en todos los cursos
    IF NEW.role = 'admin' THEN
        INSERT INTO enrollments (user_id, course_id, enrolled_at, status)
        SELECT NEW.id, c.id, NOW(), 'active'
        FROM courses c
        WHERE NOT EXISTS (
            SELECT 1 FROM enrollments e 
            WHERE e.user_id = NEW.id AND e.course_id = c.id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para auto-inscripción de admins
DROP TRIGGER IF EXISTS trigger_auto_enroll_admin ON users;
CREATE TRIGGER trigger_auto_enroll_admin
    AFTER INSERT OR UPDATE OF role ON users
    FOR EACH ROW
    EXECUTE FUNCTION auto_enroll_admin();

-- 13. Crear función para verificar acceso a lecciones
CREATE OR REPLACE FUNCTION check_lesson_access(
    p_user_id UUID,
    p_lesson_id UUID
) RETURNS TABLE (
    has_access BOOLEAN,
    lesson_title TEXT,
    course_title TEXT,
    is_free BOOLEAN,
    user_role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN u.role = 'admin' THEN true
            WHEN l.is_free = true THEN true
            WHEN EXISTS (
                SELECT 1 FROM enrollments e 
                WHERE e.user_id = p_user_id 
                AND e.course_id = l.course_id 
                AND e.status = 'active'
            ) THEN true
            ELSE false
        END as has_access,
        l.title as lesson_title,
        c.title as course_title,
        l.is_free,
        u.role as user_role
    FROM lessons l
    JOIN courses c ON l.course_id = c.id
    CROSS JOIN users u
    WHERE l.id = p_lesson_id AND u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 14. Limpiar lecciones existentes y crear nuevas con contenido
DELETE FROM lessons;

-- 15. Insertar lecciones de ejemplo con contenido completo
INSERT INTO lessons (id, course_id, title, description, content, video_url, duration_minutes, order_index, is_free, status) 
SELECT 
    uuid_generate_v4(),
    c.id,
    'Introducción a ' || c.title,
    'Lección introductoria del curso ' || c.title,
    '<h2>Bienvenido al curso: ' || c.title || '</h2>
    <p>En esta lección introductoria aprenderás los conceptos fundamentales que necesitas para dominar este tema.</p>
    <h3>Objetivos de aprendizaje:</h3>
    <ul>
        <li>Comprender los conceptos básicos</li>
        <li>Identificar las herramientas necesarias</li>
        <li>Establecer una base sólida para el aprendizaje</li>
    </ul>
    <h3>Contenido de la lección:</h3>
    <p>Esta es una lección de ejemplo con contenido HTML completo. Aquí puedes incluir texto, imágenes, videos y cualquier otro contenido educativo.</p>
    <blockquote>
        <p><strong>Nota importante:</strong> Esta es una lección de demostración. El contenido real debe ser proporcionado por el instructor del curso.</p>
    </blockquote>',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    15,
    1,
    true,
    'published'
FROM courses c
WHERE c.status = 'published';

-- Insertar segunda lección para cada curso
INSERT INTO lessons (id, course_id, title, description, content, video_url, duration_minutes, order_index, is_free, status) 
SELECT 
    uuid_generate_v4(),
    c.id,
    'Conceptos Fundamentales - ' || c.title,
    'Segunda lección del curso ' || c.title,
    '<h2>Conceptos Fundamentales</h2>
    <p>En esta segunda lección profundizaremos en los conceptos fundamentales del tema.</p>
    <h3>Temas a cubrir:</h3>
    <ol>
        <li>Definiciones importantes</li>
        <li>Principios básicos</li>
        <li>Aplicaciones prácticas</li>
        <li>Casos de estudio</li>
    </ol>
    <h3>Ejercicios prácticos:</h3>
    <p>Al final de esta lección podrás realizar los siguientes ejercicios:</p>
    <ul>
        <li>Ejercicio 1: Identificación de conceptos</li>
        <li>Ejercicio 2: Aplicación práctica</li>
        <li>Ejercicio 3: Análisis de casos</li>
    </ul>
    <div style="background-color: #f0f9ff; padding: 1rem; border-left: 4px solid #0ea5e9; margin: 1rem 0;">
        <h4>💡 Consejo del instructor:</h4>
        <p>Tómate tu tiempo para entender cada concepto antes de avanzar a la siguiente sección.</p>
    </div>',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    25,
    2,
    false,
    'published'
FROM courses c
WHERE c.status = 'published';

-- Insertar tercera lección para cada curso
INSERT INTO lessons (id, course_id, title, description, content, video_url, duration_minutes, order_index, is_free, status) 
SELECT 
    uuid_generate_v4(),
    c.id,
    'Práctica Avanzada - ' || c.title,
    'Lección avanzada del curso ' || c.title,
    '<h2>Práctica Avanzada</h2>
    <p>Esta lección está diseñada para estudiantes que han completado las lecciones anteriores y están listos para contenido más avanzado.</p>
    <h3>Prerrequisitos:</h3>
    <ul>
        <li>Haber completado la lección de introducción</li>
        <li>Entender los conceptos fundamentales</li>
        <li>Tener experiencia práctica básica</li>
    </ul>
    <h3>Contenido avanzado:</h3>
    <p>En esta sección cubriremos técnicas avanzadas y casos de uso complejos.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
        <thead>
            <tr style="background-color: #f8fafc;">
                <th style="border: 1px solid #e2e8f0; padding: 0.5rem;">Técnica</th>
                <th style="border: 1px solid #e2e8f0; padding: 0.5rem;">Dificultad</th>
                <th style="border: 1px solid #e2e8f0; padding: 0.5rem;">Tiempo estimado</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.5rem;">Técnica A</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.5rem;">Intermedio</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.5rem;">30 min</td>
            </tr>
            <tr>
                <td style="border: 1px solid #e2e8f0; padding: 0.5rem;">Técnica B</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.5rem;">Avanzado</td>
                <td style="border: 1px solid #e2e8f0; padding: 0.5rem;">45 min</td>
            </tr>
        </tbody>
    </table>
    <div style="background-color: #fef3c7; padding: 1rem; border-left: 4px solid #f59e0b; margin: 1rem 0;">
        <h4>⚠️ Advertencia:</h4>
        <p>Este contenido requiere conocimientos previos. Asegúrate de haber completado las lecciones anteriores.</p>
    </div>',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    35,
    3,
    false,
    'published'
FROM courses c
WHERE c.status = 'published';

-- 16. Actualizar el conteo de lecciones en los cursos
UPDATE courses 
SET total_lessons = (
    SELECT COUNT(*) 
    FROM lessons l 
    WHERE l.course_id = courses.id
);

-- 17. Crear algunos tags de ejemplo
INSERT INTO course_tags (name, color) VALUES
('Principiante', '#10B981'),
('Intermedio', '#F59E0B'),
('Avanzado', '#EF4444'),
('Práctico', '#8B5CF6'),
('Teórico', '#06B6D4')
ON CONFLICT (name) DO NOTHING;

-- 18. Verificar que todo esté correcto
DO $$
DECLARE
    user_count INTEGER;
    course_count INTEGER;
    lesson_count INTEGER;
    enrollment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO course_count FROM courses;
    SELECT COUNT(*) INTO lesson_count FROM lessons;
    SELECT COUNT(*) INTO enrollment_count FROM enrollments;
    
    RAISE NOTICE '✅ Base de datos configurada correctamente:';
    RAISE NOTICE '   - Usuarios: %', user_count;
    RAISE NOTICE '   - Cursos: %', course_count;
    RAISE NOTICE '   - Lecciones: %', lesson_count;
    RAISE NOTICE '   - Inscripciones: %', enrollment_count;
END $$;

-- 19. Mensaje final
SELECT 
    '✅ Base de datos completamente configurada y lista para usar' as status,
    COUNT(DISTINCT c.id) as total_courses,
    COUNT(l.id) as total_lessons,
    COUNT(DISTINCT u.id) as total_users
FROM courses c
LEFT JOIN lessons l ON c.id = l.course_id
CROSS JOIN users u;
