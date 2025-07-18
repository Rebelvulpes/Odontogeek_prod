"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Clock, Trophy, User, Play, AlertCircle, ShoppingCart, Star, Calendar } from "lucide-react"
import Link from "next/link"

interface DashboardData {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
    member_since: string
  }
  stats: {
    totalCourses: number
    completedCourses: number
    inProgressCourses: number
    notStartedCourses: number
    totalLessons: number
    averageProgress: number
  }
  enrollments: Array<{
    id: string
    progress: number
    enrolled_at: string
    completed_at: string | null
    courses: {
      id: string
      title: string
      description: string
      thumbnail_url: string | null
      price: number
      instructor: string
      duration_hours: number
      lessons: Array<{
        id: string
        title: string
        duration_minutes: number
      }>
    }
  }>
  hasEnrollments: boolean
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("🔄 Fetching dashboard data...")
        const response = await fetch("/api/student/dashboard", {
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        console.log("📡 Response status:", response.status)
        const result = await response.json()
        console.log("📊 Response data:", result)

        if (result.success) {
          setData(result.data)
          console.log("✅ Dashboard data loaded successfully")
        } else {
          console.error("❌ Dashboard API error:", result)
          if (result.error === "NO_SESSION") {
            console.log("🔄 Redirecting to login...")
            window.location.assign("/auth/login")
            return
          }
          setError(result.message || "Error al cargar el dashboard")
        }
      } catch (err) {
        console.error("❌ Dashboard fetch error:", err)
        setError("Error de conexión. Por favor, recarga la página.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      window.location.assign("/auth/login")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="h-16 w-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button onClick={() => window.location.reload()} className="w-full">
                Reintentar
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full bg-transparent">
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No se pudieron cargar los datos del dashboard.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const memberSince = new Date(data.user.member_since).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">¡Bienvenido, {data.user.first_name}!</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Miembro desde {memberSince}
              </p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Totales</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">Cursos inscritos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.completedCourses}</div>
              <p className="text-xs text-muted-foreground">Cursos terminados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.inProgressCourses}</div>
              <p className="text-xs text-muted-foreground">Cursos activos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.averageProgress}%</div>
              <p className="text-xs text-muted-foreground">Progreso general</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Mis Cursos</h2>

          {!data.hasEnrollments ? (
            /* Empty State - No Courses */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Welcome Card */}
              <Card className="lg:col-span-2">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <BookOpen className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Comienza tu viaje de aprendizaje!</h3>
                  <p className="text-gray-600 mb-6 max-w-md">
                    Aún no tienes cursos inscritos. Explora nuestro catálogo de cursos especializados en odontología y
                    comienza a desarrollar tus habilidades profesionales.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button asChild size="lg">
                      <Link href="/courses">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Explorar Cursos
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href="/courses">Ver Catálogo Completo</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    Certificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Obtén certificados reconocidos al completar nuestros cursos especializados.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Certificados oficiales</li>
                    <li>• Reconocimiento profesional</li>
                    <li>• Validez internacional</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-600" />
                    Aprendizaje Flexible
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Aprende a tu ritmo con contenido de alta calidad disponible 24/7.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Videos HD de alta calidad</li>
                    <li>• Acceso de por vida</li>
                    <li>• Soporte de expertos</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Enrolled Courses */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    {enrollment.courses.thumbnail_url ? (
                      <img
                        src={enrollment.courses.thumbnail_url || "/placeholder.svg"}
                        alt={enrollment.courses.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {enrollment.completed_at && (
                      <Badge className="absolute top-2 right-2" variant="default">
                        ✓ Completado
                      </Badge>
                    )}
                    {enrollment.progress === 0 && !enrollment.completed_at && (
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        Nuevo
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">{enrollment.courses.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{enrollment.courses.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {enrollment.courses.instructor}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {enrollment.courses.duration_hours}h
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/courses/${enrollment.courses.id}`}>
                        {enrollment.progress > 0 ? "Continuar Curso" : "Comenzar Curso"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
