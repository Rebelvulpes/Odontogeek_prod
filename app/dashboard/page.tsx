"use client"

import { Button } from "@/components/ui/button"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BookOpen, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
  progress: number
}

interface DashboardData {
  user: {
    first_name: string
    last_name: string
  }
  courses: Course[]
  statistics: {
    totalCourses: number
    completedCourses: number
    inProgressCourses: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        const response = await fetch("/api/student/dashboard")
        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.message || "Error al cargar los datos del dashboard.")
          if (result.error === "NO_SESSION") {
            window.location.assign("/auth/login")
          }
        }
      } catch (err) {
        setError("No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <DashboardLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const { user, courses, statistics } = data

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido de nuevo, {user.first_name}!</h1>
          <p className="text-gray-600 mt-1">Listo para continuar tu aprendizaje?</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalCourses}</div>
              <p className="text-xs text-muted-foreground">Total de cursos en tu biblioteca</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos en Progreso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.inProgressCourses}</div>
              <p className="text-xs text-muted-foreground">Cursos que has comenzado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.completedCourses}</div>
              <p className="text-xs text-muted-foreground">¡Sigue así!</p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Mis Cursos</h2>
          {courses.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link href={`/courses/${course.id}`} key={course.id}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                    <img
                      src={course.thumbnail_url || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-40 object-cover"
                    />
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    </CardContent>
                    <div className="p-6 pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                        <span>Progreso</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-xl font-semibold">Aún no tienes cursos</h3>
                <p className="text-gray-500 mt-2 mb-4">Explora nuestro catálogo y empieza a aprender hoy mismo.</p>
                <Link href="/courses">
                  <Button>Explorar Cursos</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

function DashboardLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-12 w-1/2 mb-2" />
      <Skeleton className="h-6 w-1/3 mb-8" />
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-1/4" />
          </CardContent>
        </Card>
      </div>
      <Skeleton className="h-8 w-1/4 mb-6" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <Skeleton className="h-40 w-full" />
            <CardHeader>
              <Skeleton className="h-6 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <div className="p-6 pt-0">
              <Skeleton className="h-2 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
