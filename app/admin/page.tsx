"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Video,
  Users,
  DollarSign,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  LinkIcon,
  Menu,
  Home,
  Settings,
  LogOut,
} from "lucide-react"

const AdminPage = () => {
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    price: "",
    instructor: "",
  })
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null)
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    order: "",
    isFree: false,
  })

  const loadCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses")
      const result = await response.json()
      if (result.success) {
        setCourses(result.data)
      }
    } catch (error) {
      console.error("Error cargando cursos:", error)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      })
      const result = await response.json()
      if (result.success) {
        setNewCourse({ title: "", description: "", price: "", instructor: "" })
        loadCourses() // Recargar cursos
        alert("Curso creado exitosamente!")
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Error creando curso")
    }
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: selectedCourse,
          title: newLesson.title,
          description: newLesson.description,
          video_url: newLesson.videoUrl,
          duration_minutes: Number.parseInt(newLesson.duration),
          order_index: Number.parseInt(newLesson.order),
          is_free: newLesson.isFree,
        }),
      })
      const result = await response.json()
      if (result.success) {
        setIsLessonDialogOpen(false)
        setNewLesson({ title: "", description: "", videoUrl: "", duration: "", order: "", isFree: false })
        loadCourses() // Recargar cursos
        alert("Lección creada exitosamente!")
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Error creando lección")
    }
  }

  const openLessonDialog = (courseId: number, lesson?: any) => {
    setSelectedCourse(courseId)
    if (lesson) {
      setEditingLesson(lesson)
      setNewLesson({
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration.toString(),
        order: lesson.order.toString(),
        isFree: lesson.isFree,
      })
    } else {
      setEditingLesson(null)
      setNewLesson({
        title: "",
        description: "",
        videoUrl: "",
        duration: "",
        order: "",
        isFree: false,
      })
    }
    setIsLessonDialogOpen(true)
  }

  const selectedCourseData = courses.find((c) => c.id === selectedCourse)

  // Navigation items
  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/admin" },
    { icon: BookOpen, label: "Cursos", href: "/admin/courses" },
    { icon: Users, label: "Usuarios", href: "/admin/users" },
    { icon: Video, label: "Lecciones", href: "/admin/lessons" },
    { icon: DollarSign, label: "Pagos", href: "/admin/payments" },
    { icon: Settings, label: "Configuración", href: "/admin/settings" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile optimized */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Mobile menu button */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden p-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center space-x-2">
                      <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto" />
                    </SheetTitle>
                    <SheetDescription>Panel de Administración</SheetDescription>
                  </SheetHeader>

                  {/* Mobile Navigation */}
                  <nav className="p-4">
                    <div className="space-y-2">
                      {navigationItems.map((item) => (
                        <Button
                          key={item.href}
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.label}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Cerrar Sesión
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Logo - Desktop */}
              <div className="hidden lg:flex items-center space-x-4">
                <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 sm:h-10 w-auto" />
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Panel de Administración</h1>
              </div>

              {/* Logo - Mobile */}
              <div className="lg:hidden">
                <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-6 sm:h-8 w-auto" />
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navigationItems.slice(0, 4).map((item) => (
                <Button key={item.href} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Badge variant="secondary" className="hidden sm:inline-flex text-xs">
                Administrador
              </Badge>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Stats Cards - Mobile optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">2,847</p>
                </div>
                <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Ingresos</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">$810K</p>
                </div>
                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Cursos</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Videos</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">156</p>
                </div>
                <Video className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs - Mobile optimized */}
        <Tabs defaultValue="courses" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-[400px] sm:min-w-0">
              <TabsTrigger value="courses" className="text-xs sm:text-sm">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Gestión de </span>Cursos
              </TabsTrigger>
              <TabsTrigger value="lessons" className="text-xs sm:text-sm">
                <Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Gestión de </span>Lecciones
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="create" className="text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Crear </span>Contenido
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="courses" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Cursos</h2>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Curso
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Curso</TableHead>
                        <TableHead className="min-w-[100px]">Estudiantes</TableHead>
                        <TableHead className="min-w-[100px]">Ingresos</TableHead>
                        <TableHead className="min-w-[100px]">Lecciones</TableHead>
                        <TableHead className="min-w-[80px]">Estado</TableHead>
                        <TableHead className="min-w-[120px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm sm:text-base">{course.title}</p>
                              <p className="text-xs sm:text-sm text-gray-500">Creado: {course.createdAt}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm sm:text-base">{course.students?.toLocaleString()}</TableCell>
                          <TableCell className="text-sm sm:text-base">${course.revenue?.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Video className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                              <span className="text-sm sm:text-base">{course.lessons?.length || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={course.status === "Publicado" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {course.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm" onClick={() => openLessonDialog(course.id)}>
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Lecciones</h2>

            <div className="grid gap-4 sm:gap-6">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-base sm:text-lg">{course.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {course.lessons?.length || 0} lecciones configuradas
                        </CardDescription>
                      </div>
                      <Button onClick={() => openLessonDialog(course.id)} size="sm" className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Lección
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    {course.lessons && course.lessons.length > 0 ? (
                      <div className="space-y-3">
                        {course.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs sm:text-sm font-medium text-blue-600">{lesson.order}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm sm:text-base truncate">{lesson.title}</p>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{lesson.duration} min</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <LinkIcon className="w-3 h-3" />
                                    <span>Bunny.net</span>
                                  </div>
                                  {lesson.isFree && (
                                    <Badge variant="secondary" className="text-xs">
                                      Gratis
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 self-end sm:self-center">
                              <Button variant="ghost" size="sm" onClick={() => openLessonDialog(course.id, lesson)}>
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        <Video className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm sm:text-base">No hay lecciones configuradas</p>
                        <p className="text-xs sm:text-sm">Agrega la primera lección para este curso</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Usuarios Registrados</h2>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Usuario</TableHead>
                        <TableHead className="min-w-[200px]">Email</TableHead>
                        <TableHead className="min-w-[80px]">Cursos</TableHead>
                        <TableHead className="min-w-[100px]">Total Gastado</TableHead>
                        <TableHead className="min-w-[120px]">Fecha de Registro</TableHead>
                        <TableHead className="min-w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium text-sm sm:text-base">{user.name}</TableCell>
                          <TableCell className="text-sm sm:text-base">{user.email}</TableCell>
                          <TableCell className="text-sm sm:text-base">{user.courses}</TableCell>
                          <TableCell className="text-sm sm:text-base">${user.spent}</TableCell>
                          <TableCell className="text-sm sm:text-base">{user.joinDate}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Crear Nuevo Curso</h2>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Información del Curso</CardTitle>
                <CardDescription className="text-sm">
                  Completa los detalles básicos del curso. Las lecciones se configuran después con enlaces de Bunny.net
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm sm:text-base">
                      Título del Curso
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ej: Implantología Avanzada"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      className="text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm sm:text-base">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe el contenido del curso..."
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      className="text-sm sm:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm sm:text-base">
                        Precio ($)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="299"
                        value={newCourse.price}
                        onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructor" className="text-sm sm:text-base">
                        Instructor
                      </Label>
                      <Input
                        id="instructor"
                        placeholder="Dr. Juan Pérez"
                        value={newCourse.instructor}
                        onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Crear Curso
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <img
                    src="https://sjc.microlink.io/fwaEQxkrhQryOdc9uWl01AFU3L8KtJuDucDCGSljBKstN4yoPNLEati3Kpdm14J7I1V7spCnFfv827E1pXUsCg.jpeg"
                    alt="Bunny.net"
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded"
                  />
                  <span>Integración con Bunny.net</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  Los videos se hospedan en Bunny.net para máximo rendimiento y velocidad global
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-orange-50 p-3 sm:p-4 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-900 mb-2 text-sm sm:text-base">Cómo configurar videos:</h4>
                    <ol className="text-xs sm:text-sm text-orange-800 space-y-1">
                      <li>1. Sube tus videos a tu cuenta de Bunny.net</li>
                      <li>2. Copia el enlace directo del video (formato: https://vz-xxxxx.b-cdn.net/video.mp4)</li>
                      <li>3. Usa ese enlace al crear lecciones en OdontoGeek</li>
                      <li>4. Los videos se reproducirán con máxima velocidad para tus estudiantes</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <h5 className="font-medium text-green-900">✓ Ventajas</h5>
                      <ul className="text-green-700 mt-1 space-y-1">
                        <li>• CDN global ultra-rápido</li>
                        <li>• Reproducción adaptativa</li>
                        <li>• Protección contra hotlinking</li>
                        <li>• Analytics detallados</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h5 className="font-medium text-blue-900">📊 Formatos soportados</h5>
                      <ul className="text-blue-700 mt-1 space-y-1">
                        <li>• MP4 (recomendado)</li>
                        <li>• WebM</li>
                        <li>• MOV</li>
                        <li>• Streaming HLS</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para crear/editar lecciones - Mobile optimized */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {editingLesson ? "Editar Lección" : "Agregar Nueva Lección"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Configura los detalles de la lección con el enlace directo de Bunny.net
              {selectedCourseData && ` para el curso "${selectedCourseData.title}"`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lessonTitle" className="text-sm">
                  Título de la Lección
                </Label>
                <Input
                  id="lessonTitle"
                  placeholder="Ej: Introducción a la Implantología"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonOrder" className="text-sm">
                  Orden
                </Label>
                <Input
                  id="lessonOrder"
                  type="number"
                  placeholder="1"
                  value={newLesson.order}
                  onChange={(e) => setNewLesson({ ...newLesson, order: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonDescription" className="text-sm">
                Descripción
              </Label>
              <Textarea
                id="lessonDescription"
                placeholder="Describe el contenido de esta lección..."
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-sm">
                URL del Video (Bunny.net)
              </Label>
              <Input
                id="videoUrl"
                placeholder="https://vz-12345.b-cdn.net/mi-video.mp4"
                value={newLesson.videoUrl}
                onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                required
                className="text-sm"
              />
              <p className="text-xs text-gray-500">Copia el enlace directo desde tu panel de Bunny.net</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm">
                  Duración (minutos)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="45"
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                  required
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isFree" className="text-sm">
                  Acceso
                </Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="isFree"
                    checked={newLesson.isFree}
                    onCheckedChange={(checked) => setNewLesson({ ...newLesson, isFree: checked })}
                  />
                  <Label htmlFor="isFree" className="text-sm">
                    Lección gratuita
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLessonDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                {editingLesson ? "Actualizar Lección" : "Crear Lección"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminPage
