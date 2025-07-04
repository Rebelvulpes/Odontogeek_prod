"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Users, Star, Search, Filter, BookOpen, Play, DollarSign } from "lucide-react"
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
  }>
  lessons: Array<{
    id: string
    is_free: boolean
  }>
  students: number
  revenue: number
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [priceFilter, setPriceFilter] = useState<string>("all")
  const [tags, setTags] = useState([])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/courses")
      const result = await response.json()

      if (result.success) {
        // Filtrar solo cursos publicados y no archivados
        const publishedCourses = result.data.filter(
          (course: Course) => course.status === "published" && !course.archived,
        )
        setCourses(publishedCourses)
        setFilteredCourses(publishedCourses)
      } else {
        console.error("Error loading courses:", result.message)
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

  useEffect(() => {
    loadCourses()
    loadTags()
  }, [])

  useEffect(() => {
    let filtered = courses

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por etiqueta
    if (selectedTag !== "all") {
      filtered = filtered.filter((course) => course.tags?.some((tag) => tag.id === selectedTag))
    }

    // Filtrar por precio
    if (priceFilter !== "all") {
      switch (priceFilter) {
        case "free":
          filtered = filtered.filter((course) => course.price === 0)
          break
        case "under-100":
          filtered = filtered.filter((course) => course.price > 0 && course.price < 100)
          break
        case "100-300":
          filtered = filtered.filter((course) => course.price >= 100 && course.price <= 300)
          break
        case "over-300":
          filtered = filtered.filter((course) => course.price > 300)
          break
      }
    }

    setFilteredCourses(filtered)
  }, [courses, searchTerm, selectedTag, priceFilter])

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
                <DollarSign className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Todos los precios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los precios</SelectItem>
                <SelectItem value="free">Gratis</SelectItem>
                <SelectItem value="under-100">Menos de $100</SelectItem>
                <SelectItem value="100-300">$100 - $300</SelectItem>
                <SelectItem value="over-300">Más de $300</SelectItem>
              </SelectContent>
            </Select>

            {/* Contador de resultados */}
            <div className="flex items-center justify-center md:justify-start">
              <span className="text-sm text-gray-600">
                {filteredCourses.length} curso{filteredCourses.length !== 1 ? "s" : ""} encontrado
                {filteredCourses.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Grid de cursos */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-600">
              {searchTerm || selectedTag !== "all" || priceFilter !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Aún no hay cursos disponibles"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => {
              const freeLessons = course.lessons?.filter((lesson) => lesson.is_free).length || 0
              const totalLessons = course.lessons?.length || 0

              return (
                <Card
                  key={course.id}
                  className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 shadow-md overflow-hidden"
                >
                  <div className="relative">
                    {/* Imagen cuadrada optimizada */}
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=300&width=300&text=Curso+de+Odontología"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                          <BookOpen className="w-16 h-16 text-blue-300" />
                        </div>
                      )}
                    </div>

                    {/* Badge de precio */}
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={course.price === 0 ? "secondary" : "default"}
                        className={`font-semibold ${
                          course.price === 0
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {course.price === 0 ? "GRATIS" : `$${course.price}`}
                      </Badge>
                    </div>

                    {/* Badge de lecciones gratis */}
                    {freeLessons > 0 && course.price > 0 && (
                      <div className="absolute top-3 left-3">
                        <Badge variant="outline" className="bg-white/90 text-orange-600 border-orange-200">
                          <Play className="w-3 h-3 mr-1" />
                          {freeLessons} gratis
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    {/* Etiquetas */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {course.tags?.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs px-2 py-1"
                          style={{
                            backgroundColor: tag.color + "15",
                            color: tag.color,
                            borderColor: tag.color + "30",
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {course.tags?.length > 2 && (
                        <Badge variant="secondary" className="text-xs px-2 py-1">
                          +{course.tags.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Título */}
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    {/* Instructor */}
                    <p className="text-sm text-gray-600 mb-3 font-medium">{course.instructor_name}</p>

                    {/* Descripción */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                    {/* Estadísticas */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration_hours || 0}h</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{course.students || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{totalLessons}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <Link href={`/courses/${course.id}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
                        Ver Curso
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
