"use client"

import { HeroCarousel } from "@/components/hero-carousel"
import { NewsTicker } from "@/components/news-ticker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award, Clock, Star, ArrowRight, Play, CheckCircle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: number
  level: string
  price: number
  thumbnail_url: string
  tags?: string[]
}

async function getFeaturedCourses(): Promise<Course[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("courses").select("*").eq("archived", false).limit(6)

    if (error) {
      console.error("Error fetching courses:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching courses:", error)
    return []
  }
}

export default async function HomePage() {
  const featuredCourses = await getFeaturedCourses()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Floating animated elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-indigo-200/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-pink-200/30 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Carousel */}
        <section className="animate-fade-in-up">
          <HeroCarousel />
        </section>

        {/* News Ticker */}
        <section className="animate-fade-in-up delay-200">
          <NewsTicker />
        </section>

        {/* Welcome Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 animate-fade-in-up delay-300">
          <div className="max-w-7xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Plataforma Líder en Educación Dental
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bienvenido a OdontoGeek
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              La plataforma educativa más completa para profesionales de la odontología. Accede a cursos especializados,
              certificaciones y contenido actualizado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 px-8 py-3 text-lg group"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Explorar Cursos
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/nosotros">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-8 py-3 text-lg group bg-transparent"
                >
                  Conoce Más
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 animate-fade-in-up delay-400">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {featuredCourses.length}+
                  </h3>
                  <p className="text-gray-600 font-medium">Cursos Especializados</p>
                </CardContent>
              </Card>

              <Card className="text-center bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    1,000+
                  </h3>
                  <p className="text-gray-600 font-medium">Estudiantes Activos</p>
                </CardContent>
              </Card>

              <Card className="text-center bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    500+
                  </h3>
                  <p className="text-gray-600 font-medium">Certificaciones Otorgadas</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 animate-fade-in-up delay-500">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Cursos Destacados
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Cursos Más Populares
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Descubre nuestros cursos más demandados por profesionales de la odontología
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, index) => (
                <Card
                  key={course.id}
                  className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={course.thumbnail_url || "/placeholder.jpg"}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                        {course.level}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700">
                        <Clock className="w-3 h-3 mr-1" />
                        {course.duration}min
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Por {course.instructor}</span>
                      <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ${course.price}
                      </span>
                    </div>
                    <Link href={`/courses/${course.id}`}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 group">
                        Ver Curso
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/courses">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-8 py-3 text-lg group bg-transparent"
                >
                  Ver Todos los Cursos
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm animate-fade-in-up delay-700">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-green-500 to-teal-500 text-white border-0 px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                ¿Por Qué Elegirnos?
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ventajas de Nuestra Plataforma
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Contenido Actualizado</h3>
                <p className="text-gray-600">Cursos actualizados con las últimas técnicas y tecnologías</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Instructores Expertos</h3>
                <p className="text-gray-600">Aprende de profesionales reconocidos en el campo</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Certificaciones</h3>
                <p className="text-gray-600">Obtén certificados reconocidos al completar los cursos</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Flexibilidad</h3>
                <p className="text-gray-600">Estudia a tu ritmo, cuando y donde quieras</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 animate-fade-in-up delay-800">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
              <CardContent className="py-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para Avanzar en tu Carrera?</h2>
                <p className="text-xl mb-8 text-blue-100">
                  Únete a miles de profesionales que ya están transformando su práctica odontológica
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/courses">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg group"
                    >
                      <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Comenzar Ahora
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/nosotros">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg group bg-transparent"
                    >
                      Más Información
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  OdontoGeek
                </h3>
                <p className="text-gray-400">La plataforma educativa líder para profesionales de la odontología.</p>
              </div>
              <div>
                <h4 className="text-md font-semibold mb-4">Cursos</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/courses" className="hover:text-white transition-colors">
                      Todos los Cursos
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses?level=beginner" className="hover:text-white transition-colors">
                      Principiante
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses?level=intermediate" className="hover:text-white transition-colors">
                      Intermedio
                    </Link>
                  </li>
                  <li>
                    <Link href="/courses?level=advanced" className="hover:text-white transition-colors">
                      Avanzado
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-md font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/nosotros" className="hover:text-white transition-colors">
                      Nosotros
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-white transition-colors">
                      Contacto
                    </Link>
                  </li>
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
              <div>
                <h4 className="text-md font-semibold mb-4">Soporte</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/help" className="hover:text-white transition-colors">
                      Centro de Ayuda
                    </Link>
                  </li>
                  <li>
                    <Link href="/faq" className="hover:text-white transition-colors">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/support" className="hover:text-white transition-colors">
                      Soporte Técnico
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 OdontoGeek. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        .delay-600 {
          animation-delay: 0.6s;
        }
        
        .delay-700 {
          animation-delay: 0.7s;
        }
        
        .delay-800 {
          animation-delay: 0.8s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
