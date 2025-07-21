-- =====================================================
-- SCRIPT COMPLETO PARA CORREGIR LA BASE DE DATOS
-- =====================================================

-- Primero, verificamos y creamos las extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA USERS - Verificar y corregir estructura
-- =====================================================

-- Verificar si la tabla users existe y tiene las columnas correctas
DO $$
BEGIN
    -- Agregar columnas faltantes si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'date_of_birth') THEN
        ALTER TABLE users ADD COLUMN date_of_birth DATE;
    END IF;
END $$;

-- =====================================================
-- TABLA COURSES - Verificar y corregir estructura
-- =====================================================

-- Verificar si la tabla courses existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses') THEN
        CREATE TABLE courses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            content TEXT,
            price DECIMAL(10,2) DEFAULT 0,
            instructor VARCHAR(255),
            difficulty_level VARCHAR(50) DEFAULT 'beginner',
            thumbnail_url TEXT,
            status VARCHAR(50) DEFAULT 'draft',
            archived BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Agregar columnas faltantes si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'content') THEN
        ALTER TABLE courses ADD COLUMN content TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor') THEN
        ALTER TABLE courses ADD COLUMN instructor VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'difficulty_level') THEN
        ALTER TABLE courses ADD COLUMN difficulty_level VARCHAR(50) DEFAULT 'beginner';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'archived') THEN
        ALTER TABLE courses ADD COLUMN archived BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- =====================================================
-- TABLA LESSONS - Verificar y corregir estructura
-- =====================================================

-- Verificar si la tabla lessons existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        CREATE TABLE lessons (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            content TEXT,
            video_url TEXT,
            duration_minutes INTEGER DEFAULT 0,
            order_index INTEGER DEFAULT 0,
            is_free BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
    
    -- Agregar columnas faltantes si no existen
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
        ALTER TABLE lessons ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- =====================================================
-- TABLA ENROLLMENTS - Verificar y corregir estructura
-- =====================================================

-- Verificar si la tabla enrollments existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        CREATE TABLE enrollments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            status VARCHAR(50) DEFAULT 'active',
            progress INTEGER DEFAULT 0,
            enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, course_id)
        );
    END IF;
    
    -- Agregar columnas faltantes si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'progress') THEN
        ALTER TABLE enrollments ADD COLUMN progress INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'enrolled_at') THEN
        ALTER TABLE enrollments ADD COLUMN enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'enrollments' AND column_name = 'completed_at') THEN
        ALTER TABLE enrollments ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- =====================================================
-- TABLA STUDENT_ACCESS_LOG - Para monitoreo
-- =====================================================

-- Crear tabla de logs si no existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_access_log') THEN
        CREATE TABLE student_access_log (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            student_id UUID,
            email VARCHAR(255),
            action VARCHAR(100),
            success BOOLEAN,
            error_code VARCHAR(50),
            error_message TEXT,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Crear índices para mejor rendimiento
        CREATE INDEX idx_student_access_log_student_id ON student_access_log(student_id);
        CREATE INDEX idx_student_access_log_email ON student_access_log(email);
        CREATE INDEX idx_student_access_log_created_at ON student_access_log(created_at);
    END IF;
END $$;

-- =====================================================
-- INSERTAR DATOS DE EJEMPLO
-- =====================================================

-- Insertar cursos de ejemplo si no existen
INSERT INTO courses (id, title, description, content, price, instructor, difficulty_level, thumbnail_url, status)
SELECT 
    uuid_generate_v4(),
    'Fundamentos de Odontología Digital',
    'Aprende los conceptos básicos de la odontología digital moderna',
    '<h2>Bienvenido al Curso de Fundamentos de Odontología Digital</h2><p>En este curso aprenderás los conceptos fundamentales de la odontología digital moderna.</p>',
    299.99,
    'Dr. María González',
    'beginner',
    '/placeholder.svg?height=300&width=400',
    'published'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Fundamentos de Odontología Digital');

INSERT INTO courses (id, title, description, content, price, instructor, difficulty_level, thumbnail_url, status)
SELECT 
    uuid_generate_v4(),
    'Radiología Dental Avanzada',
    'Técnicas avanzadas de interpretación radiológica en odontología',
    '<h2>Radiología Dental Avanzada</h2><p>Domina las técnicas más avanzadas de radiología dental.</p>',
    499.99,
    'Dr. Carlos Rodríguez',
    'advanced',
    '/placeholder.svg?height=300&width=400',
    'published'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Radiología Dental Avanzada');

-- Insertar lecciones de ejemplo con contenido completo
DO $$
DECLARE
    course_id_1 UUID;
    course_id_2 UUID;
BEGIN
    -- Obtener IDs de los cursos
    SELECT id INTO course_id_1 FROM courses WHERE title = 'Fundamentos de Odontología Digital' LIMIT 1;
    SELECT id INTO course_id_2 FROM courses WHERE title = 'Radiología Dental Avanzada' LIMIT 1;
    
    -- Lecciones para el primer curso
    IF course_id_1 IS NOT NULL THEN
        -- Lección gratuita
        INSERT INTO lessons (id, course_id, title, description, content, video_url, duration_minutes, order_index, is_free)
        SELECT 
            uuid_generate_v4(),
            course_id_1,
            'Introducción a la Odontología Digital',
            'Una introducción completa a los conceptos básicos',
            '<div class="lesson-content">
                <h2>Introducción a la Odontología Digital</h2>
                <p>La odontología digital ha revolucionado la práctica dental moderna. En esta lección aprenderás:</p>
                <ul>
                    <li>Qué es la odontología digital</li>
                    <li>Principales tecnologías utilizadas</li>
                    <li>Beneficios para pacientes y profesionales</li>
                    <li>Tendencias futuras</li>
                </ul>
                <h3>Conceptos Clave</h3>
                <p>La digitalización en odontología incluye:</p>
                <ol>
                    <li><strong>Radiografía Digital:</strong> Imágenes de alta calidad con menor radiación</li>
                    <li><strong>Escáneres Intraorales:</strong> Impresiones digitales precisas</li>
                    <li><strong>CAD/CAM:</strong> Diseño y fabricación asistida por computadora</li>
                    <li><strong>Planificación Digital:</strong> Software especializado para tratamientos</li>
                </ol>
                <div class="video-placeholder" style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
                    <p>🎥 Video: Introducción a la Odontología Digital (15 min)</p>
                </div>
                <h3>Ejercicio Práctico</h3>
                <p>Identifica 3 tecnologías digitales que hayas observado en tu consulta dental.</p>
            </div>',
            'https://example.com/video1.mp4',
            15,
            1,
            true
        WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = course_id_1 AND title = 'Introducción a la Odontología Digital');
        
        -- Lección premium
        INSERT INTO lessons (id, course_id, title, description, content, video_url, duration_minutes, order_index, is_free)
        SELECT 
            uuid_generate_v4(),
            course_id_1,
            'Escáneres Intraorales: Técnicas Avanzadas',
            'Aprende a utilizar escáneres intraorales de manera profesional',
            '<div class="lesson-content">
                <h2>Escáneres Intraorales: Técnicas Avanzadas</h2>
                <p>Los escáneres intraorales son una herramienta fundamental en la odontología digital moderna.</p>
                <h3>Tipos de Escáneres</h3>
                <ul>
                    <li><strong>Escáneres de Luz Estructurada:</strong> Alta precisión para restauraciones</li>
                    <li><strong>Escáneres de Triangulación Láser:</strong> Ideales para ortodoncia</li>
                    <li><strong>Escáneres de Luz Blanca:</strong> Versatilidad en diferentes tratamientos</li>
                </ul>
                <div class="video-placeholder" style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
                    <p>🎥 Video: Técnicas de Escaneo Intraoral (25 min)</p>
                </div>
                <h3>Protocolo de Escaneo</h3>
                <ol>
                    <li>Preparación del paciente</li>
                    <li>Calibración del equipo</li>
                    <li>Secuencia de escaneo</li>
                    <li>Verificación de calidad</li>
                    <li>Procesamiento de datos</li>
                </ol>
                <div class="important-note" style="background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <strong>Nota Importante:</strong> La precisión del escaneo depende de la técnica utilizada y las condiciones del ambiente.
                </div>
            </div>',
            'https://example.com/video2.mp4',
            25,
            2,
            false
        WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = course_id_1 AND title = 'Escáneres Intraorales: Técnicas Avanzadas');
    END IF;
    
    -- Lecciones para el segundo curso
    IF course_id_2 IS NOT NULL THEN
        INSERT INTO lessons (id, course_id, title, description, content, video_url, duration_minutes, order_index, is_free)
        SELECT 
            uuid_generate_v4(),
            course_id_2,
            'Fundamentos de Radiología Dental',
            'Conceptos básicos de radiología aplicada a la odontología',
            '<div class="lesson-content">
                <h2>Fundamentos de Radiología Dental</h2>
                <p>La radiología dental es esencial para el diagnóstico y planificación de tratamientos.</p>
                <h3>Tipos de Radiografías Dentales</h3>
                <ul>
                    <li><strong>Periapicales:</strong> Visualización completa del diente</li>
                    <li><strong>Bitewing:</strong> Detección de caries interproximales</li>
                    <li><strong>Panorámicas:</strong> Vista general de toda la dentición</li>
                    <li><strong>CBCT:</strong> Imágenes tridimensionales de alta resolución</li>
                </ul>
                <div class="video-placeholder" style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0;">
                    <p>🎥 Video: Tipos de Radiografías Dentales (20 min)</p>
                </div>
                <h3>Principios de Radioprotección</h3>
                <p>Es fundamental seguir los principios ALARA (As Low As Reasonably Achievable):</p>
                <ol>
                    <li>Justificación del examen</li>
                    <li>Optimización de la técnica</li>
                    <li>Limitación de la dosis</li>
                </ol>
            </div>',
            'https://example.com/video3.mp4',
            20,
            1,
            true
        WHERE NOT EXISTS (SELECT 1 FROM lessons WHERE course_id = course_id_2 AND title = 'Fundamentos de Radiología Dental');
    END IF;
