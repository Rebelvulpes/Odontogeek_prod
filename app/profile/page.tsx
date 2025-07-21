"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Lock, Camera, Award, BookOpen, Download, Edit, Save, X, CheckCircle, Clock, Trophy } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  avatar_url?: string
  bio?: string
  created_at: string
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string
  progress: number
  enrolled_at: string
  completed_at?: string
  status: string
  enrollment_id: string
}

interface Certificate {
  id: string
  course_id: string
  course_title: string
  instructor: string
  thumbnail_url?: string
  completed_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    bio: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [editingProfile, setEditingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)

      // Load user profile
      const userResponse = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
        setProfileForm({
          first_name: userData.user.first_name || "",
          last_name: userData.user.last_name || "",
          email: userData.user.email || "",
          bio: userData.user.bio || "",
        })

        // Load courses if user is a student
        if (userData.user.role === "student") {
          const coursesResponse = await fetch("/api/student/courses", {
            credentials: "include",
          })

          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json()
            setCourses(coursesData.courses || [])
          }

          // Load certificates
          const certificatesResponse = await fetch("/api/student/certificates", {
            credentials: "include",
          })

          if (certificatesResponse.ok) {
            const certificatesData = await certificatesResponse.json()
            setCertificates(certificatesData.certificates || [])
          }
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setMessage({ type: "error", text: "Error cargando datos del perfil" })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      setUpdating(true)
      setMessage(null)

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
        setUser(data.user)
        setEditingProfile(false)
        setMessage({ type: "success", text: "Perfil actualizado exitosamente" })
      } else {
        setMessage({ type: "error", text: data.message || "Error actualizando perfil" })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      setMessage({ type: "error", text: "Error actualizando perfil" })
    } finally {
      setUpdating(false)
    }
  }

  const changePassword = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setMessage({ type: "error", text: "Las contraseñas no coinciden" })
        return
      }

      if (passwordForm.newPassword.length < 6) {
        setMessage({ type: "error", text: "La nueva contraseña debe tener al menos 6 caracteres" })
        return
      }

      setUpdating(true)
      setMessage(null)

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setChangingPassword(false)
        setMessage({ type: "success", text: "Contraseña actualizada exitosamente" })
      } else {
        setMessage({ type: "error", text: data.message || "Error cambiando contraseña" })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      setMessage({ type: "error", text: "Error cambiando contraseña" })
    } finally {
      setUpdating(false)
    }
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const firstName = user.first_name || ""
    const lastName = user.last_name || ""
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
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

  const getCompletedCoursesCount = () => {
    return courses.filter((course) => course.completed_at).length
  }

  const getAverageProgress = () => {
    if (courses.length === 0) return 0
    const totalProgress = courses.reduce((sum, course) => sum + course.progress, 0)
    return Math.round(totalProgress / courses.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          <Alert>
            <AlertDescription>
              No se pudo cargar la información del perfil. Por favor, inicia sesión nuevamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert
            className={`mb-6 ${message.type === "success" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
          >
            <AlertDescription className={message.type === "success" ? "text-green-800" : "text-red-800"}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={getUserDisplayName()} />
                    <AvatarFallback className="text-xl">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-xl">{getUserDisplayName()}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <Badge variant="secondary" className="mt-2">
                  {user.role === "admin" ? "Administrador" : "Estudiante"}
                </Badge>
              </CardHeader>

              {user.role === "student" && (
                <CardContent className="space-y-4">
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
                      <div className="text-sm text-gray-600">Cursos Inscritos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{getCompletedCoursesCount()}</div>
                      <div className="text-sm text-gray-600">Completados</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{getAverageProgress()}%</div>
                    <div className="text-sm text-gray-600">Progreso Promedio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{certificates.length}</div>
                    <div className="text-sm text-gray-600">Certificados</div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Perfil</TabsTrigger>
                <TabsTrigger value="security">Seguridad</TabsTrigger>
                {user.role === "student" && <TabsTrigger value="courses">Cursos</TabsTrigger>}
                {user.role === "student" && <TabsTrigger value="certificates">Certificados</TabsTrigger>}
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>Actualiza tu información personal y biografía</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setEditingProfile(!editingProfile)}>
                        {editingProfile ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                        {editingProfile ? "Cancelar" : "Editar"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">Nombre</Label>
                        <Input
                          id="first_name"
                          value={profileForm.first_name}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, first_name: e.target.value }))}
                          disabled={!editingProfile}
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Apellido</Label>
                        <Input
                          id="last_name"
                          value={profileForm.last_name}
                          onChange={(e) => setProfileForm((prev) => ({ ...prev, last_name: e.target.value }))}
                          disabled={!editingProfile}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                        disabled={!editingProfile}
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">Biografía</Label>
                      <Textarea
                        id="bio"
                        placeholder="Cuéntanos un poco sobre ti..."
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                        disabled={!editingProfile}
                        rows={4}
                      />
                    </div>

                    {editingProfile && (
                      <div className="flex gap-2">
                        <Button onClick={updateProfile} disabled={updating}>
                          <Save className="h-4 w-4 mr-2" />
                          {updating ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                        <Button variant="outline" onClick={() => setEditingProfile(false)}>
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Seguridad de la Cuenta</CardTitle>
                    <CardDescription>Cambia tu contraseña y gestiona la seguridad de tu cuenta</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!changingPassword ? (
                      <Button onClick={() => setChangingPassword(true)}>
                        <Lock className="h-4 w-4 mr-2" />
                        Cambiar Contraseña
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">Contraseña Actual</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="newPassword">Nueva Contraseña</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={changePassword} disabled={updating}>
                            {updating ? "Cambiando..." : "Cambiar Contraseña"}
                          </Button>
                          <Button variant="outline" onClick={() => setChangingPassword(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Courses Tab */}
              {user.role === "student" && (
                <TabsContent value="courses">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mis Cursos</CardTitle>
                      <CardDescription>Progreso y estado de tus cursos inscritos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {courses.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No tienes cursos inscritos aún</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {courses.map((course) => (
                            <div key={course.id} className="border rounded-lg p-4">
                              <div className="flex items-start gap-4">
                                <img
                                  src={course.thumbnail_url || "/placeholder.svg"}
                                  alt={course.title}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg">{course.title}</h3>
                                  <p className="text-gray-600 text-sm mb-2">{course.description}</p>

                                  <div className="flex items-center gap-4 mb-2">
                                    <Badge variant={course.completed_at ? "default" : "secondary"}>
                                      {course.completed_at ? (
                                        <>
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          Completado
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="h-3 w-3 mr-1" />
                                          En Progreso
                                        </>
                                      )}
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                      Inscrito: {new Date(course.enrolled_at).toLocaleDateString()}
                                    </span>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>Progreso</span>
                                      <span>{course.progress}%</span>
                                    </div>
                                    <Progress value={course.progress} className="h-2" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Certificates Tab */}
              {user.role === "student" && (
                <TabsContent value="certificates">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mis Certificados</CardTitle>
                      <CardDescription>Certificados obtenidos por completar cursos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {certificates.length === 0 ? (
                        <div className="text-center py-8">
                          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No tienes certificados aún</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Completa un curso para obtener tu primer certificado
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {certificates.map((certificate) => (
                            <div
                              key={certificate.id}
                              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start gap-3">
                                <div className="bg-yellow-100 p-2 rounded-lg">
                                  <Award className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold">{certificate.course_title}</h3>
                                  <p className="text-sm text-gray-600 mb-2">Instructor: {certificate.instructor}</p>
                                  <p className="text-sm text-gray-500 mb-3">
                                    Completado: {new Date(certificate.completed_at).toLocaleDateString()}
                                  </p>
                                  <Button size="sm" variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Descargar PDF
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
