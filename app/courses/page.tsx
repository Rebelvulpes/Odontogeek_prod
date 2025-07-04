"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Search, Filter, BookOpen, Play, User } from "lucide-react"
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
  tags: Array<{
    id: string
    name: string
    color: string
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
  const [sortBy, setSortBy] = useState<string>("newest")
  const [priceRange, setPriceRange] = useState<string>("all")

  useEffect(() => {
    loadCourses()
    loadTags()
  }, [])

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
        console.error("Error cargando cursos:", result.message)
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

  // Filtrar y ordenar cursos
  const filteredAndSortedCourses = courses
    .filter((course) => {
      // Filtro por búsqueda
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por etiqueta
      const matchesTag = selectedTag === "all" || course.tags.some((tag) => tag.id === selectedTag)

      // Filtro por precio
      let matchesPrice = true
      if (priceRange === "free") {
        matchesPrice = course.price === 0
      } else if (priceRange === "under-100") {
        matchesPrice = course.price > 0 && course.price < 100000
      } else if (priceRange === "100-300") {
        matchesPrice = course.price >= 100000 && course.price < 300000
      } else if (priceRange === "over-300") {
        matchesPrice = course.price >= 300000
      }

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
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  const formatPrice = (price: number) => {
    if (price === 0) return "Gratis"
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
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
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Cursos de Odontología</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre nuestra colección de cursos especializados en odontología, diseñados por expertos para
              profesionales como tú.
            </p>
          </div>

          {/* Filtros y búsqueda */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            {/* Barra de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar cursos, instructores o temas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por etiqueta */}
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="bg-white">
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
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Todos los precios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los precios</SelectItem>
                  <SelectItem value="free">Gratis</SelectItem>
                  <SelectItem value="under-100">Menos de $100.000</SelectItem>
                  <SelectItem value="100-300">$100.000 - $300.000</SelectItem>
                  <SelectItem value="over-300">Más de $300.000</SelectItem>
                </SelectContent>
              </Select>

              {/* Ordenar por */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguos</SelectItem>
                  <SelectItem value="price-low">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-high">Precio: mayor a menor</SelectItem>
                  <SelectItem value="title">Título A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Botón limpiar filtros */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedTag("all")
                  setSortBy("newest")
                  setPriceRange("all")
                }}
                className="bg-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Resultados */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {filteredAndSortedCourses.length} curso{filteredAndSortedCourses.length !== 1 ? "s" : ""} encontrado
            {filteredAndSortedCourses.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Grid de cursos */}
        {filteredAndSortedCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No se encontraron cursos</h3>
            <p className="text-gray-500 mb-4">Intenta ajustar los filtros o términos de búsqueda</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setSelectedTag("all")
                setSortBy("newest")
                setPriceRange("all")
              }}
            >
              Ver todos los cursos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedCourses.map((course) => (
              <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="relative">
                  {/* Imagen del curso */}
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=200&width=300&text=Curso+de+Odontología"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <BookOpen className="w-12 h-12 text-blue-500" />
                      </div>
                    )}
                  </div>

                  {/* Badge de precio */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={course.price === 0 ? "secondary" : "default"}
                      className={course.price === 0 ? "bg-green-100 text-green-800" : "bg-blue-600 text-white"}
                    >
                      {formatPrice(course.price)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Etiquetas */}
                  <div className="flex flex-wrap gap-1 mb-3">
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

                  {/* Título y descripción */}
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                  {/* Información del curso */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-2" />
                      <span>{course.instructor_name}</span>
                    </div>
                    {course.duration_hours && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{course.duration_hours} horas</span>
                      </div>
                    )}
                  </div>

                  {/* Botón de acción */}
                  <Link href={`/courses/${course.id}`} className="block">
                    <Button className="w-full group-hover:bg-blue-700 transition-colors">
                      <Play className="w-4 h-4 mr-2" />
                      Ver curso
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
