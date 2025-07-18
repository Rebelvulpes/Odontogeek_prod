"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Clock, Trophy, User, Play, AlertCircle } from "lucide-react"
import Link from "next/link"

interface DashboardData {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
  }
  stats: {
    totalCourses: number
    completedCourses: number
    inProgressCourses: number
    totalLessons: number
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
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/student/dashboard", {
          credentials: "include",
        })

        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          if (result.error === "NO_SESSION") {
            // Redirect to login if no session
            window.location.assign("/auth/login")
            return
          }
          setError(result.message || "Error al cargar el dashboard")
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err)
        setError("Error de conexión. Por favor, recarga la página.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No se pudieron cargar los datos del dashboard.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">¡Hola, {data.user.first_name}!</h1>
          <p className="text-muted-foreground">Continúa tu aprendizaje y alcanza tus objetivos profesionales.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <CardTitle className="text-sm font-medium">Lecciones</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.totalLessons}</div>
              <p className="text-xs text-muted-foreground">Lecciones disponibles</p>
            </CardContent>
          </Card>
        </div>

        {/* Courses */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Mis Cursos</h2>

          {data.enrollments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes cursos inscritos</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Explora nuestro catálogo de cursos y comienza tu aprendizaje.
                </p>
                <Button asChild>
                  <Link href="/courses">Explorar Cursos</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="overflow-hidden">
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
                      <Badge className="absolute top-2 right-2" variant="secondary">
                        Completado
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
                        {enrollment.progress > 0 ? "Continuar" : "Comenzar"}
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
