"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Clock, CheckCircle, BookOpen, TrendingUp, User } from "lucide-react"

const enrolledCourses = [
  {
    id: 1,
    title: "Implantología Avanzada",
    progress: 65,
    totalLessons: 24,
    completedLessons: 16,
    nextLesson: "Técnicas de elevación sinusal",
    instructor: "Dr. María González",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 2,
    title: "Endodoncia Contemporánea",
    progress: 30,
    totalLessons: 18,
    completedLessons: 5,
    nextLesson: "Instrumentación rotatoria",
    instructor: "Dr. Carlos Ruiz",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
]

const recentActivity = [
  {
    type: "completed",
    title: "Completaste: Planificación en implantes",
    time: "Hace 2 horas",
    course: "Implantología Avanzada",
  },
  {
    type: "started",
    title: "Iniciaste: Anatomía del conducto radicular",
    time: "Ayer",
    course: "Endodoncia Contemporánea",
  },
  {
    type: "certificate",
    title: "Certificado obtenido: Fundamentos de Periodoncia",
    time: "Hace 3 días",
    course: "Periodoncia Básica",
  },
]

export default function DashboardPage() {
  const [user] = useState({
    name: "Dr. Juan Pérez",
    email: "juan@ejemplo.com",
    joinDate: "Enero 2024",
    completedCourses: 3,
    totalHours: 45,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto" />
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-blue-600 font-medium">
              Dashboard
            </Link>
            <Link href="/courses" className="text-gray-600 hover:text-blue-600">
              Explorar Cursos
            </Link>
            <Link href="/certificates" className="text-gray-600 hover:text-blue-600">
              Certificados
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido de vuelta, {user.name}!</h1>
          <p className="text-gray-600">Continúa tu actualización continua donde lo dejaste</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cursos Completados</p>
                  <p className="text-2xl font-bold text-gray-900">{user.completedCourses}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Horas de Estudio</p>
                  <p className="text-2xl font-bold text-gray-900">{user.totalHours}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Racha de Días</p>
                  <p className="text-2xl font-bold text-gray-900">7</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Mis Cursos</TabsTrigger>
            <TabsTrigger value="activity">Actividad Reciente</TabsTrigger>
            <TabsTrigger value="progress">Progreso</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Cursos en Progreso</h2>
              <Link href="/courses">
                <Button variant="outline">Explorar Más Cursos</Button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden">
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>Por {course.instructor}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progreso</span>
                          <span>
                            {course.completedLessons}/{course.totalLessons} lecciones
                          </span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Siguiente:</p>
                          <p className="text-sm text-gray-600">{course.nextLesson}</p>
                        </div>
                        <Link href={`/courses/${course.id}/watch`}>
                          <Button size="sm">
                            <Play className="w-4 h-4 mr-2" />
                            Continuar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Actividad Reciente</h2>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === "completed"
                            ? "bg-green-100"
                            : activity.type === "started"
                              ? "bg-blue-100"
                              : "bg-yellow-100"
                        }`}
                      >
                        {activity.type === "completed" && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {activity.type === "started" && <Play className="w-4 h-4 text-blue-600" />}
                        {activity.type === "certificate" && <CheckCircle className="w-4 h-4 text-yellow-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.course}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Tu Progreso</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas de Aprendizaje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tiempo total de estudio</span>
                    <Badge variant="secondary">{user.totalHours} horas</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Promedio semanal</span>
                    <Badge variant="secondary">8 horas</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cursos completados</span>
                    <Badge variant="secondary">{user.completedCourses}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Certificados obtenidos</span>
                    <Badge variant="secondary">2</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximos Objetivos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completar Implantología Avanzada</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Obtener certificación en Endodoncia</span>
                      <span>30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
