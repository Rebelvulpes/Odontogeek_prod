"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Video,
  Users,
  DollarSign,
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Eye,
  Archive,
  Tag,
  ImageIcon,
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
        setCourses([])
        alert(`Error cargando cursos: ${result.message}`)
      }
    } catch (error) {
      console.error("Error cargando cursos:", error)
      setCourses([])
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
      } else {
        setTags([])
      }
    } catch (error) {
      console.error("Error cargando etiquetas:", error)
      setTags([])
    }
  }

  const loadCarouselSlides = async () => {
    try {
      const response = await fetch("/api/carousel")
      const result = await response.json()
      if (result.success) {
        setCarouselSlides(Array.isArray(result.data) ? result.data : [])
      } else {
        setCarouselSlides([])
      }
    } catch (error) {
      console.error("Error cargando slides del carrusel:", error)
      setCarouselSlides([])
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

  const handleUnarchiveCourse = async (courseId: string) => {
    if (!courseId || courseId === "undefined" || courseId === "null") {
      alert("Error: ID de curso no válido")
      return
    }

    if (confirm("¿Estás seguro de que quieres desarchivar este curso? Volverá a estar visible en la vista pública.")) {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: false }),
        })
        const result = await response.json()
        if (result.success) {
          loadCourses()
          loadStats()
          alert("Curso desarchivado exitosamente")
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error("Error desarchivando curso:", error)
        alert("Error desarchivando curso")
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
      const slide = carouselSlides.find((s) => s.id === slideId)
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
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      description: slide.description || "",
      image_url: slide.image_url || "",
      cta_text: slide.cta_text || "Ver Más",
      cta_link: slide.cta_link || "/courses",
      background_color: slide.background_color || "from-blue-900 to-indigo-900",
      badge_text: slide.badge_text || "",
      badge_color: slide.badge_color || "bg-blue-500",
      slide_type: slide.slide_type || "general",
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
                      {Array.isArray(courses) && courses.length > 0 ? (
                        courses.map((course) => (
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
                                    Creado:{" "}
                                    {course.created_at ? new Date(course.created_at).toLocaleDateString() : "N/A"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm sm:text-base">
                              {course.students?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell className="text-sm sm:text-base">
                              ${course.revenue?.toLocaleString() || 0}
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
                                  onClick={() =>
                                    course.archived ? handleUnarchiveCourse(course.id) : handleArchiveCourse(course.id)
                                  }
                                  className={
                                    course.archived
                                      ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                      : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  }
                                  title={course.archived ? "Desarchivar curso" : "Archivar curso"}
                                >
                                  {course.archived ? (
                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
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
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No hay cursos disponibles
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs content would continue here... */}
          <TabsContent value="lessons" className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Lecciones</h2>
            <div className="text-center py-8 text-gray-500">
              <p>Funcionalidad de lecciones en desarrollo...</p>
            </div>
          </TabsContent>

          <TabsContent value="carousel" className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión del Carrusel</h2>
            <div className="text-center py-8 text-gray-500">
              <p>Funcionalidad de carrusel en desarrollo...</p>
            </div>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Etiquetas de Cursos</h2>
            <div className="text-center py-8 text-gray-500">
              <p>Funcionalidad de etiquetas en desarrollo...</p>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Usuarios Registrados</h2>
            <div className="text-center py-8 text-gray-500">
              <p>Funcionalidad de usuarios en desarrollo...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AdminPage
