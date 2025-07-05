"use client"

import { Navigation } from "@/components/navigation"
import { HeroCarousel } from "@/components/hero-carousel"
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
      title: "Implantología Avanzada",
      description: "Técnicas modernas de implantes dentales con casos clínicos reales",
      instructor: "Dr. María González",
      price: 299,
      originalPrice: 399,
      duration: "12 horas",
      lessons: 24,
      rating: 4.9,
      students: 1250,
      image: "/placeholder.svg?height=300&width=400&text=Implantología",
      tags: ["Implantes", "Cirugía", "Avanzado"],
      featured: true,
    },
    {
      id: "2",
      title: "Endodoncia Contemporánea",
      description: "Protocolos actualizados en tratamiento de conductos",
      instructor: "Dr. Carlos Ruiz",
      price: 199,
      originalPrice: 249,
      duration: "8 horas",
      lessons: 18,
      rating: 4.8,
      students: 890,
      image: "/placeholder.svg?height=300&width=400&text=Endodoncia",
      tags: ["Endodoncia", "Tratamiento", "Técnicas"],
      featured: false,
    },
    {
      id: "3",
      title: "Ortodoncia Digital",
      description: "Planificación y tratamiento con tecnología 3D",
      instructor: "Dra. Ana Martín",
      price: 399,
      originalPrice: 499,
      duration: "15 horas",
      lessons: 20,
      rating: 4.9,
      students: 650,
      image: "/placeholder.svg?height=300&width=400&text=Ortodoncia",
      tags: ["Ortodoncia", "Digital", "3D"],
      featured: true,
    },
  ]

  const stats = [
    { icon: Users, label: "Estudiantes Activos", value: "15,000+" },
    { icon: BookOpen, label: "Cursos Disponibles", value: "120+" },
    { icon: Award, label: "Certificaciones", value: "8,500+" },
    { icon: Star, label: "Calificación Promedio", value: "4.8/5" },
  ]

  const features = [
    {
      icon: Play,
      title: "Videos en HD",
      description: "Contenido de alta calidad con resolución 4K",
    },
    {
      icon: CheckCircle,
      title: "Certificación",
      description: "Obtén certificados reconocidos al completar los cursos",
    },
    {
      icon: Clock,
      title: "Acceso 24/7",
      description: "Aprende a tu ritmo, cuando y donde quieras",
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Conecta con otros profesionales de la odontología",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* News Ticker */}
      <NewsTicker />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cursos Destacados</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestros cursos más populares, diseñados por expertos para impulsar tu carrera profesional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredCourses.map((course) => (
              <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {course.featured && (
                    <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">Destacado</Badge>
                  )}
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                    {course.duration}
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {course.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">{course.title}</CardTitle>
                  <CardDescription className="text-sm">{course.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>Por {course.instructor}</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{course.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{course.students.toLocaleString()} estudiantes</span>
                    <span>{course.lessons} lecciones</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                      {course.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">${course.originalPrice}</span>
                      )}
                    </div>
                    <Link href={`/courses/${course.id}`}>
                      <Button size="sm" className="group/btn">
                        Ver Curso
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/courses">
              <Button size="lg" variant="outline" className="group bg-transparent">
                Ver Todos los Cursos
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir OdontoGeek?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos la mejor experiencia de aprendizaje online para profesionales de la odontología
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-6 group-hover:bg-blue-200 transition-colors">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para impulsar tu carrera?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de profesionales que ya están transformando su práctica odontológica
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" variant="secondary" className="group">
                Explorar Cursos
                <BookOpen className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
              >
                Crear Cuenta Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto mb-4" />
              <p className="text-gray-400 text-sm">La plataforma líder en educación odontológica online</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Cursos</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/courses" className="hover:text-white transition-colors">
                    Todos los Cursos
                  </Link>
                </li>
                <li>
                  <Link href="/courses?category=implantologia" className="hover:text-white transition-colors">
                    Implantología
                  </Link>
                </li>
                <li>
                  <Link href="/courses?category=endodoncia" className="hover:text-white transition-colors">
                    Endodoncia
                  </Link>
                </li>
                <li>
                  <Link href="/courses?category=ortodoncia" className="hover:text-white transition-colors">
                    Ortodoncia
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Términos
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 OdontoGeek. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
