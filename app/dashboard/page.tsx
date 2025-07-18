"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Clock, Users, TrendingUp, ShoppingCart, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  price: number
  instructor: string
  duration: string
  level: string
  created_at: string
}

interface Enrollment {
  id: string
  enrolled_at: string
  progress: number
  completed: boolean
  course: Course
}

interface DashboardData {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
  }
  enrolledCourses: Enrollment[]
  availableCourses: Course[]
  stats: {
    totalCourses: number
    completedCourses: number
    inProgressCourses: number
    totalProgress: number
  }
  errors: {
    enrolledCoursesError: string | null
    availableCoursesError: string | null
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/student/dashboard", {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login")
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || "Error al cargar el dashboard")
      }
    } catch (error) {
      console.error("Dashboard error:", error)
      setError("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDashboardData} className="mt-4">
          Reintentar
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>No se pudieron cargar los datos del dashboard.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">¡Hola, {data.user.first_name || data.user.email}! 👋</h1>
        <p className="text-gray-600 mt-2">Bienvenido a tu panel de aprendizaje</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.totalCourses === 0 ? "¡Inscríbete a tu primer curso!" : "Cursos en tu biblioteca"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.completedCourses === 0 ? "¡Completa tu primer curso!" : "Cursos terminados"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.inProgressCourses}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.inProgressCourses === 0 ? "Comienza a estudiar" : "Cursos activos"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progreso Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalProgress}%</div>
            <Progress value={data.stats.totalProgress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      {data.enrolledCourses.length > 0 ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mis Cursos</CardTitle>
            <CardDescription>Continúa donde lo dejaste</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.enrolledCourses.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      {enrollment.course.thumbnail_url ? (
                        <img
                          src={enrollment.course.thumbnail_url || "/placeholder.svg"}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{enrollment.course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progreso</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} />
                      <div className="flex items-center justify-between">
                        <Badge variant={enrollment.completed ? "default" : "secondary"}>
                          {enrollment.completed ? "Completado" : "En progreso"}
                        </Badge>
                        <Button asChild size="sm">
                          <Link href={`/courses/${enrollment.course.id}`}>
                            {enrollment.completed ? "Revisar" : "Continuar"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardHeader className="text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <CardTitle>¡Comienza tu Aprendizaje!</CardTitle>
            <CardDescription>
              Aún no tienes cursos inscritos. Explora nuestro catálogo y encuentra el curso perfecto para ti.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="lg">
              <Link href="/courses">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Explorar Cursos
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Available Courses */}
      {data.availableCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Cursos Recomendados</CardTitle>
            <CardDescription>Descubre nuevos cursos que podrían interesarte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.availableCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Instructor: {course.instructor}</span>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Duración: {course.duration}</span>
                        <span className="font-semibold text-lg">€{course.price}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Link href={`/courses/${course.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </Link>
                        </Button>
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/courses/${course.id}/checkout`}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Comprar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-6">
              <Button asChild variant="outline">
                <Link href="/courses">Ver Todos los Cursos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Messages */}
      {(data.errors.enrolledCoursesError || data.errors.availableCoursesError) && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>
            {data.errors.enrolledCoursesError && (
              <div>Error cargando cursos inscritos: {data.errors.enrolledCoursesError}</div>
            )}
            {data.errors.availableCoursesError && (
              <div>Error cargando cursos disponibles: {data.errors.availableCoursesError}</div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="aspect-video w-full mb-3" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-2 w-full mb-3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
