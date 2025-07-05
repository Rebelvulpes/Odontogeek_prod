"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Award, Play } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { RouteGuard } from "@/components/route-guard"

interface EnrolledCourse {
  id: string
  title: string
  description: string
  instructor: string
  thumbnail_url?: string
  progress: number
  total_lessons: number
  completed_lessons: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulated enrolled courses data
    const mockEnrolledCourses: EnrolledCourse[] = [
      {
        id: "1",
        title: "Endodoncia Avanzada",
        description: "Técnicas modernas en tratamiento de conductos",
        instructor: "Dr. María González",
        thumbnail_url: "/placeholder.jpg",
        progress: 65,
        total_lessons: 12,
        completed_lessons: 8,
      },
      {
        id: "2",
        title: "Implantología Básica",
        description: "Fundamentos de implantes dentales",
        instructor: "Dr. Carlos Rodríguez",
        thumbnail_url: "/placeholder.jpg",
        progress: 30,
        total_lessons: 15,
        completed_lessons: 4,
      },
    ]

    setEnrolledCourses(mockEnrolledCourses)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Bienvenido, {user?.name}</h1>
            <p className="text-gray-600 mt-2">Continúa con tu aprendizaje y alcanza tus objetivos</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{enrolledCourses.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Horas Completadas</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificados</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
              </CardContent>
            </Card>
          </div>

          {/* Enrolled Courses */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mis Cursos</h2>
              <Button asChild>
                <Link href="/courses">Explorar Más Cursos</Link>
              </Button>
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={course.thumbnail_url || "/placeholder.jpg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.jpg"
                        }}
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                      <p className="text-sm text-gray-600">Instructor: {course.instructor}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progreso</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>

                        <div className="flex justify-between text-sm text-gray-600">
                          <span>
                            {course.completed_lessons} de {course.total_lessons} lecciones
                          </span>
                        </div>

                        <Button asChild className="w-full">
                          <Link href={`/courses/${course.id}`}>
                            <Play className="w-4 h-4 mr-2" />
                            Continuar Curso
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cursos inscritos</h3>
                  <p className="text-gray-600 mb-6">Explora nuestro catálogo y comienza tu aprendizaje</p>
                  <Button asChild>
                    <Link href="/courses">Explorar Cursos</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}
