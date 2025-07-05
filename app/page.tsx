"use client"

import { HeroCarousel } from "@/components/hero-carousel"
import { Navigation } from "@/components/navigation"
import { NewsTicker } from "@/components/news-ticker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award, Clock, Star, ArrowRight, Play, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const featuredCourses = [
    {
      id: "1",
      title: "Implantología Básica",
      description: "Fundamentos esenciales de la implantología dental moderna",
      instructor: "Dr. Carlos Mendoza",
      duration: "8 horas",
      students: 245,
      rating: 4.8,
      price: 299,
      image: "/placeholder.svg?height=200&width=300&text=Implantología",
      tags: ["Implantes", "Básico"],
    },
    {
      id: "2",
      title: "Endodoncia Avanzada",
      description: "Técnicas avanzadas en tratamiento de conductos",
      instructor: "Dra. Ana García",
      duration: "12 horas",
      students: 189,
      rating: 4.9,
      price: 399,
      image: "/placeholder.svg?height=200&width=300&text=Endodoncia",
      tags: ["Endodoncia", "Avanzado"],
    },
    {
      id: "3",
      title: "Ortodoncia Digital",
      description: "Planificación digital en ortodoncia moderna",
      instructor: "Dr. Miguel Torres",
      duration: "10 horas",
      students: 156,
      rating: 4.7,
      price: 349,
      image: "/placeholder.svg?height=200&width=300&text=Ortodoncia",
      tags: ["Ortodoncia", "Digital"],
    },
  ]

  const stats = [
    { icon: Users, label: "Estudiantes", value: "2,500+" },
    { icon: BookOpen, label: "Cursos", value: "50+" },
    { icon: Award, label: "Certificaciones", value: "1,200+" },
    { icon: Star, label: "Calificación", value: "4.8/5" },
  ]

  const benefits = [
    {
      title: "Contenido Actualizado",
      description: "Cursos desarrollados con las últimas técnicas y tecnologías dentales",
      icon: CheckCircle,
    },
    {
      title: "Instructores Expertos",
      description: "Aprende de profesionales reconocidos en el campo de la odontología",
      icon: Award,
    },
    {
      title: "Certificación Oficial",
      description: "Obtén certificados reconocidos que validen tu formación profesional",
      icon: Badge,
    },
    {
      title: "Acceso de por Vida",
      description: "Una vez adquirido, tendrás acceso permanente al contenido del curso",
      icon: Clock,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <NewsTicker />

      {/* Hero Section */}
      <section className="relative">
        <HeroCarousel />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cursos Destacados</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre nuestros cursos más populares diseñados por expertos en odontología
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary">
                      <Play className="w-4 h-4 mr-2" />
                      Vista Previa
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                      <CardDescription className="text-sm">{course.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {course.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{course.instructor}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{course.students} estudiantes</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                    <Link href={`/courses/${course.id}`}>
                      <Button>
                        Ver Curso
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/courses">
              <Button size="lg" variant="outline">
                Ver Todos los Cursos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir OdontoGeek?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ofrecemos la mejor experiencia de aprendizaje en odontología con beneficios únicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <benefit.icon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para avanzar en tu carrera odontológica?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Únete a miles de profesionales que ya están transformando su práctica con nuestros cursos especializados
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" variant="secondary">
                Explorar Cursos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Registrarse Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="/images/odontogeek-logo-new.png"
                  alt="OdontoGeek"
                  className="h-8 w-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder-logo.svg"
                  }}
                />
                <span className="font-bold text-xl">OdontoGeek</span>
              </div>
              <p className="text-gray-400 mb-4">
                La plataforma líder en educación odontológica online. Cursos especializados para profesionales que
                buscan la excelencia.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/courses" className="hover:text-white">
                    Cursos
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacidad
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
