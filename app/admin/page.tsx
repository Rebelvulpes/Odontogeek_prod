"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Navigation } from "@/components/navigation"
import { RouteGuard } from "@/components/route-guard"
import {
  Users,
  BookOpen,
  DollarSign,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  EyeOff,
  Archive,
  Play,
  Pause,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  created_at: string
}

interface Course {
  id: string
  title: string
  description: string
  price: number
  instructor_name: string
  thumbnail_url?: string
  created_at: string
  archived: boolean
  students: number
  revenue: number
  lessonsCount: number
}

interface Lesson {
  id: string
  title: string
  description: string
  video_url: string
  duration_minutes: number
  course_id: string
  order_index: number
  created_at: string
  courses?: {
    id: string
    title: string
  }
}

interface Stats {
  totalUsers: number
  totalCourses: number
  totalLessons: number
  totalRevenue: number
}

interface CourseTag {
  id: string
  name: string
  color: string
  created_at: string
}

interface CarouselSlide {
  id: string
  title: string
  description: string
  image_url: string
  link_url?: string
  is_active: boolean
  order_index: number
  created_at: string
}

export default function AdminPanel() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalCourses: 0, totalLessons: 0, totalRevenue: 0 })
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [courseTags, setCourseTags] = useState<CourseTag[]>([])
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [openCourses, setOpenCourses] = useState<Set<string>>(new Set())

  // Dialog states
  const [courseDialogOpen, setCourseDialogOpen] = useState(false)
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [slideDialogOpen, setSlideDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [editingTag, setEditingTag] = useState<CourseTag | null>(null)
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    price: "",
    instructor: "",
    thumbnail_url: "",
  })

  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    video_url: "",
    duration_minutes: "",
    order_index: "",
  })

  const [tagForm, setTagForm] = useState({
    name: "",
    color: "#3B82F6",
  })

  const [slideForm, setSlideForm] = useState({
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    is_active: true,
    order_index: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchCourses(),
        fetchLessons(),
        fetchCourseTags(),
        fetchCarouselSlides(),
      ])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setStats(result.data)
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setUsers(result.data)
        } else {
          setUsers([])
        }
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses")
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setCourses(result.data)
        } else {
          console.error("Courses data is not an array:", result)
          setCourses([])
        }
      } else {
        setCourses([])
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
      setCourses([])
    }
  }

  const fetchLessons = async () => {
    try {
      const response = await fetch("/api/admin/lessons")
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setLessons(result.data)
        } else {
          setLessons([])
        }
      } else {
        setLessons([])
      }
    } catch (error) {
      console.error("Error fetching lessons:", error)
      setLessons([])
    }
  }

  const fetchCourseTags = async () => {
    try {
      const response = await fetch("/api/course-tags")
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setCourseTags(result.data)
        } else {
          setCourseTags([])
        }
      } else {
        setCourseTags([])
      }
    } catch (error) {
      console.error("Error fetching course tags:", error)
      setCourseTags([])
    }
  }

  const fetchCarouselSlides = async () => {
    try {
      const response = await fetch("/api/carousel")
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data)) {
          setCarouselSlides(result.data)
        } else {
          setCarouselSlides([])
        }
      } else {
        setCarouselSlides([])
      }
    } catch (error) {
      console.error("Error fetching carousel slides:", error)
      setCarouselSlides([])
    }
  }

  const handleCreateCourse = async () => {
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseForm.title,
          description: courseForm.description,
          price: courseForm.price,
          instructor: courseForm.instructor,
          thumbnail_url: courseForm.thumbnail_url,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Curso creado correctamente" })
        setCourseDialogOpen(false)
        setCourseForm({ title: "", description: "", price: "", instructor: "", thumbnail_url: "" })
        await fetchCourses()
        await fetchStats()
      } else {
        throw new Error(result.message || "Error al crear curso")
      }
    } catch (error) {
      console.error("Error creating course:", error)
      toast({ title: "Error", description: "Error al crear curso", variant: "destructive" })
    }
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse) return

    try {
      const response = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseForm.title,
          description: courseForm.description,
          price: courseForm.price,
          instructor: courseForm.instructor,
          thumbnail_url: courseForm.thumbnail_url,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Curso actualizado correctamente" })
        setCourseDialogOpen(false)
        setEditingCourse(null)
        setCourseForm({ title: "", description: "", price: "", instructor: "", thumbnail_url: "" })
        await fetchCourses()
      } else {
        throw new Error(result.message || "Error al actualizar curso")
      }
    } catch (error) {
      console.error("Error updating course:", error)
      toast({ title: "Error", description: "Error al actualizar curso", variant: "destructive" })
    }
  }

  const handleArchiveCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Curso archivado correctamente" })
        await fetchCourses()
        await fetchStats()
      } else {
        throw new Error(result.message || "Error al archivar curso")
      }
    } catch (error) {
      console.error("Error archiving course:", error)
      toast({ title: "Error", description: "Error al archivar curso", variant: "destructive" })
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Curso eliminado correctamente" })
        await fetchCourses()
        await fetchStats()
      } else {
        throw new Error(result.message || "Error al eliminar curso")
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({ title: "Error", description: "Error al eliminar curso", variant: "destructive" })
    }
  }

  const openEditCourseDialog = (course: Course) => {
    setEditingCourse(course)
    setCourseForm({
      title: course.title || "",
      description: course.description || "",
      price: course.price?.toString() || "",
      instructor: course.instructor_name || "",
      thumbnail_url: course.thumbnail_url || "",
    })
    setCourseDialogOpen(true)
  }

  const openNewCourseDialog = () => {
    setEditingCourse(null)
    setCourseForm({ title: "", description: "", price: "", instructor: "", thumbnail_url: "" })
    setCourseDialogOpen(true)
  }

  const handleCreateLesson = async () => {
    if (!selectedCourseId) {
      toast({ title: "Error", description: "Error: No se ha seleccionado un curso", variant: "destructive" })
      return
    }

    try {
      const response = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonForm.title,
          description: lessonForm.description,
          video_url: lessonForm.video_url,
          duration_minutes: lessonForm.duration_minutes,
          course_id: selectedCourseId,
          order_index: lessonForm.order_index,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Lección creada correctamente" })
        setLessonDialogOpen(false)
        setLessonForm({
          title: "",
          description: "",
          video_url: "",
          duration_minutes: "",
          order_index: "",
        })
        setSelectedCourseId("")
        await fetchLessons()
        await fetchStats()
      } else {
        throw new Error(result.message || "Error al crear lección")
      }
    } catch (error) {
      console.error("Error creating lesson:", error)
      toast({ title: "Error", description: "Error al crear lección", variant: "destructive" })
    }
  }

  const handleUpdateLesson = async () => {
    if (!editingLesson) return

    try {
      const response = await fetch(`/api/admin/lessons/${editingLesson.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: lessonForm.title,
          description: lessonForm.description,
          video_url: lessonForm.video_url,
          duration_minutes: lessonForm.duration_minutes,
          course_id: editingLesson.course_id,
          order_index: lessonForm.order_index,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Lección actualizada correctamente" })
        setLessonDialogOpen(false)
        setEditingLesson(null)
        setLessonForm({
          title: "",
          description: "",
          video_url: "",
          duration_minutes: "",
          order_index: "",
        })
        await fetchLessons()
      } else {
        throw new Error(result.message || "Error al actualizar lección")
      }
    } catch (error) {
      console.error("Error updating lesson:", error)
      toast({ title: "Error", description: "Error al actualizar lección", variant: "destructive" })
    }
  }

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Lección eliminada correctamente" })
        await fetchLessons()
        await fetchStats()
      } else {
        throw new Error(result.message || "Error al eliminar lección")
      }
    } catch (error) {
      console.error("Error deleting lesson:", error)
      toast({ title: "Error", description: "Error al eliminar lección", variant: "destructive" })
    }
  }

  const openEditLessonDialog = (lesson: Lesson) => {
    setEditingLesson(lesson)
    setLessonForm({
      title: lesson.title || "",
      description: lesson.description || "",
      video_url: lesson.video_url || "",
      duration_minutes: lesson.duration_minutes?.toString() || "",
      order_index: lesson.order_index?.toString() || "",
    })
    setLessonDialogOpen(true)
  }

  const openNewLessonDialogForCourse = (courseId: string) => {
    setEditingLesson(null)
    setSelectedCourseId(courseId)
    setLessonForm({
      title: "",
      description: "",
      video_url: "",
      duration_minutes: "",
      order_index: "",
    })
    setLessonDialogOpen(true)
  }

  const toggleCourseOpen = (courseId: string) => {
    const newOpenCourses = new Set(openCourses)
    if (newOpenCourses.has(courseId)) {
      newOpenCourses.delete(courseId)
    } else {
      newOpenCourses.add(courseId)
    }
    setOpenCourses(newOpenCourses)
  }

  const getLessonsForCourse = (courseId: string) => {
    return lessons.filter((lesson) => lesson.course_id === courseId).sort((a, b) => a.order_index - b.order_index)
  }

  const handleCreateTag = async () => {
    try {
      const response = await fetch("/api/course-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tagForm),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Tag creado correctamente" })
        setTagDialogOpen(false)
        setTagForm({ name: "", color: "#3B82F6" })
        await fetchCourseTags()
      } else {
        throw new Error(result.message || "Error al crear tag")
      }
    } catch (error) {
      console.error("Error creating tag:", error)
      toast({ title: "Error", description: "Error al crear tag", variant: "destructive" })
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag) return

    try {
      const response = await fetch(`/api/course-tags/${editingTag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tagForm),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Tag actualizado correctamente" })
        setTagDialogOpen(false)
        setEditingTag(null)
        setTagForm({ name: "", color: "#3B82F6" })
        await fetchCourseTags()
      } else {
        throw new Error(result.message || "Error al actualizar tag")
      }
    } catch (error) {
      console.error("Error updating tag:", error)
      toast({ title: "Error", description: "Error al actualizar tag", variant: "destructive" })
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    try {
      const response = await fetch(`/api/course-tags/${tagId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Tag eliminado correctamente" })
        await fetchCourseTags()
      } else {
        throw new Error(result.message || "Error al eliminar tag")
      }
    } catch (error) {
      console.error("Error deleting tag:", error)
      toast({ title: "Error", description: "Error al eliminar tag", variant: "destructive" })
    }
  }

  const openEditTagDialog = (tag: CourseTag) => {
    setEditingTag(tag)
    setTagForm({
      name: tag.name || "",
      color: tag.color || "#3B82F6",
    })
    setTagDialogOpen(true)
  }

  const openNewTagDialog = () => {
    setEditingTag(null)
    setTagForm({ name: "", color: "#3B82F6" })
    setTagDialogOpen(true)
  }

  const handleCreateSlide = async () => {
    try {
      const response = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: slideForm.title,
          description: slideForm.description,
          image_url: slideForm.image_url,
          link_url: slideForm.link_url,
          is_active: slideForm.is_active,
          order_index: slideForm.order_index,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Slide creado correctamente" })
        setSlideDialogOpen(false)
        setSlideForm({ title: "", description: "", image_url: "", link_url: "", is_active: true, order_index: "" })
        await fetchCarouselSlides()
      } else {
        throw new Error(result.message || "Error al crear slide")
      }
    } catch (error) {
      console.error("Error creating slide:", error)
      toast({ title: "Error", description: "Error al crear slide", variant: "destructive" })
    }
  }

  const handleUpdateSlide = async () => {
    if (!editingSlide) return

    try {
      const response = await fetch(`/api/carousel/${editingSlide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: slideForm.title,
          description: slideForm.description,
          image_url: slideForm.image_url,
          link_url: slideForm.link_url,
          is_active: slideForm.is_active,
          order_index: slideForm.order_index,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Slide actualizado correctamente" })
        setSlideDialogOpen(false)
        setEditingSlide(null)
        setSlideForm({ title: "", description: "", image_url: "", link_url: "", is_active: true, order_index: "" })
        await fetchCarouselSlides()
      } else {
        throw new Error(result.message || "Error al actualizar slide")
      }
    } catch (error) {
      console.error("Error updating slide:", error)
      toast({ title: "Error", description: "Error al actualizar slide", variant: "destructive" })
    }
  }

  const handleToggleSlideActive = async (slideId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/carousel/${slideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: `Slide ${!isActive ? "activado" : "desactivado"} correctamente` })
        await fetchCarouselSlides()
      } else {
        throw new Error(result.message || "Error al cambiar estado del slide")
      }
    } catch (error) {
      console.error("Error toggling slide:", error)
      toast({ title: "Error", description: "Error al cambiar estado del slide", variant: "destructive" })
    }
  }

  const handleDeleteSlide = async (slideId: string) => {
    try {
      const response = await fetch(`/api/carousel/${slideId}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({ title: "Éxito", description: "Slide eliminado correctamente" })
        await fetchCarouselSlides()
      } else {
        throw new Error(result.message || "Error al eliminar slide")
      }
    } catch (error) {
      console.error("Error deleting slide:", error)
      toast({ title: "Error", description: "Error al eliminar slide", variant: "destructive" })
    }
  }

  const openEditSlideDialog = (slide: CarouselSlide) => {
    setEditingSlide(slide)
    setSlideForm({
      title: slide.title || "",
      description: slide.description || "",
      image_url: slide.image_url || "",
      link_url: slide.link_url || "",
      is_active: slide.is_active,
      order_index: slide.order_index?.toString() || "",
    })
    setSlideDialogOpen(true)
  }

  const openNewSlideDialog = () => {
    setEditingSlide(null)
    setSlideForm({
      title: "",
      description: "",
      image_url: "",
      link_url: "",
      is_active: true,
      order_index: "",
    })
    setSlideDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-600 mt-2">Gestiona usuarios, cursos y contenido de la plataforma</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Lecciones</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLessons}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue}</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="courses" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="courses">Cursos</TabsTrigger>
              <TabsTrigger value="lessons">Lecciones</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="carousel">Carousel</TabsTrigger>
              <TabsTrigger value="users">Usuarios</TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Cursos</CardTitle>
                      <CardDescription>Administra los cursos de la plataforma</CardDescription>
                    </div>
                    <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={openNewCourseDialog}>
                          <Plus className="w-4 h-4 mr-2" />
                          Nuevo Curso
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{editingCourse ? "Editar Curso" : "Crear Nuevo Curso"}</DialogTitle>
                          <DialogDescription>
                            {editingCourse ? "Modifica los datos del curso" : "Completa la información del nuevo curso"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                              id="title"
                              value={courseForm.title}
                              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                              placeholder="Título del curso"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                              id="description"
                              value={courseForm.description}
                              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                              placeholder="Descripción del curso"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="price">Precio</Label>
                              <Input
                                id="price"
                                type="number"
                                value={courseForm.price}
                                onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                                placeholder="0.00"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="instructor">Instructor</Label>
                              <Input
                                id="instructor"
                                value={courseForm.instructor}
                                onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                                placeholder="Nombre del instructor"
                              />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="thumbnail_url">URL de Imagen</Label>
                            <Input
                              id="thumbnail_url"
                              value={courseForm.thumbnail_url}
                              onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                              placeholder="https://ejemplo.com/imagen.jpg"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}>
                            {editingCourse ? "Actualizar" : "Crear"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Lecciones</TableHead>
                        <TableHead>Estudiantes</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(courses) && courses.length > 0 ? (
                        courses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell>
                              <img
                                src={course.thumbnail_url || "/placeholder.svg"}
                                alt={course.title}
                                className="w-16 h-12 object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.jpg"
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{course.title}</TableCell>
                            <TableCell>{course.instructor_name}</TableCell>
                            <TableCell>${course.price}</TableCell>
                            <TableCell>{course.lessonsCount || 0}</TableCell>
                            <TableCell>{course.students || 0}</TableCell>
                            <TableCell>
                              <Badge variant={course.archived ? "secondary" : "default"}>
                                {course.archived ? "Archivado" : "Activo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditCourseDialog(course)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleArchiveCourse(course.id)}
                                  disabled={course.archived}
                                >
                                  {course.archived ? <EyeOff className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Se eliminará permanentemente el curso y todas
                                        sus lecciones.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteCourse(course.id)}>
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No hay cursos disponibles
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lessons Tab - Organized by Course */}
            <TabsContent value="lessons">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Lecciones por Curso</CardTitle>
                  <CardDescription>Administra las lecciones organizadas por curso</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Array.isArray(courses) && courses.length > 0 ? (
                    courses.map((course) => {
                      const courseLessons = getLessonsForCourse(course.id)
                      const isOpen = openCourses.has(course.id)

                      return (
                        <div key={course.id} className="border rounded-lg">
                          <Collapsible open={isOpen} onOpenChange={() => toggleCourseOpen(course.id)}>
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
                                <div className="flex items-center space-x-4">
                                  {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                  <img
                                    src={course.thumbnail_url || "/placeholder.svg"}
                                    alt={course.title}
                                    className="w-12 h-8 object-cover rounded"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement
                                      target.src = "/placeholder.jpg"
                                    }}
                                  />
                                  <div>
                                    <h3 className="font-semibold text-lg">{course.title}</h3>
                                    <p className="text-sm text-gray-600">
                                      {courseLessons.length} lecciones • {course.instructor_name}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={course.archived ? "secondary" : "default"}>
                                    {course.archived ? "Archivado" : "Activo"}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openNewLessonDialogForCourse(course.id)
                                    }}
                                    disabled={course.archived}
                                  >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Nueva Lección
                                  </Button>
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="px-4 pb-4">
                                {courseLessons.length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Orden</TableHead>
                                        <TableHead>Título</TableHead>
                                        <TableHead>Duración</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Acciones</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {courseLessons.map((lesson) => (
                                        <TableRow key={lesson.id}>
                                          <TableCell className="font-medium">#{lesson.order_index}</TableCell>
                                          <TableCell>{lesson.title}</TableCell>
                                          <TableCell>{lesson.duration_minutes} min</TableCell>
                                          <TableCell>{new Date(lesson.created_at).toLocaleDateString()}</TableCell>
                                          <TableCell>
                                            <div className="flex items-center space-x-2">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditLessonDialog(lesson)}
                                              >
                                                <Edit className="w-4 h-4" />
                                              </Button>
                                              <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                  <Button variant="ghost" size="sm">
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                  </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                  <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                      Esta acción no se puede deshacer. Se eliminará permanentemente la
                                                      lección.
                                                    </AlertDialogDescription>
                                                  </AlertDialogHeader>
                                                  <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteLesson(lesson.id)}>
                                                      Eliminar
                                                    </AlertDialogAction>
                                                  </AlertDialogFooter>
                                                </AlertDialogContent>
                                              </AlertDialog>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                ) : (
                                  <div className="text-center py-8 text-gray-500">
                                    <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No hay lecciones en este curso</p>
                                    <Button
                                      variant="outline"
                                      className="mt-2 bg-transparent"
                                      onClick={() => openNewLessonDialogForCourse(course.id)}
                                      disabled={course.archived}
                                    >
                                      <Plus className="w-4 h-4 mr-1" />
                                      Crear primera lección
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No hay cursos disponibles</h3>
                      <p className="text-gray-600 mb-4">Crea tu primer curso para comenzar a agregar lecciones</p>
                      <Button onClick={openNewCourseDialog}>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Primer Curso
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lesson Dialog */}
              <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{editingLesson ? "Editar Lección" : "Crear Nueva Lección"}</DialogTitle>
                    <DialogDescription>
                      {editingLesson
                        ? "Modifica los datos de la lección"
                        : `Crear nueva lección para: ${courses.find((c) => c.id === selectedCourseId)?.title || "Curso seleccionado"}`}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="lesson-title">Título</Label>
                      <Input
                        id="lesson-title"
                        value={lessonForm.title}
                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                        placeholder="Título de la lección"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lesson-description">Descripción</Label>
                      <Textarea
                        id="lesson-description"
                        value={lessonForm.description}
                        onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                        placeholder="Descripción de la lección"
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="video-url">URL del Video</Label>
                      <Input
                        id="video-url"
                        value={lessonForm.video_url}
                        onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                        placeholder="https://ejemplo.com/video.mp4"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="duration">Duración (min)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={lessonForm.duration_minutes}
                          onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: e.target.value })}
                          placeholder="30"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="order">Orden</Label>
                        <Input
                          id="order"
                          type="number"
                          value={lessonForm.order_index}
                          onChange={(e) => setLessonForm({ ...lessonForm, order_index: e.target.value })}
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={editingLesson ? handleUpdateLesson : handleCreateLesson}>
                      {editingLesson ? "Actualizar" : "Crear"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Tags Tab */}
            <TabsContent value="tags">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Tags</CardTitle>
                      <CardDescription>Administra las etiquetas para categorizar cursos</CardDescription>
                    </div>
                    <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={openNewTagDialog}>
                          <Plus className="w-4 h-4 mr-2" />
                          Nuevo Tag
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingTag ? "Editar Tag" : "Crear Nuevo Tag"}</DialogTitle>
                          <DialogDescription>
                            {editingTag ? "Modifica los datos del tag" : "Completa la información del nuevo tag"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="tag-name">Nombre</Label>
                            <Input
                              id="tag-name"
                              value={tagForm.name}
                              onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                              placeholder="Nombre del tag"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="tag-color">Color</Label>
                            <Input
                              id="tag-color"
                              type="color"
                              value={tagForm.color}
                              onChange={(e) => setTagForm({ ...tagForm, color: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={editingTag ? handleUpdateTag : handleCreateTag}>
                            {editingTag ? "Actualizar" : "Crear"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(courseTags) && courseTags.length > 0 ? (
                        courseTags.map((tag) => (
                          <TableRow key={tag.id}>
                            <TableCell className="font-medium">{tag.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
                                <span>{tag.color}</span>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(tag.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" onClick={() => openEditTagDialog(tag)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Se eliminará permanentemente el tag.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteTag(tag.id)}>
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            No hay tags disponibles
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Carousel Tab */}
            <TabsContent value="carousel">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Gestión de Carousel</CardTitle>
                      <CardDescription>Administra las imágenes del carousel principal</CardDescription>
                    </div>
                    <Dialog open={slideDialogOpen} onOpenChange={setSlideDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={openNewSlideDialog}>
                          <Plus className="w-4 h-4 mr-2" />
                          Nuevo Slide
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{editingSlide ? "Editar Slide" : "Crear Nuevo Slide"}</DialogTitle>
                          <DialogDescription>
                            {editingSlide ? "Modifica los datos del slide" : "Completa la información del nuevo slide"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="slide-title">Título</Label>
                            <Input
                              id="slide-title"
                              value={slideForm.title}
                              onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                              placeholder="Título del slide"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="slide-description">Descripción</Label>
                            <Textarea
                              id="slide-description"
                              value={slideForm.description}
                              onChange={(e) => setSlideForm({ ...slideForm, description: e.target.value })}
                              placeholder="Descripción del slide"
                              rows={3}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="slide-image">URL de Imagen</Label>
                            <Input
                              id="slide-image"
                              value={slideForm.image_url}
                              onChange={(e) => setSlideForm({ ...slideForm, image_url: e.target.value })}
                              placeholder="https://ejemplo.com/imagen.jpg"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="slide-link">URL de Enlace (opcional)</Label>
                            <Input
                              id="slide-link"
                              value={slideForm.link_url}
                              onChange={(e) => setSlideForm({ ...slideForm, link_url: e.target.value })}
                              placeholder="https://ejemplo.com/enlace"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="slide-order">Orden</Label>
                              <Input
                                id="slide-order"
                                type="number"
                                value={slideForm.order_index}
                                onChange={(e) => setSlideForm({ ...slideForm, order_index: e.target.value })}
                                placeholder="1"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="slide-active"
                                checked={slideForm.is_active}
                                onCheckedChange={(checked) => setSlideForm({ ...slideForm, is_active: checked })}
                              />
                              <Label htmlFor="slide-active">Activo</Label>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSlideDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={editingSlide ? handleUpdateSlide : handleCreateSlide}>
                            {editingSlide ? "Actualizar" : "Crear"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Imagen</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Orden</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(carouselSlides) && carouselSlides.length > 0 ? (
                        carouselSlides.map((slide) => (
                          <TableRow key={slide.id}>
                            <TableCell>
                              <img
                                src={slide.image_url || "/placeholder.svg"}
                                alt={slide.title}
                                className="w-16 h-10 object-cover rounded"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.src = "/placeholder.jpg"
                                }}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{slide.title}</TableCell>
                            <TableCell>
                              <Badge variant={slide.is_active ? "default" : "secondary"}>
                                {slide.is_active ? "Activo" : "Inactivo"}
                              </Badge>
                            </TableCell>
                            <TableCell>{slide.order_index}</TableCell>
                            <TableCell>{new Date(slide.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleSlideActive(slide.id, slide.is_active)}
                                >
                                  {slide.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openEditSlideDialog(slide)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Esta acción no se puede deshacer. Se eliminará permanentemente el slide.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDeleteSlide(slide.id)}>
                                        Eliminar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            No hay slides disponibles
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>Administra los usuarios registrados en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Fecha de Registro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(users) && users.length > 0 ? (
                        users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.first_name} {user.last_name}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                            </TableCell>
                            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            No hay usuarios registrados
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RouteGuard>
  )
}
