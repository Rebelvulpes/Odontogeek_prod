-- Diagnóstico y corrección completa de la tabla lessons
-- Este script detecta qué columnas faltan y las crea automáticamente

DO $$
DECLARE
    column_exists BOOLEAN;
    course_count INTEGER;
    lesson_count INTEGER;
    enrollment_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 === DIAGNÓSTICO COMPLETO DE LECCIONES ===';
    
    -- Verificar estructura actual de la tabla lessons
    RAISE NOTICE '📊 Verificando estructura de tabla lessons...';
    
    -- Verificar si la tabla lessons existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'lessons'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
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
        RAISE NOTICE '✅ Tabla lessons creada exitosamente';
    ELSE
        RAISE NOTICE '✅ Tabla lessons existe';
    END IF;
    
    -- Verificar y agregar columnas faltantes una por una
    
    -- Columna content
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'content'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN content TEXT;
        RAISE NOTICE '✅ Columna content agregada';
    ELSE
        RAISE NOTICE '✅ Columna content ya existe';
    END IF;
    
    -- Columna description
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'description'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN description TEXT;
        RAISE NOTICE '✅ Columna description agregada';
    ELSE
        RAISE NOTICE '✅ Columna description ya existe';
    END IF;
    
    -- Columna duration_minutes
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'duration_minutes'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN duration_minutes INTEGER DEFAULT 30;
        RAISE NOTICE '✅ Columna duration_minutes agregada';
    ELSE
        RAISE NOTICE '✅ Columna duration_minutes ya existe';
    END IF;
    
    -- Columna video_url
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'video_url'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN video_url TEXT;
        RAISE NOTICE '✅ Columna video_url agregada';
    ELSE
        RAISE NOTICE '✅ Columna video_url ya existe';
    END IF;
    
    -- Columna order_index
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'order_index'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN order_index INTEGER DEFAULT 1;
        RAISE NOTICE '✅ Columna order_index agregada';
    ELSE
        RAISE NOTICE '✅ Columna order_index ya existe';
    END IF;
    
    -- Columna is_free
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'is_free'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN is_free BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Columna is_free agregada';
    ELSE
        RAISE NOTICE '✅ Columna is_free ya existe';
    END IF;
    
    -- Verificar timestamps
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'created_at'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Columna created_at agregada';
    ELSE
        RAISE NOTICE '✅ Columna created_at ya existe';
    END IF;
    
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'lessons' AND column_name = 'updated_at'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE lessons ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Columna updated_at agregada';
    ELSE
        RAISE NOTICE '✅ Columna updated_at ya existe';
    END IF;
    
    -- Verificar estructura de tabla courses y agregar instructor si no existe
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'instructor'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        ALTER TABLE courses ADD COLUMN instructor TEXT DEFAULT 'Dr. Instructor';
        RAISE NOTICE '✅ Columna instructor agregada a courses';
    ELSE
        RAISE NOTICE '✅ Columna instructor ya existe en courses';
    END IF;
    
    -- Mostrar estructura final
    RAISE NOTICE '📋 Estructura final de tabla lessons:';
    FOR column_exists IN 
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'lessons' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE '  - %', column_exists;
    END LOOP;
    
    -- Contar datos existentes
    SELECT COUNT(*) FROM courses INTO course_count;
    SELECT COUNT(*) FROM lessons INTO lesson_count;
    
    RAISE NOTICE '📊 Estado actual:';
    RAISE NOTICE '  - Cursos: %', course_count;
    RAISE NOTICE '  - Lecciones: %', lesson_count;
    
    -- Si no hay lecciones, crear algunas de ejemplo
    IF lesson_count = 0 AND course_count > 0 THEN
        RAISE NOTICE '🎯 Creando lecciones de ejemplo...';
        
        -- Limpiar lecciones de prueba anteriores
        DELETE FROM lessons WHERE title LIKE '%Introducción%' OR title LIKE '%Fundamentos%' OR title LIKE '%Técnicas%';
        
        -- Crear lecciones para cada curso
        INSERT INTO lessons (course_id, title, content, description, duration_minutes, video_url, order_index, is_free)
        SELECT 
            c.id,
            'Introducción a ' || c.title,
            '<div class="lesson-content">
                <h2>Bienvenido a: ' || c.title || '</h2>
                <p>En esta lección introductoria aprenderás los conceptos fundamentales de <strong>' || c.title || '</strong>.</p>
                
                <h3>🎯 Objetivos de Aprendizaje</h3>
                <ul>
                    <li>Comprender los principios básicos</li>
                    <li>Identificar las herramientas necesarias</li>
                    <li>Reconocer las mejores prácticas</li>
                    <li>Aplicar técnicas fundamentales</li>
                </ul>
                
                <h3>📚 Contenido de la Lección</h3>
                <p>Esta lección cubre:</p>
                <ol>
                    <li><strong>Conceptos teóricos:</strong> Base científica y fundamentos</li>
                    <li><strong>Aplicación práctica:</strong> Casos reales y ejemplos</li>
                    <li><strong>Técnicas avanzadas:</strong> Métodos profesionales</li>
                    <li><strong>Evaluación:</strong> Criterios de éxito</li>
                </ol>
                
                <div class="highlight-box" style="background: #f0f9ff; padding: 1rem; border-left: 4px solid #0ea5e9; margin: 1rem 0;">
                    <h4>💡 Tip Profesional</h4>
                    <p>Recuerda siempre aplicar los protocolos de seguridad y seguir las normativas vigentes en tu práctica profesional.</p>
                </div>
                
                <h3>🔍 Recursos Adicionales</h3>
                <p>Al completar esta lección tendrás acceso a:</p>
                <ul>
                    <li>Material descargable en PDF</li>
                    <li>Videos complementarios</li>
                    <li>Casos clínicos de ejemplo</li>
                    <li>Foro de discusión con otros estudiantes</li>
                </ul>
            </div>',
            'Lección introductoria que cubre los fundamentos básicos y conceptos esenciales del curso.',
            15,
            'https://example.com/video/intro-' || LOWER(REPLACE(c.title, ' ', '-')),
            1,
            true -- Primera lección siempre gratuita
        FROM courses c
        WHERE c.id IS NOT NULL;
        
        -- Segunda lección para cada curso
        INSERT INTO lessons (course_id, title, content, description, duration_minutes, video_url, order_index, is_free)
        SELECT 
            c.id,
            'Fundamentos de ' || c.title,
            '<div class="lesson-content">
                <h2>Fundamentos Avanzados</h2>
                <p>Profundizamos en los aspectos técnicos y metodológicos de <strong>' || c.title || '</strong>.</p>
                
                <h3>🔬 Contenido Técnico</h3>
                <p>En esta lección abordaremos:</p>
                
                <div class="content-section">
                    <h4>1. Metodología Profesional</h4>
                    <ul>
                        <li>Protocolos estandarizados</li>
                        <li>Técnicas de diagnóstico</li>
                        <li>Herramientas especializadas</li>
                        <li>Criterios de evaluación</li>
                    </ul>
                </div>
                
                <div class="content-section">
                    <h4>2. Casos Prácticos</h4>
                    <p>Analizaremos casos reales con diferentes niveles de complejidad:</p>
                    <ul>
                        <li><strong>Caso Básico:</strong> Situación estándar con protocolo directo</li>
                        <li><strong>Caso Intermedio:</strong> Complicaciones menores y adaptaciones</li>
                        <li><strong>Caso Avanzado:</strong> Situaciones complejas y soluciones innovadoras</li>
                    </ul>
                </div>
                
                <div class="warning-box" style="background: #fef2f2; padding: 1rem; border-left: 4px solid #ef4444; margin: 1rem 0;">
                    <h4>⚠️ Consideraciones Importantes</h4>
                    <p>Siempre verifica las contraindicaciones y considera el historial médico del paciente antes de proceder.</p>
                </div>
                
                <h3>📊 Evaluación y Seguimiento</h3>
                <p>Al finalizar esta lección podrás:</p>
                <ol>
                    <li>Realizar una evaluación completa</li>
                    <li>Identificar factores de riesgo</li>
                    <li>Planificar el tratamiento adecuado</li>
                    <li>Documentar el proceso correctamente</li>
                </ol>
                
                <div class="success-box" style="background: #f0fdf4; padding: 1rem; border-left: 4px solid #22c55e; margin: 1rem 0;">
                    <h4>✅ Checkpoint</h4>
                    <p>Completa el cuestionario al final de esta lección para verificar tu comprensión de los conceptos fundamentales.</p>
                </div>
            </div>',
            'Lección que profundiza en los fundamentos técnicos y metodológicos del área de estudio.',
            30,
            'https://example.com/video/fundamentos-' || LOWER(REPLACE(c.title, ' ', '-')),
            2,
            false -- Lección premium
        FROM courses c
        WHERE c.id IS NOT NULL;
        
        -- Tercera lección para cada curso
        INSERT INTO lessons (course_id, title, content, description, duration_minutes, video_url, order_index, is_free)
        SELECT 
            c.id,
            'Técnicas Avanzadas en ' || c.title,
            '<div class="lesson-content">
                <h2>Técnicas Avanzadas y Especialización</h2>
                <p>Domina las técnicas más avanzadas y especializadas en <strong>' || c.title || '</strong>.</p>
                
                <h3>🚀 Nivel Experto</h3>
                <p>Esta lección está diseñada para profesionales que buscan perfeccionar sus habilidades y conocer las últimas innovaciones en el campo.</p>
                
                <div class="advanced-content">
                    <h4>🔬 Innovaciones Tecnológicas</h4>
                    <ul>
                        <li>Equipamiento de última generación</li>
                        <li>Software especializado</li>
                        <li>Técnicas mínimamente invasivas</li>
                        <li>Materiales biocompatibles avanzados</li>
                    </ul>
                </div>
                
                <div class="advanced-content">
                    <h4>📈 Protocolos Avanzados</h4>
                    <p>Implementación de protocolos de vanguardia:</p>
                    <ol>
                        <li><strong>Diagnóstico Digital:</strong> Uso de IA y análisis computacional</li>
                        <li><strong>Planificación 3D:</strong> Modelado tridimensional para precisión óptima</li>
                        <li><strong>Ejecución Guiada:</strong> Técnicas asistidas por computadora</li>
                        <li><strong>Seguimiento Digital:</strong> Monitoreo continuo y ajustes en tiempo real</li>
                    </ol>
                </div>
                
                <div class="case-study" style="background: #f8fafc; padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 8px; margin: 1rem 0;">
                    <h4>📋 Caso de Estudio Avanzado</h4>
                    <p><strong>Paciente:</strong> Adulto de 45 años con complicaciones múltiples</p>
                    <p><strong>Desafío:</strong> Situación compleja que requiere enfoque multidisciplinario</p>
                    <p><strong>Solución:</strong> Aplicación de técnicas avanzadas con tecnología de punta</p>
                    <p><strong>Resultado:</strong> Éxito completo con mínimas molestias para el paciente</p>
                </div>
                
                <h3>🎯 Objetivos de Maestría</h3>
                <p>Al completar esta lección avanzada serás capaz de:</p>
                <ul>
                    <li>Manejar casos de alta complejidad</li>
                    <li>Integrar múltiples técnicas especializadas</li>
                    <li>Adaptar protocolos según necesidades específicas</li>
                    <li>Mentorizar a otros profesionales</li>
                    <li>Contribuir a la investigación en el área</li>
                </ul>
                
                <div class="expert-tip" style="background: #fefce8; padding: 1rem; border-left: 4px solid #eab308; margin: 1rem 0;">
                    <h4>🏆 Consejo de Experto</h4>
                    <p>La maestría en estas técnicas requiere práctica constante y actualización continua. Mantente al día con las últimas publicaciones científicas y participa en congresos especializados.</p>
                </div>
                
                <h3>📚 Recursos Exclusivos</h3>
                <p>Como estudiante avanzado tendrás acceso a:</p>
                <ul>
                    <li>Biblioteca digital especializada</li>
                    <li>Webinars con expertos internacionales</li>
                    <li>Red de contactos profesionales</li>
                    <li>Certificación de especialización</li>
                </ul>
            </div>',
            'Lección avanzada que cubre técnicas especializadas y de vanguardia para profesionales experimentados.',
            45,
            'https://example.com/video/avanzado-' || LOWER(REPLACE(c.title, ' ', '-')),
            3,
            false -- Lección premium avanzada
        FROM courses c
        WHERE c.id IS NOT NULL;
        
        -- Contar lecciones creadas
        SELECT COUNT(*) FROM lessons INTO lesson_count;
        RAISE NOTICE '✅ Lecciones creadas exitosamente. Total: %', lesson_count;
        
    ELSE
        RAISE NOTICE '✅ Ya existen lecciones en la base de datos';
    END IF;
    
    -- Crear índices para optimizar performance
    CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
    CREATE INDEX IF NOT EXISTS idx_lessons_order_index ON lessons(order_index);
    CREATE INDEX IF NOT EXISTS idx_lessons_is_free ON lessons(is_free);
    
    RAISE NOTICE '✅ Índices de performance creados';
    
    -- Verificar enrollments para acceso
    SELECT COUNT(*) FROM enrollments INTO enrollment_count;
    RAISE NOTICE '📊 Enrollments existentes: %', enrollment_count;
    
    -- Estadísticas finales
    SELECT COUNT(*) FROM courses INTO course_count;
    SELECT COUNT(*) FROM lessons INTO lesson_count;
    
    RAISE NOTICE '🎉 === DIAGNÓSTICO COMPLETADO ===';
    RAISE NOTICE '📊 Resumen final:';
    RAISE NOTICE '  - Cursos disponibles: %', course_count;
    RAISE NOTICE '  - Lecciones totales: %', lesson_count;
    RAISE NOTICE '  - Lecciones gratuitas: %', (SELECT COUNT(*) FROM lessons WHERE is_free = true);
    RAISE NOTICE '  - Lecciones premium: %', (SELECT COUNT(*) FROM lessons WHERE is_free = false);
    RAISE NOTICE '✅ Sistema de lecciones listo para usar';
    
END $$;

-- Mostrar algunas lecciones creadas para verificación
SELECT 
    c.title as curso,
    l.title as leccion,
    l.duration_minutes as duracion,
    l.is_free as gratuita,
    l.order_index as orden
FROM lessons l
JOIN courses c ON l.course_id = c.id
ORDER BY c.title, l.order_index
LIMIT 10;
