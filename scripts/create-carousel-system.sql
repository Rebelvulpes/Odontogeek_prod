-- Crear tabla para slides del carrusel
CREATE TABLE IF NOT EXISTS carousel_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    image_url TEXT,
    cta_text VARCHAR(100) DEFAULT 'Ver Más',
    cta_link VARCHAR(500) DEFAULT '/courses',
    background_color VARCHAR(50) DEFAULT 'from-blue-900 to-indigo-900',
    badge_text VARCHAR(100),
    badge_color VARCHAR(50) DEFAULT 'bg-blue-500',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    slide_type VARCHAR(50) DEFAULT 'general', -- 'course', 'promotion', 'news', 'general'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para estadísticas de slides
CREATE TABLE IF NOT EXISTS carousel_slide_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slide_id UUID REFERENCES carousel_slides(id) ON DELETE CASCADE,
    icon_name VARCHAR(50) NOT NULL, -- 'Users', 'Play', 'Award', 'Calendar', 'TrendingUp'
    label VARCHAR(100) NOT NULL,
    value VARCHAR(50) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar slides por defecto
INSERT INTO carousel_slides (title, subtitle, description, image_url, cta_text, cta_link, background_color, badge_text, badge_color, order_index, slide_type) VALUES
(
    'Nuevo Curso: Férulas Oclusales',
    'Incrementa tus ingresos rápidamente imprimiendo tus propias férulas',
    'Olvídate de mandar a laboratorio y hazlas tú mismo',
    'https://res.cloudinary.com/dxe6ugbzi/image/upload/v1746227801/fe%CC%81rulas_medit_qozti5.jpg',
    'Ver Curso',
    '/courses/1',
    'from-blue-900 to-indigo-900',
    'Nuevo Curso',
    'bg-green-500',
    1,
    'course'
),
(
    'Congreso Internacional de Odontología 2024',
    'Participa en el Evento Dental del Año',
    'Únete a más de 5,000 profesionales dentales en el congreso más importante de Latinoamérica.',
    '/placeholder.svg?height=500&width=400&text=Congreso+2024',
    'Más Información',
    '/events/congress-2024',
    'from-purple-900 to-blue-900',
    'Evento Especial',
    'bg-blue-500',
    2,
    'news'
),
(
    'Oferta Especial: 40% de Descuento',
    'Acceso Completo a Todos los Cursos',
    'Por tiempo limitado, obtén acceso a nuestra biblioteca completa de cursos dentales con un descuento exclusivo.',
    '/placeholder.svg?height=500&width=400&text=40%+Descuento',
    'Aprovechar Oferta',
    '/courses?promo=special40',
    'from-red-900 to-pink-900',
    'Oferta Limitada',
    'bg-red-500',
    3,
    'promotion'
),
(
    'Más de 10,000 Profesionales Capacitados',
    'Únete a la Comunidad OdontoGeek',
    'Miles de dentistas ya han mejorado sus habilidades con nuestros cursos. Forma parte de la comunidad más grande.',
    '/placeholder.svg?height=500&width=400&text=10K+Profesionales',
    'Únete Ahora',
    '/auth/register',
    'from-green-900 to-teal-900',
    'Comunidad',
    'bg-purple-500',
    4,
    'success'
);

-- Insertar estadísticas para cada slide
INSERT INTO carousel_slide_stats (slide_id, icon_name, label, value, order_index) 
SELECT id, 'Users', '1,250+ estudiantes', '1,250+', 1 FROM carousel_slides WHERE title = 'Nuevo Curso: Férulas Oclusales';

INSERT INTO carousel_slide_stats (slide_id, icon_name, label, value, order_index) 
SELECT id, 'Play', '24 lecciones', '24', 2 FROM carousel_slides WHERE title = 'Nuevo Curso: Férulas Oclusales';

INSERT INTO carousel_slide_stats (slide_id, icon_name, label, value, order_index) 
SELECT id, 'Award', 'Certificado incluido', 'Certificado', 3 FROM carousel_slides WHERE title = 'Nuevo Curso: Férulas Oclusales';

INSERT INTO carousel_slide_stats (slide_id, icon_name, label, value, order_index) 
SELECT id, 'Calendar', '15-17 Marzo', '3 días', 1 FROM carousel_slides WHERE title = 'Congreso Internacional de Odontología 2024';

INSERT INTO carousel_slide_stats (slide_id, icon_name, label, value, order_index) 
SELECT id, 'Users', '5,000+ asistentes', '5,000+', 2 FROM carousel_slides WHERE title = 'Congreso Internacional de Odontología 2024';

INSERT INTO carousel_slide_stats (slide_id, icon_name, label, value, order_index) 
SELECT id, 'Award', '50+ ponentes', '50+', 3 FROM carousel_slides WHERE title = 'Congreso Internacional de Odontología 2024';

INSERT INTO carousel_slide_stats (slide_id, icon_name, label, value, order_index) 
SELECT id, 'TrendingUp', '40% descuento', '40%', 1 FROM carousel_slides WHERE title = 'Oferta Especial: 40% de Descuento';

INSERT INTO carousel_slide_stats (slide_id, icon_name, label, value, order_index) 
SELECT id, 'Play', '15+ cursos', '15+', 2 FROM carousel_slides WHERE title = 'Oferta Especial: 40% de Descuento';

INSERT INTO carousel_slide_stats (slide_id, icon_name, label, value, order_index) 
SELECT id, 'Calendar', 'Válido hasta fin de mes', 'Limitado', 3 FROM carousel_slides WHERE title = 'Oferta Especial: 40% de Descuento';

INSERT INTO carousel_slide_stats (slide_id, icon_name, label, value, order_index) 
SELECT id, 'Users', '10,000+ profesionales', '10,000+', 1 FROM carousel_slides WHERE title = 'Más de 10,000 Profesionales Capacitados';

INSERT INTO carousel_slide_stats (slide_id, icon_name, label, value, order_index) 
SELECT id, 'Award', '5,000+ certificados', '5,000+', 2 FROM carousel_slides WHERE title = 'Más de 10,000 Profesionales Capacitados';

INSERT INTO carousel_slide_stats (slide_id, icon_name, label, value, order_index) 
SELECT id, 'TrendingUp', '95% satisfacción', '95%', 3 FROM carousel_slides WHERE title = 'Más de 10,000 Profesionales Capacitados';
