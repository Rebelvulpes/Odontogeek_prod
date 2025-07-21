-- Script completo para corregir TODA la estructura de la base de datos
-- Este script verifica y corrige todas las tablas y columnas necesarias

DO $$
DECLARE
    column_exists BOOLEAN;
    table_exists BOOLEAN;
    course_count INTEGER;
    lesson_count INTEGER;
BEGIN
    RAISE NOTICE '🔧 === CORRECCIÓN COMPLETA DE BASE DE DATOS ===';
    
    -- 1. VERIFICAR Y CORREGIR TABLA COURSES
    RAISE NOTICE '📊 Verificando tabla courses...';
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'courses'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE '❌ Tabla courses no existe. Creándola...';
        CREATE TABLE courses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            price DECIMAL(10,2) DEFAULT 0,
            instructor TEXT DEFAULT 'Dr. Instructor',
            status TEXT DEFAULT 'published',
            thumbnail_url TEXT,
            difficulty_level TEXT DEFAULT 'beginner',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '✅ Tabla courses creada';
    ELSE
        RAISE NOTICE '✅ Tabla courses existe';
    END IF;
    
    -- Verificar y agregar columnas faltantes en courses
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'instructor'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE courses ADD COLUMN instructor TEXT DEFAULT 'Dr. Instructor';
        RAISE NOTICE '✅ Columna instructor agregada a courses';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'status'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE courses ADD COLUMN status TEXT DEFAULT 'published';
        RAISE NOTICE '✅ Columna status agregada a courses';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'thumbnail_url'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE courses ADD COLUMN thumbnail_url TEXT;
        RAISE NOTICE '✅ Columna thumbnail_url agregada a courses';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'difficulty_level'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE courses ADD COLUMN difficulty_level TEXT DEFAULT 'beginner';
        RAISE NOTICE '✅ Columna difficulty_level agregada a courses';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'created_at'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE courses ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Columna created_at agregada a courses';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'updated_at'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE courses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Columna updated_at agregada a courses';
    END IF;
    
    -- 2. VERIFICAR Y CORREGIR TABLA LESSONS
    RAISE NOTICE '📚 Verificando tabla lessons...';
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'lessons'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE '❌ Tabla lessons no existe. Creándola...';
        CREATE TABLE lessons (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            content TEXT,
            description TEXT,
            duration_minutes INTEGER DEFAULT 30,
            video_url TEXT,
            order_index INTEGER DEFAULT 1,
            is_free BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '✅ Tabla lessons creada';
    ELSE
        RAISE NOTICE '✅ Tabla lessons existe';
    END IF;
    
    -- Verificar y agregar TODAS las columnas necesarias en lessons
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'content'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN content TEXT;
        RAISE NOTICE '✅ Columna content agregada a lessons';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'description'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN description TEXT;
        RAISE NOTICE '✅ Columna description agregada a lessons';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'duration_minutes'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN duration_minutes INTEGER DEFAULT 30;
        RAISE NOTICE '✅ Columna duration_minutes agregada a lessons';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'video_url'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN video_url TEXT;
        RAISE NOTICE '✅ Columna video_url agregada a lessons';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'order_index'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN order_index INTEGER DEFAULT 1;
        RAISE NOTICE '✅ Columna order_index agregada a lessons';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'is_free'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN is_free BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Columna is_free agregada a lessons';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'created_at'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Columna created_at agregada a lessons';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'updated_at'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Columna updated_at agregada a lessons';
    END IF;
    
    -- 3. VERIFICAR Y CORREGIR TABLA ENROLLMENTS
    RAISE NOTICE '📝 Verificando tabla enrollments...';
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'enrollments'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE '❌ Tabla enrollments no existe. Creándola...';
        CREATE TABLE enrollments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'active',
            progress INTEGER DEFAULT 0,
            enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE '✅ Tabla enrollments creada';
    ELSE
        RAISE NOTICE '✅ Tabla enrollments existe';
    END IF;
    
    -- Verificar columnas en enrollments
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'enrollments' AND column_name = 'status'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE enrollments ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE '✅ Columna status agregada a enrollments';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'enrollments' AND column_name = 'progress'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE enrollments ADD COLUMN progress INTEGER DEFAULT 0;
        RAISE NOTICE '✅ Columna progress agregada a enrollments';
    END IF;
    
    -- 4. VERIFICAR Y CORREGIR TABLA USERS
    RAISE NOTICE '👤 Verificando tabla users...';
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'student';
        RAISE NOTICE '✅ Columna role agregada a users';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'first_name'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE users ADD COLUMN first_name TEXT;
        RAISE NOTICE '✅ Columna first_name agregada a users';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_name'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE users ADD COLUMN last_name TEXT;
        RAISE NOTICE '✅ Columna last_name agregada a users';
    END IF;
    
    -- 5. CREAR ÍNDICES PARA PERFORMANCE
    CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
    CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(order_index);
    CREATE INDEX IF NOT EXISTS idx_lessons_is_free ON lessons(is_free);
    CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);
    CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
    CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
    
    RAISE NOTICE '✅ Índices de performance creados';
    
    -- 6. POBLAR CON DATOS DE EJEMPLO SI ESTÁN VACÍAS
    SELECT COUNT(*) FROM courses INTO course_count;
    SELECT COUNT(*) FROM lessons INTO lesson_count;
    
    RAISE NOTICE '📊 Estado actual: % cursos, % lecciones', course_count, lesson_count;
    
    -- Si no hay cursos, crear algunos de ejemplo
    IF course_count = 0 THEN
        RAISE NOTICE '🎯 Creando cursos de ejemplo...';
        
        INSERT INTO courses (title, description, price, instructor, status, difficulty_level) VALUES
        ('Endodoncia Avanzada', 'Curso completo de endodoncia con técnicas modernas y casos clínicos reales', 299.99, 'Dr. María González', 'published', 'advanced'),
        ('Ortodoncia Básica', 'Fundamentos de ortodoncia para principiantes', 199.99, 'Dr. Carlos Ruiz', 'published', 'beginner'),
        ('Implantología Dental', 'Técnicas avanzadas de implantología y cirugía oral', 399.99, 'Dr. Ana Martínez', 'published', 'advanced'),
        ('Periodoncia Clínica', 'Diagnóstico y tratamiento de enfermedades periodontales', 249.99, 'Dr. Luis Fernández', 'published', 'intermediate'),
        ('Odontopediatría', 'Atención dental especializada para niños', 179.99, 'Dra. Carmen López', 'published', 'beginner');
        
        SELECT COUNT(*) FROM courses INTO course_count;
        RAISE NOTICE '✅ % cursos de ejemplo creados', course_count;
    END IF;
    
    -- Si no hay lecciones, crear algunas para cada curso
    IF lesson_count = 0 AND course_count > 0 THEN
        RAISE NOTICE '🎯 Creando lecciones de ejemplo...';
        
        -- Crear 3 lecciones para cada curso
        INSERT INTO lessons (course_id, title, content, description, duration_minutes, order_index, is_free)
        SELECT 
            c.id,
            'Introducción a ' || c.title,
            '<div class="lesson-content">
                <h2>🎯 Bienvenido al Curso: ' || c.title || '</h2>
                <p>En esta lección introductoria aprenderás los conceptos fundamentales y la metodología que seguiremos durante todo el curso.</p>
                
                <h3>📚 Objetivos de Aprendizaje</h3>
                <ul>
                    <li>Comprender los principios básicos de ' || c.title || '</li>
                    <li>Identificar las herramientas y materiales necesarios</li>
                    <li>Reconocer las mejores prácticas clínicas</li>
                    <li>Establecer protocolos de seguridad</li>
                </ul>
                
                <h3>🔬 Contenido Teórico</h3>
                <p>Esta lección incluye:</p>
                <ol>
                    <li><strong>Fundamentos científicos:</strong> Base teórica y evidencia científica</li>
                    <li><strong>Anatomía relevante:</strong> Estructuras anatómicas importantes</li>
                    <li><strong>Materiales y equipos:</strong> Instrumentos y materiales necesarios</li>
                    <li><strong>Protocolos de seguridad:</strong> Medidas de bioseguridad</li>
                </ol>
                
                <div class="info-box" style="background: #e0f2fe; padding: 1rem; border-left: 4px solid #0891b2; margin: 1rem 0;">
                    <h4>💡 Información Importante</h4>
                    <p>Esta es una <strong>lección gratuita</strong> disponible para todos los usuarios registrados. Te permitirá conocer el contenido y metodología del curso antes de decidir inscribirte.</p>
                </div>
                
                <h3>📖 Material de Estudio</h3>
                <p>Para esta lección tendrás acceso a:</p>
                <ul>
                    <li>Presentación en PDF descargable</li>
                    <li>Videos explicativos complementarios</li>
                    <li>Bibliografía recomendada</li>
                    <li>Casos clínicos introductorios</li>
                </ul>
                
                <h3>✅ Evaluación</h3>
                <p>Al finalizar esta lección podrás:</p>
                <ul>
                    <li>Explicar los conceptos fundamentales</li>
                    <li>Identificar los materiales básicos</li>
                    <li>Describir los protocolos de seguridad</li>
                    <li>Reconocer las indicaciones principales</li>
                </ul>
            </div>',
            'Lección introductoria gratuita que presenta los conceptos fundamentales y la metodología del curso.',
            20,
            1,
            true -- Primera lección siempre gratuita
        FROM courses c;
        
        -- Segunda lección (premium)
        INSERT INTO lessons (course_id, title, content, description, duration_minutes, order_index, is_free)
        SELECT 
            c.id,
            'Técnicas Fundamentales de ' || c.title,
            '<div class="lesson-content">
                <h2>🚀 Técnicas Fundamentales</h2>
                <p>En esta lección profundizaremos en las técnicas fundamentales de <strong>' || c.title || '</strong> con casos prácticos y demostraciones paso a paso.</p>
                
                <h3>🎯 Objetivos Específicos</h3>
                <ul>
                    <li>Dominar las técnicas básicas esenciales</li>
                    <li>Aplicar protocolos clínicos estandarizados</li>
                    <li>Resolver casos clínicos de complejidad básica</li>
                    <li>Identificar y manejar complicaciones menores</li>
                </ul>
                
                <h3>🔬 Contenido Práctico</h3>
                <div class="content-section">
                    <h4>1. Técnicas Básicas</h4>
                    <ul>
                        <li>Preparación del campo operatorio</li>
                        <li>Selección y manejo de instrumentos</li>
                        <li>Técnicas de anestesia local</li>
                        <li>Protocolos de asepsia y antisepsia</li>
                    </ul>
                </div>
                
                <div class="content-section">
                    <h4>2. Casos Clínicos Básicos</h4>
                    <p>Analizaremos casos reales con diferentes presentaciones:</p>
                    <ul>
                        <li><strong>Caso 1:</strong> Presentación típica - manejo estándar</li>
                        <li><strong>Caso 2:</strong> Variación anatómica - adaptación de técnica</li>
                        <li><strong>Caso 3:</strong> Complicación menor - resolución práctica</li>
                    </ul>
                </div>
                
                <div class="warning-box" style="background: #fef2f2; padding: 1rem; border-left: 4px solid #ef4444; margin: 1rem 0;">
                    <h4>⚠️ Consideraciones Clínicas</h4>
                    <p>Recuerda siempre evaluar las contraindicaciones y el estado general del paciente antes de proceder con cualquier tratamiento.</p>
                </div>
                
                <h3>📊 Protocolo Paso a Paso</h3>
                <ol>
                    <li><strong>Evaluación inicial:</strong> Historia clínica y examen físico</li>
                    <li><strong>Diagnóstico:</strong> Análisis de hallazgos clínicos</li>
                    <li><strong>Planificación:</strong> Selección de técnica apropiada</li>
                    <li><strong>Ejecución:</strong> Aplicación de la técnica seleccionada</li>
                    <li><strong>Evaluación:</strong> Verificación de resultados</li>
                    <li><strong>Seguimiento:</strong> Control post-tratamiento</li>
                </ol>
                
                <div class="premium-box" style="background: #fefce8; padding: 1rem; border-left: 4px solid #eab308; margin: 1rem 0;">
                    <h4>⭐ Contenido Premium</h4>
                    <p>Esta lección incluye material exclusivo para estudiantes inscritos: videos en alta definición, casos clínicos detallados y acceso al foro de discusión con el instructor.</p>
                </div>
            </div>',
            'Lección que cubre las técnicas fundamentales con casos prácticos y protocolos clínicos detallados.',
            35,
            2,
            false -- Lección premium
        FROM courses c;
        
        -- Tercera lección (premium avanzada)
        INSERT INTO lessons (course_id, title, content, description, duration_minutes, order_index, is_free)
        SELECT 
            c.id,
            'Casos Avanzados y Complicaciones en ' || c.title,
            '<div class="lesson-content">
                <h2>🏆 Casos Avanzados y Manejo de Complicaciones</h2>
                <p>Esta lección avanzada está diseñada para profesionales que buscan perfeccionar sus habilidades en el manejo de casos complejos y situaciones desafiantes.</p>
                
                <h3>🎯 Objetivos Avanzados</h3>
                <ul>
                    <li>Manejar casos de alta complejidad</li>
                    <li>Resolver complicaciones intraoperatorias</li>
                    <li>Aplicar técnicas de rescate y salvamento</li>
                    <li>Desarrollar criterios de derivación</li>
                </ul>
                
                <h3>🔬 Casos Clínicos Complejos</h3>
                <div class="advanced-case">
                    <h4>📋 Caso Clínico #1: Situación Compleja</h4>
                    <p><strong>Presentación:</strong> Paciente con múltiples comorbilidades</p>
                    <p><strong>Desafío:</strong> Anatomía alterada y limitaciones sistémicas</p>
                    <p><strong>Abordaje:</strong> Técnica modificada con consideraciones especiales</p>
                    <p><strong>Resultado:</strong> Éxito con manejo multidisciplinario</p>
                </div>
                
                <div class="advanced-case">
                    <h4>📋 Caso Clínico #2: Complicación Intraoperatoria</h4>
                    <p><strong>Situación:</strong> Complicación inesperada durante el procedimiento</p>
                    <p><strong>Manejo inmediato:</strong> Protocolo de emergencia aplicado</p>
                    <p><strong>Resolución:</strong> Técnica de rescate exitosa</p>
                    <p><strong>Seguimiento:</strong> Control a largo plazo</p>
                </div>
                
                <h3>🚨 Manejo de Emergencias</h3>
                <div class="emergency-protocol">
                    <h4>Protocolo de Emergencia</h4>
                    <ol>
                        <li><strong>Reconocimiento inmediato</strong> de la complicación</li>
                        <li><strong>Estabilización</strong> del paciente</li>
                        <li><strong>Aplicación de técnica de rescate</strong> apropiada</li>
                        <li><strong>Evaluación</strong> de daños y necesidades</li>
                        <li><strong>Derivación</strong> si es necesario</li>
                        <li><strong>Seguimiento</strong> especializado</li>
                    </ol>
                </div>
                
                <div class="expert-tip" style="background: #f0fdf4; padding: 1rem; border-left: 4px solid #22c55e; margin: 1rem 0;">
                    <h4>💡 Consejo de Experto</h4>
                    <p>La clave para manejar casos complejos es la preparación previa, el conocimiento profundo de la anatomía y tener siempre un plan B y C preparados.</p>
                </div>
                
                <h3>📚 Técnicas Avanzadas</h3>
                <ul>
                    <li><strong>Técnica de abordaje mínimamente invasivo</strong></li>
                    <li><strong>Uso de tecnología de punta</strong></li>
                    <li><strong>Técnicas de regeneración tisular</strong></li>
                    <li><strong>Manejo farmacológico avanzado</strong></li>
                </ul>
                
                <h3>🎓 Certificación Avanzada</h3>
                <p>Al completar esta lección y aprobar la evaluación correspondiente, recibirás:</p>
                <ul>
                    <li>Certificado de competencia en casos avanzados</li>
                    <li>Acceso a la comunidad de expertos</li>
                    <li>Invitación a webinars exclusivos</li>
                    <li>Material de referencia actualizado</li>
                </ul>
                
                <div class="master-level" style="background: #f3e8ff; padding: 1rem; border-left: 4px solid #a855f7; margin: 1rem 0;">
                    <h4>🏆 Nivel Maestría</h4>
                    <p>Esta lección representa el nivel más alto de competencia en ' || c.title || '. Solo para profesionales con experiencia previa y dedicación al aprendizaje continuo.</p>
                </div>
            </div>',
            'Lección avanzada para el manejo de casos complejos y situaciones desafiantes en la práctica clínica.',
            50,
            3,
            false -- Lección premium avanzada
        FROM courses c;
        
        SELECT COUNT(*) FROM lessons INTO lesson_count;
        RAISE NOTICE '✅ % lecciones de ejemplo creadas', lesson_count;
    END IF;
    
    -- 7. MOSTRAR RESUMEN FINAL
    SELECT COUNT(*) FROM courses INTO course_count;
    SELECT COUNT(*) FROM lessons INTO lesson_count;
    
    RAISE NOTICE '🎉 === CORRECCIÓN COMPLETADA ===';
    RAISE NOTICE '📊 Resumen final:';
    RAISE NOTICE '  - Cursos disponibles: %', course_count;
    RAISE NOTICE '  - Lecciones totales: %', lesson_count;
    RAISE NOTICE '  - Lecciones gratuitas: %', (SELECT COUNT(*) FROM lessons WHERE is_free = true);
    RAISE NOTICE '  - Lecciones premium: %', (SELECT COUNT(*) FROM lessons WHERE is_free = false);
    RAISE NOTICE '✅ Base de datos completamente corregida y lista para usar';
    
END $$;

-- Mostrar estructura final de las tablas principales
SELECT 
    'ESTRUCTURA COURSES:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'courses' 
ORDER BY ordinal_position;

SELECT 
    'ESTRUCTURA LESSONS:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'lessons' 
ORDER BY ordinal_position;

-- Mostrar algunos datos de ejemplo
SELECT 
    'CURSOS CREADOS:' as status,
    c.id,
    c.title,
    c.instructor,
    c.price,
    c.difficulty_level
FROM courses c
ORDER BY c.created_at
LIMIT 5;

SELECT 
    'LECCIONES CREADAS:' as status,
    l.title,
    c.title as course_title,
    l.duration_minutes,
    l.is_free,
    l.order_index
FROM lessons l
JOIN courses c ON l.course_id = c.id
ORDER BY c.title, l.order_index
LIMIT 10;

COMMIT;
