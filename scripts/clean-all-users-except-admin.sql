-- Clean all users except the admin user
-- This script will remove all users except mendozaij88@gmail.com

BEGIN;

-- Show current state
SELECT 'BEFORE CLEANUP - Users count:' as status, COUNT(*) as count FROM users;
SELECT 'BEFORE CLEANUP - Admin user exists:' as status, COUNT(*) as count FROM users WHERE email = 'mendozaij88@gmail.com';

-- Delete related data first (foreign key constraints)
DELETE FROM student_access_log WHERE student_id NOT IN (
    SELECT id FROM users WHERE email = 'mendozaij88@gmail.com'
);

DELETE FROM enrollments WHERE user_id NOT IN (
    SELECT id FROM users WHERE email = 'mendozaij88@gmail.com'
);

DELETE FROM password_reset_tokens WHERE user_id NOT IN (
    SELECT id FROM users WHERE email = 'mendozaij88@gmail.com'
);

-- Delete all users except the admin
DELETE FROM users WHERE email != 'mendozaij88@gmail.com';

-- Show final state
SELECT 'AFTER CLEANUP - Users count:' as status, COUNT(*) as count FROM users;
SELECT 'AFTER CLEANUP - Remaining users:' as status, email, role, created_at FROM users;

-- Verify admin user
SELECT 'ADMIN USER DETAILS:' as status, 
       id, email, first_name, last_name, role, 
       CASE WHEN password_hash IS NOT NULL THEN 'HAS_PASSWORD' ELSE 'NO_PASSWORD' END as password_status,
       created_at
FROM users WHERE email = 'mendozaij88@gmail.com';

COMMIT;
