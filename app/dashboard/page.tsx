"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { RouteGuard } from "@/components/route-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Award, Play, CheckCircle, User } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [loading, setLoading] = useState(true)

  // Datos de ejemplo para el dashboard del estudiante
  const mockCourses = [
    {
      id: "1",
      title: "Implantología Básica",
      description: "Fundamentos esenciales de la implantología dental moderna",
      instructor: "Dr. Carlos Mendoza",
      progress: 65,
      totalLessons: 12,
      completedLessons: 8,
      thumbnail: "/placeholder.svg?height=200&width=300&text=Implantología",
      status: "in_progress",
    },
    {
      id: "2",
      title: "Endodoncia Avanzada",
      description: "Técnicas avanzadas en tratamiento de conductos",
      instructor: "Dra. Ana García",
      progress: 100,
      totalLessons: 15,
      completedLessons: 15,
      thumbnail: "/placeholder.svg?height=200&width=300&text=Endodoncia",
      status: "completed",
    },
    {
      id: "3",
      title: "Ortodoncia Digital",
      description: "Planificación digital en ortodoncia moderna",
      instructor: "Dr. Miguel Torres",
      progress: 25,
      totalLessons: 10,
      completedLessons: 3,
      thumbnail: "/placeholder.svg?height=200&width=300&text=Ortodoncia",
      status: "in_progress",
    },
  ]

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setEnrolledCourses(mockCourses)
      setLoading(false)
    }, 1000)
  }, [])

  const stats = {
    totalCourses: enrolledCourses.length,
    completedCourses: enrolledCourses.filter((course) => course.status === "completed").length,
    inProgressCourses: enrolledCourses.filter((course) => course.status === "in_progress").length,
    totalHours: 45, // Ejemplo
  }

  if (loading) {
    return (
      <RouteGuard requireAuth={true} requireRole="student">
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando dashboard...</p>
            </div>
          </div>
        </div>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard requireAuth={true} requireRole="student">
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mi Dashboard</h1>
            <p className="text-gray-600 mt-2">Gestiona tu progreso y continúa aprendiendo</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cursos Inscritos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completados</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">En Progreso</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.inProgressCourses}</p>
                  </div>
                  <Play className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Horas Totales</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalHours}</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Mis Cursos</h2>
                <Link href="/courses">
                  <Button variant="outline">Explorar Más Cursos</Button>
                </Link>
              </div>

              <div className="space-y-6">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-32 md:h-auto bg-gray-100">
                        <img
                          src={course.thumbnail || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <User className="w-4 h-4 mr-1" />
                              <span>{course.instructor}</span>
                            </div>
                          </div>
                          <Badge variant={course.status === "completed" ? "default" : "secondary"}>
                            {course.status === "completed" ? "Completado" : "En Progreso"}
                          </Badge>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span>Progreso del curso</span>
                            <span>
                              {course.completedLessons}/{course.totalLessons} lecciones
                            </span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                          <div className="text-right text-sm text-gray-500 mt-1">{course.progress}%</div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {course.status === "completed" ? (
                              <div className="flex items-center text-green-600">
                                <Award className="w-4 h-4 mr-1" />
                                <span>Certificado disponible</span>
                              </div>
                            ) : (
                              <span>{course.totalLessons - course.completedLessons} lecciones restantes</span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {course.status === "completed" && (
                              <Button variant="outline" size="sm">
                                <Award className="w-4 h-4 mr-2" />
                                Certificado
                              </Button>
                            )}
                            <Link href={`/courses/${course.id}`}>
                              <Button size="sm">
                                {course.status === "completed" ? "Revisar" : "Continuar"}
                                <Play className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Completaste "Técnicas de Sutura"</p>
                        <p className="text-xs text-gray-500">Hace 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Iniciaste "Planificación Digital"</p>
                        <p className="text-xs text-gray-500">Ayer</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Obtuviste certificado en Endodoncia</p>
                        <p className="text-xs text-gray-500">Hace 3 días</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Logros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Award className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Primer Curso Completado</p>
                        <p className="text-xs text-gray-500">Endodoncia Avanzada</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Estudiante Activo</p>
                        <p className="text-xs text-gray-500">3 cursos en progreso</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/courses">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Explorar Cursos
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Award className="w-4 h-4 mr-2" />
                    Mis Certificados
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <User className="w-4 h-4 mr-2" />
                    Perfil
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}
