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
import { Checkbox } from "@/components/ui/checkbox"
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
  Archive,
  Tag,
  ImageIcon,
  ExternalLink,
  Presentation,
} from "lucide-react"
import { Navigation } from "@/components/navigation"

interface Course {
  id: string
  title: string
  description: string
  price: number
  instructor_name: string
  thumbnail_url: string
  duration_hours: number
  archived: boolean
  created_at: string
  lessons: Lesson[]
  tags: CourseTag[]
  students: number
  revenue: number
  lessonsCount: number
  status: string
}

interface Lesson {
  id: string
  title: string
  description: string
  video_url: string
  duration_minutes: number
  order_index: number
  is_free: boolean
  archived: boolean
  created_at: string
}

interface CourseTag {
  id: string
  name: string
  color: string
  slug: string
  description: string
}

interface CarouselSlide {
  id: string
  title: string
  subtitle: string
  description: string
  image_url: string
  cta_text: string
  cta_link: string
  background_color: string
  badge_text: string
  badge_color: string
  order_index: number
  is_active: boolean
  slide_type: string
  stats: Array<{
    icon_name: string
    label: string
    value: string
    order_index: number
  }>
}

interface Stats {
  totalUsers: number
  totalCourses: number
  totalLessons: number
  totalRevenue: number
}

