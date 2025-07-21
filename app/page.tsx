"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, BookOpen, Play, Award, TrendingUp, Sparkles, ArrowRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { HeroCarousel } from "@/components/hero-carousel"
import { NewsTicker } from "@/components/news-ticker"
import { createClient } from "@supabase/supabase-js"
import { checkAuthStatus, type User } from "@/lib/auth-utils"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Course {
  id: string
  title: string
  description: string
  price: number
  duration_hours: number
  thumbnail_url: string
  instructor_name: string
  students_count: number
  tags: Array<{
    id: string
    name: string
    slug: string
    color: string
  }>
  lessons: Array<{
    id: string
    title: string
    duration_minutes: number
    is_free: boolean
  }>
}

async function getFeaturedCourses(): Promise<Course[]> {
  try {
    // Obtener cursos publicados y no archivados
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        price,
        duration_hours,
        thumbnail_url,
        instructor_name,
        created_at,
        status
      `)
      .eq("status", "published")
      .neq("archived", true)
      .order("created_at", { ascending: false })
      .limit(3)

    if (coursesError) {
      console.error("Error obteniendo cursos:", coursesError)
      return []
    }

    if (!courses || courses.length === 0) {
      return []
    }

    // Procesar cada curso para obtener datos adicionales
    const coursesWithDetails = await Promise.all(
      courses.map(async (course) => {
        // Obtener etiquetas del curso
        const { data: courseTags } = await supabase
          .from("course_tags")
          .select(`
            tags (
              id,
              name,
              slug,
              color
            )
          `)
          .eq("course_id", course.id)

        // Obtener lecciones del curso
        const { data: lessons } = await supabase
          .from("lessons")
          .select(`
            id,
            title,
            duration_minutes,
            is_free
          `)
          .eq("course_id", course.id)
          .neq("archived", true)
          .order("order_index", { ascending: true })

        // Obtener número de estudiantes inscritos
        const { count: studentsCount } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        return {
          ...course,
          lessons: lessons || [],
          students_count: studentsCount || 0,
          tags: courseTags?.map((relation) => relation.tags).filter(Boolean) || [],
        }
      }),
    )

    return coursesWithDetails
  } catch (error) {
    console.error("Error fetching featured courses:", error)
    return []
  }
}

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // Verificar autenticación
      const authUser = await checkAuthStatus()
      setUser(authUser)
      setAuthLoading(false)

      // Cargar cursos destacados
      const courses = await getFeaturedCourses()
      setFeaturedCourses(courses)
      setLoading(false)
    }

    loadData()
  }, [])

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

      {/* Hero Section with Carousel */}
      <section className="relative overflow-hidden animate-fade-in-up">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-50 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-30 animate-pulse delay-1000" />
        <HeroCarousel />
      </section>

      {/* News Ticker */}
      <NewsTicker />

      {/* Featured Courses Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm animate-fade-in-up delay-300">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Educación Odontológica de Excelencia
            </Badge>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cursos Destacados
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubre nuestros cursos más populares y comienza tu journey de aprendizaje hoy mismo
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, index) => (
                <Card
                  key={course.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up shadow-lg"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-t-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
                    <img
                      src={course.thumbnail_url || "/placeholder.jpg"}
                      alt={course.title}
                      className="relative w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.jpg"
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg">
                        ${course.price}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">{course.description}</p>
                    </div>

                    {/* Tags */}
                    {course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.tags.slice(0, 2).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs border-blue-200 text-blue-600 bg-blue-50"
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {course.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs border-purple-200 text-purple-600 bg-purple-50">
                            +{course.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-blue-500" />
                          <span>{course.duration_hours}h</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-green-500" />
                          <span>{course.students_count}</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1 text-purple-500" />
                          <span>{course.lessons.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Instructor */}
                    {course.instructor_name && (
                      <p className="text-sm text-gray-600 mb-4">
                        Por <span className="font-medium text-blue-600">{course.instructor_name}</span>
                      </p>
                    )}

                    {/* Action Button */}
                    <Link href={`/courses/${course.id}`}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 group-hover:shadow-lg">
                        <Play className="w-4 h-4 mr-2" />
                        Ver Curso
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Próximamente
                </span>
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Estamos preparando cursos increíbles para ti. ¡Mantente atento!
              </p>
              <Link href="/courses">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Explorar Catálogo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {featuredCourses.length > 0 && (
            <div className="text-center mt-16 animate-fade-in-up">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Ver Todos los Cursos
                  <BookOpen className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 animate-fade-in-up delay-600">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              ¿Por qué elegir{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                OdontoGeek?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              La plataforma líder en educación odontológica con las mejores herramientas y contenido
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Contenido Actualizado",
                description: "Cursos actualizados con las últimas técnicas y tecnologías odontológicas",
                color: "from-blue-500 to-blue-600",
                iconColor: "text-blue-600",
              },
              {
                icon: Award,
                title: "Certificación Oficial",
                description: "Obtén certificados reconocidos que validen tus conocimientos profesionales",
                color: "from-green-500 to-green-600",
                iconColor: "text-green-600",
              },
              {
                icon: TrendingUp,
                title: "Progreso Personalizado",
                description: "Sigue tu progreso y recibe recomendaciones personalizadas de aprendizaje",
                color: "from-purple-500 to-purple-600",
                iconColor: "text-purple-600",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up shadow-lg"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden animate-fade-in-up delay-900">
        <div className="absolute top-10 right-10 w-24 h-24 bg-white/10 rounded-full animate-pulse" />
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/5 rounded-full animate-pulse delay-1000" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div>
            <h2 className="text-4xl font-bold mb-6">¿Listo para impulsar tu carrera odontológica?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
              Únete a miles de profesionales que ya están transformando su práctica con nuestros cursos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Explorar Cursos
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              {!user && (
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 bg-transparent backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Crear Cuenta Gratis
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="animate-fade-in-up">
              <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto mb-4" />
              <p className="text-gray-400 leading-relaxed">La plataforma líder en educación odontológica continua</p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <h4 className="font-semibold mb-4 text-white">Cursos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/courses" className="hover:text-white transition-colors">
                    Todos los Cursos
                  </Link>
                </li>
                <li>
                  <Link href="/courses?tags=endodoncia" className="hover:text-white transition-colors">
                    Endodoncia
                  </Link>
                </li>
                <li>
                  <Link href="/courses?tags=ortodoncia" className="hover:text-white transition-colors">
                    Ortodoncia
                  </Link>
                </li>
                <li>
                  <Link href="/courses?tags=cirugia" className="hover:text-white transition-colors">
                    Cirugía
                  </Link>
                </li>
              </ul>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <h4 className="font-semibold mb-4 text-white">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Términos
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacidad
                  </Link>
                </li>
              </ul>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
              <h4 className="font-semibold mb-4 text-white">Síguenos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    YouTube
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div
            className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 animate-fade-in-up"
            style={{ animationDelay: "800ms" }}
          >
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
        
        .delay-300 { animation-delay: 300ms; }
        .delay-600 { animation-delay: 600ms; }
        .delay-900 { animation-delay: 900ms; }
        .delay-1000 { animation-delay: 1000ms; }
        .delay-2000 { animation-delay: 2000ms; }
      `}</style>
    </div>
  )
}
