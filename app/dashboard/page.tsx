"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Clock, Award, Camera, Play, CheckCircle, Download } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
  duration_hours: number
  instructor: string
  price: number
  enrollment: {
    id: string
    status: string
    progress_percentage: number
    completed_at: string | null
    last_accessed_at: string | null
    created_at: string
  }
  lessons: {
    total: number
    completed: number
    list: any[]
  }
  is_completed: boolean
}

interface Student {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  avatar_url: string | null
  created_at: string
}

export default function DashboardPage() {
  const [student, setStudent] = useState<Student | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  })
  const { toast } = useToast()

  // Cargar datos del usuario y cursos
  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar información del usuario
        const userResponse = await fetch("/api/auth/me")
        if (userResponse.ok) {
          const userData = await userResponse.json()
          if (userData.success) {
            setStudent(userData.user)
            setProfileData({
              first_name: userData.user.first_name,
              last_name: userData.user.last_name,
              email: userData.user.email,
            })
          }
        }

        // Cargar cursos del estudiante
        const coursesResponse = await fetch("/api/student/courses")
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json()
          if (coursesData.success) {
            setCourses(coursesData.data)
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del dashboard",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Actualizar perfil
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)

    try {
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      const result = await response.json()

      if (result.success) {
        setStudent(result.user)
        toast({
          title: "Perfil actualizado",
          description: "Tu información ha sido actualizada exitosamente",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "No se pudo actualizar el perfil",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Error de conexión al actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setProfileLoading(false)
    }
  }

  // Calcular estadísticas
  const stats = {
    activeCourses: courses.filter((c) => !c.is_completed).length,
    completedCourses: courses.filter((c) => c.is_completed).length,
    totalHours: courses.reduce((acc, course) => acc + (course.duration_hours || 0), 0),
    certificates: courses.filter((c) => c.is_completed).length,
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta, {student?.first_name} {student?.last_name}
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas de Estudio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificados</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates}</div>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Mis Cursos</TabsTrigger>
          <TabsTrigger value="progress">Progreso</TabsTrigger>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
        </TabsList>

        {/* Pestaña Mis Cursos */}
        <TabsContent value="courses" className="space-y-4">
          {courses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes cursos inscritos</h3>
                <p className="text-muted-foreground mb-4">Explora nuestro catálogo y comienza a aprender</p>
                <Button asChild>
                  <Link href="/courses">Explorar Cursos</Link>
                </Button>
              </CardContent>
            </Card>
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
                    {course.is_completed && <Badge className="absolute top-2 right-2 bg-green-500">Completado</Badge>}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span>{Math.round(course.enrollment.progress_percentage)}%</span>
                      </div>
                      <Progress value={course.enrollment.progress_percentage} />
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        {course.lessons.completed}/{course.lessons.total} lecciones
                      </span>
                      <span>{course.duration_hours}h</span>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link href={`/courses/${course.id}`}>
                          <Play className="w-4 h-4 mr-2" />
                          Continuar
                        </Link>
                      </Button>
                      {course.is_completed && (
                        <Button variant="outline" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pestaña Progreso */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Progreso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Tasa de Finalización</span>
                  <span className="font-semibold">
                    {courses.length > 0 ? Math.round((stats.completedCourses / courses.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total de Lecciones</span>
                  <span className="font-semibold">
                    {courses.reduce((acc, course) => acc + course.lessons.total, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lecciones Completadas</span>
                  <span className="font-semibold">
                    {courses.reduce((acc, course) => acc + course.lessons.completed, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <p className="text-muted-foreground">No hay actividad reciente</p>
                ) : (
                  <div className="space-y-3">
                    {courses
                      .sort(
                        (a, b) =>
                          new Date(b.enrollment.last_accessed_at || b.enrollment.created_at).getTime() -
                          new Date(a.enrollment.last_accessed_at || a.enrollment.created_at).getTime(),
                      )
                      .slice(0, 3)
                      .map((course) => (
                        <div key={course.id} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{course.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(course.enrollment.progress_percentage)}% completado
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pestaña Perfil */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu información personal y de contacto</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={student?.avatar_url || ""} />
                      <AvatarFallback className="text-lg">
                        {student ? getInitials(student.first_name, student.last_name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      Cambiar Foto
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Nombre</Label>
                      <Input
                        id="first_name"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Apellido</Label>
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? "Actualizando..." : "Actualizar Perfil"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de Cuenta</span>
                  <Badge variant="secondary">Estudiante</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Miembro desde</span>
                  <span>{student?.created_at ? new Date(student.created_at).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cursos Inscritos</span>
                  <span>{courses.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
