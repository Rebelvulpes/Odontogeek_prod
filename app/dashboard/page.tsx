"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Clock, Award, Camera, Play, CheckCircle, Download } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
  instructor: string
  total_lessons: number
  completed_lessons: number
  progress_percentage: number
  enrolled_at: string
  status: string
  is_completed: boolean
}

interface UserStats {
  activeCourses: number
  completedCourses: number
  totalHours: number
  certificates: number
}

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string | null
  created_at: string
}

export default function DashboardPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [stats, setStats] = useState<UserStats>({
    activeCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    certificates: 0,
  })
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Obtener información del usuario actual
      const userResponse = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (!userResponse.ok) {
        window.location.href = "/auth/login"
        return
      }

      const userData = await userResponse.json()
      setProfile(userData.user)

      // Obtener cursos del estudiante
      const coursesResponse = await fetch("/api/student/courses", {
        credentials: "include",
      })

      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json()
        setCourses(coursesData.courses || [])

        // Calcular estadísticas
        const activeCourses = coursesData.courses?.filter((c: Course) => !c.is_completed).length || 0
        const completedCourses = coursesData.courses?.filter((c: Course) => c.is_completed).length || 0
        const totalHours = coursesData.courses?.reduce((acc: number, c: Course) => acc + c.total_lessons * 0.5, 0) || 0

        setStats({
          activeCourses,
          completedCourses,
          totalHours: Math.round(totalHours),
          certificates: completedCourses,
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (formData: FormData) => {
    setUpdating(true)
    try {
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        body: formData,
        credentials: "include",
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setProfile(updatedUser.user)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    updateProfile(formData)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Dashboard</h1>
          <p className="text-gray-600">Bienvenido de vuelta, {profile?.first_name}</p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile?.avatar_url || ""} />
          <AvatarFallback>{profile ? getInitials(profile.first_name, profile.last_name) : "U"}</AvatarFallback>
        </Avatar>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}</div>
            <p className="text-xs text-muted-foreground">En progreso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">Cursos finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas de Estudio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}</div>
            <p className="text-xs text-muted-foreground">Tiempo invertido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates}</div>
            <p className="text-xs text-muted-foreground">Obtenidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses">Mis Cursos</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
        </TabsList>

        {/* Mis Cursos Tab */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mis Cursos</CardTitle>
              <CardDescription>Continúa tu aprendizaje donde lo dejaste</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cursos inscritos</h3>
                  <p className="text-gray-600 mb-4">Explora nuestro catálogo y comienza tu aprendizaje</p>
                  <Button asChild>
                    <a href="/courses">Explorar Cursos</a>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Card key={course.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img
                          src={course.thumbnail_url || "/placeholder.jpg"}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        {course.is_completed && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completado
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Progreso</span>
                            <span>{Math.round(course.progress_percentage)}%</span>
                          </div>
                          <Progress value={course.progress_percentage} className="h-2" />

                          <div className="flex justify-between text-sm text-gray-600">
                            <span>
                              {course.completed_lessons}/{course.total_lessons} lecciones
                            </span>
                            <span>Por {course.instructor}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button asChild className="flex-1">
                            <a href={`/courses/${course.id}`}>
                              <Play className="w-4 h-4 mr-2" />
                              {course.is_completed ? "Revisar" : "Continuar"}
                            </a>
                          </Button>
                          {course.is_completed && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progreso Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Progreso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Tasa de Finalización</span>
                  <span className="font-semibold">
                    {stats.activeCourses + stats.completedCourses > 0
                      ? Math.round((stats.completedCourses / (stats.activeCourses + stats.completedCourses)) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Horas Totales</span>
                  <span className="font-semibold">{stats.totalHours}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Lecciones Completadas</span>
                  <span className="font-semibold">
                    {courses.reduce((acc, course) => acc + course.completed_lessons, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                {courses.length > 0 ? (
                  <div className="space-y-3">
                    {courses.slice(0, 3).map((course) => (
                      <div key={course.id} className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded overflow-hidden">
                          <img
                            src={course.thumbnail_url || "/placeholder.jpg"}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{course.title}</p>
                          <p className="text-xs text-gray-600">{Math.round(course.progress_percentage)}% completado</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No hay actividad reciente</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Perfil Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>Actualiza tu información personal</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="text-lg">
                      {profile ? getInitials(profile.first_name, profile.last_name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" variant="outline">
                      <Camera className="w-4 h-4 mr-2" />
                      Cambiar Foto
                    </Button>
                    <p className="text-sm text-gray-600 mt-2">JPG, PNG o GIF. Máximo 2MB.</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">Nombre</Label>
                    <Input id="first_name" name="first_name" defaultValue={profile?.first_name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Apellido</Label>
                    <Input id="last_name" name="last_name" defaultValue={profile?.last_name} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={profile?.email} required />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información de Cuenta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tipo de cuenta:</span>
                      <p className="font-medium">Estudiante</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Miembro desde:</span>
                      <p className="font-medium">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={updating}>
                  {updating ? "Actualizando..." : "Guardar Cambios"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
