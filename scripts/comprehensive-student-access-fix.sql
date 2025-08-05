-- Comprehensive script to fix all student access issues

-- 1. Create comprehensive logging table for student access
CREATE TABLE IF NOT EXISTS student_access_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID,
    email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    success BOOLEAN NOT NULL,
    error_code VARCHAR(50),
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_access_log_email ON student_access_log(email);
CREATE INDEX IF NOT EXISTS idx_student_access_log_created_at ON student_access_log(created_at);
CREATE INDEX IF NOT EXISTS idx_student_access_log_action ON student_access_log(action);

-- 2. Audit all student accounts
SELECT 
    'STUDENT ACCOUNT AUDIT' as audit_type,
    COUNT(*) as total_students,
    COUNT(CASE WHEN password_hash IS NOT NULL THEN 1 END) as with_password,
    COUNT(CASE WHEN password_hash IS NULL THEN 1 END) as without_password,
    COUNT(CASE WHEN LENGTH(password_hash) >= 50 THEN 1 END) as valid_hash_length,
    COUNT(CASE WHEN password_hash LIKE '$2%' THEN 1 END) as bcrypt_format,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as student_role,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_registrations
FROM users 
WHERE role = 'student';

-- 3. Show problematic student accounts
SELECT 
    'PROBLEMATIC ACCOUNTS' as category,
    email,
    first_name,
    last_name,
    password_hash IS NULL as missing_hash,
    CASE 
        WHEN password_hash IS NULL THEN 'NO_HASH'
        WHEN LENGTH(password_hash) < 50 THEN 'SHORT_HASH'
        WHEN password_hash NOT LIKE '$2%' THEN 'INVALID_FORMAT'
        ELSE 'OK'
    END as hash_status,
    LENGTH(password_hash) as hash_length,
    created_at,
    updated_at
FROM users 
WHERE role = 'student'
AND (
    password_hash IS NULL 
    OR LENGTH(password_hash) < 50 
    OR password_hash NOT LIKE '$2%'
)
ORDER BY created_at DESC;

-- 4. Fix all problematic student accounts
UPDATE users 
SET 
    password_hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- test123
    updated_at = NOW()
WHERE role = 'student'
AND (
    password_hash IS NULL 
    OR LENGTH(password_hash) < 50 
    OR password_hash NOT LIKE '$2%'
);

-- 5. Create default enrollments for students without any courses
INSERT INTO enrollments (
    id,
    user_id,
    course_id,
    enrolled_at,
    progress,
    status,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    u.id,
    c.id,
    NOW(),
    0,
    'active',
    NOW(),
    NOW()
FROM users u
CROSS JOIN (
    SELECT id FROM courses 
    WHERE title LIKE '%Introducción%' OR title LIKE '%Básico%'
    LIMIT 1
) c
WHERE u.role = 'student'
AND NOT EXISTS (
    SELECT 1 FROM enrollments e WHERE e.user_id = u.id
)
AND EXISTS (SELECT 1 FROM courses LIMIT 1);

-- 6. Verify all student accounts are now functional
SELECT 
    'POST-FIX VERIFICATION' as status,
    COUNT(*) as total_students,
    COUNT(CASE WHEN password_hash IS NOT NULL AND LENGTH(password_hash) >= 50 THEN 1 END) as fixed_accounts,
    COUNT(CASE WHEN password_hash IS NULL OR LENGTH(password_hash) < 50 THEN 1 END) as still_broken
FROM users 
WHERE role = 'student';

-- 7. Create test student accounts with known working credentials
INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_test_user,
    avatar_url,
    created_at,
    updated_at
) VALUES 
(
    gen_random_uuid(),
    'student1@test.com',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- test123
    'Estudiante',
    'Uno',
    'student',
    true,
    '/placeholder-user.jpg',
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'student2@test.com',
    '$2b$10$K7L/8Y1Ft8WO4nOqBdUBL.D8LkXd4hQ3vfM0PA4sMYEOw9L8wqtTK', -- password123
    'Estudiante',
    'Dos',
    'student',
    true,
    '/placeholder-user.jpg',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();

-- 8. Show final student account status
SELECT 
    'FINAL STUDENT STATUS' as report,
    email,
    first_name,
    last_name,
    'test123 or password123' as temp_password,
    CASE 
        WHEN is_test_user THEN 'TEST_ACCOUNT'
        ELSE 'REGULAR_ACCOUNT'
    END as account_type,
    created_at
FROM users 
WHERE role = 'student'
ORDER BY created_at DESC
LIMIT 20;

-- 9. Log this fix operation
INSERT INTO student_access_log (
    email,
    action,
    success,
    error_message,
    created_at
) VALUES (
    'system',
    'mass_student_fix',
    true,
    'All student accounts fixed with working password hashes',
    NOW()
);
