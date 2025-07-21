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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Presentation,
  Star,
  TrendingUp,
  Award,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
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

interface Course {
  id: string
  title: string
  description: string
  price: number
  instructor_name: string
  thumbnail_url: string
  duration_hours: number
  difficulty_level: string
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

interface User {
  id: string
  name: string
  email: string
  role: string
  courses: number
  spent: number
  joinDate: string
  avatar_url?: string
  is_test_user?: boolean
  enrollment_count: number
  total_spent: number
  created_at: string
  updated_at: string
}

interface Stats {
  totalUsers: number
  totalCourses: number
  totalLessons: number
  totalRevenue: number
}

const AdminPage = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [tags, setTags] = useState<CourseTag[]>([])
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    price: "",
    instructor: "",
    thumbnailUrl: "",
    durationHours: "",
    difficultyLevel: "principiante",
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

  const difficultyLevels = [
    {
      value: "principiante",
      label: "Principiante",
      icon: Star,
      color: "text-green-600",
      bgColor: "bg-green-100 text-green-800",
    },
    {
      value: "intermedio",
      label: "Intermedio",
      icon: TrendingUp,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 text-yellow-800",
    },
    { value: "experto", label: "Experto", icon: Award, color: "text-red-600", bgColor: "bg-red-100 text-red-800" },
  ]

  const getDifficultyIcon = (level: string) => {
    const difficulty = difficultyLevels.find((d) => d.value === level)
    if (!difficulty) return <Star className="w-4 h-4 text-gray-500" />
    const Icon = difficulty.icon
    return <Icon className={`w-4 h-4 ${difficulty.color}`} />
  }

  const getDifficultyColor = (level: string) => {
    const difficulty = difficultyLevels.find((d) => d.value === level)
    return difficulty ? difficulty.bgColor : "bg-gray-100 text-gray-800"
  }

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

