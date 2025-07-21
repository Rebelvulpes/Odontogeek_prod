-- Verificar y corregir la estructura de la base de datos para lecciones
-- Este script asegura que la estructura coincida con el código

-- 1. Verificar que la tabla lessons existe y tiene la estructura correcta
DO $$
BEGIN
    -- Verificar si la tabla lessons existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'lessons') THEN
        RAISE NOTICE '❌ Table lessons does not exist. Creating...';
        
        CREATE TABLE lessons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            content TEXT,
            video_url TEXT,
            duration_minutes INTEGER DEFAULT 0,
            order_index INTEGER NOT NULL DEFAULT 1,
            is_free BOOLEAN DEFAULT false,
            status VARCHAR(50) DEFAULT 'draft',
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ Table lessons created successfully';
    ELSE
        RAISE NOTICE '✅ Table lessons exists';
    END IF;
    
    -- Verificar columnas necesarias
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'status') THEN
        ALTER TABLE lessons ADD COLUMN status VARCHAR(50) DEFAULT 'draft';
        RAISE NOTICE '✅ Added status column to lessons';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'is_free') THEN
        ALTER TABLE lessons ADD COLUMN is_free BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Added is_free column to lessons';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'order_index') THEN
        ALTER TABLE lessons ADD COLUMN order_index INTEGER NOT NULL DEFAULT 1;
        RAISE NOTICE '✅ Added order_index column to lessons';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'lessons' AND column_name = 'duration_minutes') THEN
        ALTER TABLE lessons ADD COLUMN duration_minutes INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Added duration_minutes column to lessons';
    END IF;
END $$;

-- 2. Verificar que la tabla courses existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
        RAISE NOTICE '❌ Table courses does not exist. Creating basic structure...';
        
        CREATE TABLE courses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'draft',
            is_free BOOLEAN DEFAULT false,
            price DECIMAL(10,2) DEFAULT 0.00,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ Table courses created successfully';
    ELSE
        RAISE NOTICE '✅ Table courses exists';
    END IF;
END $$;

-- 3. Verificar que la tabla enrollments existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'enrollments') THEN
        RAISE NOTICE '❌ Table enrollments does not exist. Creating...';
        
        CREATE TABLE enrollments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            status VARCHAR(50) DEFAULT 'active',
            enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE '✅ Table enrollments created successfully';
    ELSE
        RAISE NOTICE '✅ Table enrollments exists';
    END IF;
END $$;

-- 4. Crear algunas lecciones de prueba si no existen
DO $$
DECLARE
    course_record RECORD;
    lesson_count INTEGER;
BEGIN
    -- Verificar si hay cursos
    SELECT COUNT(*) INTO lesson_count FROM courses WHERE status = 'published';
    
    IF lesson_count > 0 THEN
        RAISE NOTICE '📚 Found % published courses', lesson_count;
        
        -- Para cada curso publicado, asegurar que tenga al menos una lección
        FOR course_record IN SELECT id, title FROM courses WHERE status = 'published' LOOP
            SELECT COUNT(*) INTO lesson_count FROM lessons WHERE course_id = course_record.id;
            
            IF lesson_count = 0 THEN
                RAISE NOTICE '📝 Creating test lesson for course: %', course_record.title;
                
                INSERT INTO lessons (
                    title,
                    description,
                    content,
                    video_url,
                    duration_minutes,
                    order_index,
                    is_free,
                    status,
                    course_id
                ) VALUES (
                    'Lección de Introducción - ' || course_record.title,
                    'Esta es una lección de introducción para el curso ' || course_record.title,
                    '<h2>Bienvenido al curso</h2><p>En esta lección aprenderás los conceptos básicos.</p><ul><li>Conceptos fundamentales</li><li>Herramientas necesarias</li><li>Objetivos del curso</li></ul>',
                    'https://www.youtube.com/embed/dQw4w9WgXcQ',
                    15,
                    1,
                    true,
                    'published',
                    course_record.id
                );
                
                RAISE NOTICE '✅ Created test lesson for course: %', course_record.title;
            ELSE
                RAISE NOTICE '✅ Course % already has % lessons', course_record.title, lesson_count;
            END IF;
        END LOOP;
    ELSE
        RAISE NOTICE '⚠️ No published courses found. Creating a test course with lesson...';
        
        -- Crear un curso de prueba
        INSERT INTO courses (
            title,
            description,
            status,
            is_free,
            price
        ) VALUES (
            'Curso de Prueba - Odontología Básica',
            'Un curso de prueba para verificar el sistema de lecciones',
            'published',
            true,
            0.00
        ) RETURNING id INTO course_record.id;
        
        -- Crear una lección para el curso de prueba
        INSERT INTO lessons (
            title,
            description,
            content,
            video_url,
            duration_minutes,
            order_index,
            is_free,
            status,
            course_id
        ) VALUES (
            'Introducción a la Odontología',
            'Lección introductoria sobre los fundamentos de la odontología',
            '<h2>Fundamentos de la Odontología</h2><p>En esta lección aprenderás:</p><ul><li>Historia de la odontología</li><li>Anatomía dental básica</li><li>Herramientas fundamentales</li><li>Principios de higiene</li></ul><p>Esta es una lección gratuita para que puedas probar el sistema.</p>',
            'https://www.youtube.com/embed/dQw4w9WgXcQ',
            20,
            1,
            true,
            'published',
            course_record.id
        );
        
        RAISE NOTICE '✅ Created test course and lesson successfully';
    END IF;
END $$;

-- 5. Verificar la estructura final
SELECT 
    'lessons' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'published') as published_lessons,
    COUNT(*) FILTER (WHERE is_free = true) as free_lessons
FROM lessons
UNION ALL
SELECT 
    'courses' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'published') as published_courses,
    COUNT(*) FILTER (WHERE is_free = true) as free_courses
FROM courses
UNION ALL
SELECT 
    'enrollments' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'active') as active_enrollments,
    0 as unused_column
FROM enrollments;

-- 6. Mostrar algunas lecciones de ejemplo
SELECT 
    l.id,
    l.title,
    l.status,
    l.is_free,
    l.order_index,
    c.title as course_title,
    c.status as course_status
FROM lessons l
JOIN courses c ON l.course_id = c.id
WHERE l.status = 'published'
ORDER BY c.title, l.order_index
LIMIT 10;

RAISE NOTICE '✅ Database structure verification completed successfully';
