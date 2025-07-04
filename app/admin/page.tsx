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
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Video,
  Users,
  DollarSign,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  LinkIcon,
  Menu,
  Home,
  Settings,
  LogOut,
  Archive,
  Tag,
} from "lucide-react"

const AdminPage = () => {
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    price: "",
    instructor: "",
    tags: [],
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
  const [isCreateCourseDialogOpen, setIsCreateCourseDialogOpen] = useState(false)
  const [isCreateTagDialogOpen, setIsCreateTagDialogOpen] = useState(false)
  const [isEditTagDialogOpen, setIsEditTagDialogOpen] = useState(false)
  const [isDeleteTagDialogOpen, setIsDeleteTagDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<any>(null)
  const [tagToDelete, setTagToDelete] = useState<any>(null)
  const [newTag, setNewTag] = useState({
    name: "",
    color: "#3B82F6",
    description: "",
  })

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/courses")
      const result = await response.json()

      console.log("Respuesta de la API:", result) // Debug

      if (result.success) {
        // Ensure lessons array exists for each course and log the structure
        const coursesWithLessons = result.data.map((course) => {
          console.log(`Curso ${course.title}:`, course.lessons) // Debug
          return {
            ...course,
            lessons: course.lessons || [],
          }
        })
        setCourses(coursesWithLessons)
      } else {
        console.error("Error loading courses:", result.message)
        alert(`Error cargando cursos: ${result.message}`)
      }
    } catch (error) {
      console.error("Error cargando cursos:", error)
      alert("Error de conexión al cargar cursos")
    } finally {
      setLoading(false)
    }
  }

  const loadTags = async () => {
    try {
      const response = await fetch("/api/course-tags")
      const result = await response.json()
      if (result.success) {
        setTags(result.data)
      }
    } catch (error) {
      console.error("Error cargando etiquetas:", error)
    }
  }

  useEffect(() => {
    loadCourses()
    loadTags()
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
        setNewCourse({ title: "", description: "", price: "", instructor: "", tags: [] })
        setIsCreateCourseDialogOpen(false)
        loadCourses() // Recargar cursos
        alert("Curso creado exitosamente!")
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Error creando curso")
    }
  }

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/course-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTag),
      })
      const result = await response.json()
      if (result.success) {
        setNewTag({ name: "", color: "#3B82F6", description: "" })
        setIsCreateTagDialogOpen(false)
        loadTags() // Recargar etiquetas
        alert("Etiqueta creada exitosamente!")
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Error creando etiqueta")
    }
  }

  const handleEditTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTag) return

    try {
      const response = await fetch(`/api/course-tags/${editingTag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingTag.name,
          color: editingTag.color,
          description: editingTag.description,
        }),
      })
      const result = await response.json()
      if (result.success) {
        setIsEditTagDialogOpen(false)
        setEditingTag(null)
        loadTags() // Recargar etiquetas
        alert("Etiqueta actualizada exitosamente!")
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Error actualizando etiqueta")
    }
  }

  const handleDeleteTag = async () => {
    if (!tagToDelete) return

    try {
      const response = await fetch(`/api/course-tags/${tagToDelete.id}`, {
        method: "DELETE",
      })
      const result = await response.json()
      if (result.success) {
        setIsDeleteTagDialogOpen(false)
        setTagToDelete(null)
        loadTags() // Recargar etiquetas
        alert("Etiqueta eliminada exitosamente!")
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Error eliminando etiqueta")
    }
  }

  const openEditTagDialog = (tag: any) => {
    setEditingTag({ ...tag })
    setIsEditTagDialogOpen(true)
  }

  const openDeleteTagDialog = (tag: any) => {
    setTagToDelete(tag)
    setIsDeleteTagDialogOpen(true)
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
    console.log("Abriendo diálogo para curso:", courseId, "lección:", lesson) // Debug

    setSelectedCourse(courseId)
    if (lesson) {
      setEditingLesson(lesson)
      setNewLesson({
        title: lesson.title || "",
        description: lesson.description || "",
        videoUrl: lesson.video_url || "", // database uses video_url
        duration: lesson.duration_minutes?.toString() || "", // database uses duration_minutes
        order: lesson.order_index?.toString() || "", // database uses order_index
        isFree: lesson.is_free || false, // database uses is_free
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

  const handleArchiveLesson = async (lessonId: string) => {
    console.log("Intentando archivar lección con ID:", lessonId) // Debug

    if (!lessonId || lessonId === "undefined" || lessonId === "null") {
      alert("Error: ID de lección no válido")
      console.error("ID de lección inválido:", lessonId)
      return
    }

    if (confirm("¿Estás seguro de que quieres archivar esta lección? Se ocultará pero no se eliminará.")) {
      try {
        const response = await fetch(`/api/admin/lessons/${lessonId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: true }),
        })
        const result = await response.json()
        if (result.success) {
          loadCourses()
          alert("Lección archivada exitosamente")
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error("Error archivando lección:", error)
        alert("Error archivando lección")
      }
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    console.log("Intentando eliminar lección con ID:", lessonId) // Debug

    if (!lessonId || lessonId === "undefined" || lessonId === "null") {
      alert("Error: ID de lección no válido")
      console.error("ID de lección inválido:", lessonId)
      return
    }

    if (
      confirm("¿Estás seguro de que quieres ELIMINAR DEFINITIVAMENTE esta lección? Esta acción no se puede deshacer.")
    ) {
      try {
        const response = await fetch(`/api/admin/lessons/${lessonId}`, {
          method: "DELETE",
        })
        const result = await response.json()
        if (result.success) {
          loadCourses()
          alert("Lección eliminada definitivamente")
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error("Error eliminando lección:", error)
        alert("Error eliminando lección")
      }
    }
  }

  // Nuevas funciones para cursos
  const handleArchiveCourse = async (courseId: string) => {
    console.log("Intentando archivar curso con ID:", courseId)

    if (!courseId || courseId === "undefined" || courseId === "null") {
      alert("Error: ID de curso no válido")
      return
    }

    if (
      confirm("¿Estás seguro de que quieres archivar este curso? Se ocultará de la vista pública pero no se eliminará.")
    ) {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: true }),
        })
        const result = await response.json()
        if (result.success) {
          loadCourses()
          alert("Curso archivado exitosamente")
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error("Error archivando curso:", error)
        alert("Error archivando curso")
      }
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    console.log("Intentando eliminar curso con ID:", courseId)

    if (!courseId || courseId === "undefined" || courseId === "null") {
      alert("Error: ID de curso no válido")
      return
    }

    if (
      confirm(
        "¿Estás seguro de que quieres ELIMINAR DEFINITIVAMENTE este curso? Esta acción eliminará también todas sus lecciones y no se puede deshacer.",
      )
    ) {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          method: "DELETE",
        })
        const result = await response.json()
        if (result.success) {
          loadCourses()
          alert(result.message)
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error("Error eliminando curso:", error)
        alert("Error eliminando curso")
      }
    }
  }

  const handleTagToggle = (tagId: string) => {
    setNewCourse((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId) ? prev.tags.filter((id) => id !== tagId) : [...prev.tags, tagId],
    }))
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

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
              <TabsTrigger value="tags" className="text-xs sm:text-sm">
                <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Etiquetas
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Usuarios
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="courses" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Cursos</h2>
              <Button size="sm" className="w-full sm:w-auto" onClick={() => setIsCreateCourseDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Curso
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
                        <TableHead className="min-w-[150px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <div>
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-sm sm:text-base">{course.title}</p>
                                {course.archived && (
                                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                    Archivado
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {course.tags?.slice(0, 2).map((tag) => (
                                  <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="text-xs"
                                    style={{ backgroundColor: tag.color + "20", color: tag.color }}
                                  >
                                    {tag.name}
                                  </Badge>
                                ))}
                                {course.tags?.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{course.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs sm:text-sm text-gray-500">
                                Creado: {course.created_at ? new Date(course.created_at).toLocaleDateString() : "N/A"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm sm:text-base">
                            {(course.students || 0).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm sm:text-base">
                            ${(course.revenue || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Video className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                              <span className="text-sm sm:text-base">{course.lessonsCount || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={course.status === "published" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {course.status === "published" ? "Publicado" : "Borrador"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openLessonDialog(course.id)}
                                title="Agregar lección"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Editar curso">
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (course.id) {
                                    handleArchiveCourse(course.id)
                                  } else {
                                    alert("Error: ID de curso no disponible")
                                  }
                                }}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                title={course.archived ? "Curso archivado" : "Archivar curso"}
                              >
                                {course.archived ? (
                                  <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : (
                                  <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (course.id) {
                                    handleDeleteCourse(course.id)
                                  } else {
                                    alert("Error: ID de curso no disponible")
                                  }
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Eliminar definitivamente"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
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
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-base sm:text-lg">{course.title}</CardTitle>
                          {course.archived && (
                            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                              Archivado
                            </Badge>
                          )}
                        </div>
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
                        {course.lessons.map((lesson) => {
                          console.log("Renderizando lección:", lesson) // Debug
                          return (
                            <div
                              key={lesson.id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs sm:text-sm font-medium text-blue-600">
                                    {lesson.order_index}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm sm:text-base truncate">{lesson.title}</p>
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3" />
                                      <span>{lesson.duration_minutes} min</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <LinkIcon className="w-3 h-3" />
                                      <span>Bunny.net</span>
                                    </div>
                                    {lesson.is_free && (
                                      <Badge variant="secondary" className="text-xs">
                                        Gratis
                                      </Badge>
                                    )}
                                    <div className="text-xs text-gray-400">ID: {lesson.id}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 self-end sm:self-center">
                                <Button variant="ghost" size="sm" onClick={() => openLessonDialog(course.id, lesson)}>
                                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (lesson.id) {
                                      handleArchiveLesson(lesson.id)
                                    } else {
                                      alert("Error: ID de lección no disponible")
                                      console.error("Lección sin ID:", lesson)
                                    }
                                  }}
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  title="Archivar lección"
                                >
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (lesson.id) {
                                      handleDeleteLesson(lesson.id)
                                    } else {
                                      alert("Error: ID de lección no disponible")
                                      console.error("Lección sin ID:", lesson)
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Eliminar definitivamente"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
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

          <TabsContent value="tags" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Etiquetas de Cursos</h2>
              <Button size="sm" className="w-full sm:w-auto" onClick={() => setIsCreateTagDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Etiqueta
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tags.map((tag) => (
                <Card key={tag.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        variant="secondary"
                        className="text-sm font-medium"
                        style={{ backgroundColor: tag.color + "20", color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                      <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: tag.color }} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tag.description}</p>
                    <p className="text-xs text-gray-400 mb-3">Slug: {tag.slug}</p>

                    {/* Botones de acción */}
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditTagDialog(tag)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Editar etiqueta"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteTagDialog(tag)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Eliminar etiqueta"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
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

      {/* Dialog para crear curso */}
      <Dialog open={isCreateCourseDialogOpen} onOpenChange={setIsCreateCourseDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Crear Nuevo Curso</DialogTitle>
            <DialogDescription className="text-sm">
              Completa los detalles básicos del curso. Las lecciones se configuran después.
            </DialogDescription>
          </DialogHeader>

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
                required
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
                required
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
                  required
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
                  required
                />
              </div>
            </div>

            {/* Selección de Etiquetas */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Etiquetas del Curso</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={newCourse.tags.includes(tag.id)}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                    />
                    <Label htmlFor={`tag-${tag.id}`} className="text-xs cursor-pointer" style={{ color: tag.color }}>
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">Selecciona las etiquetas que mejor describan este curso</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateCourseDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Crear Curso
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear etiqueta */}
      <Dialog open={isCreateTagDialogOpen} onOpenChange={setIsCreateTagDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Crear Nueva Etiqueta</DialogTitle>
            <DialogDescription className="text-sm">
              Crea una nueva etiqueta para categorizar los cursos
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTag} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tagName" className="text-sm">
                Nombre de la Etiqueta
              </Label>
              <Input
                id="tagName"
                placeholder="Ej: Cirugía Oral"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagColor" className="text-sm">
                Color
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="tagColor"
                  type="color"
                  value={newTag.color}
                  onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={newTag.color}
                  onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagDescription" className="text-sm">
                Descripción (Opcional)
              </Label>
              <Textarea
                id="tagDescription"
                placeholder="Describe el tipo de cursos que incluye esta etiqueta..."
                value={newTag.description}
                onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateTagDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Crear Etiqueta
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar etiqueta */}
      <Dialog open={isEditTagDialogOpen} onOpenChange={setIsEditTagDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Editar Etiqueta</DialogTitle>
            <DialogDescription className="text-sm">Modifica los detalles de la etiqueta</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditTag} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTagName" className="text-sm">
                Nombre de la Etiqueta
              </Label>
              <Input
                id="editTagName"
                placeholder="Ej: Cirugía Oral"
                value={editingTag?.name || ""}
                onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editTagColor" className="text-sm">
                Color
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="editTagColor"
                  type="color"
                  value={editingTag?.color || "#3B82F6"}
                  onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={editingTag?.color || "#3B82F6"}
                  onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editTagDescription" className="text-sm">
                Descripción (Opcional)
              </Label>
              <Textarea
                id="editTagDescription"
                placeholder="Describe el tipo de cursos que incluye esta etiqueta..."
                value={editingTag?.description || ""}
                onChange={(e) => setEditingTag({ ...editingTag, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditTagDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Actualizar Etiqueta
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para eliminar etiqueta */}
      <AlertDialog open={isDeleteTagDialogOpen} onOpenChange={setIsDeleteTagDialogOpen}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base sm:text-lg">¿Eliminar Etiqueta?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              ¿Estás seguro de que quieres eliminar la etiqueta "{tagToDelete?.name}"? Esta acción no se puede deshacer.
              {tagToDelete && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800">
                    <strong>Nota:</strong> Si esta etiqueta está siendo usada por algún curso, no podrá ser eliminada.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTag} className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
              Eliminar Etiqueta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default AdminPage
