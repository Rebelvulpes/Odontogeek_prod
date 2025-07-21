"use client"

import { HeroCarousel } from "@/components/hero-carousel"
import { NewsTicker } from "@/components/news-ticker"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Users,
  Award,
  Clock,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  TrendingUp,
  Globe,
  Shield,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface Course {
  id: string
  title: string
  description: string
  instructor_name: string
  price: number
  thumbnail_url: string
  difficulty_level: string
  duration_hours: number
  created_at: string
  status: string
}

async function getFeaturedCourses(): Promise<Course[]> {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables")
      return []
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
      .neq("archived", true)
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      console.error("Error fetching featured courses:", error)
      return []
    }

    return courses || []
  } catch (error) {
    console.error("Error in getFeaturedCourses:", error)
    return []
  }
}

async function getCourseStats(courseId: string) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get student count
    const { count: studentCount } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId)

    // Get lesson count
    const { count: lessonCount } = await supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId)
      .neq("archived", true)

    return {
      studentCount: studentCount || 0,
      lessonCount: lessonCount || 0,
      rating: 4.8, // Default rating
    }
  } catch (error) {
    console.error("Error getting course stats:", error)
    return {
      studentCount: 0,
      lessonCount: 0,
      rating: 4.8,
    }
  }
}

export default async function HomePage() {
  const featuredCourses = await getFeaturedCourses()

  // Get stats for each course
  const coursesWithStats = await Promise.all(
    featuredCourses.map(async (course) => {
      const stats = await getCourseStats(course.id)
      return {
        ...course,
        ...stats,
      }
    }),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-indigo-200/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-pink-200/30 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <Navigation />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* News Ticker */}
      <NewsTicker />

      {/* Featured Courses Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Cursos Destacados
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Aprende con los Mejores
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubre nuestra selección de cursos premium diseñados por expertos en odontología
            </p>
          </div>

          {coursesWithStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coursesWithStats.map((course, index) => (
                <div key={course.id} className="group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={course.thumbnail_url || "/placeholder.svg?height=200&width=400"}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4">
                          <Button
                            size="sm"
                            className="w-full bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Vista Previa
                          </Button>
                        </div>
                      </div>
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                        {course.difficulty_level || "Intermedio"}
                      </Badge>
                      {course.price === 0 && (
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                          Gratis
                        </Badge>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {course.duration_hours || 2}h
                        </Badge>
                        <div className="flex items-center text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm ml-1">{course.rating}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors duration-300">
                        {course.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="w-4 h-4 mr-1" />
                          {course.studentCount} estudiantes
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {course.lessonCount} lecciones
                        </div>
                      </div>

                      {course.instructor_name && (
                        <p className="text-sm text-gray-600 mb-4">
                          Por <span className="font-medium text-blue-600">{course.instructor_name}</span>
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {course.price === 0 ? "Gratis" : `$${course.price}`}
                        </div>
                        <Link href={`/courses/${course.id}`}>
                          <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 group">
                            Ver Curso
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in-up">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay cursos disponibles</h3>
              <p className="text-gray-500">Pronto tendremos nuevos cursos para ti</p>
            </div>
          )}

          <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Link href="/courses">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-8 group"
              >
                Ver Todos los Cursos
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-4 bg-white/20 text-white border-0">
              <TrendingUp className="w-4 h-4 mr-2" />
              Nuestros Números
            </Badge>
            <h2 className="text-4xl font-bold mb-4 text-white">Impacto en Números</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: BookOpen, number: `${coursesWithStats.length}+`, label: "Cursos Disponibles" },
              {
                icon: Users,
                number: `${coursesWithStats.reduce((total, course) => total + course.studentCount, 0)}+`,
                label: "Estudiantes Activos",
              },
              { icon: Award, number: "95%", label: "Tasa de Satisfacción" },
              { icon: Globe, number: "50+", label: "Países" },
            ].map((stat, index) => (
              <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-blue-500 text-white border-0">
              <CheckCircle className="w-4 h-4 mr-2" />
              ¿Por qué elegirnos?
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                La Mejor Experiencia de Aprendizaje
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Contenido Actualizado",
                description: "Cursos constantemente actualizados con las últimas técnicas y tecnologías en odontología",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Shield,
                title: "Certificación Oficial",
                description: "Obtén certificados reconocidos que validen tus conocimientos y habilidades profesionales",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Users,
                title: "Comunidad Activa",
                description: "Conecta con otros profesionales y comparte experiencias en nuestra comunidad global",
                color: "from-purple-500 to-pink-500",
              },
            ].map((feature, index) => (
              <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <Card className="h-full bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                  <CardContent className="p-8 text-center">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <Badge className="mb-6 bg-white/20 text-white border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Únete Hoy
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Listo para Transformar tu Carrera?</h2>
            <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
              Únete a miles de profesionales que ya están avanzando en sus carreras con nuestros cursos especializados
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 group">
                  Explorar Cursos
                  <BookOpen className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-purple-600 px-8 bg-transparent group"
                >
                  Registrarse Gratis
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="animate-fade-in-up">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                OdontoGeek
              </h3>
              <p className="text-gray-400 mb-4">La plataforma líder en educación odontológica online</p>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <h4 className="font-semibold mb-4">Cursos</h4>
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

            <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <h4 className="font-semibold mb-4">Empresa</h4>
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
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white transition-colors">
                    Carreras
                  </Link>
                </li>
              </ul>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
              <h4 className="font-semibold mb-4">Soporte</h4>
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

          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
