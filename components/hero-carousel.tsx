"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Clock, Users, Star, BookOpen } from "lucide-react"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  price: number
  instructor_name: string
  thumbnail_url: string
  duration_hours: number
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

export function HeroCarousel() {
  const [courses, setCourses] = useState<Course[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedCourses()
  }, [])

  useEffect(() => {
    if (courses.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % courses.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [courses.length])

  const loadFeaturedCourses = async () => {
    try {
      const response = await fetch("/api/courses?limit=5")
      const result = await response.json()
      if (result.success && result.data.courses) {
        setCourses(result.data.courses)
      }
    } catch (error) {
      console.error("Error cargando cursos destacados:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % courses.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + courses.length) % courses.length)
  }

  if (loading) {
    return (
      <div className="relative h-[600px] bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando cursos destacados...</p>
        </div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="relative h-[600px] bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white max-w-2xl mx-auto px-4">
          <BookOpen className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-bold mb-4">Cursos de Odontología Profesional</h2>
          <p className="text-xl mb-8 opacity-90">
            Descubre nuestra plataforma de educación especializada en odontología
          </p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            <Link href="/courses">Explorar Cursos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const currentCourse = courses[currentIndex]

  return (
    <div className="relative h-[600px] overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
      {/* Imagen de fondo */}
      <div className="absolute inset-0">
        {currentCourse.thumbnail_url ? (
          <img
            src={currentCourse.thumbnail_url || "/placeholder.svg"}
            alt={currentCourse.title}
            className="w-full h-full object-cover opacity-30"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-800 opacity-80" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Información del curso */}
            <div className="text-white space-y-6">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {currentCourse.tags?.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag.id}
                    className="text-xs font-medium px-3 py-1"
                    style={{
                      backgroundColor: tag.color + "40",
                      color: "white",
                      borderColor: tag.color,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {currentCourse.price === 0 && (
                  <Badge className="bg-green-500 text-white font-medium px-3 py-1">Gratuito</Badge>
                )}
              </div>

              {/* Título */}
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">{currentCourse.title}</h1>

              {/* Descripción */}
              <p className="text-xl text-gray-200 leading-relaxed max-w-2xl">{currentCourse.description}</p>

              {/* Instructor */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{currentCourse.instructor_name}</p>
                  <p className="text-gray-300 text-sm">Especialista en Odontología</p>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="flex items-center space-x-8 text-sm">
                <div className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span className="font-medium">{currentCourse.lessons?.length || 0} lecciones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{currentCourse.duration_hours}h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">{currentCourse.students_count} estudiantes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium">4.8</span>
                </div>
              </div>

              {/* Lecciones gratuitas */}
              {currentCourse.lessons?.some((lesson) => lesson.is_free) && (
                <div className="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg px-4 py-3">
                  <p className="text-green-200 font-medium">✓ Incluye lecciones gratuitas para probar</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  <Link href={`/courses/${currentCourse.id}`}>
                    {currentCourse.price === 0 ? "Ver Curso Gratis" : `Comprar por $${currentCourse.price}`}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg bg-transparent"
                >
                  <Link href="/courses">Ver Todos los Cursos</Link>
                </Button>
              </div>
            </div>

            {/* Imagen del curso */}
            <div className="hidden lg:block">
              <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-white border-opacity-20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    {currentCourse.thumbnail_url ? (
                      <img
                        src={currentCourse.thumbnail_url || "/placeholder.svg"}
                        alt={currentCourse.title}
                        className="w-full h-80 object-cover"
                      />
                    ) : (
                      <div className="w-full h-80 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                        <BookOpen className="w-20 h-20 text-white opacity-50" />
                      </div>
                    )}

                    {/* Overlay con botón de play */}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-8 h-8 text-blue-600 ml-1" />
                      </div>
                    </div>

                    {/* Precio */}
                    {currentCourse.price > 0 && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-blue-600 text-white font-bold px-4 py-2 text-lg">
                          ${currentCourse.price}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de navegación */}
      {courses.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full p-3 transition-all duration-200"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Indicadores */}
      {courses.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-2">
            {courses.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex ? "bg-white" : "bg-white bg-opacity-50 hover:bg-opacity-75"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
