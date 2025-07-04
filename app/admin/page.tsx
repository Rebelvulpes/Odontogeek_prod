"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, DollarSign, BookOpen, Play, Edit, Eye, EyeOff, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Course {
  id: string
  title: string
  description: string
  price: number
  instructor_name: string
  duration_hours: number
  thumbnail_url: string
  status: string
  archived: boolean
  created_at: string
  lessonsCount: number
  students: number
  revenue: number
  tags: Array<{
    id: string
    name: string
    color: string
  }>
}

interface Stats {
  totalUsers: number
  totalCourses: number
  totalLessons: number
  totalRevenue: number
}

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  description: string
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalRevenue: 0,
  })
  const [courses, setCourses] = useState<Course[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    instructor: "",
    duration_hours: "",
    thumbnailUrl: "",
    tags: [] as string[],
  })

  useEffect(() => {
    loadStats()
    loadCourses()
    loadTags()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      } else {
        console.error("Error cargando estadísticas:", data.message)
        toast.error("Error cargando estadísticas")
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error)
      toast.error("Error cargando estadísticas")
    }
  }

  const loadCourses = async () => {
    try {
      const response = await fetch("/api/admin/courses")
      const data = await response.json()
      if (data.success) {
        setCourses(data.data)
      } else {
        console.error("Error cargando cursos:", data.message)
        toast.error("Error cargando cursos")
      }
    } catch (error) {
      console.error("Error cargando cursos:", error)
      toast.error("Error cargando cursos")
    } finally {
      setLoading(false)
    }
  }

  const loadTags = async () => {
    try {
      const response = await fetch("/api/course-tags")
      const data = await response.json()
      if (data.success) {
        setTags(data.data)
      }
    } catch (error) {
      console.error("Error cargando etiquetas:", error)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Curso creado exitosamente")
        setIsCreateDialogOpen(false)
        setFormData({
          title: "",
          description: "",
          price: "",
          instructor: "",
          duration_hours: "",
          thumbnailUrl: "",
          tags: [],
        })
        loadCourses()
        loadStats()
      } else {
        toast.error(data.message || "Error creando curso")
      }
    } catch (error) {
      console.error("Error creando curso:", error)
      toast.error("Error creando curso")
    }
  }

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse) return

    try {
      const response = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Curso actualizado exitosamente")
        setIsEditDialogOpen(false)
        setEditingCourse(null)
        setFormData({
          title: "",
          description: "",
          price: "",
          instructor: "",
          duration_hours: "",
          thumbnailUrl: "",
          tags: [],
        })
        loadCourses()
        loadStats()
      } else {
        toast.error(data.message || "Error actualizando curso")
      }
    } catch (error) {
      console.error("Error actualizando curso:", error)
      toast.error("Error actualizando curso")
    }
  }

  const handleArchiveCourse = async (courseId: string, archived: boolean) => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success(`Curso ${archived ? "archivado" : "restaurado"} exitosamente`)
        loadCourses()
        loadStats()
      } else {
        toast.error(data.message || "Error actualizando curso")
      }
    } catch (error) {
      console.error("Error actualizando curso:", error)
      toast.error("Error actualizando curso")
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      })

      const data = await response.json()
      if (data.success) {
        toast.success("Curso eliminado exitosamente")
        loadCourses()
        loadStats()
      } else {
        toast.error(data.message || "Error eliminando curso")
      }
    } catch (error) {
      console.error("Error eliminando curso:", error)
      toast.error("Error eliminando curso")
    }
  }

  const openEditDialog = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price.toString(),
      instructor: course.instructor_name,
      duration_hours: course.duration_hours?.toString() || "",
      thumbnailUrl: course.thumbnail_url || "",
      tags: course.tags.map((tag) => tag.id),
    })
    setIsEditDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
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
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLessons}</div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Management */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Gestión de Cursos</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Cursos</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Curso</DialogTitle>
                  <DialogDescription>Completa la información del nuevo curso.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructor">Instructor</Label>
                      <Input
                        id="instructor"
                        value={formData.instructor}
                        onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio (COP)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration_hours">Duración (horas)</Label>
                      <Input
                        id="duration_hours"
                        type="number"
                        value={formData.duration_hours}
                        onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thumbnailUrl">URL de Imagen</Label>
                    <Input
                      id="thumbnailUrl"
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Crear Curso</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Lecciones</TableHead>
                    <TableHead>Estudiantes</TableHead>
                    <TableHead>Ingresos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {course.thumbnail_url && (
                            <img
                              src={course.thumbnail_url || "/placeholder.svg"}
                              alt={course.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {course.description.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{course.instructor_name}</TableCell>
                      <TableCell>{formatCurrency(course.price)}</TableCell>
                      <TableCell>{course.lessonsCount}</TableCell>
                      <TableCell>{course.students}</TableCell>
                      <TableCell>{formatCurrency(course.revenue)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge variant={course.archived ? "secondary" : "default"}>
                            {course.archived ? "Archivado" : "Activo"}
                          </Badge>
                          {course.status === "published" && <Badge variant="outline">Publicado</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(course)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchiveCourse(course.id, !course.archived)}
                          >
                            {course.archived ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
            <DialogDescription>Actualiza la información del curso.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-instructor">Instructor</Label>
                <Input
                  id="edit-instructor"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Precio (COP)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration_hours">Duración (horas)</Label>
                <Input
                  id="edit-duration_hours"
                  type="number"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-thumbnailUrl">URL de Imagen</Label>
              <Input
                id="edit-thumbnailUrl"
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            <DialogFooter>
              <Button type="submit">Actualizar Curso</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
