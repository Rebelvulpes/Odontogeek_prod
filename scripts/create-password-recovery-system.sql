-- Sistema de recuperación de contraseñas para usuarios que no pueden acceder

-- 1. Crear tabla para tokens de recuperación
CREATE TABLE IF NOT EXISTS password_recovery_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_password_recovery_tokens_token ON password_recovery_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_recovery_tokens_user_id ON password_recovery_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_recovery_tokens_expires_at ON password_recovery_tokens(expires_at);

-- 3. Función para generar token de recuperación
CREATE OR REPLACE FUNCTION generate_recovery_token(user_email VARCHAR)
RETURNS TABLE(
    success BOOLEAN,
    token VARCHAR,
    expires_at TIMESTAMP,
    message TEXT
) AS $$
DECLARE
    user_record RECORD;
    recovery_token VARCHAR;
    expiry_time TIMESTAMP;
BEGIN
    -- Buscar usuario
    SELECT * INTO user_record FROM users WHERE email = user_email;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::VARCHAR, NULL::TIMESTAMP, 'Usuario no encontrado';
        RETURN;
    END IF;
    
    -- Generar token único
    recovery_token := encode(gen_random_bytes(32), 'hex');
    expiry_time := NOW() + INTERVAL '1 hour';
    
    -- Invalidar tokens anteriores
    UPDATE password_recovery_tokens 
    SET used = true 
    WHERE user_id = user_record.id AND used = false;
    
    -- Crear nuevo token
    INSERT INTO password_recovery_tokens (user_id, token, expires_at)
    VALUES (user_record.id, recovery_token, expiry_time);
    
    RETURN QUERY SELECT true, recovery_token, expiry_time, 'Token generado exitosamente';
END;
$$ LANGUAGE plpgsql;

-- 4. Función para resetear contraseña con token
CREATE OR REPLACE FUNCTION reset_password_with_token(
    recovery_token VARCHAR,
    new_password_hash VARCHAR
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    token_record RECORD;
    user_record RECORD;
BEGIN
    -- Buscar token válido
    SELECT * INTO token_record 
    FROM password_recovery_tokens 
    WHERE token = recovery_token 
    AND used = false 
    AND expires_at > NOW();
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Token inválido o expirado';
        RETURN;
    END IF;
    
    -- Buscar usuario
    SELECT * INTO user_record FROM users WHERE id = token_record.user_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Usuario no encontrado';
        RETURN;
    END IF;
    
    -- Actualizar contraseña
    UPDATE users 
    SET password_hash = new_password_hash,
        updated_at = NOW()
    WHERE id = user_record.id;
    
    -- Marcar token como usado
    UPDATE password_recovery_tokens 
    SET used = true 
    WHERE id = token_record.id;
    
    RETURN QUERY SELECT true, 'Contraseña actualizada exitosamente';
END;
$$ LANGUAGE plpgsql;

-- 5. Generar tokens de recuperación para usuarios problemáticos
DO $$
DECLARE
    user_record RECORD;
    recovery_result RECORD;
BEGIN
    -- Para cada usuario que podría tener problemas
    FOR user_record IN 
        SELECT email FROM users 
        WHERE email IN ('rebelmariachiboy@gmail.com', 'nuevo@test.com', 'admin-nuevo@test.com')
    LOOP
        SELECT * INTO recovery_result 
        FROM generate_recovery_token(user_record.email);
        
        RAISE NOTICE 'Usuario: % - Token: % - Expira: %', 
            user_record.email, 
            recovery_result.token, 
            recovery_result.expires_at;
    END LOOP;
END $$;

-- 6. Mostrar todos los tokens de recuperación activos
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    prt.token,
    prt.expires_at,
    prt.used,
    'Usar este token para resetear contraseña' as instructions
FROM password_recovery_tokens prt
JOIN users u ON prt.user_id = u.id
WHERE prt.used = false 
AND prt.expires_at > NOW()
ORDER BY prt.created_at DESC;
