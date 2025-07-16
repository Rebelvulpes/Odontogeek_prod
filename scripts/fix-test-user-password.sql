-- Eliminar usuario de prueba existente si existe
DELETE FROM users WHERE email = 'estudiante@test.com';

-- Crear usuario de prueba con hash correcto para "test123"
-- Hash generado con bcrypt para "test123": $2a$10$N9qo8uLOickgx2ZMRZoMye.IjdBJGGqQCQvpJIXOZQeP6.Uq6rOvC
INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_test_user,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'estudiante@test.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjdBJGGqQCQvpJIXOZQeP6.Uq6rOvC',
    'Estudiante',
    'Prueba',
    'student',
    true,
    NOW(),
    NOW()
);

-- Verificar que el usuario fue creado correctamente
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    LEFT(password_hash, 20) as hash_preview,
    LENGTH(password_hash) as hash_length,
    created_at
FROM users 
WHERE email = 'estudiante@test.com';
