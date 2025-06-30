-- Insertar datos de ejemplo para la plataforma

-- Insertar usuarios administradores e instructores
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@dentalacademy.com', '$2b$10$example_hash', 'Admin', 'Principal', 'admin'),
('maria.gonzalez@dentalacademy.com', '$2b$10$example_hash', 'María', 'González', 'instructor'),
('carlos.ruiz@dentalacademy.com', '$2b$10$example_hash', 'Carlos', 'Ruiz', 'instructor'),
('ana.martin@dentalacademy.com', '$2b$10$example_hash', 'Ana', 'Martín', 'instructor');

-- Insertar usuarios estudiantes de ejemplo
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('juan.perez@ejemplo.com', '$2b$10$example_hash', 'Juan', 'Pérez', 'student'),
('maria.garcia@ejemplo.com', '$2b$10$example_hash', 'María', 'García', 'student'),
('carlos.lopez@ejemplo.com', '$2b$10$example_hash', 'Carlos', 'López', 'student');

-- Insertar cursos
INSERT INTO courses (title, description, price, instructor_id, duration_hours, total_lessons, status) VALUES
(
    'Implantología Avanzada',
    'Técnicas modernas de implantes dentales con casos clínicos reales. Aprende los protocolos más actualizados en implantología.',
    299.00,
    (SELECT id FROM users WHERE email = 'maria.gonzalez@dentalacademy.com'),
    12,
    24,
    'published'
),
(
    'Endodoncia Contemporánea',
    'Protocolos actualizados en tratamiento de conductos con las últimas técnicas y materiales.',
    199.00,
    (SELECT id FROM users WHERE email = 'carlos.ruiz@dentalacademy.com'),
    8,
    18,
    'published'
),
(
    'Ortodoncia Digital',
    'Planificación y tratamiento ortodóncico con tecnología 3D y herramientas digitales.',
    399.00,
    (SELECT id FROM users WHERE email = 'ana.martin@dentalacademy.com'),
    15,
    20,
    'published'
);

-- Insertar lecciones para el curso de Implantología
INSERT INTO lessons (course_id, title, description, duration_minutes, order_index, is_free) VALUES
(
    (SELECT id FROM courses WHERE title = 'Implantología Avanzada'),
    'Introducción a la Implantología Moderna',
    'Conceptos básicos y evolución de los implantes dentales',
    45,
    1,
    true
),
(
    (SELECT id FROM courses WHERE title = 'Implantología Avanzada'),
    'Planificación del Tratamiento',
    'Evaluación del paciente y planificación quirúrgica',
    60,
    2,
    false
),
(
    (SELECT id FROM courses WHERE title = 'Implantología Avanzada'),
    'Técnicas Quirúrgicas Básicas',
    'Procedimientos quirúrgicos fundamentales en implantología',
    75,
    3,
    false
);

-- Insertar lecciones para el curso de Endodoncia
INSERT INTO lessons (course_id, title, description, duration_minutes, order_index, is_free) VALUES
(
    (SELECT id FROM courses WHERE title = 'Endodoncia Contemporánea'),
    'Diagnóstico Endodóncico',
    'Métodos de diagnóstico en endodoncia moderna',
    40,
    1,
    true
),
(
    (SELECT id FROM courses WHERE title = 'Endodoncia Contemporánea'),
    'Instrumentación Rotatoria',
    'Técnicas de instrumentación con sistemas rotatorios',
    55,
    2,
    false
);

-- Insertar inscripciones de ejemplo
INSERT INTO enrollments (user_id, course_id, progress_percentage) VALUES
(
    (SELECT id FROM users WHERE email = 'juan.perez@ejemplo.com'),
    (SELECT id FROM courses WHERE title = 'Implantología Avanzada'),
    65
),
(
    (SELECT id FROM users WHERE email = 'juan.perez@ejemplo.com'),
    (SELECT id FROM courses WHERE title = 'Endodoncia Contemporánea'),
    30
),
(
    (SELECT id FROM users WHERE email = 'maria.garcia@ejemplo.com'),
    (SELECT id FROM courses WHERE title = 'Ortodoncia Digital'),
    80
);

-- Insertar pagos completados
INSERT INTO payments (user_id, course_id, stripe_payment_intent_id, amount, status, completed_at) VALUES
(
    (SELECT id FROM users WHERE email = 'juan.perez@ejemplo.com'),
    (SELECT id FROM courses WHERE title = 'Implantología Avanzada'),
    'pi_example_123456',
    299.00,
    'completed',
    NOW() - INTERVAL '7 days'
),
(
    (SELECT id FROM users WHERE email = 'juan.perez@ejemplo.com'),
    (SELECT id FROM courses WHERE title = 'Endodoncia Contemporánea'),
    'pi_example_789012',
    199.00,
    'completed',
    NOW() - INTERVAL '5 days'
);
