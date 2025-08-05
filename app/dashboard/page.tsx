"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Clock, Users, TrendingUp, ShoppingCart, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Award, Camera, LogOut } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  price: number
  instructor: string
  duration: string
  level: string
  created_at: string
}

interface Enrollment {
  id: string
  enrolled_at: string
  progress: number
  completed: boolean
  course: Course
}

interface DashboardData {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: string
    avatar_url?: string
  }
  enrolledCourses: Enrollment[]
  availableCourses: Course[]
  stats: {
    totalCourses: number
    completedCourses: number
    inProgressCourses: number
    totalProgress: number
  }
  errors: {
    enrolledCoursesError: string | null
    availableCoursesError: string | null
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showCertificatesDialog, setShowCertificatesDialog] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    avatar_url: "",
  })
  const [certificates, setCertificates] = useState([])
  const [updatingProfile, setUpdatingProfile] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (data?.user) {
      setProfileData({
        first_name: data.user.first_name || "",
        last_name: data.user.last_name || "",
        email: data.user.email || "",
        avatar_url: data.user.avatar_url || "",
      })
    }
  }, [data?.user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/student/dashboard", {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login")
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || "Error al cargar el dashboard")
      }
    } catch (error) {
      console.error("Dashboard error:", error)
      setError("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (formData: FormData) => {
    try {
      setUpdatingProfile(true)
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          first_name: formData.get("first_name"),
          last_name: formData.get("last_name"),
          email: formData.get("email"),
        }),
      })

      const result = await response.json()
      if (result.success) {
        setData((prev) => (prev ? { ...prev, user: result.user } : null))
        setShowProfileDialog(false)
        // Actualizar datos del perfil
        setProfileData({
          first_name: result.user.first_name,
          last_name: result.user.last_name,
          email: result.user.email,
          avatar_url: result.user.avatar_url || "",
        })
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError("Error actualizando perfil")
    } finally {
      setUpdatingProfile(false)
    }
  }

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/student/certificates", {
        credentials: "include",
      })
      const result = await response.json()
      if (result.success) {
        setCertificates(result.certificates)
      }
    } catch (error) {
      console.error("Error fetching certificates:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDashboardData} className="mt-4">
          Reintentar
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>No se pudieron cargar los datos del dashboard.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation user={data?.user || null} />

      <div className="container mx-auto px-4 py-8">
        {/* Header with Profile Menu */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Hola, {data?.user?.first_name || data?.user?.email}! 👋
            </h1>
            <p className="text-gray-600 mt-2">Bienvenido a tu panel de aprendizaje</p>
          </div>

          {/* Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profileData.avatar_url || "/placeholder-user.jpg"} alt="Avatar" />
                  <AvatarFallback>{data?.user?.first_name?.[0] || data?.user?.email?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {data?.user?.first_name && data?.user?.last_name
                      ? `${data.user.first_name} ${data.user.last_name}`
                      : data?.user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">{data?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Editar Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setShowCertificatesDialog(true)
                  fetchCertificates()
                }}
              >
                <Award className="mr-2 h-4 w-4" />
                <span>Mis Certificados</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cursos Inscritos</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.totalCourses || 0}</div>
              <p className="text-xs text-muted-foreground">
                {data?.stats.totalCourses === 0 ? "¡Inscríbete a tu primer curso!" : "Cursos en tu biblioteca"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.completedCourses || 0}</div>
              <p className="text-xs text-muted-foreground">
                {data?.stats.completedCourses === 0 ? "¡Completa tu primer curso!" : "Cursos terminados"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.inProgressCourses || 0}</div>
              <p className="text-xs text-muted-foreground">
                {data?.stats.inProgressCourses === 0 ? "Comienza a estudiar" : "Cursos activos"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progreso Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.stats.totalProgress || 0}%</div>
              <Progress value={data?.stats.totalProgress || 0} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        {data?.enrolledCourses && data.enrolledCourses.length > 0 ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Mis Cursos</CardTitle>
              <CardDescription>Continúa donde lo dejaste</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.enrolledCourses.map((enrollment) => (
                  <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        {enrollment.course.thumbnail_url ? (
                          <img
                            src={enrollment.course.thumbnail_url || "/placeholder.svg"}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <BookOpen className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{enrollment.course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progreso</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} />
                        <div className="flex items-center justify-between">
                          <Badge variant={enrollment.completed ? "default" : "secondary"}>
                            {enrollment.completed ? "Completado" : "En progreso"}
                          </Badge>
                          <Button asChild size="sm">
                            <Link href={`/courses/${enrollment.course.id}`}>
                              {enrollment.completed ? "Revisar" : "Continuar"}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader className="text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle>¡Comienza tu Aprendizaje!</CardTitle>
              <CardDescription>
                Aún no tienes cursos inscritos. Explora nuestro catálogo y encuentra el curso perfecto para ti.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild size="lg">
                <Link href="/courses">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Explorar Cursos
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Available Courses */}
        {data?.availableCourses && data.availableCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cursos Recomendados</CardTitle>
              <CardDescription>Descubre nuevos cursos que podrían interesarte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.availableCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url || "/placeholder.svg"}
                            alt={course.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <BookOpen className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Instructor: {course.instructor}</span>
                          <Badge variant="outline">{course.level}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Duración: {course.duration}</span>
                          <span className="font-semibold text-lg">€{course.price}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Link href={`/courses/${course.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="flex-1">
                            <Link href={`/courses/${course.id}/checkout`}>
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Comprar
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-6">
                <Button asChild variant="outline">
                  <Link href="/courses">Ver Todos los Cursos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Messages */}
        {data?.errors && (data.errors.enrolledCoursesError || data.errors.availableCoursesError) && (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>
              {data.errors.enrolledCoursesError && (
                <div>Error cargando cursos inscritos: {data.errors.enrolledCoursesError}</div>
              )}
              {data.errors.availableCoursesError && (
                <div>Error cargando cursos disponibles: {data.errors.availableCoursesError}</div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>Actualiza tu información personal aquí.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              updateProfile(formData)
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first_name" className="text-right">
                  Nombre
                </Label>
                <Input id="first_name" name="first_name" defaultValue={profileData.first_name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="last_name" className="text-right">
                  Apellido
                </Label>
                <Input id="last_name" name="last_name" defaultValue={profileData.last_name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" name="email" type="email" defaultValue={profileData.email} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Foto</Label>
                <div className="col-span-3 flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profileData.avatar_url || "/placeholder-user.jpg"} />
                    <AvatarFallback>{profileData.first_name?.[0] || profileData.email?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline" size="sm">
                    <Camera className="mr-2 h-4 w-4" />
                    Cambiar Foto
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updatingProfile}>
                {updatingProfile ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Certificates Dialog */}
      <Dialog open={showCertificatesDialog} onOpenChange={setShowCertificatesDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Mis Certificados</DialogTitle>
            <DialogDescription>Aquí puedes ver y descargar todos tus certificados obtenidos.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {certificates.length > 0 ? (
              <div className="grid gap-4">
                {certificates.map((cert: any) => (
                  <Card key={cert.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{cert.course_title}</CardTitle>
                          <CardDescription>
                            Completado el {new Date(cert.completed_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Award className="h-8 w-8 text-yellow-500" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">Instructor: {cert.instructor}</div>
                        <Button size="sm" variant="outline">
                          Descargar PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes certificados aún</h3>
                <p className="text-gray-600">Completa tus cursos para obtener certificados de finalización.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="aspect-video w-full mb-3" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-2 w-full mb-3" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
