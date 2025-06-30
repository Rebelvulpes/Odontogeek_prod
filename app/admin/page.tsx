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
import { Upload, Video, Users, DollarSign, BookOpen, Plus, Edit, Trash2, Eye } from "lucide-react"

const courses = [
  {
    id: 1,
    title: "Implantología Avanzada",
    students: 1250,
    revenue: 373750,
    status: "Publicado",
    videos: 24,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    title: "Endodoncia Contemporánea",
    students: 890,
    revenue: 177100,
    status: "Publicado",
    videos: 18,
    createdAt: "2024-02-01",
  },
  {
    id: 3,
    title: "Ortodoncia Digital",
    students: 650,
    revenue: 259350,
    status: "Borrador",
    videos: 12,
    createdAt: "2024-02-15",
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
  {
    id: 3,
    name: "Dr. Carlos López",
    email: "carlos@ejemplo.com",
    courses: 1,
    spent: 299,
    joinDate: "2024-02-01",
  },
]

export default function AdminPage() {
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    price: "",
    instructor: "",
  })

  const [uploadedVideos, setUploadedVideos] = useState<File[]>([])

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedVideos([...uploadedVideos, ...Array.from(e.target.files)])
    }
  }

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Nuevo curso:", newCourse)
    console.log("Videos subidos:", uploadedVideos)
    // Aquí implementarías la creación del curso
  }

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
                  <p className="text-sm font-medium text-gray-600">Videos Subidos</p>
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
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="upload">Subir Contenido</TabsTrigger>
            <TabsTrigger value="analytics">Analíticas</TabsTrigger>
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
                      <TableHead>Videos</TableHead>
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
                        <TableCell>{course.videos} videos</TableCell>
                        <TableCell>
                          <Badge variant={course.status === "Publicado" ? "default" : "secondary"}>
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
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

          <TabsContent value="upload" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Curso</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información del Curso</CardTitle>
                  <CardDescription>Completa los detalles básicos del curso</CardDescription>
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
                  <CardTitle>Subir Videos</CardTitle>
                  <CardDescription>Arrastra y suelta los videos del curso o haz clic para seleccionar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Arrastra videos aquí o haz clic para seleccionar</p>
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="video-upload"
                    />
                    <Label htmlFor="video-upload">
                      <Button variant="outline" asChild>
                        <span>Seleccionar Videos</span>
                      </Button>
                    </Label>
                  </div>

                  {uploadedVideos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium">Videos Subidos:</h4>
                      {uploadedVideos.map((video, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{video.name}</span>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analíticas</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ingresos por Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Gráfico de ingresos mensuales
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cursos Más Populares</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.map((course, index) => (
                      <div key={course.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-500">{course.students} estudiantes</p>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
