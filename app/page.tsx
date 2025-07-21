"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, BookOpen, Play, Award, TrendingUp } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { HeroCarousel } from "@/components/hero-carousel"
import { NewsTicker } from "@/components/news-ticker"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
}

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

// Función para verificar el estado de autenticación
async function checkAuthStatus(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.user) {
        return data.user
      }
    }
    return null
  } catch (error) {
    console.error("Error checking auth status:", error)
    return null
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
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />

      {/* Hero Section with Carousel */}
      <section className="relative">
        <HeroCarousel />
      </section>

      {/* News Ticker */}
      <NewsTicker />

      {/* Featured Courses Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cursos Destacados</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestros cursos más populares y comienza tu journey de aprendizaje hoy mismo
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
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
              {featuredCourses.map((course) => (
                <Card key={course.id} className="group hover:shadow-lg transition-shadow duration-300">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={course.thumbnail_url || "/placeholder.jpg"}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.jpg"
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-900">
                        ${course.price}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{course.description}</p>
                    </div>

                    {/* Tags */}
                    {course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {course.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{course.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{course.duration_hours}h</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{course.students_count}</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          <span>{course.lessons.length} lecciones</span>
                        </div>
                      </div>
                    </div>

                    {/* Instructor */}
                    {course.instructor_name && (
                      <p className="text-sm text-gray-600 mb-4">
                        Por <span className="font-medium">{course.instructor_name}</span>
                      </p>
                    )}

                    {/* Action Button */}
                    <Link href={`/courses/${course.id}`}>
                      <Button className="w-full group-hover:bg-blue-700 transition-colors">
                        <Play className="w-4 h-4 mr-2" />
                        Ver Curso
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Próximamente</h3>
              <p className="text-gray-600 mb-6">Estamos preparando cursos increíbles para ti. ¡Mantente atento!</p>
              <Link href="/courses">
                <Button>Explorar Catálogo</Button>
              </Link>
            </div>
          )}

          {featuredCourses.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/courses">
                <Button variant="outline" size="lg">
                  Ver Todos los Cursos
                  <BookOpen className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Por qué elegir OdontoGeek?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              La plataforma líder en educación odontológica con las mejores herramientas y contenido
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contenido Actualizado</h3>
              <p className="text-gray-600">Cursos actualizados con las últimas técnicas y tecnologías odontológicas</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Certificación Oficial</h3>
              <p className="text-gray-600">
                Obtén certificados reconocidos que validen tus conocimientos profesionales
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progreso Personalizado</h3>
              <p className="text-gray-600">Sigue tu progreso y recibe recomendaciones personalizadas de aprendizaje</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para impulsar tu carrera odontológica?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Únete a miles de profesionales que ya están transformando su práctica con nuestros cursos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/courses">
              <Button size="lg" variant="secondary">
                Explorar Cursos
              </Button>
            </Link>
            {!user && (
              <Link href="/auth/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  Crear Cuenta Gratis
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto mb-4" />
              <p className="text-gray-400">La plataforma líder en educación odontológica continua</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Cursos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/courses" className="hover:text-white">
                    Todos los Cursos
                  </Link>
                </li>
                <li>
                  <Link href="/courses?tags=endodoncia" className="hover:text-white">
                    Endodoncia
                  </Link>
                </li>
                <li>
                  <Link href="/courses?tags=ortodoncia" className="hover:text-white">
                    Ortodoncia
                  </Link>
                </li>
                <li>
                  <Link href="/courses?tags=cirugia" className="hover:text-white">
                    Cirugía
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-white">
                    Centro de Ayuda
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
            <div>
              <h4 className="font-semibold mb-4">Síguenos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    YouTube
                  </a>
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
