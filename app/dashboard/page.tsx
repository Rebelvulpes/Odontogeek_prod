"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  User,
  Calendar,
  ShoppingCart,
  GraduationCap,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
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
  completed_at: string | null
  course: Course
}

interface DashboardStats {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  totalProgress: number
}

interface DashboardData {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
  }
  stats: DashboardStats
  enrollments: Enrollment[]
  recentActivity: any[]
  hasEnrollments: boolean
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
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
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if not authenticated
          router.push("/auth/login")
          return
        }
        throw new Error(data.message || "Error al cargar el dashboard")
      }

      if (data.success) {
        setDashboardData(data.data)
      } else {
        throw new Error(data.message || "Error al cargar los datos")
      }
    } catch (error) {
      console.error("Dashboard error:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
      // Force redirect even if logout fails
      router.push("/auth/login")
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button onClick={fetchDashboardData} variant="outline" className="flex-1 bg-transparent">
                Reintentar
              </Button>
              <Button onClick={handleLogout} variant="destructive" className="flex-1">
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No se pudieron cargar los datos del dashboard</p>
            <Button onClick={fetchDashboardData} className="w-full mt-4">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">OdontoGeek</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {dashboardData.user.first_name} {dashboardData.user.last_name}
                </span>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido, {dashboardData.user.first_name}!</h2>
          <p className="text-gray-600">
            {dashboardData.hasEnrollments
              ? "Continúa tu aprendizaje donde lo dejaste"
              : "Comienza tu viaje de aprendizaje explorando nuestros cursos"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.stats.totalCourses === 0 ? "Ningún curso inscrito" : "Total de cursos"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.inProgressCourses}</div>
              <p className="text-xs text-muted-foreground">Cursos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.completedCourses}</div>
              <p className="text-xs text-muted-foreground">Cursos finalizados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.totalProgress}%</div>
              <p className="text-xs text-muted-foreground">Progreso general</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {dashboardData.hasEnrollments ? (
          <EnrolledCoursesSection enrollments={dashboardData.enrollments} />
        ) : (
          <EmptyStateSection />
        )}
      </main>
    </div>
  )
}

function EnrolledCoursesSection({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Mis Cursos</h3>
        <Link href="/courses">
          <Button variant="outline" size="sm">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Explorar Más Cursos
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => (
          <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="aspect-video bg-gray-200 rounded-md mb-3 overflow-hidden">
                {enrollment.course.thumbnail_url ? (
                  <img
                    src={enrollment.course.thumbnail_url || "/placeholder.svg"}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
              <CardDescription className="line-clamp-2">{enrollment.course.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Instructor: {enrollment.course.instructor}</span>
                <Badge variant="secondary">{enrollment.course.level}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso</span>
                  <span>{enrollment.progress || 0}%</span>
                </div>
                <Progress value={enrollment.progress || 0} className="h-2" />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Inscrito: {new Date(enrollment.enrolled_at).toLocaleDateString("es-ES")}</span>
              </div>

              <Link href={`/courses/${enrollment.course.id}`}>
                <Button className="w-full">{enrollment.progress === 0 ? "Comenzar Curso" : "Continuar Curso"}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function EmptyStateSection() {
  return (
    <div className="text-center py-12">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 pb-8">
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Comienza tu viaje de aprendizaje!</h3>
            <p className="text-gray-600 mb-6">
              Aún no tienes cursos inscritos. Explora nuestra amplia selección de cursos de odontología y comienza a
              aprender hoy mismo.
            </p>
          </div>

          <div className="space-y-4">
            <Link href="/courses">
              <Button size="lg" className="w-full sm:w-auto">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Explorar Cursos Disponibles
              </Button>
            </Link>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-sm text-gray-600">
              <div className="flex flex-col items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                <span className="font-medium">Cursos Especializados</span>
                <span className="text-xs">Contenido de alta calidad</span>
              </div>
              <div className="flex flex-col items-center">
                <Trophy className="h-8 w-8 text-blue-600 mb-2" />
                <span className="font-medium">Certificaciones</span>
                <span className="text-xs">Obtén certificados oficiales</span>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="h-8 w-8 text-blue-600 mb-2" />
                <span className="font-medium">A tu Ritmo</span>
                <span className="text-xs">Aprende cuando quieras</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
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
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="aspect-video w-full rounded-md mb-3" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
