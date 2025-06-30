"use client"

import type React from "react"

import { useState } from "react"
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
import { Video, Users, DollarSign, BookOpen, Plus, Edit, Trash2, Eye, Clock, LinkIcon } from "lucide-react"

const courses = [
  {
    id: 1,
    title: "Implantología Avanzada",
    students: 1250,
    revenue: 373750,
    status: "Publicado",
    videos: 24,
    createdAt: "2024-01-15",
    lessons: [
      {
        id: 1,
        title: "Introducción a la Implantología",
        description: "Conceptos básicos y fundamentos",
        videoUrl: "https://vz-12345.b-cdn.net/intro-implantologia.mp4",
        duration: 45,
        order: 1,
        isFree: true,
      },
      {
        id: 2,
        title: "Planificación del Tratamiento",
        description: "Evaluación del paciente y planificación",
        videoUrl: "https://vz-12345.b-cdn.net/planificacion-tratamiento.mp4",
        duration: 60,
        order: 2,
        isFree: false,
      },
    ],
  },
  {
    id: 2,
    title: "Endodoncia Contemporánea",
    students: 890,
    revenue: 177100,
    status: "Publicado",
    videos: 18,
    createdAt: "2024-02-01",
    lessons: [],
  },
]

const users = [
  {
    id: 1,
    name: "Dr. Juan Pérez",
    email: "juan@ejemplo.com",
    courses: 2,
    spent: 498,
    joinDate: "2024-01-10",
  },
  {
    id: 2,
    name: "Dra. María García",
    email: "maria@ejemplo.com",
    courses: 3,
    spent: 897,
    joinDate: "2024-01-15",
  },
]

export default function AdminPage() {
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    price: "",
    instructor: "",
  })

  const [selectedCourse, setSelectedCourse] = useState<number | null>(null)
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [newLesson, setNewLesson] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    order: "",
    isFree: false,
  })

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Nuevo curso:", newCourse)
    // Aquí implementarías la creación del curso
  }

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Nueva lección:", newLesson, "para curso:", selectedCourse)
    // Aquí implementarías la creación de la lección
    setIsLessonDialogOpen(false)
    setNewLesson({
      title: "",
      description: "",
      videoUrl: "",
      duration: "",
      order: "",
      isFree: false,
    })
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración - OdontoGeek</h1>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary">Administrador</Badge>
              <Button variant="outline" size="sm">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">2,847</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">$810,200</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Videos en Bunny.net</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
                <Video className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">Gestión de Cursos</TabsTrigger>
            <TabsTrigger value="lessons">Gestión de Lecciones</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="create">Crear Contenido</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Cursos</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Curso
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Curso</TableHead>
                      <TableHead>Estudiantes</TableHead>
                      <TableHead>Ingresos</TableHead>
                      <TableHead>Lecciones</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <p className="text-sm text-gray-500">Creado: {course.createdAt}</p>
                          </div>
                        </TableCell>
                        <TableCell>{course.students.toLocaleString()}</TableCell>
                        <TableCell>${course.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Video className="w-4 h-4 text-gray-500" />
                            <span>{course.lessons?.length || 0} lecciones</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={course.status === "Publicado" ? "default" : "secondary"}>
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => openLessonDialog(course.id)}>
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
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

          <TabsContent value="lessons" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Lecciones</h2>

            <div className="grid gap-6">
              {courses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <CardDescription>{course.lessons?.length || 0} lecciones configuradas</CardDescription>
                      </div>
                      <Button onClick={() => openLessonDialog(course.id)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Lección
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {course.lessons && course.lessons.length > 0 ? (
                      <div className="space-y-3">
                        {course.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">{lesson.order}</span>
                              </div>
                              <div>
                                <p className="font-medium">{lesson.title}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
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
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => openLessonDialog(course.id, lesson)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay lecciones configuradas</p>
                        <p className="text-sm">Agrega la primera lección para este curso</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Usuarios Registrados</h2>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cursos</TableHead>
                      <TableHead>Total Gastado</TableHead>
                      <TableHead>Fecha de Registro</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.courses}</TableCell>
                        <TableCell>${user.spent}</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
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

          <TabsContent value="create" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Curso</h2>

            <Card>
              <CardHeader>
                <CardTitle>Información del Curso</CardTitle>
                <CardDescription>
                  Completa los detalles básicos del curso. Las lecciones se configuran después con enlaces de Bunny.net
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título del Curso</Label>
                    <Input
                      id="title"
                      placeholder="Ej: Implantología Avanzada"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe el contenido del curso..."
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="299"
                        value={newCourse.price}
                        onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructor">Instructor</Label>
                      <Input
                        id="instructor"
                        placeholder="Dr. Juan Pérez"
                        value={newCourse.instructor}
                        onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
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
                <CardTitle className="flex items-center space-x-2">
                  <img
                    src="https://sjc.microlink.io/fwaEQxkrhQryOdc9uWl01AFU3L8KtJuDucDCGSljBKstN4yoPNLEati3Kpdm14J7I1V7spCnFfv827E1pXUsCg.jpeg"
                    alt="Bunny.net"
                    className="w-6 h-6 rounded"
                  />
                  <span>Integración con Bunny.net</span>
                </CardTitle>
                <CardDescription>
                  Los videos se hospedan en Bunny.net para máximo rendimiento y velocidad global
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-900 mb-2">Cómo configurar videos:</h4>
                    <ol className="text-sm text-orange-800 space-y-1">
                      <li>1. Sube tus videos a tu cuenta de Bunny.net</li>
                      <li>2. Copia el enlace directo del video (formato: https://vz-xxxxx.b-cdn.net/video.mp4)</li>
                      <li>3. Usa ese enlace al crear lecciones en OdontoGeek</li>
                      <li>4. Los videos se reproducirán con máxima velocidad para tus estudiantes</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
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

      {/* Dialog para crear/editar lecciones */}
      <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Editar Lección" : "Agregar Nueva Lección"}</DialogTitle>
            <DialogDescription>
              Configura los detalles de la lección con el enlace directo de Bunny.net
              {selectedCourseData && ` para el curso "${selectedCourseData.title}"`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateLesson} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lessonTitle">Título de la Lección</Label>
                <Input
                  id="lessonTitle"
                  placeholder="Ej: Introducción a la Implantología"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonOrder">Orden</Label>
                <Input
                  id="lessonOrder"
                  type="number"
                  placeholder="1"
                  value={newLesson.order}
                  onChange={(e) => setNewLesson({ ...newLesson, order: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonDescription">Descripción</Label>
              <Textarea
                id="lessonDescription"
                placeholder="Describe el contenido de esta lección..."
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">URL del Video (Bunny.net)</Label>
              <Input
                id="videoUrl"
                placeholder="https://vz-12345.b-cdn.net/mi-video.mp4"
                value={newLesson.videoUrl}
                onChange={(e) => setNewLesson({ ...newLesson, videoUrl: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">Copia el enlace directo desde tu panel de Bunny.net</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duración (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="45"
                  value={newLesson.duration}
                  onChange={(e) => setNewLesson({ ...newLesson, duration: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isFree">Acceso</Label>
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsLessonDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editingLesson ? "Actualizar Lección" : "Crear Lección"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
