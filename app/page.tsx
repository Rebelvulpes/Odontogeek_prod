import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Play, Users, Star } from "lucide-react"
import { HeroCarousel } from "@/components/hero-carousel"
import { NewsTicker } from "@/components/news-ticker"

async function getFeaturedCourses() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/courses?limit=3`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch courses")
    }

    const result = await response.json()

    if (result.success && result.data?.courses) {
      return result.data.courses
    }

    return []
  } catch (error) {
    console.error("Error fetching featured courses:", error)
    return []
  }
}

export default async function HomePage() {
  const featuredCourses = await getFeaturedCourses()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header - Mobile optimized */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo - Mobile optimized */}
            <div className="flex-shrink-0">
              <img
                src="/images/odontogeek-logo-new.png"
                alt="OdontoGeek"
                className="h-8 sm:h-10 md:h-12 w-auto max-w-[120px] sm:max-w-[150px] md:max-w-[200px]"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
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

            {/* Auth Buttons - Mobile optimized */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                  Registrarse
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* News Ticker */}
      <NewsTicker />

      {/* Hero Carousel Section */}
      <section className="relative overflow-hidden">
        <HeroCarousel />
      </section>

      {/* Features - Mobile optimized */}
      <section className="py-12 sm:py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">¿Por qué elegir OdontoGeek?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Expertos Reconocidos</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Aprende de los mejores especialistas en odontología con años de experiencia clínica
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Certificación Oficial</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Obtén certificados reconocidos que avalen tu formación continua profesional
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Acceso 24/7</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Estudia a tu ritmo con acceso ilimitado a todos los contenidos desde cualquier dispositivo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses - Mobile optimized */}
      <section className="py-12 sm:py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Cursos Destacados</h2>

          {featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-200 relative">
                    <img
                      src={course.thumbnail_url || "/placeholder.svg?height=200&width=300"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=300&text=Imagen+no+disponible"
                      }}
                    />
                    <Badge className="absolute top-3 right-3 bg-blue-600 text-xs sm:text-sm">${course.price}</Badge>
                  </div>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">{course.title}</CardTitle>
                    <CardDescription className="text-sm">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mb-4">
                      <span>{course.duration_hours} horas</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current mr-1" />
                        <span>4.9</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">{course.students_count} estudiantes</span>
                      <Link href={`/courses/${course.id}`}>
                        <Button size="sm" className="text-xs sm:text-sm">
                          Ver Curso
                        </Button>
                      </Link>
                    </div>
                    {course.instructor_name && (
                      <div className="mt-2 text-xs text-gray-500">Instructor: {course.instructor_name}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-600">Próximamente</h3>
              <p className="text-gray-500 mb-6">Estamos preparando cursos increíbles para ti. ¡Mantente atento!</p>
              <Link href="/courses">
                <Button>Explorar Todos los Cursos</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Mobile optimized */}
      <section className="py-16 sm:py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            Comienza tu Actualización Continua Hoy
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
            Únete a más de 10,000 profesionales que ya han mejorado sus habilidades con OdontoGeek
          </p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-sm sm:text-base lg:text-lg px-6 sm:px-8 py-3">
              Registrarse Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer - Mobile optimized */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="/images/odontogeek-logo-new.png"
                  alt="OdontoGeek"
                  className="h-8 sm:h-10 w-auto brightness-0 invert"
                />
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-2">
                La plataforma líder en actualización continua odontológica
              </p>
              <p className="text-xs sm:text-sm text-gray-500">Actualización continua.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Cursos</h3>
              <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
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
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Empresa</h3>
              <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
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
              <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Soporte</h3>
              <ul className="space-y-2 text-gray-400 text-xs sm:text-sm">
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
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-xs sm:text-sm">&copy; 2024 OdontoGeek. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
