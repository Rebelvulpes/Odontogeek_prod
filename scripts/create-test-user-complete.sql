-- Crear usuario de prueba con contraseña hasheada
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Insertar o actualizar usuario de prueba
    INSERT INTO users (
        id,
        email,
        password_hash,
        first_name,
        last_name,
        role,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'estudiante@test.com',
        '$2b$10$rOzJqQZ8kVZZ8kVZZ8kVZOzJqQZ8kVZZ8kVZZ8kVZOzJqQZ8kVZZ8k',
        'María',
        'González',
        'student',
        NOW(),
        NOW()
    ) ON CONFLICT (email) DO UPDATE SET
        password_hash = '$2b$10$rOzJqQZ8kVZZ8kVZZ8kVZOzJqQZ8kVZZ8kVZZ8kVZOzJqQZ8kVZZ8k',
        first_name = 'María',
        last_name = 'González',
        role = 'student',
        updated_at = NOW()
    RETURNING id INTO user_uuid;
    
    -- Mostrar información del usuario creado
    RAISE NOTICE 'Usuario creado/actualizado: %', user_uuid;
END $$;

-- Verificar que el usuario fue creado correctamente
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
WHERE email = 'estudiante@test.com';
