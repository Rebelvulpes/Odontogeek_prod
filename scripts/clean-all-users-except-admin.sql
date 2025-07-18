-- Clean all users except the admin (mendozaij88@gmail.com)
-- This script will remove all non-admin users and their related data

BEGIN;

-- First, let's see what we're working with
SELECT 'Current users before cleanup:' as info;
SELECT id, email, role, first_name, last_name, created_at 
FROM users 
ORDER BY created_at;

-- Delete enrollments for non-admin users
DELETE FROM enrollments 
WHERE user_id IN (
    SELECT id FROM users 
    WHERE email != 'mendozaij88@gmail.com'
);

-- Delete student access logs for non-admin users
DELETE FROM student_access_log 
WHERE student_id IN (
    SELECT id FROM users 
    WHERE email != 'mendozaij88@gmail.com'
);

-- Delete any other user-related data if exists
-- (Add more tables here if needed)

-- Finally, delete all non-admin users
DELETE FROM users 
WHERE email != 'mendozaij88@gmail.com';

-- Show remaining users
SELECT 'Remaining users after cleanup:' as info;
SELECT id, email, role, first_name, last_name, created_at 
FROM users 
ORDER BY created_at;

-- Reset sequences if needed
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

COMMIT;

-- Verify the cleanup
SELECT 
    'Cleanup Summary:' as info,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
    (SELECT COUNT(*) FROM users WHERE role = 'student') as student_users,
    (SELECT COUNT(*) FROM enrollments) as total_enrollments;
