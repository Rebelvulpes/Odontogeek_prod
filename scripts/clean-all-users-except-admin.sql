-- Clean all users except admin mendozaij88@gmail.com
-- This script will remove all non-admin users and their related data

DO $$
DECLARE
    admin_user_id TEXT;
    deleted_users_count INTEGER := 0;
    deleted_enrollments_count INTEGER := 0;
    deleted_access_logs_count INTEGER := 0;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id 
    FROM users 
    WHERE email = 'mendozaij88@gmail.com' AND role = 'admin';
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user mendozaij88@gmail.com not found!';
    END IF;
    
    RAISE NOTICE 'Admin user found: % (ID: %)', 'mendozaij88@gmail.com', admin_user_id;
    
    -- Delete enrollments for non-admin users
    DELETE FROM enrollments 
    WHERE user_id != admin_user_id;
    
    GET DIAGNOSTICS deleted_enrollments_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % enrollments', deleted_enrollments_count;
    
    -- Delete access logs for non-admin users (if table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_access_logs') THEN
        DELETE FROM student_access_logs 
        WHERE user_id != admin_user_id AND user_id IS NOT NULL;
        
        GET DIAGNOSTICS deleted_access_logs_count = ROW_COUNT;
        RAISE NOTICE 'Deleted % access logs', deleted_access_logs_count;
    END IF;
    
    -- Delete all non-admin users
    DELETE FROM users 
    WHERE id != admin_user_id;
    
    GET DIAGNOSTICS deleted_users_count = ROW_COUNT;
    RAISE NOTICE 'Deleted % users', deleted_users_count;
    
    -- Verify admin user still exists
    IF EXISTS (SELECT 1 FROM users WHERE id = admin_user_id) THEN
        RAISE NOTICE '✅ Admin user preserved successfully';
    ELSE
        RAISE EXCEPTION '❌ Admin user was accidentally deleted!';
    END IF;
    
    RAISE NOTICE '=== CLEANUP SUMMARY ===';
    RAISE NOTICE 'Users deleted: %', deleted_users_count;
    RAISE NOTICE 'Enrollments deleted: %', deleted_enrollments_count;
    RAISE NOTICE 'Access logs deleted: %', deleted_access_logs_count;
    RAISE NOTICE 'Admin user preserved: mendozaij88@gmail.com';
    
END $$;

-- Verify the cleanup
SELECT 
    'REMAINING USERS' as table_name,
    COUNT(*) as count,
    STRING_AGG(email, ', ') as emails
FROM users
UNION ALL
SELECT 
    'REMAINING ENROLLMENTS' as table_name,
    COUNT(*) as count,
    'N/A' as emails
FROM enrollments;
