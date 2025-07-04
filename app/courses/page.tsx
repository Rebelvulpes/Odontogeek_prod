"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Grid, List, Clock, Users, Play } from "lucide-react"
import Link from "next/link"

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

  const loadCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      const data = await response.json()
      if (data.success) {
        // Filtrar solo cursos publicados y no archivados
        const publishedCourses = data.data.filter((course: Course) => course.status === "published" && !course.archived)
        setCourses(publishedCourses)
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

  // Filtrar y ordenar cursos
  const filteredAndSortedCourses = courses
    .filter((course) => {
      // Filtro de búsqueda
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de etiqueta
      const matchesTag = selectedTag === "all" || course.tags.some((tag) => tag.id === selectedTag)

      // Filtro de precio
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && course.price === 0) ||
        (priceFilter === "paid" && course.price > 0) ||
        (priceFilter === "under-100" && course.price > 0 && course.price < 100000) ||
        (priceFilter === "100-200" && course.price >= 100000 && course.price < 200000) ||
        (priceFilter === "over-200" && course.price >= 200000)

      return matchesSearch && matchesTag && matchesPrice
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
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Gratis"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(amount)
  }

  const getFreeLessonsCount = (course: Course) => {
    return course.lessons?.filter((lesson) => lesson.is_free && !lesson.archived).length || 0
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando cursos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Cursos de Odontología</h1>
        <p className="text-xl text-muted-foreground">
          Descubre nuestros cursos especializados para profesionales dentales
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tag Filter */}
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Filter */}
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Precio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los precios</SelectItem>
                <SelectItem value="free">Gratis</SelectItem>
                <SelectItem value="paid">De pago</SelectItem>
                <SelectItem value="under-100">Menos de $100.000</SelectItem>
                <SelectItem value="100-200">$100.000 - $200.000</SelectItem>
                <SelectItem value="over-200">Más de $200.000</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
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

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          {filteredAndSortedCourses.length} curso{filteredAndSortedCourses.length !== 1 ? "s" : ""} encontrado
          {filteredAndSortedCourses.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Courses Grid/List */}
      {filteredAndSortedCourses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron cursos</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredAndSortedCourses.map((course) => (
            <Card
              key={course.id}
              className={`group hover:shadow-lg transition-shadow ${viewMode === "list" ? "flex" : ""}`}
            >
              <div className={viewMode === "list" ? "flex w-full" : ""}>
                {course.thumbnail_url && (
                  <div className={viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-video"}>
                    <img
                      src={course.thumbnail_url || "/placeholder.svg"}
                      alt={course.title}
                      className={`object-cover ${viewMode === "list" ? "w-full h-full rounded-l-lg" : "w-full h-full rounded-t-lg"}`}
                    />
                  </div>
                )}
                <div className={viewMode === "list" ? "flex-1" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                      </div>
                      <Badge variant={course.price === 0 ? "secondary" : "default"}>
                        {formatCurrency(course.price)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Por {course.instructor_name}</span>
                      {course.duration_hours && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.duration_hours}h
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Play className="h-4 w-4 mr-1" />
                          {course.lessonsCount} lecciones
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.students} estudiantes
                        </div>
                      </div>
                      {getFreeLessonsCount(course) > 0 && (
                        <Badge variant="outline">{getFreeLessonsCount(course)} gratis</Badge>
                      )}
                    </div>

                    {course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {course.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                        {course.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{course.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <Link href={`/courses/${course.id}`}>
                      <Button className="w-full">Ver Curso</Button>
                    </Link>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
