"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Grid, List, Clock, Users, BookOpen, Play } from "lucide-react"

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
  lessons: Array<{
    id: string
    title: string
    is_free: boolean
    archived: boolean
  }>
}

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  description: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [priceFilter, setPriceFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    loadCourses()
    loadTags()
  }, [])

  useEffect(() => {
    filterAndSortCourses()
  }, [courses, searchTerm, selectedTag, priceFilter, sortBy])

  const loadCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      const data = await response.json()
      if (data.success) {
        // Solo mostrar cursos publicados y no archivados
        const activeCourses = data.data.filter((course: Course) => course.status === "published" && !course.archived)
        setCourses(activeCourses)
      } else {
        console.error("Error cargando cursos:", data.message)
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
      const data = await response.json()
      if (data.success) {
        setTags(data.data)
      }
    } catch (error) {
      console.error("Error cargando etiquetas:", error)
    }
  }

  const filterAndSortCourses = () => {
    let filtered = [...courses]

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtro por etiqueta
    if (selectedTag !== "all") {
      filtered = filtered.filter((course) => course.tags.some((tag) => tag.id === selectedTag))
    }

    // Filtro por precio
    if (priceFilter !== "all") {
      switch (priceFilter) {
        case "free":
          filtered = filtered.filter((course) => course.price === 0)
          break
        case "under-100":
          filtered = filtered.filter((course) => course.price > 0 && course.price < 100000)
          break
        case "100-300":
          filtered = filtered.filter((course) => course.price >= 100000 && course.price < 300000)
          break
        case "over-300":
          filtered = filtered.filter((course) => course.price >= 300000)
          break
      }
    }

    // Ordenamiento
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "popular":
        filtered.sort((a, b) => b.students - a.students)
        break
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    setFilteredCourses(filtered)
  }

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratis"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getFreeLessonsCount = (course: Course) => {
    return course.lessons?.filter((lesson) => lesson.is_free && !lesson.archived).length || 0
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando cursos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Cursos de Odontología</h1>
        <p className="text-lg text-muted-foreground">
          Descubre nuestros cursos especializados en odontología y mejora tus habilidades profesionales
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar cursos, instructores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoría" />
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

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Precio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los precios</SelectItem>
                <SelectItem value="free">Gratis</SelectItem>
                <SelectItem value="under-100">Menos de $100.000</SelectItem>
                <SelectItem value="100-300">$100.000 - $300.000</SelectItem>
                <SelectItem value="over-300">Más de $300.000</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
                <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                <SelectItem value="popular">Más populares</SelectItem>
                <SelectItem value="title">Título A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredCourses.length} curso{filteredCourses.length !== 1 ? "s" : ""} encontrado
            {filteredCourses.length !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Courses Grid/List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No se encontraron cursos</h3>
          <p className="text-muted-foreground">Intenta ajustar los filtros o términos de búsqueda</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                viewMode === "list" ? "flex flex-col sm:flex-row" : ""
              }`}
              onClick={() => (window.location.href = `/courses/${course.id}`)}
            >
              <div className={viewMode === "list" ? "sm:w-64 flex-shrink-0" : ""}>
                <div
                  className={`bg-gray-200 ${
                    viewMode === "list" ? "h-48 sm:h-full sm:rounded-l-lg sm:rounded-r-none" : "h-48 rounded-t-lg"
                  } overflow-hidden`}
                >
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Curso"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                      <BookOpen className="h-16 w-16 text-blue-500" />
                    </div>
                  )}
                </div>
              </div>

              <div className={viewMode === "list" ? "flex-1" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">{course.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {course.tags.slice(0, 3).map((tag) => (
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
                    {course.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{course.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Play className="h-4 w-4" />
                        <span>{course.lessonsCount} lecciones</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration_hours || 0}h</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students} estudiantes</span>
                      </div>
                    </div>
                  </div>

                  {/* Instructor and Free Lessons */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Por </span>
                      <span className="font-medium">{course.instructor_name}</span>
                    </div>
                    {getFreeLessonsCount(course) > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {getFreeLessonsCount(course)} lección{getFreeLessonsCount(course) !== 1 ? "es" : ""} gratis
                      </Badge>
                    )}
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">{formatPrice(course.price)}</div>
                    <Button size="sm">Ver curso</Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
