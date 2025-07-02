-- Script para arreglar la tabla de usuarios y permitir usuarios de prueba

-- Hacer password_hash opcional
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Agregar campo para identificar usuarios de prueba
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_test_user BOOLEAN DEFAULT FALSE;

-- Agregar campo para fecha de creación si no existe
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Agregar índices útiles
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_test ON users(is_test_user) WHERE is_test_user = true;

-- Función para limpiar usuarios de prueba (opcional)
CREATE OR REPLACE FUNCTION clean_test_users()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM users WHERE is_test_user = true;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insertar algunos datos de ejemplo si no existen
INSERT INTO users (email, password_hash, first_name, last_name, role, is_test_user)
VALUES 
  ('admin@odontogeek.com', '$2b$10$example.admin.hash', 'Admin', 'Principal', 'admin', false),
  ('instructor@odontogeek.com', '$2b$10$example.instructor.hash', 'Dr. María', 'González', 'instructor', false)
ON CONFLICT (email) DO NOTHING;

-- Verificar que los cursos existen
INSERT INTO courses (title, description, price, instructor_id, duration_hours, total_lessons, status)
SELECT 
  'Implantología Avanzada',
  'Técnicas modernas de implantes dentales con casos clínicos reales',
  299.00,
  (SELECT id FROM users WHERE email = 'instructor@odontogeek.com' LIMIT 1),
  12,
  24,
  'published'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Implantología Avanzada');

INSERT INTO courses (title, description, price, instructor_id, duration_hours, total_lessons, status)
SELECT 
  'Endodoncia Contemporánea',
  'Protocolos actualizados en tratamiento de conductos',
  199.00,
  (SELECT id FROM users WHERE email = 'instructor@odontogeek.com' LIMIT 1),
  8,
  18,
  'published'
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE title = 'Endodoncia Contemporánea');
