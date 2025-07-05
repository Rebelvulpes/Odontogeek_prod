"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { Search, Filter, Play, Users, Clock, BookOpen, Star, DollarSign } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  price: number
  instructor_name: string
  thumbnail_url: string
  status: string
  duration_hours: number
  created_at: string
  students: number
  lessonsCount: number
  tags: Array<{
    id: string
    name: string
    color: string
  }>
}

interface Tag {
  id: string
  name: string
  color: string
  slug: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")

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
        // Extraer el array de cursos de la estructura de respuesta
        setCourses(result.data.courses || [])
      } else {
        console.error("Error loading courses:", result.message)
        setCourses([])
      }
    } catch (error) {
      console.error("Error cargando cursos:", error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const loadTags = async () => {
    try {
      const response = await fetch("/api/course-tags")
      const result = await response.json()
      if (result.success) {
        setTags(result.data || [])
      }
    } catch (error) {
      console.error("Error cargando etiquetas:", error)
      setTags([])
    }
  }

  // Filtrar cursos
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTag = selectedTag === "all" || course.tags?.some((tag) => tag.id === selectedTag)

    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "free" && course.price === 0) ||
      (priceFilter === "paid" && course.price > 0)

    return matchesSearch && matchesTag && matchesPrice
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando cursos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cursos de Odontología</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre nuestra colección de cursos especializados en odontología, impartidos por expertos reconocidos en
            el campo.
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar cursos, instructores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {/* Filtro por categoría */}
            <div className="w-full lg:w-64">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="h-12">
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

            {/* Filtro por precio */}
            <div className="w-full lg:w-48">
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="h-12">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Todos los precios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los precios</SelectItem>
                  <SelectItem value="free">Gratuitos</SelectItem>
                  <SelectItem value="paid">De pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Mostrando {filteredCourses.length} de {courses.length} cursos
              {searchTerm && ` para "${searchTerm}"`}
            </p>
          </div>
        </div>

        {/* Grid de cursos */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative">
                  {/* Imagen del curso - MÁS GRANDE */}
                  <div className="relative h-96 sm:h-[400px] lg:h-[420px] overflow-hidden bg-gray-100">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=420&width=420&text=Curso+de+Odontología"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <BookOpen className="w-16 h-16 text-blue-400" />
                      </div>
                    )}

                    {/* Overlay con botón play - MÁS GRANDE */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                        <Play className="w-8 h-8 text-blue-600 ml-1" />
                      </div>
                    </div>

                    {/* Badge de precio - MÁS GRANDE */}
                    <div className="absolute top-4 right-4">
                      {course.price === 0 ? (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 text-sm">GRATIS</Badge>
                      ) : (
                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm">
                          ${course.price}
                        </Badge>
                      )}
                    </div>

                    {/* Badge de lecciones gratuitas */}
                    {course.price > 0 && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-white bg-opacity-90 text-gray-700 px-3 py-1.5 text-sm">
                          Vista previa gratis
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    {/* Etiquetas */}
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {course.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs px-2 py-1"
                            style={{
                              backgroundColor: tag.color + "20",
                              color: tag.color,
                              borderColor: tag.color + "40",
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                        {course.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            +{course.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Título - MÁS GRANDE */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    {/* Descripción - MÁS LÍNEAS */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

                    {/* Instructor */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {course.instructor_name?.charAt(0) || "I"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{course.instructor_name || "Instructor"}</p>
                        <p className="text-xs text-gray-500">Especialista</p>
                      </div>
                    </div>

                    {/* Estadísticas */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{course.lessonsCount || 0} lecciones</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.duration_hours || 0}h</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                      </div>
                    </div>

                    {/* Botón de acción - MÁS GRANDE */}
                    <Button
                      className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => (window.location.href = `/courses/${course.id}`)}
                    >
                      {course.price === 0 ? "Acceder Gratis" : "Ver Curso"}
                    </Button>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-600 mb-8">
              {searchTerm || selectedTag !== "all" || priceFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Aún no hay cursos disponibles"}
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedTag("all")
                setPriceFilter("all")
              }}
              variant="outline"
            >
              Limpiar Filtros
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
          <p className="text-xl mb-6 opacity-90">Contáctanos y te ayudaremos a encontrar el curso perfecto para ti</p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-medium px-8">
            Contactar Ahora
          </Button>
        </div>
      </div>
    </div>
  )
}