const AdminPage = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [tags, setTags] = useState<CourseTag[]>([])
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    price: "",
    instructor: "",
    thumbnailUrl: "",
    durationHours: "",
    tags: [] as string[],
  })
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
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
  const [editingTag, setEditingTag] = useState<CourseTag | null>(null)
  const [tagToDelete, setTagToDelete] = useState<CourseTag | null>(null)
  const [newTag, setNewTag] = useState({
    name: "",
    color: "#3B82F6",
    description: "",
  })
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Carousel management states
  const [isCreateSlideDialogOpen, setIsCreateSlideDialogOpen] = useState(false)
  const [isEditSlideDialogOpen, setIsEditSlideDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null)
  const [newSlide, setNewSlide] = useState({
    title: "",
    subtitle: "",
    description: "",
    image_url: "",
    cta_text: "Ver Más",
    cta_link: "/courses",
    background_color: "from-blue-900 to-indigo-900",
    badge_text: "",
    badge_color: "bg-blue-500",
    slide_type: "general",
  })

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      } else {
        console.error("Error cargando estadísticas:", result.message)
        setStats({
          totalUsers: 0,
          totalCourses: 0,
          totalLessons: 0,
          totalRevenue: 0,
        })
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error)
      setStats({
        totalUsers: 0,
        totalCourses: 0,
        totalLessons: 0,
        totalRevenue: 0,
      })
    }
  }

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/courses")
      const result = await response.json()

      if (result.success) {
        setCourses(Array.isArray(result.data) ? result.data : [])
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
        setTags(Array.isArray(result.data) ? result.data : [])
      }
    } catch (error) {
      console.error("Error cargando etiquetas:", error)
    }
  }

  const loadCarouselSlides = async () => {
    try {
      const response = await fetch("/api/carousel")
      const result = await response.json()
      if (result.success) {
        setCarouselSlides(Array.isArray(result.data) ? result.data : [])
      }
    } catch (error) {
      console.error("Error cargando slides del carrusel:", error)
    }
  }

  useEffect(() => {
    loadStats()
    loadCourses()
    loadTags()
    loadCarouselSlides()
  }, [])

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCourse,
          duration_hours: newCourse.durationHours ? Number.parseInt(newCourse.durationHours) : null,
        }),
      })
      const result = await response.json()
      if (result.success) {
        setNewCourse({
          title: "",
          description: "",
          price: "",
          instructor: "",
          thumbnailUrl: "",
          durationHours: "",
          tags: [],
        })
        setIsCreateCourseDialogOpen(false)
        loadCourses()
        loadStats()
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
        loadTags()
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
        loadTags()
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
        loadTags()
        alert("Etiqueta eliminada exitosamente!")
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Error eliminando etiqueta")
    }
  }

  const openEditTagDialog = (tag: CourseTag) => {
    setEditingTag({ ...tag })
    setIsEditTagDialogOpen(true)
  }

  const openDeleteTagDialog = (tag: CourseTag) => {
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
        loadCourses()
        loadStats()
        alert("Lección creada exitosamente!")
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Error creando lección")
    }
  }

  const openLessonDialog = (courseId: string, lesson?: Lesson) => {
    setSelectedCourse(courseId)
    if (lesson) {
      setEditingLesson(lesson)
      setNewLesson({
        title: lesson.title || "",
        description: lesson.description || "",
        videoUrl: lesson.video_url || "",
        duration: lesson.duration_minutes?.toString() || "",
        order: lesson.order_index?.toString() || "",
        isFree: lesson.is_free || false,
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
    if (!lessonId || lessonId === "undefined" || lessonId === "null") {
      alert("Error: ID de lección no válido")
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
          loadStats()
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
    if (!lessonId || lessonId === "undefined" || lessonId === "null") {
      alert("Error: ID de lección no válido")
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
          loadStats()
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

  const handleArchiveCourse = async (courseId: string) => {
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
          loadStats()
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
          loadStats()
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

  const openEditCourseDialog = (course: Course) => {
    setEditingCourse(course)
    setNewCourse({
      title: course.title || "",
      description: course.description || "",
      price: course.price?.toString() || "",
      instructor: course.instructor_name || "",
      thumbnailUrl: course.thumbnail_url || "",
      durationHours: course.duration_hours?.toString() || "",
      tags: course.tags?.map((tag) => tag.id) || [],
    })
    setIsEditCourseDialogOpen(true)
  }

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse) return

    try {
      const response = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newCourse.title,
          description: newCourse.description,
          price: Number.parseFloat(newCourse.price),
          instructor: newCourse.instructor,
          thumbnail_url: newCourse.thumbnailUrl,
          duration_hours: newCourse.durationHours ? Number.parseInt(newCourse.durationHours) : null,
          tags: newCourse.tags,
        }),
      })
      const result = await response.json()
      if (result.success) {
        setNewCourse({
          title: "",
          description: "",
          price: "",
          instructor: "",
          thumbnailUrl: "",
          durationHours: "",
          tags: [],
        })
        setIsEditCourseDialogOpen(false)
        setEditingCourse(null)
        loadCourses()
        loadStats()
        alert("Curso actualizado exitosamente!")
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("Error actualizando curso:", error)
      alert("Error actualizando curso")
    }
  }

  // Carousel management functions
  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSlide,
          order_index: carouselSlides.length + 1,
        }),
      })
      const result = await response.json()
      if (result.success) {
        setNewSlide({
          title: "",
          subtitle: "",
          description: "",
          image_url: "",
          cta_text: "Ver Más",
          cta_link: "/courses",
          background_color: "from-blue-900 to-indigo-900",
          badge_text: "",
          badge_color: "bg-blue-500",
          slide_type: "general",
        })
        setIsCreateSlideDialogOpen(false)
        loadCarouselSlides()
        alert("Slide creado exitosamente!")
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Error creando slide")
    }
  }

  const handleUpdateSlide = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSlide) return

    try {
      const response = await fetch(`/api/carousel/${editingSlide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newSlide.title,
          subtitle: newSlide.subtitle,
          description: newSlide.description,
          image_url: newSlide.image_url,
          cta_text: newSlide.cta_text,
          cta_link: newSlide.cta_link,
          background_color: newSlide.background_color,
          badge_text: newSlide.badge_text,
          badge_color: newSlide.badge_color,
          slide_type: newSlide.slide_type,
          is_active: editingSlide.is_active,
          order_index: editingSlide.order_index,
        }),
      })
      const result = await response.json()
      if (result.success) {
        setIsEditSlideDialogOpen(false)
        setEditingSlide(null)
        loadCarouselSlides()
        alert("Slide actualizado exitosamente!")
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Error actualizando slide")
    }
  }

  const handleDeleteSlide = async (slideId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este slide del carrusel?")) {
      try {
        const response = await fetch(`/api/carousel/${slideId}`, {
          method: "DELETE",
        })
        const result = await response.json()
        if (result.success) {
          loadCarouselSlides()
          alert("Slide eliminado exitosamente!")
        } else {
          alert(result.message)
        }
      } catch (error) {
        alert("Error eliminando slide")
      }
    }
  }

  const handleToggleSlideActive = async (slideId: string, isActive: boolean) => {
    try {
      const slide = carouselSlides.find(s => s.id === slideId)
      if (!slide) return

      const response = await fetch(`/api/carousel/${slideId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...slide,
          is_active: !isActive,
        }),
      })
      const result = await response.json()
      if (result.success) {
        loadCarouselSlides()
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert("Error actualizando slide")
    }
  }

  const openEditSlideDialog = (slide: CarouselSlide) => {
    setEditingSlide(slide)
    setNewSlide({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      image_url: slide.image_url,
      cta_text: slide.cta_text,
      cta_link: slide.cta_link,
      background_color: slide.background_color,
      badge_text: slide.badge_text,
      badge_color: slide.badge_color,
      slide_type: slide.slide_type,
    })
    setIsEditSlideDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={{ name: "Admin", email: "admin@odontogeek.com", role: "admin" }} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando panel de administración...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={{ name: "Admin", email: "admin@odontogeek.com", role: "admin" }} />

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona cursos, lecciones, etiquetas, carrusel y usuarios</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {stats.totalUsers.toLocaleString()}
                  </p>
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
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
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
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
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
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalLessons}</p>
                </div>
                <Video className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="courses" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-[500px] sm:min-w-0">
              <TabsTrigger value="courses" className="text-xs sm:text-sm">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Gestión de </span>Cursos
              </TabsTrigger>
              <TabsTrigger value="lessons" className="text-xs sm:text-sm">
                <Video className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Gestión de </span>Lecciones
              </TabsTrigger>
              <TabsTrigger value="carousel" className="text-xs sm:text-sm">
                <Presentation className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Carrusel
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
                        <TableHead className="min-w-[250px]">Curso</TableHead>
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
                            <div className="flex items-start space-x-3">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {course.thumbnail_url ? (
                                  <img
                                    src={course.thumbnail_url || "/placeholder.svg"}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = "/placeholder.svg?height=80&width=80&text=No+Image"
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <ImageIcon className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium text-sm sm:text-base truncate">{course.title}</p>
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
                                  {course.tags && course.tags.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{course.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                  ${course.price} • {course.duration_hours || 0}h
                                </p>
                                <p className="text-xs text-gray-400">
                                  Instructor: {course.instructor_name || "No asignado"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Creado: {course.created_at ? new Date(course.created_at).toLocaleDateString() : "N/A"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm sm:text-base">{course.students.toLocaleString()}</TableCell>
                          <TableCell className="text-sm sm:text-base">${course.revenue.toLocaleString()}</TableCell>
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
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Editar curso"
                                onClick={() => openEditCourseDialog(course)}
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchiveCourse(course.id)}
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
                                onClick={() => handleDeleteCourse(course.id)}
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
                        {course.lessons.map((lesson) => (
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
                                onClick={() => handleArchiveLesson(lesson.id)}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                title="Archivar lección"
                              >
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Eliminar definitivamente"
                              >
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

          <TabsContent value="carousel" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión del Carrusel</h2>
              <Button size="sm" className="w-full sm:w-auto" onClick={() => setIsCreateSlideDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Slide
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[300px]">Slide</TableHead>
                        <TableHead className="min-w-[100px]">Tipo</TableHead>
                        <TableHead className="min-w-[80px]">Orden</TableHead>
                        <TableHead className="min-w-[80px]">Estado</TableHead>
                        <TableHead className="min-w-[150px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carouselSlides.map((slide) => (
                        <TableRow key={slide.id}>
                          <TableCell>
                            <div className="flex items-start space-x-3">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {slide.image_url ? (
                                  <img
                                    src={slide.image_url || "/placeholder.svg"}
                                    alt={slide.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = "/placeholder.svg?height=80&width=80&text=No+Image"
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                    <Presentation className="w-6 h-6 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-2">
                                  <p className="font-medium text-sm sm:text-base truncate">{slide.title}</p>
                                  {slide.badge_text && (
                                    <Badge variant="secondary" className="text-xs">
                                      {slide.badge_text}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{slide.subtitle}</p>
                                <p className="text-xs text-gray-400 mt-1">CTA: {slide.cta_text}</p>
                                <p className="text-xs text-gray-400">Link: {slide.cta_link}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {slide.slide_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm sm:text-base">{slide.order_index}</TableCell>
                          <TableCell>
                            <Badge
                              variant={slide.is_active ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {slide.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditSlideDialog(slide)}
                                title="Editar slide"
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleSlideActive(slide.id, slide.is_active)}
                                className={slide.is_active ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                                title={slide.is_active ? "Desactivar slide" : "Activar slide"}
                              >
                                {slide.is_active ? (
                                  <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                                ) : (
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSlide(slide.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Eliminar slide"
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
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-sm sm:text-base">No hay usuarios registrados</p>
                            <p className="text-xs sm:text-sm">Los usuarios aparecerán aquí cuando se registren</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para crear/editar lecciones */}
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
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Crear Nuevo Curso</DialogTitle>
            <DialogDescription className="text-sm">
              Completa los detalles básicos del curso. Las lecciones se configuran después.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
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
                    rows={4}
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
                    <Label htmlFor="durationHours" className="text-sm sm:text-base">
                      Duración (horas)
                    </Label>
                    <Input
                      id="durationHours"
                      type="number"
                      placeholder="12"
                      value={newCourse.durationHours}
                      onChange={(e) => setNewCourse({ ...newCourse, durationHours: e.target.value })}
                      className="text-sm sm:text-base"
                    />
                  </div>
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

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl" className="text-sm sm:text-base flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Imagen del Curso
                  </Label>
                  <Input
                    id="thumbnailUrl"
                    type="url"
                    placeholder="https://res.cloudinary.com/tu-cuenta/image/upload/v123/curso.jpg"
                    value={newCourse.thumbnailUrl}
                    onChange={(e) => setNewCourse({ ...newCourse, thumbnailUrl: e.target.value })}
                    className="text-sm sm:text-base"
                  />
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>Sube tu imagen a Cloudinary, Imgur, o cualquier servicio de hosting de imágenes.</p>
                      <p className="mt-1">Tamaño recomendado: 1080x1080px (1:1)</p>
                    </div>
                  </div>
                </div>

                {newCourse.thumbnailUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm">Vista Previa</Label>
                    <div className="w-full max-w-sm">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                        <img
                          src={newCourse.thumbnailUrl || "/placeholder.svg"}
                          alt="Vista previa del curso"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=300&width=300&text=Error+cargando+imagen"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Etiquetas del Curso</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border rounded-md bg-gray-50">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={newCourse.tags.includes(tag.id)}
                          onCheckedChange={() => handleTagToggle(tag.id)}
                        />
                        <Label htmlFor={`tag-${tag.id}`} className="text-xs cursor-pointer flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                          <span style={{ color: tag.color }}>{tag.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Selecciona las etiquetas que mejor describan este curso</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateCourseDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Crear Curso
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar curso */}
      <Dialog open={isEditCourseDialogOpen} onOpenChange={setIsEditCourseDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Editar Curso</DialogTitle>
            <DialogDescription className="text-sm">
              Modifica los detalles del curso "{editingCourse?.title}"
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateCourse} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editTitle" className="text-sm sm:text-base">
                    Título del Curso
                  </Label>
                  <Input
                    id="editTitle"
                    placeholder="Ej: Implantología Avanzada"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    className="text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDescription" className="text-sm sm:text-base">
                    Descripción
                  </Label>
                  <Textarea
                    id="editDescription"
                    placeholder="Describe el contenido del curso..."
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    className="text-sm sm:text-base"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editPrice" className="text-sm sm:text-base">
                      Precio ($)
                    </Label>
                    <Input
                      id="editPrice"
                      type="number"
                      placeholder="299"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                      className="text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editDurationHours" className="text-sm sm:text-base">
                      Duración (horas)
                    </Label>
                    <Input
                      id="editDurationHours"
                      type="number"
                      placeholder="12"
                      value={newCourse.durationHours}
                      onChange={(e) => setNewCourse({ ...newCourse, durationHours: e.target.value })}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editInstructor" className="text-sm sm:text-base">
                    Instructor
                  </Label>
                  <Input
                    id="editInstructor"
                    placeholder="Dr. Juan Pérez"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                    className="text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editThumbnailUrl" className="text-sm sm:text-base flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Imagen del Curso
                  </Label>
                  <Input
                    id="editThumbnailUrl"
                    type="url"
                    placeholder="https://res.cloudinary.com/tu-cuenta/image/upload/v123/curso.jpg"
                    value={newCourse.thumbnailUrl}
                    onChange={(e) => setNewCourse({ ...newCourse, thumbnailUrl: e.target.value })}
                    className="text-sm sm:text-base"
                  />
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>Sube tu imagen a Cloudinary, Imgur, o cualquier servicio de hosting de imágenes.</p>
                      <p className="mt-1">Tamaño recomendado: 1080x1080px (1:1)</p>
                    </div>
                  </div>
                </div>

                {newCourse.thumbnailUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm">Vista Previa</Label>
                    <div className="w-full max-w-sm">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                        <img
                          src={newCourse.thumbnailUrl || "/placeholder.svg"}
                          alt="Vista previa del curso"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=300&width=300&text=Error+cargando+imagen"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Etiquetas del Curso</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border rounded-md bg-gray-50">
                    {tags.map((tag) => (
                      <div key={tag.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-tag-${tag.id}`}
                          checked={newCourse.tags.includes(tag.id)}
                          onCheckedChange={() => handleTagToggle(tag.id)}
                        />
                        <Label
                          htmlFor={`edit-tag-${tag.id}`}
                          className="text-xs cursor-pointer flex items-center space-x-1"
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                          <span style={{ color: tag.color }}>{tag.name}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Selecciona las etiquetas que mejor describan este curso</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditCourseDialogOpen(false)
                  setEditingCourse(null)
                  setNewCourse({
                    title: "",
                    description: "",
                    price: "",
                    instructor: "",
                    thumbnailUrl: "",
                    durationHours: "",
                    tags: [],
                  })
                }}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                <Edit className="w-4 h-4 mr-2" />
                Actualizar Curso
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para crear slide del carrusel */}
      <Dialog open={isCreateSlideDialogOpen} onOpenChange={setIsCreateSlideDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Crear Nuevo Slide</DialogTitle>
            <DialogDescription className="text-sm">
              Crea un nuevo slide para el carrusel de la página principal
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSlide} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slideTitle" className="text-sm sm:text-base">
                    Título del Slide
                  </Label>
                  <Input
                    id="slideTitle"
                    placeholder="Ej: Nuevo Curso Disponible"
                    value={newSlide.title}
                    onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                    className="text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slideSubtitle" className="text-sm sm:text-base">
                    Subtítulo
                  </Label>
                  <Input
                    id="slideSubtitle"
                    placeholder="Ej: Aprende las técnicas más avanzadas"
                    value={newSlide.subtitle}
                    onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slideDescription" className="text-sm sm:text-base">
                    Descripción
                  </Label>
                  <Textarea
                    id="slideDescription"
                    placeholder="Describe el contenido del slide..."
                    value={newSlide.description}
                    onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
                    className="text-sm sm:text-base"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slideCtaText" className="text-sm sm:text-base">
                      Texto del Botón
                    </Label>
                    <Input
                      id="slideCtaText"
                      placeholder="Ver Más"
                      value={newSlide.cta_text}
                      onChange={(e) => setNewSlide({ ...newSlide, cta_text: e.target.value })}
                      className="text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slideCtaLink" className="text-sm sm:text-base">
                      Enlace del Botón
                    </Label>
                    <Input
                      id="slideCtaLink"
                      placeholder="/courses"
                      value={newSlide.cta_link}
                      onChange={(e) => setNewSlide({ ...newSlide, cta_link: e.target.value })}
                      className="text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slideBadgeText" className="text-sm sm:text-base">
                      Texto del Badge
                    </Label>
                    <Input
                      id="slideBadgeText"
                      placeholder="Nuevo"
                      value={newSlide.badge_text}
                      onChange={(e) => setNewSlide({ ...newSlide, badge_text: e.target.value })}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slideType" className="text-sm sm:text-base">
                      Tipo de Slide
                    </Label>
                    <select
                      id="slideType"
                      value={newSlide.slide_type}
                      onChange={(e) => setNewSlide({ ...newSlide, slide_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    >
                      <option value="general">General</option>
                      <option value="course">Curso</option>
                      <option value="promotion">Promoción</option>
                      <option value="news">Noticia</option>
                      <option value="success">Éxito</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slideImageUrl" className="text-sm sm:text-base flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Imagen del Slide
                  </Label>
                  <Input
                    id="slideImageUrl"
                    type="url"
                    placeholder="https://res.cloudinary.com/tu-cuenta/image/upload/v123/slide.jpg"
                    value={newSlide.image_url}
                    onChange={(e) => setNewSlide({ ...newSlide, image_url: e.target.value })}
                    className="text-sm sm:text-base"
                  />
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>Sube tu imagen a Cloudinary, Imgur, o cualquier servicio de hosting de imágenes.</p>
                      <p className="mt-1">Tamaño recomendado: 1080x1080px (1:1)</p>
                    </div>
                  </div>
                </div>

                {newSlide.image_url && (
                  <div className="space-y-2">
                    <Label className="text-sm">Vista Previa</Label>
                    <div className="w-full max-w-sm">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                        <img
                          src={newSlide.image_url || "/placeholder.svg"}
                          alt="Vista previa del slide"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=300&width=300&text=Error+cargando+imagen"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="slideBackgroundColor" className="text-sm sm:text-base">
                    Color de Fondo (Gradiente)
                  </Label>
                  <select
                    id="slideBackgroundColor"
                    value={newSlide.background_color}
                    onChange={(e) => setNewSlide({ ...newSlide, background_color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  >
                    <option value="from-blue-900 to-indigo-900">Azul a Índigo</option>
                    <option value="from-purple-900 to-blue-900">Púrpura a Azul</option>
                    <option value="from-red-900 to-pink-900">Rojo a Rosa</option>
                    <option value="from-green-900 to-teal-900">Verde a Teal</option>
                    <option value="from-orange-900 to-red-900">Naranja a Rojo</option>
                    <option value="from-gray-900 to-gray-800">Gris Oscuro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slideBadgeColor" className="text-sm sm:text-base">
                    Color del Badge
                  </Label>
                  <select
                    id="slideBadgeColor"
                    value={newSlide.badge_color}
                    onChange={(e) => setNewSlide({ ...newSlide, badge_color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  >
                    <option value="bg-blue-500">Azul</option>
                    <option value="bg-green-500">Verde</option>
                    <option value="bg-red-500">Rojo</option>
                    <option value="bg-purple-500">Púrpura</option>
                    <option value="bg-orange-500">Naranja</option>
                    <option value="bg-gray-500">Gris</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateSlideDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Crear Slide
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar slide del carrusel */}
      <Dialog open={isEditSlideDialogOpen} onOpenChange={setIsEditSlideDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Editar Slide</DialogTitle>
            <DialogDescription className="text-sm">
              Modifica los detalles del slide "{editingSlide?.title}"
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateSlide} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editSlideTitle" className="text-sm sm:text-base">
                    Título del Slide
                  </Label>
                  <Input
                    id="editSlideTitle"
                    placeholder="Ej: Nuevo Curso Disponible"
                    value={newSlide.title}
                    onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                    className="text-sm sm:text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editSlideSubtitle" className="text-sm sm:text-base">
                    Subtítulo
                  </Label>
                  <Input
                    id="editSlideSubtitle"
                    placeholder="Ej: Aprende las técnicas más avanzadas"
                    value={newSlide.subtitle}
                    onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editSlideDescription" className="text-sm sm:text-base">
                    Descripción
                  </Label>
                  <Textarea
                    id="editSlideDescription"
                    placeholder="Describe el contenido del slide..."
                    value={newSlide.description}
                    onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
                    className="text-sm sm:text-base"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editSlideCtaText" className="text-sm sm:text-base">
                      Texto del Botón
                    </Label>
                    <Input
                      id="editSlideCtaText"
                      placeholder="Ver Más"
                      value={newSlide.cta_text}
                      onChange={(e) => setNewSlide({ ...newSlide, cta_text: e.target.value })}
                      className="text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editSlideCtaLink" className="text-sm sm:text-base">
                      Enlace del Botón
                    </Label>
                    <Input
                      id="editSlideCtaLink"
                      placeholder="/courses"
                      value={newSlide.cta_link}
                      onChange={(e) => setNewSlide({ ...newSlide, cta_link: e.target.value })}
                      className="text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editSlideBadgeText" className="text-sm sm:text-base">
                      Texto del Badge
                    </Label>
                    <Input
                      id="editSlideBadgeText"
                      placeholder="Nuevo"
                      value={newSlide.badge_text}
                      onChange={(e) => setNewSlide({ ...newSlide, badge_text: e.target.value })}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editSlideType" className="text-sm sm:text-base">
                      Tipo de Slide
                    </Label>
                    <select
                      id="editSlideType"
                      value={newSlide.slide_type}
                      onChange={(e) => setNewSlide({ ...newSlide, slide_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                    >
                      <option value="general">General</option>
                      <option value="course">Curso</option>
                      <option value="promotion">Promoción</option>
                      <option value="news">Noticia</option>
                      <option value="success">Éxito</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editSlideImageUrl" className="text-sm sm:text-base flex items-center">
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Imagen del Slide
                  </Label>
                  <Input
                    id="editSlideImageUrl"
                    type="url"
                    placeholder="https://res.cloudinary.com/tu-cuenta/image/upload/v123/slide.jpg"
                    value={newSlide.image_url}
                    onChange={(e) => setNewSlide({ ...newSlide, image_url: e.target.value })}
                    className="text-sm sm:text-base"
                  />
                  <div className="flex items-start space-x-2 text-xs text-gray-500">
                    <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>Sube tu imagen a Cloudinary, Imgur, o cualquier servicio de hosting de imágenes.</p>
                      <p className="mt-1">Tamaño recomendado: 1080x1080px (1:1)</p>
                    </div>
                  </div>
                </div>

                {newSlide.image_url && (
                  <div className="space-y-2">
                    <Label className="text-sm">Vista Previa</Label>
                    <div className="w-full max-w-sm">
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                        <img
                          src={newSlide.image_url || "/placeholder.svg"}
                          alt="Vista previa del slide"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=300&width=300&text=Error+cargando+imagen"
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="editSlideBackgroundColor" className="text-sm sm:text-base">
                    Color de Fondo (Gradiente)
                  </Label>
                  <select
                    id="editSlideBackgroundColor"
                    value={newSlide.background_color}
                    onChange={(e) => setNewSlide({ ...newSlide, background_color: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  >
                    <option value="from-blue-900 to-indigo-900">Azul a Índigo</option>
                    <option value="from-purple-900 to-blue-900">Púrpura a Azul</option>
                    <option value="from-red-900 to-pink-900">Rojo a Rosa</option>
                    <option value="from-green-900 to-teal-900">Verde a Teal</option>
                    <option value="from-orange-900 to-red-900">Naranja a Rojo</option>
                    <option value="from-gray-900 to-gray-800">Gris Oscuro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editSlideBadgeColor" className="text-sm sm:text-base">
                    Color del Badge
                  </Label>
                  <select
                    id="editSlideBadgeColor"
                    value={newSlide.badge_color}
                    onChange={(e) => setNewSlide({ ...newSlide, badge_color: e.\