END $$;

-- =====================================================
-- CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================

-- Índices para la tabla courses
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at);

-- Índices para la tabla lessons
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_is_free ON lessons(is_free);

-- Índices para la tabla enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- =====================================================
-- FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para verificar acceso a lecciones
CREATE OR REPLACE FUNCTION check_lesson_access(
    p_user_id UUID,
    p_lesson_id UUID,
    p_user_role VARCHAR DEFAULT 'student'
) RETURNS BOOLEAN AS $$
DECLARE
    lesson_is_free BOOLEAN;
    user_enrolled BOOLEAN;
BEGIN
    -- Los administradores tienen acceso completo
    IF p_user_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar si la lección es gratuita
    SELECT is_free INTO lesson_is_free
    FROM lessons
    WHERE id = p_lesson_id;
    
    -- Si la lección es gratuita, permitir acceso
    IF lesson_is_free THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar si el usuario está inscrito en el curso
    SELECT EXISTS(
        SELECT 1
        FROM enrollments e
        JOIN lessons l ON l.course_id = e.course_id
        WHERE e.user_id = p_user_id
        AND l.id = p_lesson_id
        AND e.status = 'active'
    ) INTO user_enrolled;
    
    RETURN user_enrolled;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos corregida exitosamente';
    RAISE NOTICE '📊 Tablas verificadas: users, courses, lessons, enrollments, student_access_log';
    RAISE NOTICE '🔧 Columnas agregadas: content, video_url, duration_minutes, order_index, is_free';
    RAISE NOTICE '📚 Cursos de ejemplo insertados con lecciones completas';
    RAISE NOTICE '🚀 Sistema listo para usar';
END $$;
