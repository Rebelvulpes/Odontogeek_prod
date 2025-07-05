"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { Search, Filter, Clock, Users, Star, Play, BookOpen, Award, ChevronLeft, ChevronRight } from "lucide-react"

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  duration: string
  level: string
  price: number
  thumbnail_url?: string
  rating: number
  students: number
  lessons: number
  tags: string[]
}

interface Tag {
  id: number
  name: string
  color: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const coursesPerPage = 12

  useEffect(() => {
    fetchCourses()
    fetchTags()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/course-tags")
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
    }
  }

  // Filter and sort courses
  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTag = selectedTag === "all" || course.tags?.includes(selectedTag)

      return matchesSearch && matchesTag
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        case "students":
          return b.students - a.students
        default:
          return b.id - a.id // newest first
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage)
  const startIndex = (currentPage - 1) * coursesPerPage
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + coursesPerPage)

  const CourseCard = ({ course }: { course: Course }) => {
    const [imageError, setImageError] = useState(false)

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
        <CardHeader className="p-0">
          <div className="relative w-full" style={{ paddingBottom: "100%" }}>
            {!imageError && course.thumbnail_url ? (
              <img
                src={course.thumbnail_url || "/placeholder.svg"}
                alt={course.title}
                className="absolute inset-0 w-full h-full object-contain bg-gray-50"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center p-4">
                  <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-700 text-sm line-clamp-2">{course.title}</h3>
                </div>
              </div>
            )}
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="bg-white/90 text-gray-700">
                {course.level}
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <Badge className="bg-blue-600 text-white">${course.price}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Por {course.instructor}</p>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Play className="w-4 h-4" />
                  <span>{course.lessons} lecciones</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{course.students}</span>
                </div>
              </div>
              <Award className="w-5 h-5 text-blue-500" />
            </div>

            {course.tags && course.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {course.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {course.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{course.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Link href={`/courses/${course.id}`} className="w-full">
            <Button className="w-full group-hover:bg-blue-700 transition-colors">
              Ver Curso
              <Play className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cursos de Odontología</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra amplia selección de cursos especializados para profesionales dentales
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar por categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {tags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.name}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
                <SelectItem value="students">Más populares</SelectItem>
                <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center">
              {filteredCourses.length} curso{filteredCourses.length !== 1 ? "s" : ""} encontrado
              {filteredCourses.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {paginatedCourses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className="w-10"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
