-- Limpiar completamente la tabla de inscripciones
-- Eliminar todos los datos falsos y crear tabla vacía

-- Eliminar tabla existente si existe
DROP TABLE IF EXISTS enrollments CASCADE;

-- Crear tabla de inscripciones completamente vacía
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
CREATE INDEX idx_enrollments_enrolled_at ON enrollments(enrolled_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_enrollments_updated_at 
    BEFORE UPDATE ON enrollments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que la tabla está vacía
SELECT 
    'Tabla enrollments creada exitosamente' as mensaje,
    COUNT(*) as total_inscripciones
FROM enrollments;

-- Verificar estructura de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'enrollments' 
ORDER BY ordinal_position;

-- Mensaje de confirmación
SELECT 'LIMPIEZA COMPLETA: Tabla enrollments vacía y lista para datos reales' as status;
