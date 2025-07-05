"use client"

import { RouteGuard } from "@/components/route-guard"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Award, Play, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

const DashboardPage = () => {
  // Datos de ejemplo - en una app real vendrían de la API
  const enrolledCourses = [
    {
      id: "1",
      title: "Implantología Avanzada",
      instructor: "Dr. María González",
      progress: 65,
      totalLessons: 24,
      completedLessons: 16,
      thumbnail: "/placeholder.svg?height=200&width=300&text=Implantología",
      nextLesson: "Técnicas de Inserción",
      timeSpent: "8.5 horas",
      rating: 4.9,
    },
    {
      id: "2",
      title: "Endodoncia Contemporánea",
      instructor: "Dr. Carlos Ruiz",
      progress: 30,
      totalLessons: 18,
      completedLessons: 5,
      thumbnail: "/placeholder.svg?height=200&width=300&text=Endodoncia",
      nextLesson: "Preparación del Conducto",
      timeSpent: "3.2 horas",
      rating: 4.8,
    },
  ]

  const achievements = [
    { name: "Primer Curso Completado", icon: Award, earned: true },
    { name: "Estudiante Dedicado", icon: Clock, earned: true },
    { name: "Experto en Implantes", icon: Star, earned: false },
    { name: "Maestro de la Endodoncia", icon: BookOpen, earned: false },
  ]

  const stats = [
    { label: "Cursos Inscritos", value: "2", icon: BookOpen },
    { label: "Horas de Estudio", value: "11.7", icon: Clock },
    { label: "Certificados", value: "0", icon: Award },
    { label: "Progreso Promedio", value: "47%", icon: CheckCircle },
  ]

  return (
    <RouteGuard requireAuth={true} requireRole="student">
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Panel de Aprendizaje</h1>
            <p className="text-gray-600">Continúa tu formación profesional</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <stat.icon className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enrolled Courses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Mis Cursos
                  </CardTitle>
                  <CardDescription>Continúa donde lo dejaste</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <img
                          src={course.thumbnail || "/placeholder.svg"}
                          alt={course.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                              <p className="text-sm text-gray-600">Por {course.instructor}</p>
                              <div className="flex items-center mt-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                                <span className="text-sm text-gray-600">{course.rating}</span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="ml-2">
                              {course.progress}% completado
                            </Badge>
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>
                                {course.completedLessons} de {course.totalLessons} lecciones
                              </span>
                              <span>{course.timeSpent}</span>
                            </div>
                            <Progress value={course.progress} className="h-2 mb-3" />

                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">Siguiente:</p>
                                <p className="text-sm font-medium">{course.nextLesson}</p>
                              </div>
                              <Link href={`/courses/${course.id}`}>
                                <Button size="sm" className="flex items-center">
                                  <Play className="w-4 h-4 mr-2" />
                                  Continuar
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="text-center pt-4">
                    <Link href="/courses">
                      <Button variant="outline">Explorar Más Cursos</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Completaste "Preparación del Sitio Quirúrgico"</p>
                        <p className="text-xs text-gray-500">Hace 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Iniciaste "Implantología Avanzada"</p>
                        <p className="text-xs text-gray-500">Hace 3 días</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Te inscribiste en "Endodoncia Contemporánea"</p>
                        <p className="text-xs text-gray-500">Hace 1 semana</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Logros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${achievement.earned ? "bg-yellow-100" : "bg-gray-100"}`}>
                          <achievement.icon
                            className={`w-5 h-5 ${achievement.earned ? "text-yellow-600" : "text-gray-400"}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${achievement.earned ? "text-gray-900" : "text-gray-500"}`}
                          >
                            {achievement.name}
                          </p>
                        </div>
                        {achievement.earned && <CheckCircle className="w-5 h-5 text-green-500" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Learning Goals */}
              <Card>
                <CardHeader>
                  <CardTitle>Metas de Aprendizaje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Horas semanales</span>
                        <span className="text-sm text-gray-600">8/10</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Cursos este mes</span>
                        <span className="text-sm text-gray-600">2/3</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/courses">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Explorar Cursos
                    </Button>
                  </Link>
                  <Link href="/certificates">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Award className="w-4 h-4 mr-2" />
                      Mis Certificados
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  )
}

export default DashboardPage
