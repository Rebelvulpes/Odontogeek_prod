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

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardHeader className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-20" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden">
                  <img
                    src="/placeholder.svg?height=200&width=300"
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-gray-900 font-semibold">${course.price}</Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center space-x-2 text-white text-sm">
                      <Play className="w-4 h-4" />
                      <span>{course.lessons_count} lecciones</span>
                    </div>
                  </div>
                </div>

                <CardHeader className="p-4">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {course.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                        style={{ backgroundColor: tag.color + "20", color: tag.color }}
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
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">{course.description}</CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration_hours}h</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{course.students_count}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>4.8</span>
                    </div>
                  </div>

                  <Link href={`/courses/${course.id}`} className="block">
                    <Button className="w-full group-hover:bg-blue-700 transition-colors">
                      <Award className="w-4 h-4 mr-2" />
                      Ver Curso
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
