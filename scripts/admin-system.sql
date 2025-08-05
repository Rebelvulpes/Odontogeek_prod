-- Crear sistema de administración completo

-- Tabla de logs de administración
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de sesiones de administrador
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de permisos de administrador
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(100) NOT NULL,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(admin_id, permission)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin ON admin_permissions(admin_id);

-- Función para limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION clean_expired_admin_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM admin_sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener permisos de admin
CREATE OR REPLACE FUNCTION get_admin_permissions(admin_user_id UUID)
RETURNS TABLE(permission VARCHAR) AS $$
BEGIN
  RETURN QUERY
  SELECT ap.permission
  FROM admin_permissions ap
  WHERE ap.admin_id = admin_user_id;
END;
$$ LANGUAGE plpgsql;

-- Insertar permisos básicos para administradores
INSERT INTO admin_permissions (admin_id, permission, granted_by)
SELECT 
  u.id,
  perm.permission,
  u.id
FROM users u
CROSS JOIN (
  VALUES 
    ('manage_users'),
    ('manage_courses'),
    ('manage_payments'),
    ('view_analytics'),
    ('manage_admins'),
    ('system_settings')
) AS perm(permission)
WHERE u.role = 'admin'
ON CONFLICT (admin_id, permission) DO NOTHING;
