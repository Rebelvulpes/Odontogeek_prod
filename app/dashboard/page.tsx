"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Clock, Award, Mail, Calendar, Play, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
  price: number
  duration_hours: number
  level: string
  instructor: string
  progress: number
  enrolled_at: string
  completed_at?: string
  enrollment_id: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  })
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
    fetchCourses()
  }, [])

  const fetchUserData = async () => {
    try {
      console.log("Fetching user data...")
      const response = await fetch("/api/auth/me")
      const data = await response.json()

      console.log("User data response:", data)

      if (data.success) {
        setUser(data.user)
        setProfileData({
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          email: data.user.email,
        })
      } else {
        console.log("No user session, redirecting to login")
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
      router.push("/auth/login")
    }
  }

  const fetchCourses = async () => {
    try {
      console.log("Fetching courses...")
      const response = await fetch("/api/student/courses")
      const data = await response.json()

      console.log("Courses response:", data)

      if (data.success) {
        setCourses(data.courses || [])
      } else {
        console.log("Error fetching courses:", data.message)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)

    try {
      console.log("Updating profile...", profileData)
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      })

      const data = await response.json()
      console.log("Profile update response:", data)

      if (data.success) {
        setUser(data.user)
        toast({
          title: "Perfil actualizado",
          description: "Tu información ha sido actualizada exitosamente.",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Error actualizando perfil",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Error interno del servidor",
        variant: "destructive",
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      console.log("Logging out...")
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/auth/login")
    } catch (error) {
      console.error("Error logging out:", error)
      router.push("/auth/login")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Calcular estadísticas
  const totalCourses = courses.length
  const completedCourses = courses.filter((course) => course.completed_at).length
  const inProgressCourses = courses.filter((course) => !course.completed_at && course.progress > 0).length
  const totalHours = courses.reduce((sum, course) => sum + (course.duration_hours || 0), 0)
  const averageProgress =
    totalCourses > 0 ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / totalCourses) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url || "/placeholder-user.jpg"} />
                <AvatarFallback>
                  {user.first_name[0]}
                  {user.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Hola, {user.first_name}!</h1>
                <p className="text-sm text-gray-500">Bienvenido a tu dashboard</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="courses">Mis Cursos</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cursos Activos</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCourses}</div>
                  <p className="text-xs text-muted-foreground">{inProgressCourses} en progreso</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedCourses}</div>
                  <p className="text-xs text-muted-foreground">
                    {totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0}% del total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalHours}</div>
                  <p className="text-xs text-muted-foreground">Contenido disponible</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Progreso Promedio</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageProgress}%</div>
                  <Progress value={averageProgress} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Tus cursos más recientes</CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.slice(0, 3).map((course) => (
                      <div key={course.id} className="flex items-center space-x-4">
                        <img
                          src={course.thumbnail_url || "/placeholder.svg"}
                          alt={course.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{course.title}</p>
                          <p className="text-sm text-gray-500 truncate">{course.instructor}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={course.progress} className="flex-1" />
                            <span className="text-xs text-gray-500">{course.progress}%</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Play className="h-4 w-4 mr-1" />
                          Continuar
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No tienes cursos inscritos aún</p>
                    <Button className="mt-4" onClick={() => router.push("/courses")}>
                      Explorar Cursos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Mis Cursos</h2>
              <Button onClick={() => router.push("/courses")}>Explorar Más Cursos</Button>
            </div>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                      {course.completed_at && <Badge className="absolute top-2 right-2 bg-green-500">Completado</Badge>}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Instructor: {course.instructor}</span>
                          <span>{course.duration_hours}h</span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Progreso</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <Badge variant="outline">{course.level}</Badge>
                          <Button size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            {course.progress > 0 ? "Continuar" : "Comenzar"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cursos inscritos</h3>
                  <p className="text-gray-500 mb-6">Explora nuestro catálogo y comienza tu aprendizaje</p>
                  <Button onClick={() => router.push("/courses")}>Explorar Cursos</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu información personal y preferencias</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Nombre</Label>
                      <Input
                        id="first_name"
                        value={profileData.first_name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            first_name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Apellido</Label>
                      <Input
                        id="last_name"
                        value={profileData.last_name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            last_name: e.target.value,
                          })
                        }
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
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? "Actualizando..." : "Actualizar Perfil"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Miembro desde</p>
                    <p className="text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
