"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Clock, Users, Star, Search, Filter, ChevronLeft, ChevronRight, Play, BookOpen } from "lucide-react"
import { Navigation } from "@/components/navigation"

interface Course {
  id: string
  title: string
  description: string
  price: number
  instructor_name: string
  thumbnail_url: string
  duration_hours: number
  students_count: number
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
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const loadCourses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "12",
        search: searchTerm,
        tags: selectedTags.join(","),
      })

      const response = await fetch(`/api/courses?${params}`)
      const result = await response.json()

      if (result.success && result.data) {
        // Ensure courses is always an array
        const coursesData = Array.isArray(result.data.courses) ? result.data.courses : []
        setCourses(coursesData)

        if (result.data.pagination) {
          setTotalPages(result.data.pagination.totalPages || 1)
        }
      } else {
        console.error("Error loading courses:", result.message)
        setCourses([])
      }
    } catch (error) {
      console.error("Error loading courses:", error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const loadTags = async () => {
    try {
      const response = await fetch("/api/course-tags")
      const result = await response.json()
      if (result.success && result.data) {
        // Ensure tags is always an array
        const tagsData = Array.isArray(result.data) ? result.data : []
        setTags(tagsData)
      } else {
        console.error("Error loading tags:", result.message)
        setTags([])
      }
    } catch (error) {
      console.error("Error loading tags:", error)
      setTags([])
    }
  }

  useEffect(() => {
    loadTags()
  }, [])

  useEffect(() => {
    loadCourses()
  }, [currentPage, searchTerm, selectedTags, sortBy])

  const handleTagToggle = (tagSlug: string) => {
    setSelectedTags((prev) => (prev.includes(tagSlug) ? prev.filter((t) => t !== tagSlug) : [...prev, tagSlug]))
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadCourses()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedTags([])
    setSortBy("newest")
    setCurrentPage(1)
  }

  // Filter and sort courses on the frontend as backup
  const filteredAndSortedCourses = Array.isArray(courses)
    ? courses
        .filter((course) => {
          const matchesSearch =
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description.toLowerCase().includes(searchTerm.toLowerCase())

          const matchesTags =
            selectedTags.length === 0 ||
            (Array.isArray(course.tags) && course.tags.some((tag) => selectedTags.includes(tag.slug)))

          return matchesSearch && matchesTags
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "price-low":
              return a.price - b.price
            case "price-high":
              return b.price - a.price
            case "popular":
              return b.students_count - a.students_count
            case "newest":
            default:
              return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          }
        })
    : []

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={null} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando cursos...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={null} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cursos de Odontología</h1>
          <p className="text-xl text-gray-600">
            Descubre nuestra colección de cursos especializados para profesionales dentales
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="popular">Más populares</SelectItem>
                <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Buscar</Button>
            <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:hidden">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </form>

          {/* Tags Filter */}
          <div className={`${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="flex flex-wrap gap-2 mb-4">
              <Label className="text-sm font-medium text-gray-700 mr-4 flex items-center">Categorías:</Label>
              {Array.isArray(tags) &&
                tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={selectedTags.includes(tag.slug)}
                      onCheckedChange={() => handleTagToggle(tag.slug)}
                    />
                    <Label htmlFor={`tag-${tag.id}`} className="text-sm cursor-pointer flex items-center space-x-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                      <span>{tag.name}</span>
                    </Label>
                  </div>
                ))}
            </div>

            {(searchTerm || selectedTags.length > 0) && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredAndSortedCourses.length} curso{filteredAndSortedCourses.length !== 1 ? "s" : ""} encontrado
            {filteredAndSortedCourses.length !== 1 ? "s" : ""}
          </p>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tagSlug) => {
                const tag = tags.find((t) => t.slug === tagSlug)
                return tag ? (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs"
                    style={{ backgroundColor: tag.color + "20", color: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                ) : null
              })}
            </div>
          )}
        </div>

        {/* Courses Grid */}
        {filteredAndSortedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredAndSortedCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow duration-300 group">
                <div className="relative">
                  {/* Square image container for 1080x1080 images */}
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={course.thumbnail_url || "/placeholder.svg?height=300&width=300&text=Curso"}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=300&width=300&text=Curso+de+Odontología"
                      }}
                    />
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-blue-600 text-white">${course.price}</Badge>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-t-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 text-blue-600 ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {Array.isArray(course.tags) &&
                      course.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs"
                          style={{ backgroundColor: tag.color + "20", color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                  </div>
                  <CardTitle className="text-lg leading-tight line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">{course.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
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

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{course.instructor_name}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {Array.isArray(course.lessons) && course.lessons.length} lecciones
                    </div>
                  </div>

                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full">
                      Ver Curso
                      <BookOpen className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-600 mb-4">Intenta ajustar tus filtros de búsqueda o explora nuestras categorías.</p>
            <Button onClick={clearFilters} variant="outline">
              Limpiar filtros
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>

            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
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
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
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
