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
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  Download,
  UserIcon,
  MailIcon,
  CalendarIcon,
  CameraIcon,
} from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  instructor: string
  total_lessons: number
  completed_lessons: number
  progress_percentage: number
  enrolled_at: string
  status: string
  is_completed: boolean
}

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url: string | null
  role: string
  created_at: string
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("courses")

  // Estados para el formulario de perfil
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    fetchUserData()
    fetchCourses()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me")
      const data = await response.json()

      if (data.success) {
        setUserProfile(data.user)
        setFirstName(data.user.first_name)
        setLastName(data.user.last_name)
        setEmail(data.user.email)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del usuario",
        variant: "destructive",
      })
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/student/courses")
      const data = await response.json()

      if (data.success) {
        setCourses(data.courses)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)

    try {
      const formData = new FormData()
      formData.append("first_name", firstName)
      formData.append("last_name", lastName)
      formData.append("email", email)

      const response = await fetch("/api/student/profile", {
        method: "PUT",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setUserProfile(data.user)
        toast({
          title: "Éxito",
          description: "Perfil actualizado correctamente",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
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
    totalHours: courses.reduce((acc, course) => acc + course.total_lessons * 0.5, 0), // Estimado
    certificates: courses.filter((c) => c.is_completed).length,
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Mi Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido de vuelta, {userProfile?.first_name || "Estudiante"}</p>
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
              <Award className="h-4 w-4 text-muted-foreground" />
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
              <div className="text-2xl font-bold">{Math.round(stats.totalHours)}</div>
              <p className="text-xs text-muted-foreground">Tiempo invertido</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.certificates}</div>
              <p className="text-xs text-muted-foreground">Disponibles</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="courses">Mis Cursos</TabsTrigger>
            <TabsTrigger value="progress">Progreso</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          {/* Mis Cursos Tab */}
          <TabsContent value="courses" className="space-y-4">
            {courses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tienes cursos inscritos</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Explora nuestro catálogo y comienza tu aprendizaje
                  </p>
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
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.jpg"
                        }}
                      />
                      {course.is_completed && <Badge className="absolute top-2 right-2 bg-green-500">Completado</Badge>}
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Por {course.instructor}</span>
                        <span>
                          {course.completed_lessons}/{course.total_lessons} lecciones
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progreso</span>
                          <span>{Math.round(course.progress_percentage)}%</span>
                        </div>
                        <Progress value={course.progress_percentage} className="h-2" />
                      </div>

                      <div className="flex gap-2">
                        <Button asChild className="flex-1">
                          <Link href={`/courses/${course.id}`}>
                            <Play className="h-4 w-4 mr-2" />
                            Continuar
                          </Link>
                        </Button>
                        {course.is_completed && (
                          <Button variant="outline" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Progreso Tab */}
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
                    <span>Horas Totales</span>
                    <span className="font-semibold">{Math.round(stats.totalHours)}h</span>
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
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{course.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {Math.round(course.progress_percentage)}% completado
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hay actividad reciente</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Perfil Tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>Actualiza tu información de perfil</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={updateProfile} className="space-y-4">
                    <div className="flex items-center space-x-4 mb-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={userProfile?.avatar_url || ""} />
                        <AvatarFallback className="text-lg">
                          {userProfile ? getInitials(userProfile.first_name, userProfile.last_name) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm">
                        <CameraIcon className="h-4 w-4 mr-2" />
                        Cambiar Foto
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nombre</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Apellido</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={profileLoading}>
                      {profileLoading ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información de Cuenta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Tipo de Cuenta</p>
                      <p className="text-sm text-muted-foreground capitalize">{userProfile?.role || "Estudiante"}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MailIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Miembro desde</p>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
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
