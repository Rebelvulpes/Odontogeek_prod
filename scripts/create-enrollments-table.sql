-- Crear tabla de inscripciones (enrollments)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    progress DECIMAL(5,2) DEFAULT 0.00 CHECK (progress >= 0 AND progress <= 100),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_intent_id VARCHAR(255) NULL,
    amount_paid DECIMAL(10,2) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_status ON enrollments(payment_status);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolled_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_enrollments_updated_at ON enrollments;
CREATE TRIGGER trigger_update_enrollments_updated_at
    BEFORE UPDATE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_enrollments_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE enrollments IS 'Tabla que almacena las inscripciones de usuarios a cursos';
COMMENT ON COLUMN enrollments.progress IS 'Progreso del curso en porcentaje (0-100)';
COMMENT ON COLUMN enrollments.payment_status IS 'Estado del pago: pending, completed, failed, refunded';
COMMENT ON COLUMN enrollments.amount_paid IS 'Cantidad pagada por el curso';
