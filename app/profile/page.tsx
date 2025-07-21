"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import {
  User,
  Lock,
  BookOpen,
  Award,
  Camera,
  Save,
  Eye,
  EyeOff,
  Download,
  Calendar,
  GraduationCap,
  TrendingUp,
  CheckCircle,
} from "lucide-react"

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  bio?: string
  role: string
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
  instructor_name: string
  progress_percentage: number
  enrollment_date: string
  completion_date?: string
  status: "in_progress" | "completed"
}

interface Certificate {
  id: string
  course_title: string
  instructor_name: string
  completion_date: string
  certificate_url?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  // Load user data
  useEffect(() => {
    loadUserData()
    loadUserCourses()
    loadUserCertificates()
  }, [])

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
          setProfileForm({
            first_name: data.user.first_name || "",
            last_name: data.user.last_name || "",
            email: data.user.email || "",
            bio: data.user.bio || "",
          })
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserCourses = async () => {
    try {
      const response = await fetch("/api/student/courses", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.courses) {
          setCourses(data.courses)
        }
      }
    } catch (error) {
      console.error("Error loading courses:", error)
    }
  }

  const loadUserCertificates = async () => {
    try {
      const response = await fetch("/api/student/certificates", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.certificates) {
          setCertificates(data.certificates)
        }
      }
    } catch (error) {
      console.error("Error loading certificates:", error)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/student/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profileForm),
      })

      const data = await response.json()

      if (data.success) {
        setUser((prev) => (prev ? { ...prev, ...profileForm } : null))
        setMessage({ type: "success", text: "Perfil actualizado correctamente" })
      } else {
        setMessage({ type: "error", text: data.message || "Error al actualizar perfil" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error interno del servidor" })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" })
      return
    }

    if (passwordForm.new_password.length < 6) {
      setMessage({ type: "error", text: "La nueva contraseña debe tener al menos 6 caracteres" })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" })
        setMessage({ type: "success", text: "Contraseña cambiada correctamente" })
      } else {
        setMessage({ type: "error", text: data.message || "Error al cambiar contraseña" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error interno del servidor" })
    } finally {
      setSaving(false)
    }
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const firstName = user.first_name || ""
    const lastName = user.last_name || ""

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    if (firstName) return firstName.substring(0, 2).toUpperCase()
    return user.email.substring(0, 2).toUpperCase()
  }

  const getUserDisplayName = () => {
    if (!user) return ""
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user.first_name) return user.first_name
    return user.email.split("@")[0]
  }

  const getStats = () => {
    const totalCourses = courses.length
    const completedCourses = courses.filter((c) => c.status === "completed").length
    const averageProgress =
      totalCourses > 0 ? Math.round(courses.reduce((sum, c) => sum + c.progress_percentage, 0) / totalCourses) : 0
    const totalCertificates = certificates.length

    return { totalCourses, completedCourses, averageProgress, totalCertificates }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando perfil...</p>
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
            <p className="text-gray-600 mb-8">Debes iniciar sesión para ver tu perfil.</p>
            <Button asChild>
              <a href="/auth/login">Iniciar Sesión</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={getUserDisplayName()} />
              <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{getUserDisplayName()}</h1>
              <p className="text-gray-600">{user.email}</p>
              <Badge variant={user.role === "admin" ? "default" : "secondary"} className="mt-2">
                {user.role === "admin" ? "Administrador" : "Estudiante"}
              </Badge>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalCourses}</p>
                    <p className="text-sm text-gray-600">Cursos Inscritos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.completedCourses}</p>
                    <p className="text-sm text-gray-600">Completados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.averageProgress}%</p>
                    <p className="text-sm text-gray-600">Progreso Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Award className="h-8 w-8 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalCertificates}</p>
                    <p className="text-sm text-gray-600">Certificados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert
            className={`mb-6 ${message.type === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}
          >
            <AlertDescription className={message.type === "error" ? "text-red-800" : "text-green-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Seguridad</span>
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Cursos</span>
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Certificados</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu información personal y biografía</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={getUserDisplayName()} />
                      <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button type="button" variant="outline" className="flex items-center space-x-2 bg-transparent">
                        <Camera className="h-4 w-4" />
                        <span>Cambiar Foto</span>
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">JPG, PNG o GIF. Máximo 2MB.</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Nombre</Label>
                      <Input
                        id="first_name"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, first_name: e.target.value }))}
                        placeholder="Tu nombre"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Apellido</Label>
                      <Input
                        id="last_name"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))}
                        placeholder="Tu apellido"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                      placeholder="Cuéntanos sobre ti..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" disabled={saving} className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Contraseña Actual</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))}
                        placeholder="Tu contraseña actual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, new_password: e.target.value }))}
                        placeholder="Tu nueva contraseña"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Confirmar Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm_password: e.target.value }))}
                        placeholder="Confirma tu nueva contraseña"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" disabled={saving} className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>{saving ? "Cambiando..." : "Cambiar Contraseña"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Mis Cursos</CardTitle>
                <CardDescription>Revisa tu progreso en los cursos inscritos</CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <img
                            src={course.thumbnail_url || "/placeholder.svg?height=80&width=80"}
                            alt={course.title}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{course.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{course.instructor_name}</p>
                                <Badge variant={course.status === "completed" ? "default" : "secondary"}>
                                  {course.status === "completed" ? "Completado" : "En Progreso"}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">{course.progress_percentage}%</p>
                                <p className="text-sm text-gray-500">Progreso</p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Progreso del curso</span>
                                <span className="text-sm font-medium">{course.progress_percentage}%</span>
                              </div>
                              <Progress value={course.progress_percentage} className="h-2" />
                            </div>

                            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Inscrito: {new Date(course.enrollment_date).toLocaleDateString()}</span>
                              </div>
                              {course.completion_date && (
                                <div className="flex items-center space-x-1">
                                  <GraduationCap className="h-4 w-4" />
                                  <span>Completado: {new Date(course.completion_date).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes cursos inscritos</h3>
                    <p className="text-gray-600 mb-4">Explora nuestro catálogo y comienza tu aprendizaje</p>
                    <Button asChild>
                      <a href="/courses">Explorar Cursos</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Mis Certificados</CardTitle>
                <CardDescription>Descarga y comparte tus certificados de finalización</CardDescription>
              </CardHeader>
              <CardContent>
                {certificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {certificates.map((certificate) => (
                      <div key={certificate.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="text-center">
                          <Award className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                          <h3 className="font-semibold text-lg mb-2">{certificate.course_title}</h3>
                          <p className="text-gray-600 text-sm mb-2">Instructor: {certificate.instructor_name}</p>
                          <p className="text-gray-500 text-sm mb-4">
                            Completado: {new Date(certificate.completion_date).toLocaleDateString()}
                          </p>
                          <Button size="sm" className="flex items-center space-x-2 mx-auto">
                            <Download className="h-4 w-4" />
                            <span>Descargar PDF</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes certificados aún</h3>
                    <p className="text-gray-600 mb-4">Completa tus cursos para obtener certificados</p>
                    <Button asChild>
                      <a href="/courses">Ver Mis Cursos</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
