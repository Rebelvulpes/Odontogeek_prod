"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { BookOpen, Clock, Trophy, User, Camera, Play, CheckCircle, Award } from "lucide-react"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  role: string
  created_at: string
}

interface EnrolledCourse {
  id: string
  course_id: string
  progress_percentage: number
  enrolled_at: string
  status: string
  course: {
    id: string
    title: string
    description: string
    thumbnail_url: string
    duration_hours: number
    instructor_name: string
    total_lessons: number
    completed_lessons: number
  }
}

interface DashboardStats {
  totalCourses: number
  completedCourses: number
  totalHours: number
  certificatesEarned: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    certificatesEarned: 0,
  })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Simular usuario de prueba (en producción esto vendría de la autenticación)
  const testUserId = "test-student-001"

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Cargar perfil del usuario
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", testUserId)
        .single()

      if (userError) throw userError
      setUser(userData)

      // Cargar cursos inscritos con progreso
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select(`
          id,
          course_id,
          progress_percentage,
          enrolled_at,
          status,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            duration_hours,
            instructor_name
          )
        `)
        .eq("user_id", testUserId)
        .eq("status", "active")

      if (enrollmentsError) throw enrollmentsError

      // Procesar datos de cursos con lecciones completadas
      const coursesWithProgress = await Promise.all(
        (enrollmentsData || []).map(async (enrollment) => {
          // Contar lecciones totales
          const { count: totalLessons } = await supabase
            .from("lessons")
            .select("*", { count: "exact", head: true })
            .eq("course_id", enrollment.course_id)
            .eq("archived", false)

          // Contar lecciones completadas
          const { count: completedLessons } = await supabase
            .from("lesson_progress")
            .select("*", { count: "exact", head: true })
            .eq("user_id", testUserId)
            .eq("course_id", enrollment.course_id)
            .eq("is_completed", true)

          return {
            ...enrollment,
            course: {
              ...enrollment.courses,
              total_lessons: totalLessons || 0,
              completed_lessons: completedLessons || 0,
            },
          }
        }),
      )

      setEnrolledCourses(coursesWithProgress)

      // Calcular estadísticas
      const totalCourses = coursesWithProgress.length
      const completedCourses = coursesWithProgress.filter((c) => c.progress_percentage >= 100).length
      const totalHours = coursesWithProgress.reduce((sum, c) => sum + (c.course.duration_hours || 0), 0)

      setStats({
        totalCourses,
        completedCourses,
        totalHours,
        certificatesEarned: completedCourses,
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (formData: FormData) => {
    if (!user) return

    setUpdating(true)
    try {
      const firstName = formData.get("firstName") as string
      const lastName = formData.get("lastName") as string
      const email = formData.get("email") as string

      const { error } = await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setUser({
        ...user,
        first_name: firstName,
        last_name: lastName,
        email: email,
      })

      alert("Perfil actualizado correctamente")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error al actualizar el perfil")
    } finally {
      setUpdating(false)
    }
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={null} />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Usuario no encontrado</h1>
          <Link href="/auth/login">
            <Button>Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        user={{
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role,
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Hola, {user.first_name}! 👋</h1>
          <p className="text-gray-600">Bienvenido de vuelta a tu panel de aprendizaje</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600" />
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
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Horas de Estudio</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalHours}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certificados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.certificatesEarned}</p>
                </div>
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
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
                <CardTitle>Mis Cursos Activos</CardTitle>
                <CardDescription>Continúa donde lo dejaste y completa tus cursos</CardDescription>
              </CardHeader>
              <CardContent>
                {enrolledCourses.length > 0 ? (
                  <div className="grid gap-6">
                    {enrolledCourses.map((enrollment) => (
                      <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Course Image */}
                            <div className="flex-shrink-0">
                              <img
                                src={enrollment.course.thumbnail_url || "/placeholder.jpg"}
                                alt={enrollment.course.title}
                                className="w-full md:w-48 h-32 object-cover rounded-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.jpg"
                                }}
                              />
                            </div>

                            {/* Course Info */}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">{enrollment.course.title}</h3>
                                <Badge variant={enrollment.progress_percentage >= 100 ? "default" : "secondary"}>
                                  {enrollment.progress_percentage >= 100 ? "Completado" : "En Progreso"}
                                </Badge>
                              </div>

                              <p className="text-gray-600 mb-4 line-clamp-2">{enrollment.course.description}</p>

                              {/* Progress */}
                              <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-gray-700">Progreso</span>
                                  <span className="text-sm text-gray-600">
                                    {Math.round(enrollment.progress_percentage)}%
                                  </span>
                                </div>
                                <Progress value={enrollment.progress_percentage} className="h-2" />
                              </div>

                              {/* Course Stats */}
                              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {enrollment.course.duration_hours}h
                                </div>
                                <div className="flex items-center">
                                  <BookOpen className="w-4 h-4 mr-1" />
                                  {enrollment.course.completed_lessons}/{enrollment.course.total_lessons} lecciones
                                </div>
                                <div className="flex items-center">
                                  <User className="w-4 h-4 mr-1" />
                                  {enrollment.course.instructor_name}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-3">
                                <Link href={`/courses/${enrollment.course_id}`}>
                                  <Button>
                                    <Play className="w-4 h-4 mr-2" />
                                    Continuar Curso
                                  </Button>
                                </Link>
                                {enrollment.progress_percentage >= 100 && (
                                  <Button variant="outline">
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Ver Certificado
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes cursos activos</h3>
                    <p className="text-gray-600 mb-6">Explora nuestro catálogo y comienza tu journey de aprendizaje</p>
                    <Link href="/courses">
                      <Button>Explorar Cursos</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progreso Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen de Progreso</CardTitle>
                  <CardDescription>Tu actividad de aprendizaje en los últimos meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {Math.round((stats.completedCourses / Math.max(stats.totalCourses, 1)) * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">Tasa de Finalización</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalHours}</div>
                      <p className="text-sm text-gray-600">Horas Estudiadas</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {enrolledCourses.reduce((sum, c) => sum + c.course.completed_lessons, 0)}
                      </div>
                      <p className="text-sm text-gray-600">Lecciones Completadas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enrolledCourses.slice(0, 3).map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <img
                            src={enrollment.course.thumbnail_url || "/placeholder.jpg"}
                            alt={enrollment.course.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{enrollment.course.title}</h4>
                          <p className="text-sm text-gray-600">
                            Progreso: {Math.round(enrollment.progress_percentage)}%
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Inscrito: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Perfil Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu información de perfil y preferencias</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={updateProfile} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">
                        {getUserInitials(user.first_name, user.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" className="mb-2 bg-transparent">
                        <Camera className="w-4 h-4 mr-2" />
                        Cambiar Foto
                      </Button>
                      <p className="text-sm text-gray-600">JPG, PNG o GIF. Máximo 2MB.</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input id="firstName" name="firstName" defaultValue={user.first_name} required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input id="lastName" name="lastName" defaultValue={user.last_name} required />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={user.email} required />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={updating}>
                      {updating ? "Actualizando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Cuenta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Tipo de Cuenta</Label>
                    <p className="text-gray-900 capitalize">{user.role}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Miembro desde</Label>
                    <p className="text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
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
