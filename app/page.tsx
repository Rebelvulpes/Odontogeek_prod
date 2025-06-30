import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Play, Users, Star } from "lucide-react"
import { HeroCarousel } from "@/components/hero-carousel"
import { NewsTicker } from "@/components/news-ticker"

const featuredCourses = [
  {
    id: 1,
    title: "Implantología Avanzada",
    description: "Técnicas modernas de implantes dentales con casos clínicos reales",
    price: 299,
    duration: "12 horas",
    students: 1250,
    rating: 4.9,
    image: "/placeholder.svg?height=200&width=300",
    instructor: "Dr. María González",
  },
  {
    id: 2,
    title: "Endodoncia Contemporánea",
    description: "Protocolos actualizados en tratamiento de conductos",
    price: 199,
    duration: "8 horas",
    students: 890,
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=300",
    instructor: "Dr. Carlos Ruiz",
  },
  {
    id: 3,
    title: "Ortodoncia Digital",
    description: "Planificación y tratamiento con tecnología 3D",
    price: 399,
    duration: "15 horas",
    students: 650,
    rating: 4.9,
    image: "/placeholder.svg?height=200&width=300",
    instructor: "Dra. Ana Martín",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/images/odontogeek-logo.png" alt="OdontoGeek" className="max-w-md max-h-64-m-44" />
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/courses" className="text-gray-600 hover:text-blue-600 transition-colors">
              Cursos
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              Nosotros
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              Contacto
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Link href="/auth/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* News Ticker */}
      <NewsTicker />

      {/* Hero Carousel Section */}
      <section className="relative overflow-hidden">
        <HeroCarousel />
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir OdontoGeek?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expertos Reconocidos</h3>
              <p className="text-gray-600">
                Aprende de los mejores especialistas en odontología con años de experiencia clínica
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Certificación Oficial</h3>
              <p className="text-gray-600">
                Obtén certificados reconocidos que avalen tu formación continua profesional
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Acceso 24/7</h3>
              <p className="text-gray-600">
                Estudia a tu ritmo con acceso ilimitado a todos los contenidos desde cualquier dispositivo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Cursos Destacados</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 right-3 bg-blue-600">${course.price}</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{course.duration}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{course.students} estudiantes</span>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm">Ver Curso</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Comienza tu Actualización Continua Hoy</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Únete a más de 10,000 profesionales que ya han mejorado sus habilidades con OdontoGeek
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Registrarse Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/images/odontogeek-logo.png" alt="OdontoGeek" className="h-10 w-auto brightness-0 invert" />
              </div>
              <p className="text-gray-400">La plataforma líder en actualización continua odontológica</p>
              <p className="text-sm text-gray-500 mt-2">Actualización continua.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Cursos</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/courses" className="hover:text-white">
                    Implantología
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="hover:text-white">
                    Endodoncia
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="hover:text-white">
                    Ortodoncia
                  </Link>
                </li>
                <li>
                  <Link href="/courses" className="hover:text-white">
                    Periodoncia
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contactar
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 OdontoGeek. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
