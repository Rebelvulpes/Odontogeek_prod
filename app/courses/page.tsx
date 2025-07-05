"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { BookOpen, Clock, Users, Star, Search, Filter, Play, CheckCircle, ArrowRight } from "lucide-react"

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
  lessons: Array<{
    id: string
    title: string
    duration_minutes: number
    is_free: boolean
  }>
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
      const response = await fetch("/api/courses")
      const result = await response.json()
      if (result.success) {
        setCourses(result.data)
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

  // Filtrar cursos
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTag = selectedTag === "all" || course.tags.some((tag) => tag.id === selectedTag)

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
            Descubre nuestra colección de cursos especializados en odontología, diseñados por expertos para
            profesionales como tú.
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por etiqueta */}
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

            {/* Filtro por precio */}
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los precios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los precios</SelectItem>
                <SelectItem value="free">Gratuitos</SelectItem>
                <SelectItem value="paid">De pago</SelectItem>
              </SelectContent>
            </Select>

            {/* Estadísticas */}
            <div className="flex items-center justify-center bg-blue-50 rounded-lg px-4 py-2">
              <BookOpen className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                {filteredCourses.length} curso{filteredCourses.length !== 1 ? "s" : ""} encontrado
                {filteredCourses.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Grid de cursos */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                {/* Imagen del curso */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.thumbnail_url || "/placeholder.svg?height=200&width=400&text=Curso"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=200&width=400&text=Curso+de+Odontología"
                    }}
                  />
                  {course.price === 0 && (
                    <Badge className="absolute top-3 left-3 bg-green-500 hover:bg-green-600">Gratuito</Badge>
                  )}
                  {course.price > 0 && (
                    <Badge className="absolute top-3 right-3 bg-blue-500 hover:bg-blue-600">${course.price}</Badge>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {course.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: tag.color + "20",
                          color: tag.color,
                          borderColor: tag.color + "40",
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

                  <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </CardTitle>

                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Información del instructor */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.instructor_name || "Instructor"}</p>
                      <p className="text-xs text-gray-500">Especialista</p>
                    </div>
                  </div>

                  {/* Estadísticas del curso */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Play className="w-4 h-4" />
                      <span>{course.lessons?.length || 0} lecciones</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration_hours || 0}h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>4.8</span>
                    </div>
                  </div>

                  {/* Lecciones gratuitas */}
                  {course.lessons?.some((lesson) => lesson.is_free) && (
                    <div className="flex items-center space-x-1 text-green-600 text-sm mb-4">
                      <CheckCircle className="w-4 h-4" />
                      <span>Incluye lecciones gratuitas</span>
                    </div>
                  )}

                  {/* Botón de acción */}
                  <Button asChild className="w-full group">
                    <Link href={`/courses/${course.id}`}>
                      Ver Curso
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedTag !== "all" || priceFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Aún no hay cursos disponibles"}
            </p>
            {(searchTerm || selectedTag !== "all" || priceFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedTag("all")
                  setPriceFilter("all")
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        )}

        {/* Call to action */}
        {filteredCourses.length > 0 && (
          <div className="text-center mt-16 bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¿No encuentras lo que buscas?</h2>
            <p className="text-gray-600 mb-6">
              Contáctanos para sugerir nuevos cursos o temas específicos que te interesen.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">
                Contactar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
