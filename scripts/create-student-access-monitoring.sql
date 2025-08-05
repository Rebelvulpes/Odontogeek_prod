-- Script para crear sistema completo de monitoreo de acceso de estudiantes

-- 1. Crear vista para monitoreo en tiempo real
CREATE OR REPLACE VIEW student_access_monitor AS
SELECT 
    sal.created_at,
    sal.email,
    u.first_name,
    u.last_name,
    sal.action,
    sal.success,
    sal.error_code,
    sal.error_message,
    sal.ip_address,
    CASE 
        WHEN sal.success THEN '✅'
        ELSE '❌'
    END as status_icon,
    CASE 
        WHEN sal.action = 'login_success' THEN 'Login Exitoso'
        WHEN sal.action = 'login_failed' THEN 'Login Fallido'
        WHEN sal.action = 'registration_success' THEN 'Registro Exitoso'
        WHEN sal.action = 'dashboard_access' THEN 'Acceso Dashboard'
        WHEN sal.action = 'courses_access' THEN 'Acceso Cursos'
        WHEN sal.action = 'session_verified' THEN 'Sesión Verificada'
        WHEN sal.action = 'hash_fixed' THEN 'Hash Reparado'
        ELSE sal.action
    END as action_description
FROM student_access_log sal
LEFT JOIN users u ON sal.student_id = u.id
ORDER BY sal.created_at DESC;

