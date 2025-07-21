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

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Verificar autenticación
        const authUser = await checkAuthStatus()
        setUser(authUser)
        setAuthLoading(false)

        // Cargar cursos destacados
        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
            setFeaturedCourses([])
          } else if (courses) {
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

            setFeaturedCourses(coursesWithDetails)
          }
        }
      } catch (error) {
        console.error("Error cargando datos:", error)
        setFeaturedCourses([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Elementos flotantes animados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-indigo-200/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-18 h-18 bg-pink-200/30 rounded-full animate-pulse delay-500"></div>
      </div>

      <Navigation user={user} loading={authLoading} />

      {/* Hero Carousel */}
      <section className="relative">
        <HeroCarousel />
      </section>

      {/* News Ticker */}
      <NewsTicker />

      {/* Cursos Destacados */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Cursos Destacados
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Aprende con los Mejores
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Descubre nuestros cursos más populares y comienza tu viaje de aprendizaje hoy mismo
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, index) => (
                <Card
                  key={course.id}
                  className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={course.thumbnail_url || "/placeholder.jpg"}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                        <Play className="w-3 h-3 mr-1" />
                        {course.lessons?.length || 0} lecciones
                      </Badge>
                    </div>
                    {course.price === 0 && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                          Gratis
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {course.tags?.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-blue-500" />
                        <span>{course.duration_hours}h</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-green-500" />
                        <span>{course.students_count} estudiantes</span>
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
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 group">
                          Ver Curso
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in-up">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay cursos disponibles</h3>
              <p className="text-gray-500">Pronto tendremos nuevos cursos para ti</p>
            </div>
          )}

          <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
            <Link href="/courses">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 group"
              >
                Ver Todos los Cursos
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-20 bg-white/50 backdrop-blur-sm relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-teal-500 text-white border-0">
              <TrendingUp className="w-4 h-4 mr-2" />
              Nuestros Números
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              Impacto en Números
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {featuredCourses.length}+
                </h3>
                <p className="text-gray-600">Cursos Disponibles</p>
              </CardContent>
            </Card>

            <Card
              className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: "200ms" }}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                  {featuredCourses.reduce((total, course) => total + course.students_count, 0)}+
                </h3>
                <p className="text-gray-600">Estudiantes Activos</p>
              </CardContent>
            </Card>

            <Card
              className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: "400ms" }}
            >
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  100%
                </h3>
                <p className="text-gray-600">Satisfacción</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <Badge className="mb-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              Únete Hoy
            </Badge>
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              ¿Listo para Transformar tu Carrera?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Únete a miles de profesionales que ya están avanzando en sus carreras con nuestros cursos especializados
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white border-0 group"
                >
                  Explorar Cursos
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/nosotros">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-pink-600 text-pink-600 hover:bg-pink-50 group bg-transparent"
                >
                  Conocer Más
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="animate-fade-in-up">
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                OdontoGeek
              </h3>
              <p className="text-gray-300">Transformando la educación odontológica con tecnología de vanguardia</p>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <h4 className="font-semibold mb-4">Cursos</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/courses" className="hover:text-blue-400 transition-colors">
                    Todos los Cursos
                  </Link>
                </li>
                <li>
                  <Link href="/courses?filter=free" className="hover:text-blue-400 transition-colors">
                    Cursos Gratuitos
                  </Link>
                </li>
                <li>
                  <Link href="/courses?filter=premium" className="hover:text-blue-400 transition-colors">
                    Cursos Premium
                  </Link>
                </li>
              </ul>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/nosotros" className="hover:text-blue-400 transition-colors">
                    Nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-blue-400 transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-blue-400 transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link href="/help" className="hover:text-blue-400 transition-colors">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-blue-400 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                    Privacidad
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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
