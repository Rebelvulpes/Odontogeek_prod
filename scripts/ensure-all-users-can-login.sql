-- Script para asegurar que todos los usuarios puedan hacer login

-- 1. Verificar usuarios con problemas de hash
SELECT 
    'Usuarios con problemas' as category,
    COUNT(*) as total_users,
    COUNT(CASE WHEN password_hash IS NULL THEN 1 END) as no_hash,
    COUNT(CASE WHEN LENGTH(password_hash) < 50 THEN 1 END) as short_hash,
    COUNT(CASE WHEN password_hash NOT LIKE '$2%' THEN 1 END) as invalid_format
FROM users;

-- 2. Mostrar usuarios específicos con problemas
SELECT 
    email,
    first_name,
    last_name,
    password_hash IS NULL as no_hash,
    LENGTH(password_hash) as hash_length,
    LEFT(password_hash, 10) as hash_start,
    created_at
FROM users 
WHERE password_hash IS NULL 
   OR LENGTH(password_hash) < 50 
   OR password_hash NOT LIKE '$2%'
ORDER BY created_at DESC;

-- 3. Arreglar todos los usuarios con hash problemático
-- Usaremos un hash que corresponde a "defaultpass123" para usuarios sin contraseña válida
UPDATE users 
SET 
    password_hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    updated_at = NOW()
WHERE password_hash IS NULL 
   OR LENGTH(password_hash) < 50 
   OR password_hash NOT LIKE '$2%';

-- 4. Verificar que todos los usuarios ahora tienen hash válido
SELECT 
    'Usuarios después del arreglo' as status,
    COUNT(*) as total_users,
    COUNT(CASE WHEN password_hash IS NOT NULL AND LENGTH(password_hash) >= 50 THEN 1 END) as valid_hash,
    COUNT(CASE WHEN password_hash IS NULL OR LENGTH(password_hash) < 50 THEN 1 END) as invalid_hash
FROM users;

-- 5. Crear tabla de contraseñas temporales para usuarios arreglados
CREATE TABLE IF NOT EXISTS temp_passwords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    temp_password VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    used BOOLEAN DEFAULT false
);

-- 6. Insertar contraseñas temporales para usuarios que fueron arreglados
INSERT INTO temp_passwords (user_email, temp_password)
SELECT 
    email,
    'test123'
FROM users 
WHERE updated_at > NOW() - INTERVAL '1 minute'
AND NOT EXISTS (
    SELECT 1 FROM temp_passwords WHERE user_email = users.email
);

-- 7. Mostrar usuarios y sus contraseñas temporales
SELECT 
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    tp.temp_password,
    'Hash arreglado - usar contraseña temporal' as note
FROM users u
LEFT JOIN temp_passwords tp ON u.email = tp.user_email
WHERE u.updated_at > NOW() - INTERVAL '1 minute'
ORDER BY u.email;
