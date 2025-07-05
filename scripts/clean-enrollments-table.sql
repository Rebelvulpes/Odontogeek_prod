-- Script para limpiar completamente la tabla de inscripciones
-- Esto eliminará TODOS los datos falsos y dejará el sistema limpio

-- Eliminar tabla de inscripciones completamente
DROP TABLE IF EXISTS enrollments CASCADE;

-- Crear tabla de inscripciones vacía (sin datos de ejemplo)
CREATE TABLE enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices básicos para performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolled_at);

-- NO insertar ningún dato de ejemplo
-- La tabla queda completamente vacía

-- Verificar que la tabla está vacía
SELECT 
    'Tabla enrollments limpia' as status,
    COUNT(*) as total_inscripciones
FROM enrollments;

-- Confirmar que no hay datos falsos
SELECT 
    'Verificación final' as tipo,
    CASE 
        WHEN COUNT(*) = 0 THEN 'CORRECTO: Sin inscripciones falsas'
        ELSE 'ERROR: Aún hay datos falsos'
    END as resultado
FROM enrollments;
