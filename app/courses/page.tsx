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
  students_count: number
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
        setCourses(result.data.courses || [])
      } else {
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
      } else {
        setTags([])
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

    const matchesTag = selectedTag === "all" || (course.tags && course.tags.some((tag) => tag.id === selectedTag))

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

        {/* Grid de cursos - Optimizado para mostrar imágenes 1080x1080 completas */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white"
              >
                {/* Imagen del curso - Contenedor cuadrado para mostrar imagen completa 1080x1080 */}
                <div className="relative w-full" style={{ paddingBottom: "100%" }}>
                  <div className="absolute inset-0 bg-gray-100">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                                <div class="text-center">
                                  <div class="w-16 h-16 mx-auto mb-4 bg-blue-200 rounded-full flex items-center justify-center">
                                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                    </svg>
                                  </div>
                                  <p class="text-sm font-medium text-blue-800">${course.title}</p>
                                  <p class="text-xs text-blue-600">Curso de Odontología</p>
                                </div>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-blue-200 rounded-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-blue-800">{course.title}</p>
                          <p className="text-xs text-blue-600">Curso de Odontología</p>
                        </div>
                      </div>
                    )}

                    {course.price === 0 && (
                      <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-600 text-white font-medium px-3 py-1.5 text-sm">
                        Gratuito
                      </Badge>
                    )}
                    {course.price > 0 && (
                      <Badge className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white font-medium px-3 py-1.5 text-sm">
                        ${course.price}
                      </Badge>
                    )}

                    {/* Overlay con botón de play */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Play className="w-8 h-8 text-blue-600 ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-4 px-6 pt-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.tags &&
                      course.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs font-medium px-2 py-1"
                          style={{
                            backgroundColor: tag.color + "20",
                            color: tag.color,
                            borderColor: tag.color + "40",
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    {course.tags && course.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs font-medium px-2 py-1">
                        +{course.tags.length - 2}
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-xl font-bold line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight mb-3">
                    {course.title}
                  </CardTitle>

                  <CardDescription className="line-clamp-3 text-gray-600 text-sm leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 px-6 pb-6">
                  {/* Información del instructor */}
                  <div className="flex items-center space-x-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{course.instructor_name || "Instructor"}</p>
                      <p className="text-xs text-gray-500">Especialista en Odontología</p>
                    </div>
                  </div>

                  {/* Estadísticas del curso */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-5">
                    <div className="flex items-center space-x-1">
                      <Play className="w-4 h-4" />
                      <span className="font-medium">{course.lessons ? course.lessons.length : 0} lecciones</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{course.duration_hours || 0}h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>

                  {/* Estudiantes inscritos */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-5">
                    <Users className="w-4 h-4" />
                    <span>{course.students_count || 0} estudiantes inscritos</span>
                  </div>

                  {/* Lecciones gratuitas */}
                  {course.lessons && course.lessons.some((lesson) => lesson.is_free) && (
                    <div className="flex items-center space-x-2 text-green-600 text-sm mb-5 bg-green-50 rounded-lg px-3 py-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Incluye lecciones gratuitas</span>
                    </div>
                  )}

                  {/* Botón de acción */}
                  <Button asChild className="w-full h-12 text-base font-semibold group/btn">
                    <Link href={`/courses/${course.id}`}>
                      {course.price === 0 ? "Ver Curso Gratis" : `Comprar por $${course.price}`}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-medium text-gray-900 mb-3">No se encontraron cursos</h3>
            <p className="text-gray-600 mb-8 text-lg">
              {searchTerm || selectedTag !== "all" || priceFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Aún no hay cursos disponibles"}
            </p>
            {(searchTerm || selectedTag !== "all" || priceFilter !== "all") && (
              <Button
                variant="outline"
                size="lg"
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
          <div className="text-center mt-20 bg-white rounded-xl shadow-sm border p-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿No encuentras lo que buscas?</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Contáctanos para sugerir nuevos cursos o temas específicos que te interesen.
            </p>
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/contact">
                Contactar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
