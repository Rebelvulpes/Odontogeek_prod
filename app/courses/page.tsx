"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, BookOpen, Clock, Users, Play, ChevronRight, Grid3X3, List, Video, User } from "lucide-react"
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
  lessons: any[]
  tags: any[]
  students: number
  revenue: number
  lessonsCount: number
}

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  description: string
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [priceFilter, setPriceFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

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

  // Filtrar y ordenar cursos
  const filteredCourses = courses
    .filter((course) => {
      // Filtro de búsqueda
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de etiqueta
      const matchesTag = selectedTag === "all" || course.tags?.some((tag) => tag.id === selectedTag)

      // Filtro de precio
      const matchesPrice = (() => {
        switch (priceFilter) {
          case "free":
            return course.price === 0
          case "under-100":
            return course.price > 0 && course.price < 100
          case "100-300":
            return course.price >= 100 && course.price <= 300
          case "over-300":
            return course.price > 300
          default:
            return true
        }
      })()

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

  const freeLessonsCount = (course: Course) => {
    return course.lessons?.filter((lesson) => lesson.is_free && !lesson.archived).length || 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-96 mx-auto" />
              <Skeleton className="h-6 w-[600px] mx-auto" />
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-col lg:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-48" />
            </div>

            {/* Courses Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Cursos de Odontología</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre nuestra colección de cursos especializados diseñados por expertos para impulsar tu carrera
              profesional
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>{courses.length} cursos disponibles</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{courses.reduce((sum, course) => sum + course.students, 0)} estudiantes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4" />
                <span>{courses.reduce((sum, course) => sum + course.lessonsCount, 0)} lecciones</span>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar cursos, instructores o temas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tag Filter */}
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-full lg:w-48">
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

              {/* Price Filter */}
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full lg:w-48">
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
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {(searchTerm || selectedTag !== "all" || priceFilter !== "all") && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-500">Filtros activos:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm("")}>
                    Búsqueda: "{searchTerm}" ×
                  </Badge>
                )}
                {selectedTag !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedTag("all")}>
                    {tags.find((t) => t.id === selectedTag)?.name} ×
                  </Badge>
                )}
                {priceFilter !== "all" && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setPriceFilter("all")}>
                    {priceFilter === "free" && "Gratis"}
                    {priceFilter === "under-100" && "Menos de $100"}
                    {priceFilter === "100-300" && "$100 - $300"}
                    {priceFilter === "over-300" && "Más de $300"} ×
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {filteredCourses.length === 0
                ? "No se encontraron cursos"
                : `${filteredCourses.length} curso${filteredCourses.length !== 1 ? "s" : ""} encontrado${
                    filteredCourses.length !== 1 ? "s" : ""
                  }`}
            </p>
          </div>

          {/* Courses Grid/List */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron cursos</h3>
              <p className="text-gray-500 mb-6">
                Intenta ajustar tus filtros o términos de búsqueda para encontrar lo que buscas.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedTag("all")
                  setPriceFilter("all")
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=200&width=350&text=Curso+de+Odontología"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                          <BookOpen className="w-16 h-16 text-blue-300" />
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 left-4">
                      {course.price === 0 ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Gratis</Badge>
                      ) : (
                        <Badge className="bg-blue-500 hover:bg-blue-600">${course.price}</Badge>
                      )}
                    </div>
                    {freeLessonsCount(course) > 0 && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-white/90 text-gray-700">
                          <Play className="w-3 h-3 mr-1" />
                          {freeLessonsCount(course)} gratis
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Tags */}
                      {course.tags && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {course.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className="text-xs"
                              style={{ borderColor: tag.color, color: tag.color }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          {course.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{course.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Title and Description */}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-3">{course.description}</p>
                      </div>

                      {/* Instructor */}
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{course.instructor_name || "Instructor no asignado"}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.duration_hours || 0}h</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Video className="w-4 h-4" />
                            <span>{course.lessonsCount} lecciones</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{course.students}</span>
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      <Link href={`/courses/${course.id}`}>
                        <Button className="w-full group">
                          Ver curso
                          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-80 aspect-video md:aspect-square bg-gray-100 overflow-hidden">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url || "/placeholder.svg"}
                          alt={course.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=200&width=320&text=Curso+de+Odontología"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                          <BookOpen className="w-16 h-16 text-blue-300" />
                        </div>
                      )}
                    </div>

                    <CardContent className="flex-1 p-6">
                      <div className="flex flex-col h-full">
                        <div className="flex-1 space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {/* Tags */}
                              {course.tags && course.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {course.tags.slice(0, 3).map((tag) => (
                                    <Badge
                                      key={tag.id}
                                      variant="outline"
                                      className="text-xs"
                                      style={{ borderColor: tag.color, color: tag.color }}
                                    >
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

                              <h3 className="font-semibold text-xl text-gray-900 mb-2">{course.title}</h3>
                              <p className="text-gray-600 line-clamp-2">{course.description}</p>
                            </div>

                            <div className="ml-4 text-right">
                              {course.price === 0 ? (
                                <Badge className="bg-green-500 hover:bg-green-600 text-lg px-3 py-1">Gratis</Badge>
                              ) : (
                                <Badge className="bg-blue-500 hover:bg-blue-600 text-lg px-3 py-1">
                                  ${course.price}
                                </Badge>
                              )}
                              {freeLessonsCount(course) > 0 && (
                                <div className="mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    <Play className="w-3 h-3 mr-1" />
                                    {freeLessonsCount(course)} gratis
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Instructor */}
                          <div className="flex items-center space-x-2 text-gray-500">
                            <User className="w-4 h-4" />
                            <span>{course.instructor_name || "Instructor no asignado"}</span>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{course.duration_hours || 0} horas</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Video className="w-4 h-4" />
                              <span>{course.lessonsCount} lecciones</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{course.students} estudiantes</span>
                            </div>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="mt-6">
                          <Link href={`/courses/${course.id}`}>
                            <Button className="group">
                              Ver curso completo
                              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CoursesPage