-- 2. Crear función para obtener estadísticas de acceso
CREATE OR REPLACE FUNCTION get_student_access_stats(
    hours_back INTEGER DEFAULT 24
)
RETURNS TABLE(
    total_attempts BIGINT,
    successful_logins BIGINT,
    failed_logins BIGINT,
    registrations BIGINT,
    dashboard_accesses BIGINT,
    unique_students BIGINT,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_attempts,
        COUNT(CASE WHEN action = 'login_success' THEN 1 END) as successful_logins,
        COUNT(CASE WHEN action = 'login_failed' THEN 1 END) as failed_logins,
        COUNT(CASE WHEN action = 'registration_success' THEN 1 END) as registrations,
        COUNT(CASE WHEN action = 'dashboard_access' THEN 1 END) as dashboard_accesses,
        COUNT(DISTINCT student_id) as unique_students,
        ROUND(
            (COUNT(CASE WHEN success = true THEN 1 END)::NUMERIC / 
             NULLIF(COUNT(*), 0) * 100), 2
        ) as success_rate
    FROM student_access_log
    WHERE created_at > NOW() - INTERVAL '1 hour' * hours_back;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear función para detectar problemas de acceso
CREATE OR REPLACE FUNCTION detect_access_issues()
RETURNS TABLE(
    issue_type TEXT,
    email VARCHAR(255),
    count BIGINT,
    last_attempt TIMESTAMP,
    recommendation TEXT
) AS $$
BEGIN
    -- Usuarios con múltiples fallos de login
    RETURN QUERY
    SELECT 
        'MULTIPLE_LOGIN_FAILURES' as issue_type,
        sal.email,
        COUNT(*) as count,
        MAX(sal.created_at) as last_attempt,
        'Verificar contraseña del usuario - posible hash corrupto' as recommendation
    FROM student_access_log sal
    WHERE sal.action = 'login_failed'
    AND sal.created_at > NOW() - INTERVAL '1 hour'
    GROUP BY sal.email
    HAVING COUNT(*) >= 3;

    -- Usuarios que no pueden acceder al dashboard
    RETURN QUERY
    SELECT 
        'DASHBOARD_ACCESS_ISSUES' as issue_type,
        sal.email,
        COUNT(*) as count,
        MAX(sal.created_at) as last_attempt,
        'Verificar permisos y sesión del usuario' as recommendation
    FROM student_access_log sal
    WHERE sal.action LIKE '%dashboard%'
    AND sal.success = false
    AND sal.created_at > NOW() - INTERVAL '2 hours'
    GROUP BY sal.email
    HAVING COUNT(*) >= 2;

    -- Errores internos del servidor
    RETURN QUERY
    SELECT 
        'SERVER_ERRORS' as issue_type,
        sal.email,
        COUNT(*) as count,
        MAX(sal.created_at) as last_attempt,
        'Revisar logs del servidor y conexión a base de datos' as recommendation
    FROM student_access_log sal
    WHERE sal.error_code = 'INTERNAL_SERVER_ERROR'
    AND sal.created_at > NOW() - INTERVAL '1 hour'
    GROUP BY sal.email
    HAVING COUNT(*) >= 1;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear alertas automáticas
CREATE OR REPLACE FUNCTION create_access_alerts()
RETURNS TABLE(
    alert_level TEXT,
    message TEXT,
    affected_users BIGINT,
    created_at TIMESTAMP
) AS $$
DECLARE
    failed_logins_count BIGINT;
    server_errors_count BIGINT;
    success_rate NUMERIC;
BEGIN
    -- Contar fallos de login en la última hora
    SELECT COUNT(*) INTO failed_logins_count
    FROM student_access_log
    WHERE action = 'login_failed'
    AND created_at > NOW() - INTERVAL '1 hour';

    -- Contar errores del servidor
    SELECT COUNT(*) INTO server_errors_count
    FROM student_access_log
    WHERE error_code = 'INTERNAL_SERVER_ERROR'
    AND created_at > NOW() - INTERVAL '1 hour';

    -- Calcular tasa de éxito
    SELECT 
        ROUND(
            (COUNT(CASE WHEN success = true THEN 1 END)::NUMERIC / 
             NULLIF(COUNT(*), 0) * 100), 2
        ) INTO success_rate
    FROM student_access_log
    WHERE created_at > NOW() - INTERVAL '1 hour';

    -- Alerta crítica: muchos fallos de login
    IF failed_logins_count > 10 THEN
        RETURN QUERY SELECT 
            'CRITICAL' as alert_level,
            format('Alto número de fallos de login: %s en la última hora', failed_logins_count) as message,
            failed_logins_count as affected_users,
            NOW() as created_at;
    END IF;

    -- Alerta alta: errores del servidor
    IF server_errors_count > 5 THEN
        RETURN QUERY SELECT 
            'HIGH' as alert_level,
            format('Errores del servidor detectados: %s en la última hora', server_errors_count) as message,
            server_errors_count as affected_users,
            NOW() as created_at;
    END IF;

    -- Alerta media: baja tasa de éxito
    IF success_rate < 80 THEN
        RETURN QUERY SELECT 
            'MEDIUM' as alert_level,
            format('Baja tasa de éxito en accesos: %s%%', success_rate) as message,
            0::BIGINT as affected_users,
            NOW() as created_at;
    END IF;

    -- Si no hay alertas
    IF failed_logins_count <= 10 AND server_errors_count <= 5 AND success_rate >= 80 THEN
        RETURN QUERY SELECT 
            'INFO' as alert_level,
            'Sistema de acceso funcionando correctamente' as message,
            0::BIGINT as affected_users,
            NOW() as created_at;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Ejecutar diagnóstico completo
SELECT '=== ESTADÍSTICAS DE ACCESO (ÚLTIMAS 24 HORAS) ===' as report_section;
SELECT * FROM get_student_access_stats(24);

SELECT '=== PROBLEMAS DETECTADOS ===' as report_section;
SELECT * FROM detect_access_issues();

SELECT '=== ALERTAS DEL SISTEMA ===' as report_section;
SELECT * FROM create_access_alerts();

SELECT '=== ACTIVIDAD RECIENTE (ÚLTIMOS 50 REGISTROS) ===' as report_section;
SELECT * FROM student_access_monitor LIMIT 50;

SELECT '=== USUARIOS CON PROBLEMAS DE ACCESO ===' as report_section;
SELECT 
    email,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN success = true THEN 1 END) as successful_attempts,
    COUNT(CASE WHEN success = false THEN 1 END) as failed_attempts,
    MAX(created_at) as last_attempt,
    CASE 
        WHEN COUNT(CASE WHEN success = false THEN 1 END) > 5 THEN 'NEEDS_ATTENTION'
        WHEN COUNT(CASE WHEN success = false THEN 1 END) > 2 THEN 'MONITOR'
        ELSE 'OK'
    END as status
FROM student_access_log
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY email
HAVING COUNT(CASE WHEN success = false THEN 1 END) > 0
ORDER BY failed_attempts DESC, last_attempt DESC;
