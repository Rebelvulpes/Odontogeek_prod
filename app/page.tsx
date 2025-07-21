"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { HeroCarousel } from "@/components/hero-carousel"
import { NewsTicker } from "@/components/news-ticker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award, Clock, Star, Play, CheckCircle, TrendingUp, Heart, Shield, Zap } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  price: number
  thumbnail_url: string | null
  difficulty_level: string
  duration_hours: number
  tags: Array<{
    id: string
    name: string
    color: string
  }>
}

interface CarouselSlide {
  id: string
  title: string
  description: string
  image_url: string
  link_url: string | null
  is_active: boolean
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, carouselResponse] = await Promise.all([fetch("/api/courses"), fetch("/api/carousel")])

        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json()
          setCourses(coursesData.courses || [])
        }

        if (carouselResponse.ok) {
          const carouselData = await carouselResponse.json()
          setCarouselSlides(carouselData.slides || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "principiante":
        return "bg-green-100 text-green-800"
      case "intermedio":
        return "bg-yellow-100 text-yellow-800"
      case "avanzado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Floating animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-pink-200/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-indigo-200/30 rounded-full animate-pulse delay-500"></div>
      </div>

      <Navigation user={user} />

      {/* News Ticker */}
      <NewsTicker />

      {/* Hero Section */}
      <section className="relative py-20 px-4 animate-fade-in-up">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 mb-6 animate-fade-in-up delay-200">
              <Zap className="w-4 h-4 mr-2" />
              Plataforma Educativa Líder
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up delay-300">
              OdontoGeek
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in-up delay-400">
              Descubre el futuro de la educación odontológica con cursos especializados, tecnología de vanguardia y una
              comunidad de profesionales apasionados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-500">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                asChild
              >
                <Link href="/courses">
                  <Play className="w-5 h-5 mr-2" />
                  Explorar Cursos
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 bg-transparent"
                asChild
              >
                <Link href="/nosotros">
                  <Heart className="w-5 h-5 mr-2" />
                  Conoce Más
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Carousel */}
      {carouselSlides.length > 0 && (
        <section className="py-12 px-4 animate-fade-in-up delay-600">
          <div className="container mx-auto">
            <HeroCarousel slides={carouselSlides} />
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 px-4 animate-fade-in-up delay-700">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{courses.length}+</h3>
                <p className="text-gray-600">Cursos Disponibles</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">1,000+</h3>
                <p className="text-gray-600">Estudiantes Activos</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
                <p className="text-gray-600">Certificaciones</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">4.9</h3>
                <p className="text-gray-600">Calificación Promedio</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-4 animate-fade-in-up delay-800">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 mb-4">
              <TrendingUp className="w-4 h-4 mr-2" />
              Cursos Destacados
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Aprende con los Mejores
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre nuestros cursos más populares diseñados por expertos en odontología
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 6).map((course, index) => (
                <Card
                  key={course.id}
                  className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={course.thumbnail_url || "/placeholder.jpg"}
                      alt={course.title}
                      width={400}
                      height={200}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <Badge className={`absolute top-4 left-4 ${getDifficultyColor(course.difficulty_level)}`}>
                      {course.difficulty_level}
                    </Badge>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration_hours}h
                      </div>
                      <div className="text-lg font-bold text-blue-600">${course.price}</div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {course.tags?.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      asChild
                    >
                      <Link href={`/courses/${course.id}`}>
                        <Play className="w-4 h-4 mr-2" />
                        Ver Curso
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 bg-transparent"
              asChild
            >
              <Link href="/courses">Ver Todos los Cursos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600/5 to-purple-600/5 animate-fade-in-up delay-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 mb-4">
              <Shield className="w-4 h-4 mr-2" />
              ¿Por qué elegirnos?
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Experiencia de Aprendizaje Superior
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contenido Certificado</h3>
                <p className="text-gray-600">
                  Todos nuestros cursos están desarrollados por profesionales certificados con años de experiencia en el
                  campo odontológico.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Aprendizaje Interactivo</h3>
                <p className="text-gray-600">
                  Videos de alta calidad, ejercicios prácticos y evaluaciones que te ayudarán a dominar cada concepto
                  paso a paso.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Comunidad Activa</h3>
                <p className="text-gray-600">
                  Únete a una comunidad de profesionales donde podrás compartir experiencias, resolver dudas y crecer
                  junto a otros colegas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 animate-fade-in-up delay-1000">
        <div className="container mx-auto text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-4xl font-bold text-white mb-6">¿Listo para Transformar tu Carrera?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Únete a miles de profesionales que ya están avanzando en sus carreras con nuestros cursos
                especializados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  asChild
                >
                  <Link href="/auth/register">Comenzar Ahora</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 bg-transparent"
                  asChild
                >
                  <Link href="/courses">Explorar Cursos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                OdontoGeek
              </h3>
              <p className="text-gray-300 mb-4">
                La plataforma educativa líder en odontología, conectando profesionales con conocimiento de vanguardia.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Cursos</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/courses" className="hover:text-blue-400 transition-colors">
                    Todos los Cursos
                  </Link>
                </li>
                <li>
                  <Link href="/courses?level=principiante" className="hover:text-blue-400 transition-colors">
                    Principiante
                  </Link>
                </li>
                <li>
                  <Link href="/courses?level=intermedio" className="hover:text-blue-400 transition-colors">
                    Intermedio
                  </Link>
                </li>
                <li>
                  <Link href="/courses?level=avanzado" className="hover:text-blue-400 transition-colors">
                    Avanzado
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/nosotros" className="hover:text-blue-400 transition-colors">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-blue-400 transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-blue-400 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/ayuda" className="hover:text-blue-400 transition-colors">
                    Ayuda
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/privacidad" className="hover:text-blue-400 transition-colors">
                    Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="/terminos" className="hover:text-blue-400 transition-colors">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-blue-400 transition-colors">
                    Cookies
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

        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
        .delay-700 { animation-delay: 700ms; }
        .delay-800 { animation-delay: 800ms; }
        .delay-900 { animation-delay: 900ms; }
        .delay-1000 { animation-delay: 1000ms; }
      `}</style>
    </div>
  )
}
