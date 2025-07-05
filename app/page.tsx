import { Navigation } from "@/components/navigation"
import { HeroCarousel } from "@/components/hero-carousel"
import { NewsTicker } from "@/components/news-ticker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Award, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

      {/* News Ticker */}
      <NewsTicker />

      {/* Hero Section */}
      <section className="relative">
        <HeroCarousel />
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir OdontoGeek?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos la mejor educación en odontología con instructores expertos y contenido actualizado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Cursos Especializados</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Contenido actualizado y especializado en las últimas técnicas odontológicas
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Instructores Expertos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Aprende de profesionales reconocidos en el campo de la odontología</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Certificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Obtén certificados reconocidos que validen tus nuevas habilidades</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Aprende a tu Ritmo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Acceso 24/7 a todo el contenido para que estudies cuando quieras</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Comienza tu Formación Hoy</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a miles de profesionales que han mejorado sus habilidades con nuestros cursos
          </p>
          <div className="space-x-4">
            <Button asChild size="lg" variant="secondary">
              <Link href="/courses">Ver Cursos</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">OdontoGeek</h3>
              <p className="text-gray-400">La plataforma líder en educación odontológica online</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Cursos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/courses" className="hover:text-white">
                    Todos los Cursos
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
                    Implantología
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Términos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Política de Privacidad
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
