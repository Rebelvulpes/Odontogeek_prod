"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Users, Search, Filter, BookOpen, Play } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  price: number
  instructor_name: string
  thumbnail_url: string
  duration_hours: number
  status: string
  created_at: string
  tags: Array<{
    id: string
    name: string
    color: string
    slug: string
  }>
  lessons: Array<{
    id: string
    title: string
    duration_minutes: number
    is_free: boolean
  }>
  students: number
  revenue: number
}

interface Tag {
  id: string
  name: string
  color: string
  slug: string
  description: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")

  useEffect(() => {
    loadCourses()
    loadTags()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/courses")
      const result = await response.json()

      if (result.success) {
        setCourses(result.data)
      } else {
        console.error("Error cargando cursos:", result.message)
      }
    } catch (error) {
      console.error("Error cargando cursos:", error)
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

  // Filtrar y ordenar cursos
  const filteredAndSortedCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTag = selectedTag === "all" || course.tags.some((tag) => tag.id === selectedTag)

      return matchesSearch && matchesTag
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "popular":
          return b.students - a.students
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Cursos de Odontología</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra colección de cursos especializados en odontología, impartidos por expertos reconocidos en
              el campo.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar cursos, instructores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por etiqueta */}
            <div>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                        <span>{tag.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordenar */}
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguos</SelectItem>
                  <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                  <SelectItem value="popular">Más populares</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estadísticas de resultados */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Mostrando {filteredAndSortedCourses.length} de {courses.length} cursos
              {selectedTag !== "all" && (
                <span className="ml-2">
                  en la categoría:
                  <Badge
                    variant="secondary"
                    className="ml-1"
                    style={{
                      backgroundColor: tags.find((t) => t.id === selectedTag)?.color + "20",
                      color: tags.find((t) => t.id === selectedTag)?.color,
                    }}
                  >
                    {tags.find((t) => t.id === selectedTag)?.name}
                  </Badge>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Grid de cursos */}
        {filteredAndSortedCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-600">
              {searchTerm || selectedTag !== "all"
                ? "Intenta ajustar tus filtros de búsqueda"
                : "Aún no hay cursos disponibles"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Curso+de+Odontología"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                      <BookOpen className="w-12 h-12 text-blue-500" />
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">{course.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-600 mb-3">
                        Por {course.instructor_name}
                      </CardDescription>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-green-600">${course.price}</div>
                    </div>
                  </div>

                  {/* Etiquetas */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: tag.color + "20",
                          color: tag.color,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {course.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{course.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>

                  {/* Estadísticas del curso */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration_hours}h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Play className="w-4 h-4" />
                      <span>{course.lessons.length} lecciones</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students} estudiantes</span>
                    </div>
                  </div>

                  {/* Lecciones gratuitas */}
                  {course.lessons.some((lesson) => lesson.is_free) && (
                    <div className="mb-4">
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <Play className="w-3 h-3 mr-1" />
                        Vista previa gratuita
                      </Badge>
                    </div>
                  )}

                  {/* Botón de acción */}
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full">Ver Curso</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
