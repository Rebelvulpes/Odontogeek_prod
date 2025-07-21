import { Suspense } from "react"
import { getServerUser } from "@/lib/server-utils"
import { getServerSupabaseClient } from "@/lib/server-utils"
import { Navigation } from "@/components/navigation"
import { HeroCarousel } from "@/components/hero-carousel"
import { NewsTicker } from "@/components/news-ticker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Award, TrendingUp, Star, Clock, Play, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Loading component for suspense
function StatsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Stats component that fetches data
async function StatsSection() {
  try {
    const supabase = getServerSupabaseClient()

    // Fetch stats with error handling
    const [coursesResult, usersResult, enrollmentsResult] = await Promise.allSettled([
      supabase.from("courses").select("id", { count: "exact" }),
      supabase.from("users").select("id", { count: "exact" }),
      supabase.from("enrollments").select("id", { count: "exact" }),
    ])

    const coursesCount = coursesResult.status === "fulfilled" ? coursesResult.value.count || 0 : 0
    const usersCount = usersResult.status === "fulfilled" ? usersResult.value.count || 0 : 0
    const enrollmentsCount = enrollmentsResult.status === "fulfilled" ? enrollmentsResult.value.count || 0 : 0

    const stats = [
      {
        title: "Cursos Disponibles",
        value: coursesCount.toString(),
        icon: BookOpen,
        color: "from-blue-500 to-cyan-500",
      },
      {
        title: "Estudiantes Activos",
        value: usersCount.toString(),
        icon: Users,
        color: "from-green-500 to-emerald-500",
      },
      {
        title: "Inscripciones",
        value: enrollmentsCount.toString(),
        icon: Award,
        color: "from-purple-500 to-pink-500",
      },
      {
        title: "Tasa de Éxito",
        value: "95%",
        icon: TrendingUp,
        color: "from-orange-500 to-red-500",
      },
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden backdrop-blur-sm bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  } catch (error) {
    console.error("Error fetching stats:", error)
    // Fallback stats
    const fallbackStats = [
      { title: "Cursos Disponibles", value: "12", icon: BookOpen, color: "from-blue-500 to-cyan-500" },
      { title: "Estudiantes Activos", value: "500+", icon: Users, color: "from-green-500 to-emerald-500" },
      { title: "Inscripciones", value: "1,200", icon: Award, color: "from-purple-500 to-pink-500" },
      { title: "Tasa de Éxito", value: "95%", icon: TrendingUp, color: "from-orange-500 to-red-500" },
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {fallbackStats.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden backdrop-blur-sm bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
}

// Featured courses component
async function FeaturedCourses() {
  try {
    const supabase = getServerSupabaseClient()
    const { data: courses, error } = await supabase.from("courses").select("*").eq("archived", false).limit(3)

    if (error) {
      console.error("Error fetching courses:", error)
      return <div className="text-center text-gray-500">No se pudieron cargar los cursos</div>
    }

    if (!courses || courses.length === 0) {
      return <div className="text-center text-gray-500">No hay cursos disponibles</div>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {courses.map((course, index) => (
          <Card
            key={course.id}
            className="group relative overflow-hidden backdrop-blur-sm bg-white/80 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative h-48 overflow-hidden">
              <Image
                src={course.thumbnail_url || "/placeholder.jpg"}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <Badge className="absolute top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                {course.difficulty_level || "Intermedio"}
              </Badge>
            </div>
            <CardHeader className="relative">
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {course.title}
              </CardTitle>
              <CardDescription className="text-gray-600 line-clamp-2">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration || "4 semanas"}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    <span>4.8</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">${course.price || "99"}</div>
              </div>
              <Link href={`/courses/${course.id}`}>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 group">
                  <Play className="h-4 w-4 mr-2" />
                  Ver Curso
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  } catch (error) {
    console.error("Error in FeaturedCourses:", error)
    return <div className="text-center text-gray-500">Error al cargar los cursos</div>
  }
}

export default async function HomePage() {
  const user = await getServerUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Floating elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navigation user={user} />

      <main className="relative">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                  OdontoGeek
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transforma tu práctica odontológica con cursos especializados en tecnología dental de vanguardia
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/courses">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Explorar Cursos
                  </Button>
                </Link>
                {!user && (
                  <Link href="/auth/register">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-4 text-lg border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white transition-all duration-300 hover:-translate-y-1 bg-transparent"
                    >
                      Comenzar Gratis
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Hero Carousel */}
            <div className="mb-16">
              <HeroCarousel />
            </div>

            {/* News Ticker */}
            <div className="mb-16">
              <NewsTicker />
            </div>

            {/* Stats Section */}
            <Suspense fallback={<StatsLoading />}>
              <StatsSection />
            </Suspense>

            {/* Featured Courses */}
            <section className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Cursos Destacados
                  </span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Descubre nuestros cursos más populares y comienza tu transformación digital hoy
                </p>
              </div>
              <Suspense fallback={<div className="text-center">Cargando cursos...</div>}>
                <FeaturedCourses />
              </Suspense>
            </section>

            {/* CTA Section */}
            <section className="text-center py-16">
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl max-w-4xl mx-auto">
                <CardContent className="p-12">
                  <h2 className="text-4xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ¿Listo para revolucionar tu práctica?
                    </span>
                  </h2>
                  <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Únete a miles de profesionales que ya están transformando su práctica odontológica con tecnología de
                    vanguardia
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/courses">
                      <Button
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg border-0"
                      >
                        Ver Todos los Cursos
                      </Button>
                    </Link>
                    <Link href="/nosotros">
                      <Button
                        size="lg"
                        variant="outline"
                        className="px-8 py-4 text-lg border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white bg-transparent"
                      >
                        Conoce Más
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </section>
      </main>
    </div>
  )
}
