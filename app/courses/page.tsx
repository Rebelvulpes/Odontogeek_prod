"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, Clock, Users, Star, ChevronLeft, ChevronRight, BookOpen, Play, Award, X } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  price: number
  duration_hours: number
  lessons_count: number
  students_count: number
  thumbnail_url?: string
  tags: Array<{
    id: string
    name: string
    slug: string
    color: string
  }>
  created_at: string
}

interface Tag {
  id: string
  name: string
  slug: string
  color: string
  description: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCourses: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCourses: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [showFilters, setShowFilters] = useState(false)

  // Cargar etiquetas disponibles
  useEffect(() => {
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
    loadTags()
  }, [])

  // Cargar cursos
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "12",
        })

        if (searchTerm) {
          params.append("search", searchTerm)
        }

        if (selectedTags.length > 0) {
          params.append("tags", selectedTags.join(","))
        }

        const response = await fetch(`/api/courses?${params}`)
        const result = await response.json()

        if (result.success) {
          setCourses(result.data.courses)
          setPagination(result.data.pagination)
        } else {
          console.error("Error cargando cursos:", result.message)
        }
      } catch (error) {
        console.error("Error cargando cursos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [currentPage, searchTerm, selectedTags])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
  }

  const toggleTag = (tagSlug: string) => {
    setSelectedTags((prev) => (prev.includes(tagSlug) ? prev.filter((t) => t !== tagSlug) : [...prev, tagSlug]))
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setSelectedTags([])
    setSearchTerm("")
    setCurrentPage(1)
  }

  const getSelectedTagsInfo = () => {
    return tags.filter((tag) => selectedTags.includes(tag.slug))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Cursos de Actualización Continua</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra amplia selección de cursos especializados en odontología. Mantente actualizado con las
            últimas técnicas y tecnologías.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar cursos por título o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </form>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filtrar por especialidad</h3>
                {selectedTags.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Filtros activos:</p>
                  <div className="flex flex-wrap gap-2">
                    {getSelectedTagsInfo().map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="cursor-pointer hover:bg-gray-200"
                        style={{ backgroundColor: tag.color + "20", color: tag.color }}
                        onClick={() => toggleTag(tag.slug)}
                      >
                        {tag.name}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Tags */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.slug) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                    style={
                      selectedTags.includes(tag.slug)
                        ? { backgroundColor: tag.color, borderColor: tag.color }
                        : { borderColor: tag.color, color: tag.color }
                    }
                    onClick={() => toggleTag(tag.slug)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            {loading ? (
              <Skeleton className="h-5 w-48" />
            ) : (
              <span>
                Mostrando {courses.length} de {pagination.totalCourses} cursos
                {selectedTags.length > 0 && " (filtrados)"}
              </span>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="text-sm text-gray-500">
              Página {pagination.currentPage} de {pagination.totalPages}
            </div>
          )}
        </div>

        {/* Courses Grid - Tarjetas más grandes para imágenes 1080x1080 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 12 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardHeader className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedTags.length > 0
                ? "Intenta ajustar tus filtros de búsqueda"
                : "Aún no hay cursos disponibles"}
            </p>
            {(searchTerm || selectedTags.length > 0) && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 group bg-white"
              >
                {/* Imagen cuadrada 1:1 para 1080x1080 */}
                <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        console.error("Error cargando imagen:", course.thumbnail_url)
                        e.currentTarget.src = "/placeholder.svg?height=400&width=400&text=Imagen+no+disponible"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                      <BookOpen className="w-16 h-16 text-blue-400" />
                    </div>
                  )}

                  {/* Overlay con gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Precio en la esquina superior derecha */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/95 text-gray-900 font-bold text-base px-3 py-1 shadow-lg">
                      ${course.price}
                    </Badge>
                  </div>

                  {/* Info de lecciones en la esquina inferior izquierda */}
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center space-x-2 text-white text-sm font-medium bg-black/50 rounded-full px-3 py-1 backdrop-blur-sm">
                      <Play className="w-4 h-4" />
                      <span>{course.lessons_count} lecciones</span>
                    </div>
                  </div>
                </div>

                <CardHeader className="p-6">
                  {/* Etiquetas */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs font-medium"
                        style={{ backgroundColor: tag.color + "15", color: tag.color, borderColor: tag.color + "30" }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {course.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{course.tags.length - 3} más
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-xl font-bold line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-sm text-gray-600 leading-relaxed">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  {/* Estadísticas del curso */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{course.duration_hours || 0}h</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{course.students_count}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">4.8</span>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <Link href={`/courses/${course.id}`} className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 group-hover:shadow-lg">
                      <Award className="w-5 h-5 mr-2" />
                      Ver Curso Completo
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-10 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              disabled={!pagination.hasNextPage}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