  const loadUsers = async () => {
    try {
      console.log("=== LOADING USERS ===")
      setUsersLoading(true)
      setUsersError(null)

      const response = await fetch("/api/admin/users", {
        method: "GET",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Users API response status:", response.status)
      console.log("Users API response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Users API error:", response.status, response.statusText)
        console.error("Error response:", errorText)

        let errorMessage = "Error desconocido"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`
        }

        setUsersError(errorMessage)
        setUsers([])
        return
      }

      const result = await response.json()
      console.log("Users API result:", result)

      if (result.success) {
        const usersData = result.data || result.users || []
        console.log("Setting users data:", usersData.length, "users")
        setUsers(usersData)
        setUsersError(null)
      } else {
        console.error("Error loading users:", result.message)
        setUsersError(result.message || "Error cargando usuarios")
        setUsers([])
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error)
      setUsersError("Error de conexión al cargar usuarios")
      setUsers([])
    } finally {
      setUsersLoading(false)
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
    loadUsers() // Load users on component mount
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
          difficulty_level: newCourse.difficultyLevel,
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
          difficultyLevel: "principiante",
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
      difficultyLevel: course.difficulty_level || "principiante",
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
          difficulty_level: newCourse.difficultyLevel,
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
          difficultyLevel: "principiante",
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
                                  <Badge className={`text-xs ${getDifficultyColor(course.difficulty_level)}`}>
                                    <span className="flex items-center gap-1">
                                      {getDifficultyIcon(course.difficulty_level)}
                                      {course.difficulty_level?.charAt(0).toUpperCase() +
                                        course.difficulty_level?.slice(1)}
                                    </span>
                                  </Badge>
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
                          <Badge className={`text-xs ${getDifficultyColor(course.difficulty_level)}`}>
                            <span className="flex items-center gap-1">
                              {getDifficultyIcon(course.difficulty_level)}
                              {course.difficulty_level?.charAt(0).toUpperCase() + course.difficulty_level?.slice(1)}
                            </span>
                          </Badge>
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
                            <Badge variant={slide.is_active ? "default" : "secondary"} className="text-xs">
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
                                className={
                                  slide.is_active
                                    ? "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                    : "text-green-600 hover:text-green-700 hover:bg-green-50"
                                }
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
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Etiquetas</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Los niveles de dificultad son permanentes. Solo puedes gestionar las etiquetas de software.
                </p>
              </div>
              <Button size="sm" className="w-full sm:w-auto" onClick={() => setIsCreateTagDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Etiqueta de Software
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Difficulty Levels - Read Only */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Niveles de Dificultad</h3>
                  <Badge variant="secondary" className="text-xs">
                    Permanente
                  </Badge>
                </div>
                <div className="space-y-3">
                  {difficultyLevels.map((level) => (
                    <Card
                      key={level.value}
                      className="border-l-4"
                      style={{
                        borderLeftColor: level.color.includes("green")
                          ? "#10b981"
                          : level.color.includes("yellow")
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getDifficultyIcon(level.value)}
                            <div>
                              <p className="font-medium text-gray-900">{level.label}</p>
                              <p className="text-sm text-gray-500">
                                {level.value === "principiante" && "Para personas que están comenzando"}
                                {level.value === "intermedio" && "Para quienes tienen conocimientos básicos"}
                                {level.value === "experto" && "Para profesionales con experiencia"}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${getDifficultyColor(level.value)}`}>Sistema</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Software Tags - Editable */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Etiquetas de Software</h3>
                  <Badge variant="outline" className="text-xs">
                    Editable
                  </Badge>
                </div>
                <div className="space-y-3">
                  {tags.length > 0 ? (
                    tags.map((tag) => (
                      <Card key={tag.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
                              <div>
                                <p className="font-medium text-gray-900">{tag.name}</p>
                                <p className="text-sm text-gray-500">{tag.description || "Sin descripción"}</p>
                                <p className="text-xs text-gray-400">Slug: {tag.slug}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditTagDialog(tag)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Editar etiqueta"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteTagDialog(tag)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Eliminar etiqueta"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="p-8 text-center">
                        <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">No hay etiquetas de software</p>
                        <p className="text-sm text-gray-500 mb-4">
                          Crea etiquetas para categorizar tus cursos por software o tecnología
                        </p>
                        <Button onClick={() => setIsCreateTagDialogOpen(true)} variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Crear Primera Etiqueta
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
              <Button size="sm" className="w-full sm:w-auto" onClick={loadUsers} disabled={usersLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${usersLoading ? "animate-spin" : ""}`} />
                {usersLoading ? "Cargando..." : "Actualizar"}
              </Button>
            </div>

            {usersError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Error cargando usuarios:</strong> {usersError}
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardContent className="p-0">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando usuarios...</p>
                    </div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No se encontraron usuarios</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {usersError
                        ? "Verifica la conexión y permisos"
                        : "Los usuarios aparecerán aquí cuando se registren"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[250px]">Usuario</TableHead>
                          <TableHead className="min-w-[100px]">Rol</TableHead>
                          <TableHead className="min-w-[100px]">Cursos</TableHead>
                          <TableHead className="min-w-[100px]">Gastado</TableHead>
                          <TableHead className="min-w-[120px]">Fecha Registro</TableHead>
                          <TableHead className="min-w-[100px]">Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                                  {user.avatar_url ? (
                                    <img
                                      src={user.avatar_url || "/placeholder.svg"}
                                      alt={user.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement
                                        target.src = "/placeholder-user.jpg"
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                      <Users className="w-5 h-5 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{user.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                  {user.is_test_user && (
                                    <Badge variant="outline" className="text-xs mt-1">
                                      Usuario de prueba
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={user.role === "admin" ? "default" : "secondary"}
                                className="text-xs capitalize"
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{user.courses}</TableCell>
                            <TableCell className="text-sm">${user.spent.toLocaleString()}</TableCell>
                            <TableCell className="text-sm">{user.joinDate}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs text-green-600">
                                Activo
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Course Dialog */}
      <Dialog open={isCreateCourseDialogOpen} onOpenChange={setIsCreateCourseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Curso</DialogTitle>
            <DialogDescription>Completa la información para crear un nuevo curso</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título del Curso</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Precio ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="durationHours">Duración (horas)</Label>
                <Input
                  id="durationHours"
                  type="number"
                  value={newCourse.durationHours}
                  onChange={(e) => setNewCourse({ ...newCourse, durationHours: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="thumbnailUrl">URL de Imagen</Label>
                <Input
                  id="thumbnailUrl"
                  type="url"
                  value={newCourse.thumbnailUrl}
                  onChange={(e) => setNewCourse({ ...newCourse, thumbnailUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Difficulty Level */}
              <div>
                <Label htmlFor="difficultyLevel">Nivel de Dificultad</Label>
                <Select
                  value={newCourse.difficultyLevel}
                  onValueChange={(value) => setNewCourse({ ...newCourse, difficultyLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map((level) => {
                      const Icon = level.icon
                      return (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${level.color}`} />
                            {level.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Software Tags */}
              <div>
                <Label>Etiquetas de Software</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 mt-1">
                  {tags.length > 0 ? (
                    <div className="space-y-2">
                      {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag.id}`}
                            checked={newCourse.tags.includes(tag.id)}
                            onCheckedChange={() => handleTagToggle(tag.id)}
                          />
                          <Label
                            htmlFor={`tag-${tag.id}`}
                            className="text-sm cursor-pointer flex items-center space-x-1"
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                            <span style={{ color: tag.color }}>{tag.name}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No hay etiquetas disponibles. Crea algunas en la sección de Etiquetas.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateCourseDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear Curso</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditCourseDialogOpen} onOpenChange={setIsEditCourseDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
            <DialogDescription>Modifica la información del curso</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCourse} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Título del Curso</Label>
                <Input
                  id="edit-title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-instructor">Instructor</Label>
                <Input
                  id="edit-instructor"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-price">Precio ($)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-durationHours">Duración (horas)</Label>
                <Input
                  id="edit-durationHours"
                  type="number"
                  value={newCourse.durationHours}
                  onChange={(e) => setNewCourse({ ...newCourse, durationHours: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-thumbnailUrl">URL de Imagen</Label>
                <Input
                  id="edit-thumbnailUrl"
                  type="url"
                  value={newCourse.thumbnailUrl}
                  onChange={(e) => setNewCourse({ ...newCourse, thumbnailUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Difficulty Level */}
              <div>
                <Label htmlFor="edit-difficultyLevel">Nivel de Dificultad</Label>
                <Select
                  value={newCourse.difficultyLevel}
                  onValueChange={(value) => setNewCourse({ ...newCourse, difficultyLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyLevels.map((level) => {
                      const Icon = level.icon
                      return (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${level.color}`} />
                            {level.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Software Tags */}
              <div>
                <Label>Etiquetas de Software</Label>
                <div className="max-h-32 overflow-y-auto border rounded-md p-2 mt-1">
                  {tags.length > 0 ? (
                    <div className="space-y-2">
                      {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-tag-${tag.id}`}
                            checked={newCourse.tags.includes(tag.id)}
                            onCheckedChange={() => handleTagToggle(tag.id)}
                          />
                          <Label
                            htmlFor={`edit-tag-${tag.id}`}
                            className="text-sm cursor-pointer flex items-center space-x-1"
                          >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }} />
                            <span style={{ color: tag.color }}>{tag.name}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No hay etiquetas disponibles. Crea algunas en la sección de Etiquetas.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditCourseDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar Curso</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Lesson Dialog */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Editar Lección" : "Crear Nueva Lección"}</DialogTitle>
            <DialogDescription>{selectedCourseData && `Curso: ${selectedCourseData.title}`}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lesson-title">Título de la Lección</Label>
                <Input
                  id="lesson-title"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lesson-order">Orden</Label>
                <Input
                  id="lesson-order"
                  type="number"
                  value={newLesson.order}
                  onChange={(e) => setNewLesson({ ...newLesson, order: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lesson-description">Descripción</Label>
              <Textarea
                id="lesson-description"
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lesson-video">URL del Video</Label>
                <Input
                  id="lesson-video"
                  type="url"
                  value={newLesson.videoUrl}
                  onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lesson-duration">Duración (minutos)</Label>
                <Input
                  id="lesson-duration"
                  type="number"
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lesson-free"
                checked={newLesson.isFree}
                onCheckedChange={(checked) => setNewLesson({ ...newLesson, isFree: checked as boolean })}
              />
              <Label htmlFor="lesson-free">Lección gratuita</Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingLesson ? "Actualizar" : "Crear"} Lección</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Tag Dialog */}
      <Dialog open={isCreateTagDialogOpen} onOpenChange={setIsCreateTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Etiqueta de Software</DialogTitle>
            <DialogDescription>
              Crea una nueva etiqueta para categorizar cursos por software o tecnología
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTag} className="space-y-4">
            <div>
              <Label htmlFor="tag-name">Nombre de la Etiqueta</Label>
              <Input
                id="tag-name"
                value={newTag.name}
                onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                placeholder="Ej: Photoshop, AutoCAD, etc."
                required
              />
            </div>

            <div>
              <Label htmlFor="tag-color">Color</Label>
              <Input
                id="tag-color"
                type="color"
                value={newTag.color}
                onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                className="h-10"
              />
            </div>

            <div>
              <Label htmlFor="tag-description">Descripción</Label>
              <Textarea
                id="tag-description"
                value={newTag.description}
                onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                placeholder="Describe para qué se usa este software..."
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateTagDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear Etiqueta</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={isEditTagDialogOpen} onOpenChange={setIsEditTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Etiqueta</DialogTitle>
            <DialogDescription>Modifica la información de la etiqueta</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditTag} className="space-y-4">
            <div>
              <Label htmlFor="edit-tag-name">Nombre de la Etiqueta</Label>
              <Input
                id="edit-tag-name"
                value={editingTag?.name || ""}
                onChange={(e) => setEditingTag(editingTag ? { ...editingTag, name: e.target.value } : null)}
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-tag-color">Color</Label>
              <Input
                id="edit-tag-color"
                type="color"
                value={editingTag?.color || "#3B82F6"}
                onChange={(e) => setEditingTag(editingTag ? { ...editingTag, color: e.target.value } : null)}
                className="h-10"
              />
            </div>

            <div>
              <Label htmlFor="edit-tag-description">Descripción</Label>
              <Textarea
                id="edit-tag-description"
                value={editingTag?.description || ""}
                onChange={(e) => setEditingTag(editingTag ? { ...editingTag, description: e.target.value } : null)}
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditTagDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar Etiqueta</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Dialog */}
      <AlertDialog open={isDeleteTagDialogOpen} onOpenChange={setIsDeleteTagDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar etiqueta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la etiqueta "{tagToDelete?.name}". Los cursos que usen esta etiqueta
              ya no la tendrán asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTag} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Slide Dialog */}
      <Dialog open={isCreateSlideDialogOpen} onOpenChange={setIsCreateSlideDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Slide</DialogTitle>
            <DialogDescription>Crea un nuevo slide para el carrusel de la página principal</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSlide} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slide-title">Título</Label>
                <Input
                  id="slide-title"
                  value={newSlide.title}
                  onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slide-subtitle">Subtítulo</Label>
                <Input
                  id="slide-subtitle"
                  value={newSlide.subtitle}
                  onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="slide-description">Descripción</Label>
              <Textarea
                id="slide-description"
                value={newSlide.description}
                onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slide-image">URL de Imagen</Label>
                <Input
                  id="slide-image"
                  type="url"
                  value={newSlide.image_url}
                  onChange={(e) => setNewSlide({ ...newSlide, image_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="slide-type">Tipo de Slide</Label>
                <select
                  id="slide-type"
                  value={newSlide.slide_type}
                  onChange={(e) => setNewSlide({ ...newSlide, slide_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="course">Curso</option>
                  <option value="promotion">Promoción</option>
                  <option value="announcement">Anuncio</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slide-cta-text">Texto del Botón</Label>
                <Input
                  id="slide-cta-text"
                  value={newSlide.cta_text}
                  onChange={(e) => setNewSlide({ ...newSlide, cta_text: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="slide-cta-link">Enlace del Botón</Label>
                <Input
                  id="slide-cta-link"
                  value={newSlide.cta_link}
                  onChange={(e) => setNewSlide({ ...newSlide, cta_link: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="slide-badge-text">Texto del Badge</Label>
                <Input
                  id="slide-badge-text"
                  value={newSlide.badge_text}
                  onChange={(e) => setNewSlide({ ...newSlide, badge_text: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="slide-background">Color de Fondo</Label>
                <select
                  id="slide-background"
                  value={newSlide.background_color}
                  onChange={(e) => setNewSlide({ ...newSlide, background_color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="from-blue-900 to-indigo-900">Azul a Índigo</option>
                  <option value="from-purple-900 to-pink-900">Púrpura a Rosa</option>
                  <option value="from-green-900 to-teal-900">Verde a Teal</option>
                  <option value="from-orange-900 to-red-900">Naranja a Rojo</option>
                  <option value="from-gray-900 to-black">Gris a Negro</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateSlideDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Crear Slide</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Slide Dialog */}
      <Dialog open={isEditSlideDialogOpen} onOpenChange={setIsEditSlideDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Slide</DialogTitle>
            <DialogDescription>Modifica la información del slide del carrusel</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateSlide} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-slide-title">Título</Label>
                <Input
                  id="edit-slide-title"
                  value={newSlide.title}
                  onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-slide-subtitle">Subtítulo</Label>
                <Input
                  id="edit-slide-subtitle"
                  value={newSlide.subtitle}
                  onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-slide-description">Descripción</Label>
              <Textarea
                id="edit-slide-description"
                value={newSlide.description}
                onChange={(e) => setNewSlide({ ...newSlide, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-slide-image">URL de Imagen</Label>
                <Input
                  id="edit-slide-image"
                  type="url"
                  value={newSlide.image_url}
                  onChange={(e) => setNewSlide({ ...newSlide, image_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-slide-type">Tipo de Slide</Label>
                <select
                  id="edit-slide-type"
                  value={newSlide.slide_type}
                  onChange={(e) => setNewSlide({ ...newSlide, slide_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="course">Curso</option>
                  <option value="promotion">Promoción</option>
                  <option value="announcement">Anuncio</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-slide-cta-text">Texto del Botón</Label>
                <Input
                  id="edit-slide-cta-text"
                  value={newSlide.cta_text}
                  onChange={(e) => setNewSlide({ ...newSlide, cta_text: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-slide-cta-link">Enlace del Botón</Label>
                <Input
                  id="edit-slide-cta-link"
                  value={newSlide.cta_link}
                  onChange={(e) => setNewSlide({ ...newSlide, cta_link: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-slide-badge-text">Texto del Badge</Label>
                <Input
                  id="edit-slide-badge-text"
                  value={newSlide.badge_text}
                  onChange={(e) => setNewSlide({ ...newSlide, badge_text: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-slide-background">Color de Fondo</Label>
                <select
                  id="edit-slide-background"
                  value={newSlide.background_color}
                  onChange={(e) => setNewSlide({ ...newSlide, background_color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="from-blue-900 to-indigo-900">Azul a Índigo</option>
                  <option value="from-purple-900 to-pink-900">Púrpura a Rosa</option>
                  <option value="from-green-900 to-teal-900">Verde a Teal</option>
                  <option value="from-orange-900 to-red-900">Naranja a Rojo</option>
                  <option value="from-gray-900 to-black">Gris a Negro</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditSlideDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar Slide</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminPage
