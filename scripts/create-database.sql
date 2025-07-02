-- Crear tablas para la plataforma de cursos dentales

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Actualizar la tabla de usuarios para hacer password_hash opcional para usuarios de prueba
-- y agregar un campo para distinguir usuarios de prueba

-- Modificar la tabla de usuarios
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Agregar campo para usuarios de prueba
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_test_user BOOLEAN DEFAULT FALSE;

-- Agregar índice para usuarios de prueba
CREATE INDEX IF NOT EXISTS idx_users_test ON users(is_test_user) WHERE is_test_user = true;

-- Tabla de cursos
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    instructor_id UUID REFERENCES users(id),
    thumbnail_url VARCHAR(500),
    duration_hours INTEGER,
    total_lessons INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de lecciones/videos
CREATE TABLE IF NOT EXISTS lessons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500),
    duration_minutes INTEGER,
    order_index INTEGER NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de inscripciones (enrollments)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage INTEGER DEFAULT 0,
    UNIQUE(user_id, course_id)
);

-- Tabla de progreso de lecciones
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE,
    watch_time_seconds INTEGER DEFAULT 0,
    UNIQUE(user_id, lesson_id)
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de certificados
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    certificate_url VARCHAR(500),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe ON payments(stripe_payment_intent_id);
